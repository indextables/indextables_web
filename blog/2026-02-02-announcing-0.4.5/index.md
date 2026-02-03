---
slug: announcing-0.4.5
title: "Announcing IndexTables 0.4.5 — Faster, More Reliable, More Scalable"
authors: [indextables]
tags: [announcement, release]
date: 2026-02-02
---

We're excited to announce the release of **IndexTables 0.4.5**, a milestone update that advances performance, stability, usability, and cloud-scale readiness for large-scale data workloads.

Since the 0.4.0 line, the IndexTables project has stayed focused on a simple goal: **bring blazing-fast full-text search and analytics to Spark**, running entirely inside your existing Spark cluster—no external services or additional infrastructure required. The result is dramatically faster search and aggregation compared to traditional table formats, with **100×–1000× speedups** observed in real-world applications for interactive log analytics and cybersecurity workloads.

But performance is only the starting point.

<!-- truncate -->

## What 0.4.0 Delivered — A Major Leap in Search + Analytics

The 0.4.0 series laid a strong foundation for interactive analytics on massive datasets, introducing:

- **Native full-text search in Spark SQL**
  Powered by Tantivy/Quickwit and fully integrated with Spark SQL, enabling search combined with joins, filters, and aggregations.

- **Aggregate and predicate pushdown**
  Filters and aggregates such as `COUNT`, `SUM`, and `AVG` execute directly in the search engine layer for substantial performance gains.

- **Time-series and bucket aggregations**
  Date histograms and flexible bucketing make log and metric analysis fast and expressive.

- **Cloud object storage support**
  Optimized support for AWS S3 and Azure Blob Storage.

- **Smart file skipping and split formats**
  Dramatically reduced I/O by skipping irrelevant data segments.

- **NVMe L2 disk cache with pre-warming**
  Eliminates cold-start latency and accelerates repeated queries.

Together, these features established IndexTables as a compelling open-source solution for full-text search and analytics at cloud scale. Learn more about our approach in [Why IndexTables](/why-indextables).

## What's New in 0.4.5 — Sharpening the Edge

With 0.4.5, the focus shifts from foundation to refinement—polishing performance, strengthening reliability, and improving the production experience.

### Scalability & Performance
- Reduced metadata scan times by up to 95% on tables with hundreds of thousands of splits
- Improved memory efficiency during large batch indexing operations

### Usability & Developer Experience
- Clearer error messages for common misconfiguration issues
- Improved default settings that work well out of the box for most workloads
- Better diagnostics in `DESCRIBE INDEXTABLE` output

### Enhanced Cloud Support
- Full support for Azure managed identities
- More robust temporary credential refresh for long-running jobs

### Ecosystem & Deployment
- Updated and tested against Spark 3.5.3
- Streamlined [Databricks deployment](/docs/cloud/databricks) with Unity Catalog credential passthrough

This release reflects months of focused real-world testing and refinement, particularly across **interactive log observability and cybersecurity workloads**, where users continue to see orders-of-magnitude faster query times than with traditional formats.

## Seamless Databricks + Unity Catalog Support on AWS

One of the most impactful improvements in 0.4.5 is a dramatically smoother experience for **Databricks users on AWS**, enabled by transparent support for **Unity Catalog credentials**.

In earlier releases, integrating custom Spark data sources with Unity Catalog-managed storage often required extra configuration, manual credential wiring, or workarounds that undermined the "it just works" Databricks experience. With 0.4.5, that friction is gone—IndexTables now integrates cleanly and transparently with Unity Catalog-managed storage on AWS.

## Built for Real Workloads

IndexTables 0.4.5 is designed for systems that demand fast, interactive access to large datasets, including:

- Log analytics platforms
- SIEM and security search tools
- Observability dashboards
- Any workload requiring low-latency search and aggregation on large tables

All without locking you into proprietary ecosystems.

## Get Started

Upgrading is straightforward. Add the dependency to your project:

**Maven:**
```xml
<dependency>
  <groupId>io.indextables</groupId>
  <artifactId>indextables_spark</artifactId>
  <version>0.4.5_spark_3.5.3</version>
  <classifier>linux-x86_64-shaded</classifier>
</dependency>
```

**SBT:**
```scala
libraryDependencies += "io.indextables" % "indextables_spark" % "0.4.5_spark_3.5.3" classifier "linux-x86_64-shaded"
```

**Spark Shell:**
```bash
spark-shell --packages io.indextables:indextables_spark:0.4.5_spark_3.5.3:linux-x86_64-shaded
```

For Databricks, see the [Databricks deployment guide](/docs/cloud/databricks).

For full installation options and requirements, see the [Installation guide](/docs/getting-started/installation). For the complete list of changes, check out the [release notes on GitHub](https://github.com/indextables/indextables_spark/releases/tag/v0.4.5).

If you haven't tried IndexTables yet, **0.4.5 is a great time to kick the tires**. Start with the [Quickstart guide](/docs/getting-started/quickstart) to create your first index in 5 minutes.

Stay tuned for upcoming posts diving deeper into advanced features and performance benchmarks.

---

*It's your data. Your performance. Your choice.*
