---
sidebar_position: 4
description: Partitioning strategies for efficient queries
---

# Partitioning

Partitioning organizes data into directories for efficient query pruning.

## Basic Partitioning

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .partitionBy("date", "region")
  .save("s3://bucket/logs")
```

Creates structure:
```
s3://bucket/logs/
  _transaction_log/
    manifests/
    state-v.../
      _manifest.json
  date=2024-01-01/region=us-east/
    abc123.split
  date=2024-01-01/region=eu-west/
    def456.split
```

## Partition Pruning

Queries with partition filters skip irrelevant directories:

```scala
// Only reads date=2024-01-15 partition
df.filter($"date" === "2024-01-15")
  .filter($"message" indexquery "error")
  .show()
```

## Best Practices

### Choose Partition Columns Wisely

- Use columns frequently filtered on (date, region, tenant)
- Avoid high-cardinality columns (user_id)
- Keep partition count manageable (< 10,000)

### Partition by Time

For time-series data, partition by date or hour:

```scala
df.withColumn("date", to_date($"timestamp"))
  .write
  .partitionBy("date")
  .save("path")
```

### Compound Partitions

Combine multiple dimensions:

```scala
df.write
  .partitionBy("year", "month", "day")  // Hierarchical
  .save("path")

df.write
  .partitionBy("region", "date")  // Multi-dimensional
  .save("path")
```

## Managing Partitions

### Drop Old Partitions

```sql
DROP INDEXTABLES PARTITIONS FROM 's3://bucket/logs'
WHERE date < '2023-01-01';
```

### Merge Within Partitions

```sql
MERGE SPLITS 's3://bucket/logs'
WHERE date = '2024-01-01'
TARGET SIZE 4G;
```

See [DROP PARTITIONS](/docs/sql-commands/drop-partitions) for more details.
