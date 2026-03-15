---
sidebar_position: 6
description: Configure unified native memory management with Spark's memory manager
---

# Unified Memory Management

:::caution Experimental
Unified memory management is new in IndexTables 0.5.4 and under active development. The recommendations on this page are based on early production testing and may evolve as we gain more experience across workloads and cluster sizes. We welcome feedback on what works (and what doesn't) for your environment.
:::

IndexTables 0.5.4 integrates tantivy4java's native (Rust) memory allocations with Spark's `UnifiedMemoryManager`. This gives Spark visibility and control over native memory consumption — Spark decides whether native code can grow or must shrink, rather than relying on heuristics.

## Background

IndexTables uses tantivy4java under the hood, which allocates memory in Rust for indexing, searching, merging, and caching. Without unified memory management, these native allocations are invisible to Spark — potentially leading to over-commitment where Spark believes memory is available when Rust has already consumed it. This can cause OOM kills, especially on memory-constrained clusters.

With unified memory management enabled, every native allocation flows through Spark's `TaskMemoryManager`, which:

- **Charges allocations to the correct Spark task** for accurate per-task accounting
- **Applies backpressure** when memory is scarce — Spark can deny or reduce native allocations
- **Releases memory on task completion** — no leaked native allocations across tasks

This is a similar approach to [Apache DataFusion Comet](https://datafusion.apache.org/comet/user-guide/latest/tuning.html), which also bridges Rust-based native memory with Spark's memory manager via JNI.

## Enabling Unified Memory Management

Unified memory management requires Spark's off-heap memory to be enabled:

```properties
spark.memory.offHeap.enabled  true
spark.memory.offHeap.size     <bytes>
spark.executor.memory         <on-heap size>
```

:::warning
If `spark.memory.offHeap.enabled` is not set, IndexTables logs a warning at initialization. Native memory allocations will still work but are **not tracked or bounded** by Spark's memory manager.
:::

## How Spark Computes Container Memory

Understanding Spark's container memory formula is essential for sizing. In Spark 3.x, the total memory requested per executor is:

```
Total Container Memory =
    spark.executor.memory           (JVM heap)
  + spark.executor.memoryOverhead   (default: max(executor.memory × 0.10, 384MB))
  + spark.memory.offHeap.size       (native/off-heap, separate from overhead)
  + pyspark.executor.memory         (if applicable)
```

All four components are **additive** — `offHeap.size` is not nested inside `memoryOverhead`. If the total exceeds what the container manager (YARN, Kubernetes, or Databricks) allocates, executors will be killed.

On **Databricks**, the available memory per executor is approximately:

```
Available ≈ (host_memory_MB × 0.97 − 4800) × 0.8
```

For example, a 64 GB host provides roughly **47,000 MB** for Spark.

## What Off-Heap Is Used For

In IndexTables, off-heap memory is consumed by tantivy4java's native Rust layer for:

- **Indexing** — writer heap, Arrow FFI batch buffers, split conversion
- **Querying** — streaming retrieval buffers, Arrow FFI columnar reads
- **Merging** — merge heap, temporary merge buffers
- **L2 disk cache** — write queue buffers

Off-heap memory is **not** currently used for Spark shuffle. Shuffle, broadcast variables, and general Spark execution still use on-heap (JVM) memory. This means `spark.executor.memory` must be large enough to handle your shuffle workload independently.

## Example Configurations

:::note
These configurations are based on early production testing and should be treated as starting points. Your optimal settings will depend on workload characteristics (write-heavy vs. query-heavy), number of cores per executor, and concurrent task count. **Test and monitor before adopting in production.**
:::

### 64 GB Hosts

Tested on `r6id.2xlarge` and `i4i.2xlarge` instances:

```properties
spark.memory.offHeap.enabled  true
spark.memory.offHeap.size     36974886912
spark.executor.memory         11754m
```

Approximate breakdown:

| Component | Size | Notes |
|-----------|------|-------|
| Off-heap (Rust/native) | ~34.4 GB | Indexing, querying, merging, cache write queue |
| On-heap (JVM/Spark) | ~11.5 GB | Shuffle, broadcast, JVM overhead |
| Memory overhead (10% default) | ~1.2 GB | JVM metaspace, thread stacks, JNI |
| **Total** | **~47.1 GB** | Leaves ~17 GB for OS and container overhead |

### 32 GB Hosts

For `c6id.2xlarge` or similar instances:

```properties
spark.memory.offHeap.enabled  true
spark.memory.offHeap.size     16977502208
spark.executor.memory         5397m
```

Approximate breakdown:

| Component | Size | Notes |
|-----------|------|-------|
| Off-heap (Rust/native) | ~15.8 GB | Indexing, querying, merging, cache write queue |
| On-heap (JVM/Spark) | ~5.3 GB | Shuffle, broadcast, JVM overhead |
| Memory overhead (10% default) | ~540 MB | JVM metaspace, thread stacks, JNI |
| **Total** | **~21.6 GB** | Leaves ~10.4 GB for OS and container overhead |

:::caution 32 GB Sizing
The 32 GB configuration leaves less headroom for OS and container overhead. Monitor for container kills and reduce `offHeap.size` if needed.
:::

### General Sizing Approach

Based on the Spark 3.x container memory formula, your settings must satisfy:

```
executor.memory + (executor.memory × 0.10) + offHeap.size  ≤  container budget
```

As a starting point:
- **Off-heap: 50–55% of host memory** — covers native indexing, search, merge, and cache operations
- **On-heap: 15–20% of host memory** — covers Spark shuffle and JVM overhead
- **OS reserve: 25–30% of host memory** — covers page cache, OS buffers, container overhead

These ratios are preliminary. If your workload is shuffle-heavy (large joins, wide aggregations), you may need to shift memory toward on-heap. If your workload is index/query-heavy with minimal shuffle, more off-heap may be beneficial.

## Databricks Configuration

On Databricks, set these as **cluster Spark properties** (not notebook-scoped), since they must be set at cluster startup:

```properties
spark.memory.offHeap.enabled  true
spark.memory.offHeap.size     36974886912
spark.executor.memory         11754m
```

:::note Photon
We recommend disabling Photon when using IndexTables, as it doesn't accelerate IndexTables workloads and its memory consumption can conflict with off-heap settings.
:::

## Monitoring

Native memory statistics are available via `DESCRIBE INDEXTABLES ENVIRONMENT`:

```sql
DESCRIBE INDEXTABLES ENVIRONMENT;
```

Look for rows with `property_name` containing `native_memory` to see current allocation and peak usage.

## Troubleshooting

### "offHeap.enabled is not set" warning

Off-heap memory is not configured. Native allocations will proceed but are not bounded by Spark. Add the `spark.memory.offHeap.*` settings to your cluster configuration.

### Container killed by YARN/Databricks

Your total memory (executor.memory + memoryOverhead + offHeap.size) exceeds the container budget. Reduce `offHeap.size` or `executor.memory`. Use the formula above to verify your settings fit.

### Task failures with memory acquisition denied

Spark's memory manager rejected a native allocation due to memory pressure. This is the system working as intended — preventing an OOM. Reduce parallelism, increase `offHeap.size`, or reduce `indexWriter.heapSize` per task.

## Further Reading

- [Apache Spark Memory Management](https://luminousmen.com/post/dive-into-spark-memory/) — deep dive into Spark's unified memory model
- [Spark Executor Memory Allocation (Databricks)](https://kb.databricks.com/clusters/spark-executor-memory) — how Databricks computes executor memory
- [DataFusion Comet Tuning Guide](https://datafusion.apache.org/comet/user-guide/latest/tuning.html) — similar Rust-via-JNI memory integration approach
- [Spark Memory Configuration Notes (Luca Canali)](https://github.com/LucaCanali/Miscellaneous/blob/master/Spark_Notes/Spark_Memory_Configuration.md) — detailed memory configuration reference
