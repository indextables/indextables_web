---
sidebar_position: 2
description: Delta Lake-style transaction log for atomic operations
---

# Transaction Log

IndexTables uses a Delta Lake-style transaction log for atomic operations and time travel.

## Overview

The transaction log is stored in the `_transaction_log/` directory and records all changes to the index. IndexTables supports two state formats for checkpoints: the legacy JSON format and the high-performance Avro format.

## State Formats

### Avro Format (Default)

The Avro-based state format is the default for new tables and delivers substantial performance improvements:

| Operation | JSON | Avro | Improvement |
|-----------|------|------|-------------|
| Read 70K files | ~14s | <500ms | **28x faster** |
| Incremental write (100 files) | Rewrite all 70K | Write 100 entries | **700x less I/O** |
| Query single partition (1M files) | Load all 1M entries | Load matching manifests | **~1000x less data** |

**Avro file structure:**

```
s3://bucket/my_index/
  _transaction_log/
    00000000000000000001.json          # Version files (unchanged)
    00000000000000000002.json
    state-v3/                          # Avro state directory
      _manifest.json                   # State metadata
      manifest-00000.avro              # File entries (Zstd compressed)
      manifest-00001.avro
    _last_checkpoint                   # Checkpoint pointer
```

The `_manifest.json` contains metadata including format version, manifest file list with partition bounds, tombstones for deleted files, and protocol version information.

**Key features:**
- **Partition pruning**: Filters manifests based on partition bounds before reading, enabling efficient queries on specific partitions in multi-million-file tables
- **Parallel reads**: Multiple Avro manifests load concurrently
- **Incremental writes**: New files append to manifest parts instead of rewriting all entries
- **Streaming support**: Tracks `addedAtVersion` for efficient change detection

### JSON Format (Legacy)

The JSON format is still supported for backward compatibility:

```
s3://bucket/my_index/
  _transaction_log/
    00000000000000000001.json
    00000000000000000002.json
    00000000000000000003.checkpoint.json
```

Existing JSON tables continue to function without modification. The format is auto-detected from the `_last_checkpoint` file.

### Upgrading to Avro Format

To upgrade an existing JSON table to the Avro format, run the `CHECKPOINT INDEXTABLES` command:

```sql
CHECKPOINT INDEXTABLES 's3://bucket/my_index';
```

This will create a new Avro-based checkpoint and upgrade the table protocol to V4. The upgrade is automatic when the state format is set to `avro` (the default).

## Transaction Types

### AddAction

Records a new split being added:

```json
{
  "add": {
    "path": "partition=2024-01-01/abc123.split",
    "size": 104857600,
    "stats": { "numRecords": 10000 }
  }
}
```

### RemoveAction

Records a split being logically deleted:

```json
{
  "remove": {
    "path": "partition=2024-01-01/abc123.split",
    "deletionTimestamp": 1704067200000
  }
}
```

## Checkpoints

Checkpoints consolidate transaction log state for faster reads. The checkpoint format depends on the configured state format.

```scala
// Configure checkpoint interval
spark.conf.set("spark.indextables.checkpoint.enabled", "true")
spark.conf.set("spark.indextables.checkpoint.interval", "10")

// State format: "avro" (default) or "json"
spark.conf.set("spark.indextables.state.format", "avro")

// Compression for Avro state: "zstd" (default), "snappy", or "none"
spark.conf.set("spark.indextables.state.compression", "zstd")
```

## Compression

Transaction log version files are GZIP compressed by default (60-70% size reduction):

```scala
spark.conf.set("spark.indextables.transaction.compression.enabled", "true")
```

Avro state manifests use Zstd compression by default for optimal performance.

## SQL Commands

### CHECKPOINT INDEXTABLES

Force a checkpoint at the current version. This consolidates transaction log state and upgrades the table to the latest protocol version (V4) and state format (Avro).

```sql
CHECKPOINT INDEXTABLES 's3://bucket/my_index';
```

Use this to:
- **Upgrade existing tables** from JSON to Avro format for improved performance
- Optimize read performance by creating a checkpoint
- Force protocol upgrade on existing tables
- Create a checkpoint at a specific point in time

:::tip Upgrading Legacy Tables
If you have existing tables using the JSON checkpoint format, simply run `CHECKPOINT INDEXTABLES` to upgrade them to the Avro format. This is the recommended way to migrate tables for better read and write performance.
:::

### TRUNCATE INDEXTABLES TIME TRAVEL

Remove all historical transaction log versions, keeping only the current state. After truncation, time travel to earlier versions is no longer possible.

```sql
-- Preview what would be deleted
TRUNCATE INDEXTABLES TIME TRAVEL 's3://bucket/my_index' DRY RUN;

-- Actually truncate
TRUNCATE INDEXTABLES TIME TRAVEL 's3://bucket/my_index';
```

This command:
1. Creates a checkpoint at the current version (if none exists)
2. Deletes all transaction log version files older than the checkpoint
3. Deletes all older checkpoint files
4. Preserves all data files (splits) — only metadata is affected

Use this to:
- Reduce transaction log storage overhead
- Clean up after many small write operations
- Prepare a table for archival (remove history)

## Benefits

- **Atomicity**: Writes are all-or-nothing
- **Consistency**: Readers see consistent snapshots
- **Durability**: Committed writes survive failures
- **Audit trail**: Full history of changes
