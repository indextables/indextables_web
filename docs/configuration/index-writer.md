---
sidebar_position: 2
description: Configure index writer performance
---

# Index Writer Settings

Fine-tune index writer performance for your workload.

## Memory Settings

```scala
// Total heap allocated for indexing
spark.conf.set("spark.indextables.indexWriter.heapSize", "100M")

// Maximum buffer size before flush (prevents 100MB native limit)
spark.conf.set("spark.indextables.indexWriter.maxBatchBufferSize", "90M")
```

:::tip Memory Sizing
- Start with 100M heap for most workloads
- Increase to 500M-1G for large documents
- Keep maxBatchBufferSize below 100M to avoid native errors
:::

## Batching

```scala
// Documents per batch (affects memory usage and latency)
spark.conf.set("spark.indextables.indexWriter.batchSize", "10000")
```

| Batch Size | Memory | Latency | Use Case |
|------------|--------|---------|----------|
| 1,000 | Low | Low | Small documents |
| 10,000 | Medium | Medium | Default |
| 50,000 | High | High | Large bulk loads |

## Threading

```scala
// Parallel indexing threads
spark.conf.set("spark.indextables.indexWriter.threads", "2")
```

Recommend 1-2 threads per executor core.

## Split Conversion

```scala
// Parallelism for tantivy -> split conversion
spark.conf.set("spark.indextables.splitConversion.maxParallelism", "4")
// Default: max(1, availableProcessors / 4)
```

## Statistics

```scala
// Truncate long text in stats (prevents transaction log bloat)
spark.conf.set("spark.indextables.stats.truncation.enabled", "true")
spark.conf.set("spark.indextables.stats.truncation.maxLength", "32")

// Data skipping statistics
spark.conf.set("spark.indextables.dataSkippingNumIndexedCols", "32")
```

## All Settings Reference

| Setting | Default | Description |
|---------|---------|-------------|
| `indexWriter.heapSize` | 100M | Memory for indexing |
| `indexWriter.batchSize` | 10000 | Documents per batch |
| `indexWriter.maxBatchBufferSize` | 90M | Max buffer before flush |
| `indexWriter.threads` | 2 | Indexing threads |
| `splitConversion.maxParallelism` | auto | Split conversion parallelism |
| `stats.truncation.enabled` | true | Truncate long values |
| `stats.truncation.maxLength` | 32 | Max chars for stats |
