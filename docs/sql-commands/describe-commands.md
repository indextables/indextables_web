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
