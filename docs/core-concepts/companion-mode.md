---
sidebar_position: 1
description: Build search indexes over existing Delta, Iceberg, and Parquet data without copying it
---

# Companion Mode

Build full-text search indexes over your existing **Delta Lake tables, Apache Iceberg tables, or Parquet datasets** — without duplicating data.

## Overview

Companion Mode creates **index-only splits** that reference the parquet files already backing your table. The Tantivy inverted index (term dictionaries, postings lists, positions) lives in the companion split. Column data stays exactly where it is — in your Delta table, Iceberg table, or Parquet directory.

**Key benefits:**

- **No data duplication** — the source table remains the single system of record
- **45–70% smaller indexes** — companion splits contain only index structures, not document data
- **Incremental sync** — re-running the command indexes only new or changed files
- **Transparent reads** — queries work identically to standalone IndexTables; companion mode is auto-detected
- **Format-agnostic** — same model for Delta Lake, Apache Iceberg, and raw Parquet

## Supported Source Formats

| Format | Source Identifier | Example |
|--------|-------------------|---------|
| **Delta Lake** | Storage path or Unity Catalog table name | `'s3://warehouse/events'` or `'schema.events'` |
| **Apache Iceberg** | Namespace-qualified table name | `'prod.web_events'` |
| **Parquet** | Directory path | `'s3://logs/firewall/'` |

## Syntax

### Delta Lake (Path-Based)

```sql
BUILD INDEXTABLES COMPANION FOR DELTA '<storage_path>'
  [INDEXING MODES ('<field>':'<mode>' [, ...])]
  [FASTFIELDS MODE {HYBRID | PARQUET_ONLY | DISABLED}]
  [HASHED FASTFIELDS {INCLUDE | EXCLUDE} ('<field>' [, ...])]
  [TARGET INPUT SIZE <size>]
  [WRITER HEAP SIZE <size>]
  [FROM VERSION <number>]
  [WHERE <partition_predicates>]
  AT LOCATION '<destination_path>'
  [DRY RUN]
```

### Delta Lake (Unity Catalog)

```sql
BUILD INDEXTABLES COMPANION FOR DELTA '<schema.table>'
  CATALOG '<catalog_name>' [TYPE '<catalog_type>']
  [INDEXING MODES ('<field>':'<mode>' [, ...])]
  [FASTFIELDS MODE {HYBRID | PARQUET_ONLY | DISABLED}]
  [HASHED FASTFIELDS {INCLUDE | EXCLUDE} ('<field>' [, ...])]
  [TARGET INPUT SIZE <size>]
  [WRITER HEAP SIZE <size>]
  [FROM VERSION <number>]
  [WHERE <partition_predicates>]
  AT LOCATION '<destination_path>'
  [DRY RUN]
```

### Apache Iceberg

```sql
BUILD INDEXTABLES COMPANION FOR ICEBERG '<namespace.table_name>'
  [CATALOG '<catalog_name>' [TYPE '<catalog_type>']]
  [WAREHOUSE '<warehouse_path>']
  [INDEXING MODES ('<field>':'<mode>' [, ...])]
  [FASTFIELDS MODE {HYBRID | PARQUET_ONLY | DISABLED}]
  [HASHED FASTFIELDS {INCLUDE | EXCLUDE} ('<field>' [, ...])]
  [TARGET INPUT SIZE <size>]
  [WRITER HEAP SIZE <size>]
  [FROM SNAPSHOT <snapshot_id>]
  [WHERE <partition_predicates>]
  AT LOCATION '<destination_path>'
  [DRY RUN]
```

### Parquet

```sql
BUILD INDEXTABLES COMPANION FOR PARQUET '<parquet_directory>'
  [SCHEMA SOURCE '<parquet_file>']
  [INDEXING MODES ('<field>':'<mode>' [, ...])]
  [FASTFIELDS MODE {HYBRID | PARQUET_ONLY | DISABLED}]
  [HASHED FASTFIELDS {INCLUDE | EXCLUDE} ('<field>' [, ...])]
  [TARGET INPUT SIZE <size>]
  [WRITER HEAP SIZE <size>]
  [WHERE <partition_predicates>]
  AT LOCATION '<destination_path>'
  [DRY RUN]
```

### Format-Specific Clause Restrictions

| Clause | Delta | Iceberg | Parquet |
|--------|:-----:|:-------:|:-------:|
| `FROM VERSION` | Yes | — | — |
| `FROM SNAPSHOT` | — | Yes | — |
| `SCHEMA SOURCE` | — | — | Yes |
| `WAREHOUSE` | — | Yes | — |
| `CATALOG` / `TYPE` | Yes | Yes | — |

