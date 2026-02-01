---
sidebar_position: 2
description: Delta Lake-style transaction log for atomic operations
---

# Transaction Log

IndexTables uses a Delta Lake-style transaction log for atomic operations and time travel.

## Overview

The transaction log is stored in the `_transaction_log/` directory and records all changes to the index.

```
s3://bucket/my_index/
  _transaction_log/
    _state/           # Avro state files (v0.4.5+)
    00000000000000000001.json
    00000000000000000002.json
    00000000000000000003.checkpoint.json
```

## State Format

IndexTables supports two transaction log state formats:

| Format | Read Performance | Write Performance | Default |
|--------|-----------------|-------------------|---------|
| **Avro** | 10-28x faster | Incremental writes | New tables (v0.4.5+) |
| JSON | Baseline | Full rewrite | Legacy |

### Avro Format Benefits

- **10-28x faster reads**: 70K files load in under 500ms vs ~14s with JSON
- **Incremental writes**: New files append to manifests without rewriting
- **Partition pruning**: Skip irrelevant manifests for large tables
- **Automatic compaction**: Maintains optimal read performance

### Configuration

```scala
// State format (default: avro)
spark.conf.set("spark.indextables.state.format", "avro")

// Compression (default: zstd)
spark.conf.set("spark.indextables.state.compression", "zstd")
spark.conf.set("spark.indextables.state.compressionLevel", "3")
```

See [Configuration Reference](/docs/reference/configuration-reference#state-format-avro) for all state format options.

### Upgrading Existing Tables

Existing JSON-format tables can be upgraded to Avro:

```sql
CHECKPOINT INDEXTABLES 's3://bucket/my_table';
```

The upgrade is automatic and preserves all data. Old readers can still access the table via JSON fallback until they upgrade.

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

Checkpoints consolidate transaction log state for faster reads:

```scala
// Configure checkpoint interval
spark.conf.set("spark.indextables.checkpoint.enabled", "true")
spark.conf.set("spark.indextables.checkpoint.interval", "10")
```

## Compression

Transaction logs are GZIP compressed by default (60-70% size reduction):

```scala
spark.conf.set("spark.indextables.transaction.compression.enabled", "true")
```

## Compaction

The Avro format supports automatic compaction to maintain optimal read performance.

### Compaction Triggers

Compaction runs automatically when:
- Tombstones exceed 10% of entries (`spark.indextables.state.compaction.tombstoneThreshold`)
- Manifest count exceeds 20 (`spark.indextables.state.compaction.maxManifests`)
- After MERGE SPLITS operations (`spark.indextables.state.compaction.afterMerge`)

### Manual Compaction

Force compaction via checkpoint:

```sql
CHECKPOINT INDEXTABLES 's3://bucket/my_table';
```

## SQL Commands

### DESCRIBE STATE

View state format, version, and statistics:

```sql
DESCRIBE INDEXTABLES STATE 's3://bucket/my_index';
```

Returns format type, file counts, tombstone ratio, and protocol information.

### CHECKPOINT INDEXTABLES

Force a checkpoint at the current version. This consolidates transaction log state, triggers compaction, and upgrades the table to the latest protocol version (including Avro format).

```sql
CHECKPOINT INDEXTABLES 's3://bucket/my_index';
```

Use this to:
- Upgrade existing tables to Avro format
- Optimize read performance by compacting state
- Force protocol upgrade on existing tables
- Create a checkpoint at a specific point in time

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
