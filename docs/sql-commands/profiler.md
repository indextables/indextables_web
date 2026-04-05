---
sidebar_position: 6
description: Profile the native FFI read path
---

# Profiler Commands

Measure timing and cache performance inside the native FFI read path.

The profiler collects metrics at the native (Rust) layer and exposes them through SQL. It runs distributed—enabling it on the driver activates it across all executors.

## ENABLE / DISABLE PROFILER

```sql
ENABLE INDEXTABLES PROFILER
DISABLE INDEXTABLES PROFILER
```

`ENABLE` activates profiling on the driver and all executor hosts. `DISABLE` deactivates it while preserving the current counters.

## DESCRIBE PROFILER

View per-section timing metrics across all executors:

```sql
DESCRIBE INDEXTABLES PROFILER
```

### Output

| Column | Description |
|--------|-------------|
| host | Executor host:port |
| section | Read path section name |
| calls | Number of times this section was entered |
| total_ms | Total time spent in this section (milliseconds) |
| avg_us | Average time per call (microseconds) |
| min_us | Minimum observed time (microseconds) |
| max_us | Maximum observed time (microseconds) |

## DESCRIBE PROFILER CACHE

View cache hit/miss metrics across all executors:

```sql
DESCRIBE INDEXTABLES PROFILER CACHE
```

### Output

| Column | Description |
|--------|-------------|
| host | Executor host:port |
| cache | Cache name |
| hits | Number of cache hits |
| misses | Number of cache misses |
| hit_rate | Hit rate as a fraction (0.0–1.0) |

## RESET PROFILER

Read and atomically clear all timing counters:

```sql
RESET INDEXTABLES PROFILER
```

Returns the same columns as `DESCRIBE INDEXTABLES PROFILER`, then resets all counters to zero. Safe to use in a measure–then–reset workflow.

## RESET PROFILER CACHE

Read and atomically clear cache counters only:

```sql
RESET INDEXTABLES PROFILER CACHE
```

Returns the same columns as `DESCRIBE INDEXTABLES PROFILER CACHE`, then resets cache counters to zero.

## Example Workflow

```sql
-- Start a clean measurement window
ENABLE INDEXTABLES PROFILER;
RESET INDEXTABLES PROFILER;
RESET INDEXTABLES PROFILER CACHE;

-- Run the query you want to profile
SELECT COUNT(*) FROM indextables.`s3://bucket/events_index`
WHERE message CONTAINS 'error';

-- Inspect results
DESCRIBE INDEXTABLES PROFILER;
DESCRIBE INDEXTABLES PROFILER CACHE;

-- Disable when done
DISABLE INDEXTABLES PROFILER;
```
