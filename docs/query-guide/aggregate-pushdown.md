---
sidebar_position: 3
description: Push aggregations directly to the search engine
---

# Aggregate Pushdown

IndexTables pushes aggregation operations directly to the search engine for optimal performance.

## Supported Aggregations

| Function | Description | Requirements |
|----------|-------------|--------------|
| `COUNT(*)` | Count all documents | None |
| `COUNT(col)` | Count non-null values | None |
| `SUM(col)` | Sum of values | Fast field |
| `AVG(col)` | Average of values | Fast field |
| `MIN(col)` | Minimum value | Fast field |
| `MAX(col)` | Maximum value | Fast field |

## Basic Usage

```scala
// Simple count
df.agg(count("*")).show()

// Multiple aggregations
df.agg(
  count("*").as("total"),
  sum("score").as("total_score"),
  avg("score").as("avg_score")
).show()
```

## With Filters

```scala
// Count with filter
df.filter($"status" === "error")
  .agg(count("*"))
  .show()

// Aggregation with IndexQuery
df.filter($"message" indexquery "database connection")
  .agg(count("*"), avg("latency"))
  .show()
```

## Fast Fields Requirement

For SUM, AVG, MIN, MAX, configure fast fields at write time:

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.fastfields", "score,latency,timestamp")
  .save("path")
```

## SQL Usage

```sql
-- Count all documents
SELECT COUNT(*) FROM logs;

-- Aggregations with filter
SELECT COUNT(*), AVG(latency), MAX(latency)
FROM logs
WHERE status = 'error';

-- With IndexQuery
SELECT COUNT(*), SUM(bytes)
FROM logs
WHERE message indexquery 'timeout';
```

## GROUP BY

Simple GROUP BY on string fields:

```scala
df.groupBy("region")
  .agg(count("*"), avg("latency"))
  .show()
```

For bucket-based grouping (time intervals, ranges), see [Bucket Aggregations](/docs/query-guide/bucket-aggregations).

## Performance

Aggregate pushdown provides significant speedups:

- Avoids transferring all documents to Spark
- Executes directly in optimized search engine code
- Works with partition pruning for further optimization
