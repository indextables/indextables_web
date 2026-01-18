---
sidebar_position: 2
description: Clean up orphaned splits and old transaction logs
---

# PURGE INDEXTABLE

Remove orphaned split files and old transaction logs.

## Syntax

```sql
PURGE INDEXTABLE '<path>'
  [OLDER THAN <n> DAYS|HOURS]
  [TRANSACTION LOG RETENTION <n> DAYS|HOURS]
  [DRY RUN]
```

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `OLDER THAN` | Retention period for splits | 7 days |
| `TRANSACTION LOG RETENTION` | Retention for tx logs | 30 days |
| `DRY RUN` | Preview without deleting | disabled |

## Examples

### Preview Cleanup

```sql
PURGE INDEXTABLE 's3://bucket/my_index' DRY RUN;
```

### Standard Cleanup

```sql
PURGE INDEXTABLE 's3://bucket/my_index'
  OLDER THAN 7 DAYS;
```

### With Transaction Log Retention

```sql
PURGE INDEXTABLE 's3://bucket/my_index'
  OLDER THAN 7 DAYS
  TRANSACTION LOG RETENTION 30 DAYS;
```

## Configuration

```scala
spark.conf.set("spark.indextables.purge.defaultRetentionHours", "168")  // 7 days
spark.conf.set("spark.indextables.purge.minRetentionHours", "24")      // Safety
spark.conf.set("spark.indextables.purge.parallelism", "8")
spark.conf.set("spark.indextables.purge.maxFilesToDelete", "1000000")
```

## Safety Features

- Minimum 24-hour retention enforced
- DRY RUN mode previews before deletion
- LEFT ANTI JOIN ensures only orphaned files deleted
- Retry logic for transient cloud errors

## When to Use

- After failed writes leaving orphaned files
- After MERGE SPLITS operations
- Regular maintenance (weekly/monthly)
- Before archiving tables
