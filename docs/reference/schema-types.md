---
sidebar_position: 2
description: Supported Spark schema types
---

# Supported Schema Types

IndexTables supports all common Spark data types.

## Primitive Types

| Spark Type | Tantivy Type | Filter Pushdown | Fast Field |
|------------|--------------|-----------------|------------|
| StringType | Text/String | Yes | No |
| IntegerType | I64 | Yes | Yes |
| LongType | I64 | Yes | Yes |
| FloatType | F64 | Yes | Yes |
| DoubleType | F64 | Yes | Yes |
| BooleanType | Bool | Yes | Yes |
| DateType | Date | Yes | Yes |
| TimestampType | DateTime | Yes | Yes |
| BinaryType | Bytes | No | No |

## Complex Types

| Spark Type | Tantivy Type | Filter Pushdown | Notes |
|------------|--------------|-----------------|-------|
| StructType | JSON | Yes (nested) | Auto-detected |
| ArrayType | JSON | Partial | Element access |
| MapType | JSON | Yes (keys) | Keys as strings |

## String vs Text

**String fields** (default):
- Exact value matching
- Full filter pushdown
- Use for: IDs, categories, status codes

**Text fields**:
- Tokenized for full-text search
- IndexQuery only
- Use for: Documents, logs, descriptions

```scala
// Configure field type
.option("spark.indextables.indexing.typemap.title", "string")
.option("spark.indextables.indexing.typemap.content", "text")
```

## Date and Timestamp

```scala
// Spark DateType -> Tantivy Date
df.filter($"date" === "2024-01-15")

// Spark TimestampType -> Tantivy DateTime
df.filter($"timestamp" >= "2024-01-15T10:00:00")
```

## Binary

Binary fields are stored but not searchable:

```scala
// Stored for retrieval, not filterable
val df = spark.read.format("indextables").load("path")
df.select("binary_field").show()
```
