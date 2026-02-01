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
    00000000000000000001.json           # Version files (JSON)
    00000000000000000002.json
    ...
    manifests/                          # Shared Avro manifest files
      manifest-a1b2c3d4.avro
      manifest-e5f6g7h8.avro
    state-v00000000000000000100/        # State snapshot directory
      _manifest.json                    # References to manifest files
    _last_checkpoint                    # Pointer to latest state
```

**Version files** record individual transactions in JSON format. **State directories** contain snapshots that reference shared Avro manifests for efficient reads. The `manifests/` directory holds compressed Avro files shared across state versions.

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

## Manifest Structure

### State Manifest (`_manifest.json`)

Each state directory contains a JSON manifest that tracks:

- Number of file entries across all referenced manifests
- Total bytes of data
- Creation timestamp and protocol version
- Count of tombstone entries (removed files)
- References to Avro manifest files in the shared `manifests/` directory

### Avro Manifest Files (`manifest-*.avro`)

Avro manifests store file entries with full metadata for efficient querying:

| Field | Description |
|-------|-------------|
| `path` | Split file path relative to table root |
| `partitionValues` | Map of partition column values (enables partition pruning) |
| `size` | File size in bytes |
| `numRecords` | Document count in split |
| `minValues` / `maxValues` | Column statistics for data skipping |
| `addedAtVersion` | Transaction version when file was added |
| `addedAtTimestamp` | Timestamp when file was added |
| `tombstone` | True if file has been logically deleted |

Each manifest file holds up to 50,000 entries (configurable via `spark.indextables.state.entriesPerManifest`). Manifests are shared across state versions—new writes only create manifests for new files, dramatically reducing I/O for large tables.

## Checkpoints

Checkpoints compact multiple manifests into a single file for faster reads:

```scala
// Configure automatic checkpoint interval
spark.conf.set("spark.indextables.checkpoint.enabled", "true")
spark.conf.set("spark.indextables.checkpoint.interval", "10")
```

Checkpoints are created automatically every N transactions, or manually via SQL:

```sql
CHECKPOINT INDEXTABLES 's3://bucket/my_table';
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
