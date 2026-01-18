---
sidebar_position: 3
description: Persistent NVMe caching across JVM restarts
---

# L2 Disk Cache

Persistent NVMe caching for 10-50x faster repeated queries.

## Auto-Detection

Disk cache is **automatically enabled** when `/local_disk0` is detected (Databricks/EMR NVMe storage).

## Configuration

```scala
// Explicitly enable/disable
spark.conf.set("spark.indextables.cache.disk.enabled", "true")

// Cache path
spark.conf.set("spark.indextables.cache.disk.path",
  "/local_disk0/tantivy4spark_slicecache")

// Maximum size (0 = auto, uses 2/3 available disk)
spark.conf.set("spark.indextables.cache.disk.maxSize", "100G")

// Compression (lz4, zstd, none)
spark.conf.set("spark.indextables.cache.disk.compression", "lz4")
spark.conf.set("spark.indextables.cache.disk.minCompressSize", "4K")

// Manifest sync interval (seconds)
spark.conf.set("spark.indextables.cache.disk.manifestSyncInterval", "30")
```

## Monitoring

```sql
DESCRIBE INDEXTABLES DISK CACHE;
```

## Flushing

```sql
FLUSH INDEXTABLES DISK CACHE;
```

## Benefits

- **Persistent**: Survives JVM restarts
- **Fast**: NVMe speeds vs S3 latency
- **Automatic**: No manual warming needed
- **Compressed**: LZ4 reduces storage usage

## When NOT to Use

- Spinning disk systems (no benefit, may hurt performance)
- Ephemeral clusters with no local storage
- One-time queries (cache won't be reused)

## To Disable

```scala
spark.conf.set("spark.indextables.cache.disk.enabled", "false")
```
