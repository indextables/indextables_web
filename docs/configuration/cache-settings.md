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
```

### Monitor Disk Cache

```sql
DESCRIBE INDEXTABLES DISK CACHE;
```

### Flush Disk Cache

```sql
FLUSH INDEXTABLES DISK CACHE;
```

## Cache Directory

```scala
// In-memory cache directory
spark.conf.set("spark.indextables.cache.directoryPath", "/local_disk0/cache")
```
