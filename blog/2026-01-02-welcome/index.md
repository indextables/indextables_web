---
slug: welcome
title: "Your Fast Search Data Should Be Yours"
authors: [indextables]
tags: [announcement, mission]
date: 2026-01-02
---

We're excited to launch the official IndexTables website — and to share our vision for open search in the lakehouse era.

<!-- truncate -->

## The Search Revolution

Six years ago, the data lakehouse revolution changed everything. Data stopped belonging to vendors. It started belonging to **you**.

But one domain missed the revolution: **search**. Observability and security search stacks are still dominated by closed, expensive ecosystems.

**IndexTables brings that same open revolution to search** — with performance that rivals the biggest proprietary platforms, built entirely on open tech.

Read our full manifesto: [Why IndexTables](/why-indextables)

## What is IndexTables?

IndexTables brings high-performance full-text search to Apache Spark. Built on [Tantivy](https://github.com/quickwit-oss/tantivy) and [Quickwit](https://quickwit.io), it runs embedded in Spark executors - no external servers required.

```scala
// Write with full-text indexing
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.content", "text")
  .save("s3://bucket/logs")

// Query with IndexQuery
df.filter($"content" indexquery "error AND database").show()
```

## Key Features

- **Full-Text Search**: Native Tantivy/Quickwit query syntax with IndexQuery operators
- **Aggregate Pushdown**: COUNT, SUM, AVG, MIN, MAX executed in the search engine
- **Cloud Optimized**: QuickwitSplit format for S3 and Azure
- **Zero Infrastructure**: No Elasticsearch cluster to manage
- **Open Format**: Your data stays yours, in open formats on your storage

## Getting Started

Check out our [Quickstart Guide](/docs/getting-started/quickstart) to get up and running in 5 minutes.

## Stay Connected

- Star us on [GitHub](https://github.com/indextables/indextables_spark)
- Join the discussion in [GitHub Discussions](https://github.com/indextables/indextables_spark/discussions)
- Report issues on [GitHub Issues](https://github.com/indextables/indextables_spark/issues)

---

*It's your data. Your performance. Your choice.*
