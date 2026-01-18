---
sidebar_position: 4
description: Automatic split consolidation during writes
---

# Merge-On-Write

Automatic split consolidation during write operations.

## Overview

Merge-on-write evaluates after each write whether splits should be consolidated, reducing fragmentation automatically.

## Configuration

```scala
// Enable merge-on-write
spark.conf.set("spark.indextables.mergeOnWrite.enabled", "true")

// Target merged split size
spark.conf.set("spark.indextables.mergeOnWrite.targetSize", "4G")

// Merge threshold multiplier
spark.conf.set("spark.indextables.mergeOnWrite.mergeGroupMultiplier", "2.0")

// Minimum disk space required
spark.conf.set("spark.indextables.mergeOnWrite.minDiskSpaceGB", "20")

// Concurrent merges per worker
spark.conf.set("spark.indextables.mergeOnWrite.maxConcurrentMergesPerWorker", "auto")

// Memory overhead factor
spark.conf.set("spark.indextables.mergeOnWrite.memoryOverheadFactor", "3.0")
```

## How It Works

1. Write completes normally
2. System evaluates merge groups
3. If groups >= (parallelism × multiplier), merge runs
4. Invokes `MERGE SPLITS` command internally

## Threshold Calculation

```
threshold = defaultParallelism × mergeGroupMultiplier
```

With 100 parallelism and 2.0 multiplier: merge runs when 200+ groups exist.

## Usage

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.mergeOnWrite.enabled", "true")
  .option("spark.indextables.mergeOnWrite.targetSize", "4G")
  .save("s3://bucket/path")
```

## Best Practices

- Enable for high-frequency write workloads
- Set appropriate `minDiskSpaceGB` for your environment
- Use with purge-on-write for complete automation
