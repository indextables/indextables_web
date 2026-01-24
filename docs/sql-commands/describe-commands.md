---
sidebar_position: 5
description: Monitor cache, storage, and table statistics
---

# DESCRIBE Commands

Monitor cache usage, storage statistics, and table information.

## DESCRIBE DISK CACHE

View disk cache statistics across all executors:

```sql
DESCRIBE INDEXTABLES DISK CACHE;
```

### Output

| Column | Description |
|--------|-------------|
| executor_id | Executor identifier |
| host | IP:port |
| enabled | Cache enabled status |
| total_bytes | Current cache size |
| max_bytes | Maximum cache size |
| usage_percent | Usage percentage |
| splits_cached | Number of splits cached |
| components_cached | Number of components cached |

## DESCRIBE STORAGE STATS

View object storage access statistics:

```sql
DESCRIBE INDEXTABLES STORAGE STATS;
```

### Output

| Column | Description |
|--------|-------------|
| executor_id | Executor identifier |
| host | IP:port |
| bytes_fetched | Total bytes fetched from storage |
| requests | Number of storage requests |

## DESCRIBE DATA SKIPPING STATS

View data skipping effectiveness and cache hit rates:

```sql
DESCRIBE INDEXTABLES DATA SKIPPING STATS;
```

### Output

| Column | Description |
|--------|-------------|
| metric_type | Category: data_skipping, filter_expr_cache, partition_filter_cache, filter_type_skips |
| metric_name | Name of the metric |
| metric_value | Metric value |

### Metrics

**Data Skipping:**
- `total_files_considered` - Files evaluated before pruning
- `partition_pruned_files` - Files pruned by partition filters
- `data_skipped_files` - Files pruned by min/max statistics
- `final_files_scanned` - Files actually read
- `partition_skip_rate` - Percentage of files skipped by partitions
- `data_skip_rate` - Percentage of files skipped by statistics
- `total_skip_rate` - Overall file skip rate

**Filter Expression Cache:**
- `simplified_hits/misses` - Filter simplification cache stats
- `in_range_hits/misses` - Range check cache stats
- Hit rates and cache sizes

## DESCRIBE TRANSACTION LOG

View the contents of a table's transaction log:

```sql
-- View current state (from latest checkpoint forward)
DESCRIBE INDEXTABLES TRANSACTION LOG 's3://bucket/my_index';

-- View complete history from version 0
DESCRIBE INDEXTABLES TRANSACTION LOG 's3://bucket/my_index' INCLUDE ALL;
```

### Output

Returns detailed information about all transaction log actions including:
- `version` - Transaction log version number
- `action_type` - ADD, REMOVE, SKIP, PROTOCOL, or METADATA
- `path` - Split file path
- `partition_values` - Partition column values
- `size` - File size in bytes
- `num_records` - Document count
- `min_values/max_values` - Column statistics for data skipping
- And many more fields for debugging and analysis

## DESCRIBE STATE

View the state format and checkpoint information for a table:

```sql
DESCRIBE INDEXTABLES STATE 's3://bucket/my_index';
```

### Output

| Column | Description |
|--------|-------------|
| table_path | Path to the IndexTable |
| state_format | Current state format: `avro` or `json` |
| protocol_version | Table protocol version (V4 for Avro) |
| checkpoint_version | Version number of the latest checkpoint |
| num_files | Total number of active files in the table |
| num_manifests | Number of Avro manifest files (Avro format only) |
| total_state_size_bytes | Total size of state files |
| compression | Compression codec used (Avro: zstd, snappy, none) |

### Example

```sql
DESCRIBE INDEXTABLES STATE 's3://bucket/logs';
```

```
+---------------------------+----------------+------------------+--------------------+-----------+---------------+----------------------+-------------+
| table_path                | state_format   | protocol_version | checkpoint_version | num_files | num_manifests | total_state_size_bytes | compression |
+---------------------------+----------------+------------------+--------------------+-----------+---------------+----------------------+-------------+
| s3://bucket/logs          | avro           | V4               | 42                 | 73521     | 8             | 2456789              | zstd        |
+---------------------------+----------------+------------------+--------------------+-----------+---------------+----------------------+-------------+
```

Use this command to verify the state format of your tables and monitor checkpoint health.

