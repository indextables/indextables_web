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

## IP Address Fields

For efficient IP address indexing and querying (both IPv4 and IPv6), use the `ip` field type:

```scala
// Per-field approach
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.client_ip", "ip")
  .save("path")

// List-based approach (multiple fields)
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.ip", "client_ip,server_ip")
  .save("path")
```

### Supported Operations

- `=` (exact match): `client_ip = '192.168.1.1'`
- `>`, `<`, `>=`, `<=` (range queries): `client_ip >= '192.168.1.0' AND client_ip <= '192.168.1.255'`
- `IN` (set membership): `client_ip IN ('192.168.1.1', '10.0.0.1')`
- IPv6 support: `client_ip = '2001:db8::1'`

### CIDR Notation

CIDR notation and wildcard patterns are transparently expanded at the native layer. Pass them as normal string values — no special syntax is required.

**Equality filter with CIDR:**

```scala
df.filter($"client_ip" === "192.168.1.0/24")   // matches all IPs in 192.168.1.0–255
df.filter($"client_ip" === "10.0.0.0/8")        // matches 10.0.0.0–10.255.255.255
df.filter($"client_ip" === "192.168.1.1/32")    // exact host match
```

**IN filter with CIDR and exact IPs:**

```scala
df.filter($"client_ip".isin("10.0.0.0/8", "192.168.1.0/24"))
df.filter($"client_ip".isin("10.0.0.0/8", "203.0.113.5"))  // CIDR + exact IP
```

**IndexQuery with CIDR:**

```scala
df.filter($"client_ip" indexquery "192.168.1.0/24")
df.filter($"client_ip" indexquery "192.168.1.0/24 OR 10.0.0.0/8")
df.filter($"client_ip" indexquery "10.0.0.0/8 AND NOT 10.0.1.0/24")
```

**Wildcard patterns:**

```scala
df.filter($"client_ip" === "192.168.1.*")   // equivalent to /24
df.filter($"client_ip" === "10.0.*.*")      // equivalent to /16
```

**IPv6 CIDR** (requires quoting in IndexQuery due to colons):

```scala
// DataFrame filter — no quoting needed
df.filter($"client_ip" === "2001:db8::/32")

// IndexQuery — quote the value
df.filter($"client_ip" indexquery "\"2001:db8::/32\"")
```

**CIDR patterns reference:**

| Pattern | Matches |
|---------|---------|
| `192.168.1.0/24` | `192.168.1.0` – `192.168.1.255` |
| `10.0.0.0/8` | `10.0.0.0` – `10.255.255.255` |
| `192.168.1.1/32` | exact host `192.168.1.1` |
| `0.0.0.0/0` | all IPv4 addresses |
| `192.168.1.*` | `192.168.1.0` – `192.168.1.255` |
| `10.0.*.*` | `10.0.0.0` – `10.0.255.255` |
| `2001:db8::/32` | IPv6 range |

### Use Cases

- Network traffic analysis
- Access log filtering by source/destination IP
- Subnet-level filtering with CIDR notation

## Supported Schema Types

| Spark Type | Tantivy Type | Notes |
|------------|--------------|-------|
| String | Text/String | Configurable via typemap |
| String (ip typemap) | IP | IPv4 and IPv6 support |
| Integer/Long | I64 | - |
| Float/Double | F64 | - |
| Boolean | Bool | - |
| Date | Date | - |
| Timestamp | DateTime | - |
| Binary | Bytes | - |
| Struct/Array/Map | JSON | Auto-detected |
