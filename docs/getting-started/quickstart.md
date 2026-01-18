---
sidebar_position: 2
description: Get up and running with IndexTables in 5 minutes
---

# Quickstart

Get up and running with IndexTables in 5 minutes.

## 1. Create Sample Data

```scala
import spark.implicits._

val data = Seq(
  (1, "Introduction to Machine Learning", "machine learning basics tutorial"),
  (2, "Advanced Deep Learning", "neural networks deep learning AI"),
  (3, "Data Engineering Best Practices", "spark hadoop data pipelines"),
  (4, "Search Engine Architecture", "tantivy lucene search indexing")
).toDF("id", "title", "content")
```

## 2. Write an Index

```scala
data.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.title", "string")
  .option("spark.indextables.indexing.typemap.content", "text")
  .mode("overwrite")
  .save("/tmp/my_index")
```

:::tip Field Types
- **String fields** (default): Exact matching, full filter pushdown
- **Text fields**: Full-text search with IndexQuery
:::

## 3. Query the Index

```scala
val df = spark.read
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .load("/tmp/my_index")

// Standard SQL filters (pushed down for string fields)
df.filter($"title" === "Introduction to Machine Learning").show()

// Full-text search with IndexQuery
import org.apache.spark.sql.indextables.IndexQueryExpression._
df.filter($"content" indexquery "machine learning").show()
```

## 4. Run Aggregations

```scala
// Aggregations are pushed down to the search engine
df.agg(count("*")).show()

// With filters
df.filter($"content" indexquery "deep learning")
  .agg(count("*"))
  .show()
```

## 5. Create a Temp View

```python
df.createOrReplaceTempView("articles")
```

## 6. Use SQL

```sql
-- Query with IndexQuery
SELECT * FROM articles
WHERE content indexquery 'machine AND learning'

-- Aggregations
SELECT COUNT(*) FROM articles
WHERE content indexquery 'neural AND networks'
```

## Next Steps

- [Field Types](/docs/core-concepts/field-types) - Understand string vs text fields
- [Configuration](/docs/configuration/essential-settings) - Tune for your workload
- [IndexQuery Syntax](/docs/query-guide/indexquery-syntax) - Master full-text search
- [Your First Production Index](/docs/getting-started/first-index) - Deploy to S3
