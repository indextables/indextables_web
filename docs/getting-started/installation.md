---
sidebar_position: 1
description: How to add IndexTables to your project
---

# Installation

Add IndexTables to your project.

## Maven

```xml
<dependency>
  <groupId>io.indextables</groupId>
  <artifactId>indextables_spark</artifactId>
  <version>0.5.1_spark_3.5.3</version>
  <classifier>linux-x86_64-shaded</classifier>
</dependency>
```

## SBT

```scala
libraryDependencies += "io.indextables" % "indextables_spark" % "0.5.1_spark_3.5.3" classifier "linux-x86_64-shaded"
```

## Spark Shell

```bash
spark-shell --packages io.indextables:indextables_spark:0.5.1_spark_3.5.3:linux-x86_64-shaded
```

## Databricks

1. Download the shaded JAR from Maven Central:
   ```
   https://repo1.maven.org/maven2/io/indextables/indextables_spark/0.5.1_spark_3.5.3/indextables_spark-0.5.1_spark_3.5.3-linux-x86_64-shaded.jar
   ```
2. Upload it to a Unity Catalog volume (e.g., `/Volumes/my_catalog/my_schema/artifacts/`)
3. Create an init script that copies the JAR to the Databricks jars directory:

```bash
#!/bin/sh
cp /Volumes/my_catalog/my_schema/artifacts/indextables_spark-0.5.1_spark_3.5.3-linux-x86_64-shaded.jar /databricks/jars
```

4. Upload the init script to your volume and configure it in your cluster settings under **Advanced Options > Init Scripts**

## Requirements

| Component | Version |
|-----------|---------|
| Apache Spark | 3.5.3 |
| Java | 11 or later |
| Scala | 2.12 |

## Register SQL Extensions

To use SQL commands like `MERGE SPLITS` and `PREWARM CACHE`, register the extensions:

```scala
spark.sql("SET spark.sql.extensions=io.indextables.spark.extensions.IndexTables4SparkExtensions")
```

Or in `spark-defaults.conf`:

```properties
spark.sql.extensions=io.indextables.spark.extensions.IndexTables4SparkExtensions
```

## Next Steps

- [Quickstart](/docs/getting-started/quickstart) - Create your first index in 5 minutes
- [First Production Index](/docs/getting-started/first-index) - Deploy to S3 or Azure
