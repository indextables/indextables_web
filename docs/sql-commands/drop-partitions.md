---
sidebar_position: 3
description: Logically remove partitions from a table
---

# DROP PARTITIONS

Logically remove partitions from a table.

## Syntax

```sql
DROP INDEXTABLES PARTITIONS FROM '<path>'
  WHERE <partition_predicate>
```

## Examples

### Single Partition

```sql
DROP INDEXTABLES PARTITIONS FROM 's3://bucket/logs'
  WHERE date = '2023-01-01';
```

### Range Predicates

```sql
DROP INDEXTABLES PARTITIONS FROM 's3://bucket/logs'
  WHERE year < '2023';

DROP INDEXTABLES PARTITIONS FROM 's3://bucket/logs'
  WHERE month BETWEEN 1 AND 6;
```

### Compound Predicates

```sql
DROP INDEXTABLES PARTITIONS FROM 's3://bucket/logs'
  WHERE region = 'us-east' AND year < '2023';

DROP INDEXTABLES PARTITIONS FROM 's3://bucket/logs'
  WHERE status = 'inactive' OR created < '2023-01-01';
```

## Key Features

- **WHERE clause required** - Prevents accidental full drops
- **Partition columns only** - Validates predicates
- **Logical deletion** - Adds RemoveAction to transaction log
- **Physical cleanup via PURGE** - Delete files after retention

## Workflow

```scala
// 1. Drop old partitions
spark.sql("""
  DROP INDEXTABLES PARTITIONS FROM 's3://bucket/logs'
  WHERE year < '2022'
""").show()

// 2. Verify (optional)
spark.sql("""
  DESCRIBE INDEXTABLES TRANSACTION LOG 's3://bucket/logs'
""").show()

// 3. Clean up physical files
spark.sql("""
  PURGE INDEXTABLE 's3://bucket/logs' OLDER THAN 7 DAYS
""").show()
```

## Output

Returns status including:
- Partitions dropped
- Splits removed
- Total size freed
