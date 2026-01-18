---
sidebar_position: 4
description: Pre-warm index caches for optimal query performance
---

# PREWARM CACHE

Pre-warm index caches across all executors to make queries instant and dramatically reduce object storage calls.

## Why Prewarm?

Without prewarming, the first query on each executor must fetch index segments from object storage (S3/Azure), which can take 50-200ms per segment. Prewarming loads these segments into the local disk cache ahead of time, so queries execute in 1-5ms instead.

**Benefits:**
- **Instant queries**: Eliminate cold-start latency
- **Reduced S3/Azure costs**: 90%+ fewer GET requests
- **Predictable performance**: No variance between first and subsequent queries

:::important Storage Requirements
Prewarming requires fast local disks. Use NVMe instance storage (recommended) or a fast EBS volume class. Slow disks will negate the benefits of prewarming.
:::

## Syntax

```sql
PREWARM INDEXTABLES CACHE '<path>'
  [FOR SEGMENTS (<segments>)]
  [ON FIELDS (<fields>)]
  [WITH PERWORKER PARALLELISM OF <n>]
  [WHERE <partition_predicate>]
```

## Segment Selection

Choose which index segments to prewarm based on your query patterns:

### Basic Queries (Default)

For simple keyword searches, the default segments are sufficient:

```sql
-- Default: TERM_DICT, POSTINGS
PREWARM INDEXTABLES CACHE 's3://bucket/logs';
```

### Range Queries and Aggregations

For queries with `>`, `<`, `>=`, `<=` filters or aggregations (COUNT, SUM, AVG, MIN, MAX), add FAST_FIELD and FIELD_NORM:

```sql
PREWARM INDEXTABLES CACHE 's3://bucket/logs'
  FOR SEGMENTS (TERM_DICT, POSTINGS, FAST_FIELD, FIELD_NORM);
```

### All Segments

For comprehensive prewarming (largest cache footprint):

```sql
PREWARM INDEXTABLES CACHE 's3://bucket/logs'
  FOR SEGMENTS (TERM_DICT, POSTINGS, FAST_FIELD, FIELD_NORM, POSITIONS, DOC_STORE);
```

## Field Selection for Wide Tables

For tables with many columns, prewarm only the fields used in your WHERE clauses to reduce cache usage:

```sql
-- Only prewarm fields used in filters
PREWARM INDEXTABLES CACHE 's3://bucket/logs'
  FOR SEGMENTS (TERM_DICT, POSTINGS, FAST_FIELD)
  ON FIELDS (timestamp, status, user_id, error_code);
```

This is especially important for wide tables (50+ columns) where prewarming all fields would consume excessive disk space.

## Examples

### Basic Prewarm

```sql
PREWARM INDEXTABLES CACHE 's3://bucket/logs';
```

### Prewarm for Analytics Workloads

```sql
-- Optimized for COUNT, SUM, AVG and range filters
PREWARM INDEXTABLES CACHE 's3://bucket/logs'
  FOR SEGMENTS (TERM_DICT, POSTINGS, FAST_FIELD, FIELD_NORM);
```

### Prewarm Specific Partition

```sql
PREWARM INDEXTABLES CACHE 's3://bucket/logs'
  FOR SEGMENTS (TERM_DICT, POSTINGS, FAST_FIELD)
  WHERE date = '2024-01-15';
```

### Full Options

```sql
PREWARM INDEXTABLES CACHE 's3://bucket/logs'
  FOR SEGMENTS (TERM_DICT, FAST_FIELD, POSTINGS, FIELD_NORM)
  ON FIELDS (timestamp, status, message)
  WITH PERWORKER PARALLELISM OF 4
  WHERE region = 'us-east';
```

## Monitor Disk Cache Usage

Check how much disk space your cache is using:

```sql
DESCRIBE INDEXTABLES DISK CACHE;
```

This shows cache size, hit rate, and available capacity per executor.

## Segment Reference

| SQL Name | Description | Use Case |
|----------|-------------|----------|
| TERM_DICT, TERM | Term dictionary (FST) | All queries (default) |
| POSTINGS, POSTING_LISTS | Inverted index postings | All queries (default) |
| FAST_FIELD, FASTFIELD | Fast fields for aggregations | Range queries, aggregations |
| FIELD_NORM, FIELDNORM | Field norms for scoring | Range queries, aggregations |
| POSITIONS, POSITION_LISTS | Term positions | Phrase queries |
| DOC_STORE, STORE | Document storage | Retrieving field values |

**Default segments**: TERM_DICT, POSTINGS

## Output

| Column | Description |
|--------|-------------|
| host | Executor hostname |
| assigned_host | Expected hostname for locality |
| locality_hits | Tasks that ran on correct host |
| locality_misses | Tasks that ran on wrong host |
| splits_prewarmed | Count of splits prewarmed |
| segments | Comma-separated segment names |
| fields | Field names (or "all") |
| duration_ms | Duration in milliseconds |
| status | success, partial, no_splits |

## Configuration

```scala
spark.conf.set("spark.indextables.prewarm.splitsPerTask", "2")
spark.conf.set("spark.indextables.prewarm.maxRetries", "10")
spark.conf.set("spark.indextables.prewarm.failOnMissingField", "true")
```
