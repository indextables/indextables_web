---
sidebar_position: 1
description: Working with Struct, Array, and Map fields
---

# JSON Fields

IndexTables automatically handles Struct, Array, and Map fields as JSON.

## Automatic Detection

Complex types are automatically detected and indexed as JSON:

```scala
// Struct
case class User(name: String, age: Int, city: String)
val df = Seq((1, User("Alice", 30, "NYC"))).toDF("id", "user")

// Array
val df = Seq((1, Seq("tag1", "tag2"))).toDF("id", "tags")

// Map
val df = Seq((1, Map("color" -> "red"))).toDF("id", "attrs")
```

## Indexing Modes

```scala
// Full mode (default) - all features including fast fields
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.json.mode", "full")
  .save("path")

// Minimal mode - smaller index, no range queries
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.json.mode", "minimal")
  .save("path")
```

## Filter Pushdown

Nested field filters are pushed down:

```scala
// Struct fields
df.filter($"user.name" === "Alice")
df.filter($"user.age" > 28)

// Supported operators
df.filter($"user.city" === "NYC")      // Equality
df.filter($"user.age" >= 25)           // Range
df.filter($"user.email".isNull)        // NULL check
df.filter($"user.active" && $"user.verified")  // AND/OR
```

## Aggregations

With `json.mode = "full"`, aggregations work on nested fields:

```scala
df.agg(avg($"user.age"), max($"user.score"))
```

## Map Fields

Map keys are converted to strings:

```scala
val df = Seq(
  (1, Map("color" -> "red")),
  (2, Map(1 -> "first"))  // Integer keys supported
).toDF("id", "attributes")

df.filter($"attributes.color" === "red")
```
