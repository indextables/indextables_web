---
title: Why IndexTables
description: The open revolution came to data lakes. Now it's coming to search.
---

# Why IndexTables

<p style={{fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center'}}>
Your fast search data should be yours
</p>

## The Data Lakehouse Revolution

Six years ago, the data world flipped upside down.

A new idea emerged — **the data lakehouse** — combining the openness of data lakes with the performance of data warehouses.

It wasn't just an architecture. It was a revolution.

**Data stopped belonging to vendors. It started belonging to you.**

For the first time, teams could choose the right tools — based on innovation, cost, and skill fit — not lock-in. Vendors had to compete on merit, not monopoly.

## Search Missed the Revolution

But one domain missed the revolution: **search**.

Observability and security search stacks are still dominated by closed, expensive ecosystems. You're locked into:

- **Proprietary formats** that only work with one vendor
- **Server infrastructure** that you have to manage and scale
- **Licensing costs** that grow with your data
- **Vendor roadmaps** that may not align with your needs

## IndexTables: Open Search for the Lakehouse Era

IndexTables brings that same open revolution to search — with performance that rivals the biggest proprietary platforms, built entirely on open tech.

### Built on Spark

IndexTables runs as a native Spark DataSource V2 — the same interface you use for Delta Lake, Iceberg, and Parquet. No separate cluster. No new infrastructure. Just add the library to your existing Spark environment.

```python
# Write an index
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider") \
  .option("spark.indextables.indexing.typemap.content", "text") \
  .save("s3://bucket/logs")

# Read and query with SQL
logs = spark.read.format("io.indextables.spark.core.IndexTables4SparkTableProvider") \
  .load("s3://bucket/logs")
logs.createOrReplaceTempView("logs")

spark.sql("SELECT * FROM logs WHERE content indexquery 'error AND timeout'")
```

### Powered by Tantivy and Quickwit

IndexTables is built on [Tantivy](https://github.com/quickwit-oss/tantivy) and [Quickwit](https://quickwit.io) — Rust-based search technology that delivers Lucene-class performance with modern, memory-safe code.

### Open Format

The QuickwitSplit format is documented and open. Your indexes are stored in standard object storage (S3, Azure Blob). No proprietary lock-in.

### Community Driven

IndexTables is open source. You can inspect the code, contribute features, and shape the roadmap.

---

## The Bottom Line

| Traditional Search | IndexTables |
|--------------------|-------------|
| Separate cluster to manage | Runs in your Spark executors |
| Proprietary format | Open QuickwitSplit format |
| Per-GB licensing | Open source |
| Vendor lock-in | Your data, your choice |

---

<p style={{fontSize: '1.4rem', fontWeight: 600, textAlign: 'center', marginTop: '3rem'}}>
<em>It's your data. Your performance. Your choice.</em>
</p>

<div style={{textAlign: 'center', marginTop: '2rem'}}>
<a className="button button--primary button--lg" href="/docs/getting-started/quickstart">
Get Started
</a>
</div>
