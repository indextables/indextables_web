---
sidebar_position: 2
description: Delta Lake-style transaction log for atomic operations
---

# Transaction Log

IndexTables uses a Delta Lake-style transaction log for atomic operations and time travel.

## Overview

The transaction log is stored in the `_transaction_log/` directory and contains JSON files that record all changes to the index.

```
s3://bucket/my_index/
  _transaction_log/
    00000000000000000001.json
    00000000000000000002.json
    00000000000000000003.checkpoint.json
```

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

## SQL Commands

### CHECKPOINT INDEXTABLES

Force a checkpoint at the current version. This consolidates transaction log state and upgrades the table to the latest protocol version.

```sql
CHECKPOINT INDEXTABLES 's3://bucket/my_index';
```

Use this to:
- Optimize read performance by creating a checkpoint
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
