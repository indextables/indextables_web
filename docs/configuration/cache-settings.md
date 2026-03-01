---
sidebar_position: 3
description: Configure caching for optimal read performance
---

# Cache Settings

IndexTables provides multiple caching layers for optimal read performance.

## L2 Disk Cache

Persistent NVMe caching across JVM restarts. Auto-enabled on Databricks/EMR.

```scala
// Auto-enabled when /local_disk0 detected
spark.conf.set("spark.indextables.cache.disk.enabled", "true")

// Cache path (auto-detected or manual)
spark.conf.set("spark.indextables.cache.disk.path", "/local_disk0/tantivy4spark_slicecache")

// Maximum cache size (0 = auto, uses 2/3 available disk)
spark.conf.set("spark.indextables.cache.disk.maxSize", "100G")

// Manifest sync interval
spark.conf.set("spark.indextables.cache.disk.manifestSyncInterval", "30")

// Write queue mode: "size" (byte-based backpressure) or "fragment" (bounded slots)
spark.conf.set("spark.indextables.cache.disk.writeQueue.mode", "size")

// Write queue capacity (1G default for size mode)
spark.conf.set("spark.indextables.cache.disk.writeQueue.capacity", "1G")

// Drop query-path writes instead of blocking when full
spark.conf.set("spark.indextables.cache.disk.dropWritesWhenFull", "true")
```

### Monitor Disk Cache

```sql
DESCRIBE INDEXTABLES DISK CACHE;
```

### Flush Disk Cache

```sql
FLUSH INDEXTABLES DISK CACHE;
```

## Parquet Coalesce Max Gap

Controls how aggressively nearby parquet byte ranges are merged into fewer storage requests. The default 512KB gap works well for most workloads, but narrow projections on wide tables (e.g., selecting 2 columns from a 50-column table) may benefit from a smaller value.

```scala
// Reduce gap to 64KB for narrow projections on wide tables
spark.conf.set("spark.indextables.cache.coalesceMaxGap", "64K")
```

Accepts human-readable size strings: `"64K"`, `"512K"`, `"1M"`.

## Cache Directory

```scala
// In-memory cache directory
spark.conf.set("spark.indextables.cache.directoryPath", "/local_disk0/cache")
```
