---
sidebar_position: 1
description: Consolidate small splits for better performance
---

# MERGE SPLITS

Consolidate small splits into larger ones for improved query performance.

## Syntax

```sql
MERGE SPLITS '<path>'
  [TARGET SIZE <size>]
  [MAX DEST SPLITS <n>]
  [MAX SOURCE SPLITS PER MERGE <n>]
  [WHERE <partition_predicate>]
```

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `TARGET SIZE` | Maximum size of merged splits | 5GB |
| `MAX DEST SPLITS` | Limit destination splits processed | unlimited |
| `MAX SOURCE SPLITS PER MERGE` | Max source splits per merge | 1000 |
| `WHERE` | Partition filter predicate | all partitions |

## Examples

### Basic Merge

```sql
MERGE SPLITS 's3://bucket/my_index';
```

### With Target Size

```sql
MERGE SPLITS 's3://bucket/my_index' TARGET SIZE 4G;
```

### Partition-Specific

```sql
MERGE SPLITS 's3://bucket/my_index'
  WHERE date = '2024-01-01'
  TARGET SIZE 500M;
```

### Limit Scope

```sql
MERGE SPLITS 's3://bucket/my_index'
  TARGET SIZE 4G
  MAX DEST SPLITS 10
  MAX SOURCE SPLITS PER MERGE 100;
```

## Configuration

```scala
spark.conf.set("spark.indextables.merge.maxSourceSplitsPerMerge", "1000")
```

## Companion Mode

MERGE SPLITS works with [companion mode](/docs/core-concepts/companion-mode) splits and preserves companion metadata during the merge:

- **`companionSourceFiles`** — concatenated from all source splits
- **`companionDeltaVersion`** / **`source_version`** — the maximum value is retained
- **`companionFastFieldMode`** — preserved (must be consistent across merged splits)

No special syntax is needed — companion metadata is handled automatically.

## When to Use

- After many small writes
- During maintenance windows
- Before large analytical queries
- To optimize storage costs

## Related

- [PURGE INDEXTABLE](/docs/sql-commands/purge-indextable) - Clean up after merges
- [Merge-On-Write](/docs/advanced/merge-on-write) - Automatic merging
