---
sidebar_position: 1
description: Essential configuration settings to get started
---

# Essential Settings

Key configuration settings for IndexTables.

## Index Writer

```scala
// Heap size for indexing (supports G, M, K suffixes)
spark.conf.set("spark.indextables.indexWriter.heapSize", "100M")

// Documents per batch
spark.conf.set("spark.indextables.indexWriter.batchSize", "10000")

// Maximum batch buffer size (prevents native memory errors)
spark.conf.set("spark.indextables.indexWriter.maxBatchBufferSize", "90M")

// Indexing threads
spark.conf.set("spark.indextables.indexWriter.threads", "2")
```

## Transaction Log

```scala
// Enable checkpoints for faster reads
spark.conf.set("spark.indextables.checkpoint.enabled", "true")
spark.conf.set("spark.indextables.checkpoint.interval", "10")

// Enable compression (default: true)
spark.conf.set("spark.indextables.transaction.compression.enabled", "true")
```

## Read Settings

```scala
// Default result limit when no LIMIT specified
spark.conf.set("spark.indextables.read.defaultLimit", "250")
```

## Working Directories

Auto-detected on Databricks/EMR, or configure manually:

```scala
spark.conf.set("spark.indextables.indexWriter.tempDirectoryPath", "/local_disk0/temp")
spark.conf.set("spark.indextables.cache.directoryPath", "/local_disk0/cache")
spark.conf.set("spark.indextables.merge.tempDirectoryPath", "/local_disk0/merge-temp")
```

## Field Indexing

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  // Field types
  .option("spark.indextables.indexing.typemap.title", "string")
  .option("spark.indextables.indexing.typemap.content", "text")
  // Fast fields for aggregations
  .option("spark.indextables.indexing.fastfields", "score,timestamp")
  .save("s3://bucket/my_index")
```

## Quick Start Template

```scala
// Recommended settings for production
spark.conf.set("spark.indextables.indexWriter.heapSize", "200M")
spark.conf.set("spark.indextables.checkpoint.enabled", "true")
spark.conf.set("spark.indextables.checkpoint.interval", "10")
```

## Next Steps

- [Index Writer Settings](/docs/configuration/index-writer)
- [Cache Settings](/docs/configuration/cache-settings)
- [S3 Configuration](/docs/configuration/s3-configuration)
