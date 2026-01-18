---
sidebar_position: 4
description: Time-series and distribution analysis with bucket aggregations
---

# Bucket Aggregations

Bucket aggregations enable time-series and distribution analysis using SQL GROUP BY.

## Available Functions

| Function | Description |
|----------|-------------|
| `indextables_histogram(col, interval)` | Fixed-interval numeric bucketing |
| `indextables_date_histogram(col, interval)` | Time-based bucketing |
| `indextables_range(col, ...)` | Custom named range buckets |

## Histogram

Bucket numeric values by fixed intervals:

```sql
SELECT
  indextables_histogram(price, 50.0) as price_bucket,
  COUNT(*) as cnt,
  SUM(quantity) as total_qty
FROM products
GROUP BY indextables_histogram(price, 50.0)
```

## Date Histogram

Bucket timestamps by time intervals:

```sql
SELECT
  indextables_date_histogram(event_time, '1d') as day_bucket,
  COUNT(*) as cnt
FROM events
GROUP BY indextables_date_histogram(event_time, '1d')
```

### Supported Intervals

| Suffix | Meaning |
|--------|---------|
| `ms` | Milliseconds |
| `s` | Seconds |
| `m` | Minutes |
| `h` | Hours |
| `d` | Days |

Examples: `'1h'`, `'30m'`, `'7d'`, `'100ms'`

## Range

Create custom named buckets:

```sql
SELECT
  indextables_range(price,
    'cheap', NULL, 50.0,
    'mid', 50.0, 100.0,
    'expensive', 100.0, NULL
  ) as tier,
  COUNT(*) as cnt
FROM products
GROUP BY indextables_range(price,
  'cheap', NULL, 50.0,
  'mid', 50.0, 100.0,
  'expensive', 100.0, NULL
)
```

`NULL` indicates unbounded (no lower/upper limit).

## Requirements

Fields must be configured as **fast fields**:

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.fastfields", "price,event_time,quantity")
  .save("path")
```

## With Sub-Aggregations

Combine bucket aggregations with other aggregates:

```sql
SELECT
  indextables_date_histogram(timestamp, '1h') as hour,
  COUNT(*) as requests,
  AVG(latency) as avg_latency,
  MAX(latency) as max_latency
FROM logs
WHERE status = 'error'
GROUP BY indextables_date_histogram(timestamp, '1h')
ORDER BY hour
```
