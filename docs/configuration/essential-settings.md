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

// State format: "avro" (default, recommended) or "json"
spark.conf.set("spark.indextables.state.format", "avro")

// Compression for Avro state: "zstd" (default), "snappy", or "none"
spark.conf.set("spark.indextables.state.compression", "zstd")

// Enable compression for version files (default: true)
spark.conf.set("spark.indextables.transaction.compression.enabled", "true")
```

:::tip Upgrading Legacy Tables
Existing tables using JSON checkpoints can be upgraded to the faster Avro format by running `CHECKPOINT INDEXTABLES 'path'`.
:::

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
spark.conf.set("spark.indextables.state.format", "avro")  // High-performance state format
```

## Next Steps

- [Index Writer Settings](/docs/configuration/index-writer)
- [Cache Settings](/docs/configuration/cache-settings)
- [S3 Configuration](/docs/configuration/s3-configuration)