## Parameters Reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| `INDEXING MODES` | All fields as `string` | Per-field indexing mode: `'field':'mode'` pairs |
| `FASTFIELDS MODE` | `HYBRID` | Fast field strategy: `HYBRID`, `PARQUET_ONLY`, or `DISABLED` |
| `HASHED FASTFIELDS` | all eligible | Control which string fields get U64 hashed fast fields for aggregations. Use `INCLUDE` to whitelist or `EXCLUDE` to blacklist specific fields. |
| `TARGET INPUT SIZE` | `2G` | Maximum cumulative parquet file size per companion split |
| `WRITER HEAP SIZE` | `1G` | Tantivy writer memory budget per executor task |
| `FROM VERSION` | — | Start sync from a specific Delta version (Delta only) |
| `FROM SNAPSHOT` | — | Time-travel to a specific Iceberg snapshot ID (Iceberg only) |
| `WHERE` | — | Partition predicates to filter which files are indexed |
| `DRY RUN` | off | Preview the sync plan without creating splits |
| `AT LOCATION` | *(required)* | Destination path for the companion index |
| `CATALOG` | — | Catalog name for Unity Catalog (Delta) or Iceberg catalogs |
| `TYPE` | — | Catalog type (e.g., `rest`, `glue`, `hive`) |
| `WAREHOUSE` | — | Warehouse location (Iceberg only) |
| `SCHEMA SOURCE` | — | Parquet file to use for schema detection (Parquet only) |

## Indexing Modes

Control how each field is indexed in the companion split:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `text` | Full-text search with tokenization | Log messages, descriptions, free-form text |
| `string` | Exact-match indexing (default) | Status codes, IDs, categories |
| `json` | JSON field indexing | Structured JSON payloads |
| `ipaddress` / `ip` | IP address field type | Source IPs, destination IPs |

```sql
INDEXING MODES ('message':'text', 'src_ip':'ipaddress', 'severity':'string', 'payload':'json')
```

Fields not listed in `INDEXING MODES` default to `string`.

### Compact String Indexing Modes

For high-cardinality string fields (trace IDs, UUIDs, request IDs), standard `string` indexing can produce large term dictionaries. Compact string indexing modes reduce index size by hashing values or stripping high-cardinality tokens from text.

| Mode | What Gets Indexed | Query Support |
|------|-------------------|---------------|
| `exact_only` | xxHash64 of the raw string (U64 field) | Term queries only (search values are auto-hashed) |
| `text_uuid_exactonly` | Tokenized text with UUIDs stripped + companion U64 hash per UUID | Full-text on text, exact match on UUIDs |
| `text_uuid_strip` | Tokenized text with UUIDs stripped (UUIDs discarded) | Full-text only |
| `text_custom_exactonly` | Tokenized text with regex matches stripped + companion U64 hash per match | Full-text on text, exact match on regex pattern |
| `text_custom_strip` | Tokenized text with regex matches stripped (matches discarded) | Full-text only |

```sql
INDEXING MODES (
  'trace_id':'exact_only',
  'message':'text_uuid_exactonly',
  'error_log':'text_custom_exactonly(ERR-\\d{4})',
  'notes':'text_uuid_strip'
)
```

#### Query Behavior

Queries on compact string fields are transparently rewritten at search time:

- **Term queries** on `exact_only` fields automatically hash the search value before matching
- **Term queries** on `*_exactonly` fields redirect UUID/pattern matches to the companion hash field
- **Full-text queries** (`parseQuery()`) on `exact_only` fields are converted to hashed term queries
- **Full-text queries** on `*_exactonly` fields work normally on the stripped text, with UUID/pattern matches redirected to the companion hash

No changes to your query code are needed — rewriting is handled internally.

#### Query Limitations

Wildcard, regex, and phrase prefix queries are **not supported** on `exact_only` fields because only the hash is stored, not the original string. These queries return a clear error:

```
Cannot use wildcard query on exact_only field 'trace_id'...
```

Range queries on `exact_only` fields are handled by Spark as a post-filter on the underlying parquet data rather than being pushed down to the index.

#### Examples

```sql
-- High-cardinality trace IDs: hash-only indexing (smallest index size)
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/traces'
  INDEXING MODES ('trace_id':'exact_only', 'span_id':'exact_only', 'message':'text')
  AT LOCATION 's3://warehouse/traces_index'

-- Log messages with UUIDs: full-text search + exact UUID lookup
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/logs'
  INDEXING MODES ('message':'text_uuid_exactonly', 'request_id':'exact_only')
  AT LOCATION 's3://warehouse/logs_index'

-- Custom pattern: extract and hash error codes from log lines
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/errors'
  INDEXING MODES ('error_log':'text_custom_exactonly(ERR-\\d{4})')
  AT LOCATION 's3://warehouse/errors_index'
```

