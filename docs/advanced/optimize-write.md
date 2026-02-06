---
sidebar_position: 3
description: Shuffle-based write optimization for consistent split sizes
---

# Optimized Writes

Shuffle-based write optimization that produces consistently-sized splits using Spark's DSv2 `RequiresDistributionAndOrdering` interface.

## Overview

By default, each Spark write task produces one split. When many small tasks run in parallel, this creates numerous undersized splits, increasing read latency and cloud storage costs. Optimized writes solve this by requesting a shuffle before writing, allowing Adaptive Query Execution (AQE) to coalesce partitions into ~1 GB splits.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.write.optimizeWrite.enabled` | `false` | Enable shuffle-based write optimization |
| `spark.indextables.write.optimizeWrite.targetSplitSize` | `1G` | Target on-disk split size (supports "512M", "1G", "2G" syntax) |
| `spark.indextables.write.optimizeWrite.distributionMode` | `hash` | Distribution mode: `hash` or `none` |
| `spark.indextables.write.optimizeWrite.samplingRatio` | `1.1` | Split-to-shuffle-data ratio for size estimation |
| `spark.indextables.write.optimizeWrite.minRowsForEstimation` | `10000` | Minimum rows required for history-based estimation |

## How It Works

1. `WriteBuilder.build()` selects optimized or standard write based on configuration
2. IndexTables requests a `ClusteredDistribution` from Spark via `RequiresDistributionAndOrdering`
3. Spark inserts a shuffle with an advisory partition size derived from the target split size
4. AQE coalesces shuffle partitions to produce consistently-sized output partitions
5. Each write task receives ~1 GB of data and produces a single, well-sized split

When disabled (`enabled = false`), the standard write path is used with zero overhead.

## Distribution Strategy

The distribution mode controls how data is shuffled before writing:

| Table Type | Distribution Mode | Behavior |
|------------|-------------------|----------|
| Partitioned table | `hash` | `ClusteredDistribution` on partition columns — each partition's data is consolidated, then AQE sizes to target |
| Unpartitioned table | `hash` | `ClusteredDistribution` on first schema column — triggers shuffle for AQE coalescing |
| Any table | `none` | `UnspecifiedDistribution` — no shuffle requested |

:::tip When to Use `none` Mode
Use `distributionMode = "none"` if your upstream pipeline already produces well-sized partitions or if you want to skip the shuffle cost entirely.
:::

### Why `distributionStrictlyRequired = false`

The optimization sets `distributionStrictlyRequired = false`, which causes Spark to use AQE-aware `RebalancePartitions` instead of a strict `HashPartitioning`. This allows skewed partitions to be distributed across executors rather than forcing all rows with the same key into a single partition.

## Advisory Size Estimation

IndexTables calculates the shuffle advisory size using a `WriteSizeEstimator` that operates in two modes:

### History Mode

When existing splits are available and contain at least `minRowsForEstimation` rows, the estimator uses actual bytes-per-row from historical data to compute the advisory size. This is the most accurate mode.

### Sampling Mode

When no history is available (first write), the estimator uses a conservative calculation:

```
advisorySize = targetSplitSize × samplingRatio
```

The default `samplingRatio` of `1.1` accounts for the fact that shuffle data is typically larger than the final on-disk split. If estimation fails for any reason, it falls back gracefully.

## Usage

### Basic Enable

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.write.optimizeWrite.enabled", "true")
  .save("s3://bucket/path")
```

### Partitioned Table with Custom Target Size

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .partitionBy("date", "region")
  .option("spark.indextables.write.optimizeWrite.enabled", "true")
  .option("spark.indextables.write.optimizeWrite.targetSplitSize", "512M")
  .save("s3://bucket/path")
```

### Session-Level Configuration

```scala
spark.conf.set("spark.indextables.write.optimizeWrite.enabled", "true")
spark.conf.set("spark.indextables.write.optimizeWrite.targetSplitSize", "2G")
```

## Best Practices

- **Enable for large ingestion jobs** where many small tasks would otherwise create undersized splits
- **Start with the 1 GB default** — this balances read performance and split count for most workloads
- **Use with partitioned tables** for the best results — partition-aware clustering keeps data co-located
- **Combine with merge-on-write** for complete write optimization: optimized writes handle initial sizing, merge-on-write handles ongoing consolidation
- **Monitor shuffle metrics** in the Spark UI to verify AQE is coalescing partitions as expected
