---
slug: release-0.5.5
title: "IndexTables 0.5.5 — Native Rust Transaction Log, DataSource Short Name, and FFI Profiler"
authors: [scott]
tags: [release, arrow-ffi, datasource, performance]
date: 2026-04-05
---

IndexTables 0.5.5 continues the shift toward a fully native execution stack.

The headline change is a **complete reimplementation of the transaction log in Rust**, replacing the previous Scala-based design with a native module built on Arrow FFI. This release also introduces a DataSource short name and adds built-in profiling for the FFI read path.

<!-- truncate -->

## Native Rust Transaction Log

The transaction log—responsible for index state, checkpoints, and coordinating concurrent writes—has been **rebuilt entirely in Rust** as part of the `tantivy4java` native layer.

This new `NativeTransactionLog` replaces both `ScalaTransactionLog` and `OptimizedTransactionLog`. All I/O now flows through the Arrow C Data Interface (FFI), enabling zero-copy data sharing between the JVM and Rust with no serialization overhead.

Moving this layer into Rust unlocks a set of capabilities that were previously difficult to implement cleanly:

- **Optimistic concurrency with automatic retry** — write conflicts are resolved natively without JVM round-trips  
- **Native LRU cache with TTL** — hot log entries stay in memory, reducing object storage reads  
- **GZIP compression** — checkpoints and manifests are compressed before write  
- **Auto-checkpointing** — periodic checkpoints bound read amplification  
- **Graceful fallback** — when no checkpoint exists, the log transparently falls back to version scanning  

This change is fully transparent—existing indexes continue to work without migration.

## DataSource Short Name

IndexTables can now be referenced using the short name `"indextables"` when working with Spark.

```scala
spark.read.format("indextables").load("s3://bucket/events_index")
```

```sql
SELECT * FROM indextables.`s3://bucket/events_index`
```

## FFI Read Path Profiler

This release introduces built-in profiling for the native FFI read path.

The profiler exposes timing and cache metrics directly through SQL, making it possible to understand where time is spent during indexed reads—without external tooling.

**Enable or disable profiling:**

```sql
ENABLE INDEXTABLES PROFILER
DISABLE INDEXTABLES PROFILER
```

Profiling is distributed—enabling it on the driver activates it across all executors.

**Inspect timing metrics:**

```sql
DESCRIBE INDEXTABLES PROFILER
```

Returns per-section metrics: `calls`, `total_ms`, `avg_us`, `min_us`, `max_us`.

**Inspect cache metrics:**

```sql
DESCRIBE INDEXTABLES PROFILER CACHE
```

Returns cache `hits`, `misses`, and `hit_rate` per executor.

**Reset counters:**

```sql
RESET INDEXTABLES PROFILER
RESET INDEXTABLES PROFILER CACHE
```

`RESET` reads and atomically clears counters, making it safe for measure–then–reset workflows.

## Additional Changes

- **tantivy4java 0.34.4** — performance and stability improvements in the native layer  
- **Range bucket aggregation fix** — correct results when combining range buckets with nested `GROUP BY`  
- **Iceberg DATE partition handling** — fixed partition value conversion for `DATE` columns  
- **Iceberg `file://` path handling** — corrected local URI resolution in companion operations  

## Get Started

```xml
<dependency>
  <groupId>io.indextables</groupId>
  <artifactId>indextables_spark</artifactId>
  <version>0.5.5_spark_3.5.3</version>
  <classifier>linux-x86_64-shaded</classifier>
</dependency>
```

For installation details, see the [Installation guide](/docs/getting-started/installation).  
For the full change list, see the [GitHub release notes](https://github.com/indextables/indextables_spark/releases/tag/v0.5.5).