## Fast Field Modes

Fast fields control how columnar data is stored for aggregations and range queries:

| Mode | Companion Split Contains | Tradeoffs |
|------|--------------------------|-----------|
| `HYBRID` *(default)* | Fast fields in both tantivy index and parquet | Best read performance; moderate split size |
| `PARQUET_ONLY` | Fast fields only in parquet source files | Smallest companion splits (60–70% savings); aggregations read from parquet |
| `DISABLED` | No fast fields | Index-only; no aggregation or range query support |

```sql
-- Smallest possible companion splits
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/events'
  FASTFIELDS MODE PARQUET_ONLY
  INDEXING MODES ('message':'text')
  AT LOCATION 's3://warehouse/events_index'
```

## Unity Catalog Integration

On Databricks, you can pass a Unity Catalog table name instead of a raw storage path. IndexTables resolves the table's storage location and credentials automatically:

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 'schema.events'
  CATALOG 'unity_catalog'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress')
  AT LOCATION 's3://warehouse/companion/events'
```

- The table name format is `'schema.table'` (no three-part `catalog.schema.table` — the catalog is specified in the `CATALOG` clause)
- Storage location is resolved from Unity Catalog metadata
- Credentials are resolved automatically via the Unity Catalog credential provider
- Path-based syntax (`'s3://...'`) continues to work unchanged

:::tip Prerequisites
Unity Catalog integration requires the credential provider to be configured. See [Databricks Deployment](/docs/cloud/databricks) for setup instructions.
:::

## Iceberg Catalog Configuration

Iceberg tables require a catalog for metadata resolution. Configure via SQL clauses or Spark properties:

### SQL Clauses

```sql
BUILD INDEXTABLES COMPANION FOR ICEBERG 'prod.web_events'
  CATALOG 'rest_catalog' TYPE 'rest'
  WAREHOUSE 's3://iceberg-warehouse'
  AT LOCATION 's3://warehouse/companion/web_events'
```

### Spark Properties

| Property | Description |
|----------|-------------|
| `spark.indextables.iceberg.catalogType` | Catalog type: `rest`, `glue`, `hive` |
| `spark.indextables.iceberg.uri` | Catalog URI |
| `spark.indextables.iceberg.warehouse` | Warehouse location |
| `spark.indextables.iceberg.token` | Authentication token |
| `spark.indextables.iceberg.credential` | Authentication credential |
| `spark.indextables.iceberg.s3Endpoint` | S3-compatible endpoint (e.g., MinIO) |
| `spark.indextables.iceberg.s3PathStyleAccess` | Enable S3 path-style access |

### Supported Catalog Types

| Type | Description |
|------|-------------|
| `rest` | REST catalog (e.g., Tabular, Polaris) |
| `glue` | AWS Glue Data Catalog |
| `hive` | Hive Metastore (HMS) |

## Incremental Sync

Companion mode automatically detects changes and indexes only new or modified files:

1. **First run** — indexes all parquet files in the source table
2. **Subsequent runs** — performs a file-level anti-join against existing companion splits to identify:
   - **New files** from appends → indexed
   - **Rewritten files** from `OPTIMIZE`, `DELETE`, `UPDATE`, or `MERGE INTO` → affected companion splits invalidated and re-indexed
   - **Unchanged files** → skipped entirely

Re-run the same command to sync:

```sql
-- Only new or modified files are processed
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/events'
  AT LOCATION 's3://warehouse/events_index'
```

No separate pipelines, CDC streams, or version tracking required. If a sync is interrupted, restarting picks up where it left off.

## Read Path

Companion mode is **transparent at read time**:

- Auto-detected from transaction log metadata — no user configuration needed
- Document data is resolved from the original parquet files automatically
- All standard filters, aggregations, and IndexQuery operations work identically to standalone mode
- A **write guard** prevents accidental direct writes (non-companion `INSERT`/`APPEND`) to companion-mode tables

## MERGE SPLITS with Companion

[MERGE SPLITS](/docs/sql-commands/merge-splits) works with companion splits and preserves companion metadata:

- `companionSourceFiles` are concatenated from all source splits
- The maximum `companionDeltaVersion` / `source_version` is retained
- `companionFastFieldMode` is preserved (must be consistent across merged splits)

## PREWARM CACHE with Companion

[PREWARM CACHE](/docs/sql-commands/prewarm-cache) supports two additional segments for companion splits:

| Segment | Aliases | Description |
|---------|---------|-------------|
| `PARQUET_FAST_FIELDS` | `PARQUET_FAST` | Preload parquet fast field data for aggregations |
| `PARQUET_COLUMNS` | `PARQUET_COLS` | Preload parquet column data for document retrieval |

```sql
PREWARM INDEXTABLES CACHE 's3://warehouse/events_index'
  FOR SEGMENTS (TERM_DICT, FAST_FIELD, PARQUET_FAST_FIELDS, PARQUET_COLUMNS);
