---
slug: release-0.5.4
title: "IndexTables 0.5.4 — Streaming Sync, Unified Memory, and Faster Data Paths"
authors: [scott]
tags: [release, companion-mode, arrow-ffi, memory-management, streaming]
date: 2026-03-15
---

IndexTables 0.5.4 introduces **streaming companion synchronization**, **unified native memory management**, and **Arrow FFI across all data paths**. Together these changes simplify the architecture, reduce serialization overhead, and make IndexTables behave more like a native Spark component rather than an external indexing engine.

More importantly, this release continues a broader shift in IndexTables toward **incremental lakehouse indexing and fully columnar execution**. Companion indexes can now stay synchronized with table changes continuously, while Arrow-native data movement and unified memory management allow Spark to treat indexing and search workloads as first-class citizens inside the execution engine.

This release also adds a **streaming columnar reader** shared across all split types and introduces a new **`complete` read mode** designed for ETL workloads.

<!-- truncate -->

## Streaming Companion Sync

Companion indexes can now remain continuously up-to-date using a single SQL command:

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 's3://bucket/events'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress')
  AT LOCATION 's3://bucket/events_index'
  WITH STREAMING POLL INTERVAL 30 SECONDS
```

Instead of rescanning the entire source table on each cycle, streaming sync reads only the **Delta commit log** or **Iceberg manifest deltas**. This makes each synchronization proportional to the amount of **new data written**, not the total table size.

A lightweight version probe — a single metadata check — skips the cycle entirely when no changes are detected.

If the streaming process restarts, the loop resumes from the **last synced version recorded in the companion transaction log**, continuing incrementally without requiring a full anti-join against the source table.

See [Streaming Companion Sync](/docs/core-concepts/companion-mode#streaming-companion-sync) for details.

## Unified Native Memory Management

IndexTables now bridges Rust memory allocations in **tantivy4java** directly into Spark's `UnifiedMemoryManager`.

Spark can now see and regulate native memory usage for:

- indexing
- querying
- segment merges
- query caching

This allows Spark to apply **backpressure or allocation denial** when executors are under memory pressure, preventing runaway native allocations.

To enable the feature, Spark off-heap memory must be configured:

```properties
spark.memory.offHeap.enabled  true
spark.memory.offHeap.size     36974886912
spark.executor.memory         11754m
```

This capability is still evolving and will continue to improve in future releases. See the [Unified Memory Management](/docs/configuration/memory-management) guide for configuration recommendations and sizing guidance.

## Arrow FFI Everywhere

Version 0.5.4 completes the migration to the **Arrow C Data Interface (FFI)** across all major data paths.

### Write Path

The write pipeline now uses Arrow FFI instead of the previous TANT batch serialization format.

This produces:

- **+31% average write throughput**
- **up to +57% improvement for mixed complex types**

Structs, arrays, and maps are passed directly as **native Arrow vectors**, eliminating JSON serialization overhead.

### Aggregation Reads

All aggregation paths — including **simple**, **GROUP BY**, and **bucket aggregations** — now use Arrow FFI by default. This replaces per-bucket JNI round-trips with a fully columnar transfer model.

### Unified Read Path

A single **streaming columnar reader** now handles all split types (both companion and standalone). This replaces the previous dual-path architecture and simplifies the execution pipeline.

## Complete vs. Fast Read Mode

IndexTables now supports two read modes depending on workload characteristics.

| Mode | Default Limit | Best For |
|-----|-----|-----|
| `fast` *(default)* | 250 rows | Interactive queries |
| `complete` | No limit | ETL, extracts, batch processing |

The `fast` mode protects interactive workloads from accidentally pulling large result sets. However, when IndexTables is used as a **data source for ETL pipelines**, the default limit can silently truncate results.

The new `complete` mode removes this limit:

```scala
spark.conf.set("spark.indextables.read.mode", "complete")
```

See [Read Mode: Complete vs. Fast](/docs/core-concepts/companion-mode#read-mode-complete-vs-fast) for details.

## Multi-Region Table Roots

Companion indexes now support **named table roots**, allowing readers in different regions to resolve table paths locally.

This is useful when datasets are replicated across regions for latency or cost reasons.

```sql
SET INDEXTABLES TABLE ROOT 'us-east' = 's3://us-east-replica/events'
  FOR 's3://warehouse/events_index';
```

Readers in each region can map the companion index to a **local replica of the underlying parquet data**, avoiding cross-region reads.

See [Multi-Region Table Roots](/docs/core-concepts/companion-mode#multi-region-table-roots) for the full SQL command reference.

## Additional Changes

- **tantivy4java 0.32.7**
  Adds streaming retrieval support for regular splits, fixes `rewrite_companion_query()`, and introduces the `NativeMemoryManager` API.

- **Memory accountant fix**
  Rust async (`tokio`) thread callbacks now correctly charge allocations to the active Spark task rather than being denied.

- **PartitionPruningTest stability fix**
  Eliminates a flaky test that occasionally failed under parallel execution.

- **Range aggregation bug fix**
  Fixed an issue where range bucketing collapsed all results into `[0.0, 6]`.

- **Multi-key bucket FFI**
  GROUP BY queries combining `date_histogram` with additional columns now execute through the Arrow FFI path.

## Get Started

```xml
<dependency>
  <groupId>io.indextables</groupId>
  <artifactId>indextables_spark</artifactId>
  <version>0.5.4_spark_3.5.3</version>
  <classifier>linux-x86_64-shaded</classifier>
</dependency>
```

For full installation options, see the [Installation guide](/docs/getting-started/installation).
For the complete list of changes, see the [release notes on GitHub](https://github.com/indextables/indextables_spark/releases/tag/v0.5.4).
