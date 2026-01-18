---
sidebar_position: 1
description: Understanding filter pushdown optimization
---

# Filter Pushdown

IndexTables pushes filters down to the search engine for efficient execution.

## Equality Filters

```scala
// Exact equality
df.filter($"status" === "active")

// Null-safe equality
df.filter($"status" <=> "active")

// NOT equal
df.filter($"status" =!= "deleted")
// Or using NOT
df.filter(!($"status" === "deleted"))
```

## Range Filters

All numeric, date, and timestamp fields support range queries:

```scala
// Greater than / less than
df.filter($"score" > 0.5)
df.filter($"count" < 100)

// Greater than or equal / less than or equal
df.filter($"count" >= 10)
df.filter($"count" <= 1000)

// Combined ranges
df.filter($"count" >= 10 && $"count" < 100)

// Date/timestamp ranges
df.filter($"timestamp" >= "2024-01-01")
df.filter($"event_date" < "2024-12-31")
```

## IN Clause

```scala
df.filter($"region".isin("us-east", "us-west", "eu-west"))
df.filter($"status".isin("pending", "active", "completed"))
```

## NULL Checks

```scala
// IS NOT NULL - fully pushed down
df.filter($"category".isNotNull)

// IS NULL - evaluated by Spark (not pushed down)
df.filter($"category".isNull)
```

:::note
`IS NULL` filters are not pushed down because the search engine doesn't index null values. Spark will post-filter these results.
:::

## Compound Filters

Combine filters with AND, OR, and NOT:

```scala
// AND
df.filter($"status" === "active" && $"region" === "us-east")

// OR
df.filter($"priority" === "high" || $"priority" === "critical")

// NOT
df.filter(!($"status" === "deleted"))

// Complex combinations
df.filter(($"status" === "error" || $"status" === "warning") && $"region" === "us-east")
```

## String Pattern Filters

String pattern filters are supported but disabled by default for performance reasons. Enable via configuration:

```scala
// Enable all string pattern pushdowns
spark.conf.set("spark.indextables.filter.stringPattern.pushdown", "true")

// Or enable individually
spark.conf.set("spark.indextables.filter.stringStartsWith.pushdown", "true")  // Most efficient
spark.conf.set("spark.indextables.filter.stringEndsWith.pushdown", "true")
spark.conf.set("spark.indextables.filter.stringContains.pushdown", "true")    // Least efficient
```

Once enabled:

```scala
// StartsWith (most efficient - uses prefix queries)
df.filter($"message".startsWith("ERROR"))

// EndsWith
df.filter($"filename".endsWith(".log"))

// Contains
df.filter($"content".contains("exception"))
```

## Full-Text Search with IndexQuery

For text fields, use the `indexquery` operator for full-text search:

```scala
import org.apache.spark.sql.indextables.IndexQueryExpression._

// Single term
df.filter($"content" indexquery "error")

// Boolean queries
df.filter($"content" indexquery "error AND database")
df.filter($"content" indexquery "error OR warning")
df.filter($"content" indexquery "error NOT timeout")

// Phrase search
df.filter($"content" indexquery "\"connection refused\"")
```

See [IndexQuery Syntax](/docs/query-guide/indexquery-syntax) for full details.

## Partition Filters

Partition column filters enable partition pruning:

```scala
// Only reads matching partitions
df.filter($"date" === "2024-01-15")
  .filter($"message" indexquery "error")

// Range on partition columns
df.filter($"date" >= "2024-01-01" && $"date" < "2024-02-01")
```

## Nested JSON Field Filters

Nested fields in Struct, Array, and Map types support filter pushdown:

```scala
// Struct fields
df.filter($"user.name" === "Alice")
df.filter($"user.age" > 28)

// Deeply nested
df.filter($"request.headers.contentType" === "application/json")

// Range on nested fields
df.filter($"metadata.score" >= 0.5)
```

## What Gets Pushed Down

| Filter Type | Pushed Down | Notes |
|------------|-------------|-------|
| `=` (EqualTo) | Yes | String fields only (text fields use IndexQuery) |
| `<=>` (EqualNullSafe) | Yes | String fields only |
| `>` (GreaterThan) | Yes | All fields including nested JSON |
| `>=` (GreaterThanOrEqual) | Yes | All fields including nested JSON |
| `<` (LessThan) | Yes | All fields including nested JSON |
| `<=` (LessThanOrEqual) | Yes | All fields including nested JSON |
| `IN` | Yes | Full pushdown |
| `IS NOT NULL` | Yes | Regular fields only (not nested JSON) |
| `IS NULL` | No | Search engine doesn't index nulls |
| `AND` | Yes | If both children are supported |
| `OR` | Yes | If both children are supported |
| `NOT` | Yes | If child is supported |
| `LIKE 'prefix%'` | Config | Enable with `stringStartsWith.pushdown` |
| `LIKE '%suffix'` | Config | Enable with `stringEndsWith.pushdown` |
| `LIKE '%sub%'` | Config | Enable with `stringContains.pushdown` |
| `indexquery` | Yes | Text fields - full-text search |
| UDF | No | Evaluated by Spark |
