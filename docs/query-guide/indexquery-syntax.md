---
sidebar_position: 2
description: Full-text search with IndexQuery operators
---

# IndexQuery Syntax

Full-text search using Tantivy/Quickwit query syntax.

For the complete query syntax reference, see the [Quickwit Query Language documentation](https://quickwit.io/docs/reference/query-language).

## Basic Usage

```scala
import org.apache.spark.sql.indextables.IndexQueryExpression._

// Simple term search
df.filter($"content" indexquery "error")

// Multiple terms (implicit OR)
df.filter($"content" indexquery "error warning")
```

## Boolean Operators

```scala
// AND - both terms required
df.filter($"content" indexquery "error AND database")

// OR - either term
df.filter($"content" indexquery "error OR warning")

// NOT - exclude term
df.filter($"content" indexquery "error NOT timeout")

// Grouping
df.filter($"content" indexquery "(error OR warning) AND database")
```

## Phrase Search

```scala
// Exact phrase
df.filter($"content" indexquery "\"connection refused\"")

// Phrase with slop (terms within N positions)
df.filter($"content" indexquery "\"connection error\"~2")
```

## Wildcards

```scala
// Prefix match
df.filter($"content" indexquery "data*")

// Single character wildcard
df.filter($"content" indexquery "te?t")
```

## Fuzzy Search

```scala
// Fuzzy match (edit distance)
df.filter($"content" indexquery "databse~1")  // Matches "database"

// Default edit distance is 2
df.filter($"content" indexquery "databse~")
```

## Field-Specific Queries

```scala
// Search specific field
df.filter($"content" indexquery "title:error")

// Multiple fields
df.filter($"content" indexquery "title:error OR body:exception")
```

## Range Queries

```scala
// Numeric ranges
df.filter($"content" indexquery "count:[10 TO 100]")

// Date ranges
df.filter($"content" indexquery "timestamp:[2024-01-01 TO 2024-12-31]")
```

## SQL Usage

```sql
SELECT * FROM logs
WHERE content indexquery 'error AND database'

SELECT * FROM logs
WHERE content indexquery '"connection refused" OR timeout'
```

## Best Practices

1. **Use AND for precision** - Reduces result set
2. **Quote phrases** - For exact multi-word matches
3. **Avoid leading wildcards** - `*error` is slow
4. **Combine with partition filters** - For best performance

## Safety Limits

### Unqualified _indexall Queries

When searching all fields with `_indexall indexquery`, unqualified queries (without field prefixes) are rejected if the table has more than 10 fields. This prevents accidentally expensive full-table searches on wide tables.

```sql
-- This may fail on wide tables (>10 fields):
SELECT * FROM logs WHERE _indexall indexquery 'error'

-- Instead, qualify your search with a field prefix:
SELECT * FROM logs WHERE _indexall indexquery 'message:error'

-- Or search a specific text field:
SELECT * FROM logs WHERE message indexquery 'error'
```

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.indexquery.indexall.maxUnqualifiedFields` | 10 | Maximum fields for unqualified `_indexall` queries. Set to 0 to disable the check. |

```scala
// Allow unqualified searches on tables with up to 50 fields
spark.conf.set("spark.indextables.indexquery.indexall.maxUnqualifiedFields", "50")

// Disable the safety check entirely (not recommended)
spark.conf.set("spark.indextables.indexquery.indexall.maxUnqualifiedFields", "0")
```
