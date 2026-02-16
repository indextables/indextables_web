---
slug: companion-mode-0.5.0
title: "Search Is an Index, Not a Copy: Introducing Companion Mode in IndexTables 0.5.0"
authors: [scott]
tags: [release, companion-mode, delta-lake, iceberg, parquet]
date: 2026-02-16
---

Every database has indexes.

You don’t copy the table into the index.  
You don’t govern it separately.  
You don’t build ETL pipelines to keep it in sync.

An index is an **acceleration structure**, not a second source of truth.

So why does every search platform ask you to copy your data first?

With IndexTables 0.5.0, that changes.

Introducing **Companion Mode** — a fundamentally new way to add full-text search to your existing **Delta Lake tables, Apache Iceberg tables, or raw Parquet datasets**, **without duplicating your data**.

<!-- truncate -->

---

## An Index, Not a Dataset

Companion Mode treats search the way databases always have: as a physical index over existing data.

When you build a companion index, IndexTables creates **index-only splits** that reference the parquet files that already contain your data. The Tantivy inverted index — term dictionaries, postings lists, and positions — lives in the companion split. The column data stays exactly where it already is:

- In a **Delta Lake table**
- In an **Apache Iceberg table**
- Or in a **plain Parquet directory**

No schema changes.  
No rewritten data.  
No new dataset pretending to be the source of truth.

### Delta Lake

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/events'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress', 'severity':'string')
  AT LOCATION 's3://warehouse/events_index'
```

### Apache Iceberg

```sql
BUILD INDEXTABLES COMPANION FOR ICEBERG 'prod.web_events'
  CATALOG 'rest_catalog' TYPE 'rest'
  WAREHOUSE 's3://iceberg-warehouse'
  INDEXING MODES ('message':'text', 'user_agent':'text')
  AT LOCATION 's3://warehouse/companion/web_events'
```

### Raw Parquet

```sql
BUILD INDEXTABLES COMPANION FOR PARQUET 's3://logs/firewall/'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress')
  AT LOCATION 's3://warehouse/companion/firewall_logs'
```

Same model. Same guarantees. Same query behavior.

---

## Why Copying Data Was Always the Wrong Model

Traditional search pipelines follow a familiar pattern: extract data, transform it, load it into a search engine, and then spend the rest of your time keeping two copies from drifting apart.

At scale, this creates real pain:

- **Storage multiplies.** Your data exists in the lake *and* in the index.
- **Governance fractures.** Two datasets, two access policies, two lineage stories.
- **Freshness becomes fragile.** Every write path needs a matching indexing pipeline.

Companion Mode eliminates these problems **by design**, not configuration.  
Your table — Delta, Iceberg, or Parquet — remains the system of record.  
The index exists solely to make queries faster.

---

## Incremental Sync Without Pipelines

Companion Mode stays current without CDC streams, watermarks, or version tracking on your part.

The first run indexes everything. After that, re-running the same command performs an automatic incremental sync across **all supported table types**:

- **New parquet files** from appends are indexed.
- **Rewritten files** from `OPTIMIZE`, `DELETE`, `UPDATE`, or `MERGE INTO` invalidate the affected companion splits and are re-indexed.
- **Unchanged files** are skipped entirely.

This works through a file-level anti-join. Companion splits record exactly which parquet files they index, allowing IndexTables to precisely identify what changed — regardless of whether those files belong to Delta, Iceberg, or a raw directory.

```sql
-- Re-run the same command.
-- Only new or modified files are processed.
BUILD INDEXTABLES COMPANION FOR ICEBERG 'prod.web_events'
  CATALOG 'rest_catalog' TYPE 'rest'
  AT LOCATION 's3://warehouse/companion/web_events'
```

No separate pipelines.  
No coordination with writers.  
Just run the command — or schedule it — and the index stays correct.

---

## Smaller Indexes, Faster Queries

Because companion splits don’t store document data, they’re dramatically smaller than standalone IndexTables splits.

Depending on configuration, expect **45–70% less index storage**:

| Mode | Split contents | Typical savings |
|------|---------------|-----------------|
| `HYBRID` (default) | Index + fast fields | ~45% smaller |
| `PARQUET_ONLY` | Index only | ~60–70% smaller |

Smaller splits have cascading benefits:

- **Lower storage cost** — index storage is a fraction of the source data.
- **Faster cold reads** — less data to download from object storage.
- **Faster maintenance** — merge and compaction operations complete sooner.

This isn’t a tradeoff. Companion Mode doesn’t sacrifice performance to save space — it’s often *faster* precisely because it’s lighter. Parquet remains excellent at columnar reads, while Tantivy handles search, filtering, and aggregate pushdown (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) exactly as in standalone mode.

---

## One Table, One Governance Story

This is the win that’s easiest to underestimate.

Standalone indexing creates a new dataset. That dataset needs its own access controls, audits, and retention policies. In regulated environments, that’s real operational cost.

Companion Mode doesn’t introduce a new dataset in the governance sense. The source table — Delta or Iceberg — or the source Parquet location remains the single object of control. The companion index is an acceleration structure that inherits the table’s security posture.

On Databricks, this integrates directly with Unity Catalog for both **Delta and Iceberg** tables. Pass a table name instead of a path, and storage locations and credentials are resolved automatically:

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 'prod.security.events'
  CATALOG 'unity'
  AT LOCATION 's3://warehouse/companion/security_events'
```

No separate grants.  
No duplicated policies.  
The index follows the table.

---

## Built for Real Lakehouse Workloads

Companion Mode was designed for how modern lakehouses are actually used:

- **Delta Lake tables** managed in Unity Catalog
- **Apache Iceberg tables** in REST or Hive catalogs
- **Raw Parquet datasets** in object storage
- **High-volume append workloads** with periodic compaction
- **Security, observability, and log analytics** where freshness and cost both matter

Initial builds run as concurrent Spark jobs (up to six batches by default), and `TARGET INPUT SIZE` lets you control how files are grouped for indexing.

---

## Available in IndexTables 0.5.0

Companion Mode ships in IndexTables 0.5.0 with support for **Delta Lake, Apache Iceberg, and Parquet**. It works on Databricks, EMR, and open-source Spark.

If you’re already using IndexTables, Companion Mode is a drop-in option. Existing standalone tables continue to work unchanged — Companion Mode is simply a better fit when you want search **without** data duplication.

Get started with the [Companion Mode documentation](/docs/core-concepts/companion-mode) or the [Quickstart](/docs/getting-started/quickstart).

---

*It’s your data.  
Your format.  
Your performance.  
Your choice.*