## DESCRIBE ENVIRONMENT

View Spark and Hadoop configuration across all executors:

```sql
DESCRIBE INDEXTABLES ENVIRONMENT;
```

### Output

| Column | Description |
|--------|-------------|
| host | Executor host:port |
| role | "driver" or "worker" |
| property_type | "spark" or "hadoop" |
| property_name | Configuration property name |
| property_value | Property value (sensitive values redacted) |

Useful for debugging configuration issues across a cluster.

## DESCRIBE PREWARM JOBS

View the status of async prewarm jobs across all executors:

```sql
DESCRIBE INDEXTABLES PREWARM JOBS;
```

### Output

| Column | Description |
|--------|-------------|
| job_id | Unique job identifier |
| executor_id | Executor running the job |
| host | Executor hostname |
| table_path | Path being prewarmed |
| status | pending, running, completed, failed |
| splits_total | Total splits to prewarm |
| splits_completed | Splits prewarmed so far |
| progress_percent | Completion percentage |
| started_at | Job start timestamp |
| completed_at | Job completion timestamp (if finished) |
| error_message | Error details (if failed) |

This command provides cluster-wide visibility into all async prewarm operations, useful for monitoring long-running prewarm jobs or debugging failures.

## WAIT FOR PREWARM JOBS

Block until all async prewarm jobs complete:

```sql
-- Wait indefinitely for all jobs to complete
WAIT FOR INDEXTABLES PREWARM JOBS;

-- Wait with a timeout (in seconds)
WAIT FOR INDEXTABLES PREWARM JOBS TIMEOUT 300;
```

### Output

| Column | Description |
|--------|-------------|
| jobs_completed | Number of jobs that completed successfully |
| jobs_failed | Number of jobs that failed |
| total_splits_prewarmed | Total splits prewarmed across all jobs |
| total_duration_ms | Total time waited in milliseconds |
| timed_out | Whether the wait timed out |

Use this command when you need to ensure prewarming is complete before running benchmarks or time-sensitive queries.

### Examples

```sql
-- Start async prewarm, then wait before benchmark
PREWARM INDEXTABLES CACHE 's3://bucket/logs' ASYNC MODE;

-- Do other work...

-- Wait up to 10 minutes for prewarm to complete
WAIT FOR INDEXTABLES PREWARM JOBS TIMEOUT 600;

-- Now run your benchmark queries
SELECT COUNT(*) FROM indextables('s3://bucket/logs') WHERE status = 'error';
```

## FLUSH Commands

### FLUSH DISK CACHE

Clear the L2 disk cache across all executors:

```sql
FLUSH INDEXTABLES DISK CACHE;
```

### Output

| Column | Description |
|--------|-------------|
| executor_id | Executor identifier |
| cache_type | Type of cache flushed |
| status | success or error |
| bytes_freed | Bytes deleted |
| files_deleted | Files removed |
| message | Status message |

### FLUSH SEARCHER CACHE

Clear the in-memory (L1) searcher cache:

```sql
FLUSH INDEXTABLES SEARCHER CACHE;
```

This clears:
- Split cache managers
- Driver-side locality assignments
- Native tantivy4java caches

### FLUSH DATA SKIPPING STATS

Reset data skipping statistics (keeps cache entries):

```sql
FLUSH INDEXTABLES DATA SKIPPING STATS;
```

## INVALIDATE Commands

### INVALIDATE TRANSACTION LOG CACHE

Force refresh of transaction log cache for a specific table:

```sql
-- Invalidate cache for a specific table
INVALIDATE INDEXTABLES TRANSACTION LOG CACHE FOR 's3://bucket/my_index';
```

### Output

| Column | Description |
|--------|-------------|
| table_path | Path that was invalidated |
| result | Success or error message |
| cache_hits_before | Cache hits before invalidation |
| cache_misses_before | Cache misses before invalidation |
| hit_rate_before | Cache hit rate before invalidation |

Use this when you know the table has been modified externally and want to force a refresh.

### INVALIDATE DATA SKIPPING CACHE

Clear data skipping caches (both entries and statistics):

```sql
INVALIDATE INDEXTABLES DATA SKIPPING CACHE;
```

This clears:
- Filter expression cache entries
- Partition filter cache entries
- All statistics
