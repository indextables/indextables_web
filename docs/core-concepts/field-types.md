---
sidebar_position: 3
description: Understanding string vs text field types
---

# Field Types

IndexTables supports two primary field types for text data: **string** and **text**.

## String Fields (Default)

String fields store exact values and support full filter pushdown.

```scala
// Default - no configuration needed
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .save("path")

// Or explicitly
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.status", "string")
  .save("path")
```

### Supported Operations

- `=` (equals)
- `<>` (not equals)
- `IN` (set membership)
- `IS NULL` / `IS NOT NULL`

### Use Cases

- Status codes, IDs, categories
- Enum values
- Exact matching requirements

## Text Fields

Text fields are tokenized for full-text search using IndexQuery.

```scala
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.content", "text")
  .save("path")
```

### Querying

```scala
import org.apache.spark.sql.indextables.IndexQueryExpression._

df.filter($"content" indexquery "machine learning")
df.filter($"content" indexquery "error AND database")
df.filter($"content" indexquery "\"exact phrase\"")
```

### Index Record Options

Control what's stored in the inverted index:

| Option | Description | Index Size |
|--------|-------------|------------|
| `basic` | Document IDs only | Smallest |
| `freq` | IDs + term frequency | Medium |
| `position` | IDs + frequency + positions (default) | Largest |

```scala
// Per-field configuration
spark.conf.set("spark.indextables.indexing.indexrecordoption.logs", "basic")
```

## Fast Fields

For numeric aggregations, configure fast fields:

```scala
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.fastfields", "score,timestamp,value")
  .save("path")
```

Fast fields enable:
- Aggregate pushdown (COUNT, SUM, AVG, MIN, MAX)
- Bucket aggregations (DateHistogram, Histogram, Range)
- Efficient sorting

## Supported Schema Types

| Spark Type | Tantivy Type | Notes |
|------------|--------------|-------|
| String | Text/String | Configurable |
| Integer/Long | I64 | - |
| Float/Double | F64 | - |
| Boolean | Bool | - |
| Date | Date | - |
| Timestamp | DateTime | - |
| Binary | Bytes | - |
| Struct/Array/Map | JSON | Auto-detected |