```

**Auto-detection:** When `FAST_FIELD` is requested on companion splits using `HYBRID` or `PARQUET_ONLY` mode, parquet fast fields are automatically included — no need to specify `PARQUET_FAST_FIELDS` explicitly.

## Output Schema

| Column | Type | Description |
|--------|------|-------------|
| `table_path` | String | IndexTables destination path |
| `source_path` | String | Source table path |
| `status` | String | `success`, `no_action`, `dry_run`, or `error` |
| `source_version` | Long | Delta version, Iceberg snapshot ID, or null (Parquet) |
| `splits_created` | Int | Number of companion splits created |
| `splits_invalidated` | Int | Number of old splits removed |
| `parquet_files_indexed` | Int | Number of parquet files indexed |
| `parquet_bytes_downloaded` | Long | Total parquet bytes downloaded |
| `split_bytes_uploaded` | Long | Total companion split bytes uploaded |
| `duration_ms` | Long | Wall-clock duration |
| `message` | String | Human-readable status message |

## Configuration Reference

| Property | Default | Description |
|----------|---------|-------------|
| `spark.indextables.companion.writerHeapSize` | `1G` | Writer heap size (overridden by SQL `WRITER HEAP SIZE` clause) |
| `spark.indextables.companion.readerBatchSize` | `8192` | Parquet reader batch size |
| `spark.indextables.companion.sync.batchSize` | `defaultParallelism` | Tasks per Spark job |
| `spark.indextables.companion.sync.maxConcurrentBatches` | `6` | Maximum concurrent Spark jobs during sync |
| `spark.indextables.companion.schedulerPool` | `indextables-companion` | Spark scheduler pool name for batch parallelism |

:::note Scheduler Mode
Concurrent batch execution requires `spark.scheduler.mode=FAIR`. This is the default on Databricks. On open-source Spark, set it explicitly in your cluster configuration.
:::

## Examples

### Delta Lake (Path-Based)

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/events'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress', 'severity':'string')
  AT LOCATION 's3://warehouse/events_index'
```

### Delta Lake (Unity Catalog)

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 'security.events'
  CATALOG 'unity_catalog'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress')
  FASTFIELDS MODE HYBRID
  AT LOCATION 's3://warehouse/companion/security_events'
```

### Apache Iceberg (REST Catalog)

```sql
BUILD INDEXTABLES COMPANION FOR ICEBERG 'prod.web_events'
  CATALOG 'rest_catalog' TYPE 'rest'
  WAREHOUSE 's3://iceberg-warehouse'
  INDEXING MODES ('message':'text', 'user_agent':'text')
  AT LOCATION 's3://warehouse/companion/web_events'
```

### Parquet

```sql
BUILD INDEXTABLES COMPANION FOR PARQUET 's3://logs/firewall/'
  SCHEMA SOURCE 's3://logs/firewall/part-00000.parquet'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress')
  AT LOCATION 's3://warehouse/companion/firewall_logs'
```

### Incremental Sync

```sql
-- First run: indexes all files
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/events'
  INDEXING MODES ('message':'text')
  AT LOCATION 's3://warehouse/events_index'

-- Subsequent runs: only new/changed files
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/events'
  INDEXING MODES ('message':'text')
  AT LOCATION 's3://warehouse/events_index'
```

### Dry Run

```sql
-- Preview what would be indexed without making changes
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/events'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress')
  AT LOCATION 's3://warehouse/events_index'
  DRY RUN
```

### Hashed Fastfields

```sql
-- Only generate hashed fast fields for specific columns
BUILD INDEXTABLES COMPANION FOR PARQUET 's3://logs/events/'
  HASHED FASTFIELDS INCLUDE ('title', 'category')
  AT LOCATION 's3://warehouse/companion/events'

-- Exclude large or irrelevant string fields from hashed fast fields
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/documents'
  HASHED FASTFIELDS EXCLUDE ('raw_html', 'full_body')
  INDEXING MODES ('title':'text', 'summary':'text')
  AT LOCATION 's3://warehouse/companion/documents'
```

### Custom Sizing

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 's3://warehouse/large_events'
  INDEXING MODES ('message':'text')
  FASTFIELDS MODE PARQUET_ONLY
  TARGET INPUT SIZE 4G
  WRITER HEAP SIZE 2G
  WHERE year >= 2025
  AT LOCATION 's3://warehouse/companion/large_events'
```
