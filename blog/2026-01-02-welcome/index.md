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

Learn more: [Why IndexTables](/why-indextables)

## What is IndexTables?

IndexTables brings high-performance full-text search to Apache Spark. Built on [Tantivy](https://github.com/quickwit-oss/tantivy) and [Quickwit](https://quickwit.io), it runs embedded in Spark executors - no external servers required.

```python
# Write with full-text indexing
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider") \
  .option("spark.indextables.indexing.typemap.content", "text") \
  .save("s3://bucket/logs")

# Read and query with IndexQuery
logs = spark.read \
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider") \
  .load("s3://bucket/logs")

logs.filter("content indexquery 'error AND database'").show()
```

## Key Features

- **No Infrastructure**: Runs inside Spark executors - just add the library and start indexing
- **Spark Native**: Full filter pushdown, aggregate pushdown, and partition pruning with Spark SQL
- **Cloud Ready**: QuickwitSplit format optimized for S3 and Azure with L2 disk cache on NVMe
- **Full-Text Search**: IndexQuery operators with Tantivy/Quickwit syntax - boolean queries, phrase search, fuzzy matching
- **10-1000x Faster Analytics**: Aggregations run directly in the search engine, not Spark
- **Time-Series Analytics**: Built-in date histograms and bucket aggregations for log analysis

## Getting Started

Check out our [Quickstart Guide](/docs/getting-started/quickstart) to get up and running in 5 minutes.

## Stay Connected

- Star us on [GitHub](https://github.com/indextables/indextables_spark)
- Join the discussion in [GitHub Discussions](https://github.com/indextables/indextables_spark/discussions)
- Report issues on [GitHub Issues](https://github.com/indextables/indextables_spark/issues)

---

*It's your data. Your performance. Your choice.*
