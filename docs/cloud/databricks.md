---
sidebar_position: 1
description: Deploy IndexTables on Databricks
---

# Databricks Deployment

IndexTables is optimized for Databricks with automatic detection of local NVMe storage.

## Installation

1. Download the shaded JAR from Maven Central:
   ```
   https://repo1.maven.org/maven2/io/indextables/indextables_spark/0.5.2_spark_3.5.3/indextables_spark-0.5.2_spark_3.5.3-linux-x86_64-shaded.jar
   ```
2. Upload it to a Unity Catalog volume (e.g., `/Volumes/my_catalog/my_schema/artifacts/`)
3. Create an init script that copies the JAR to the Databricks jars directory:

```bash
#!/bin/sh
cp /Volumes/my_catalog/my_schema/artifacts/indextables_spark-0.5.2_spark_3.5.3-linux-x86_64-shaded.jar /databricks/jars
```

4. Upload the init script to your volume and configure it in your cluster settings under **Advanced Options > Init Scripts**

## Requirements

| Component | Version |
|-----------|---------|
| Databricks Runtime | 15.4 LTS or 16.4 LTS |
| Scala | 2.12 |

## Register SQL Extensions

```sql
SET spark.sql.extensions=io.indextables.spark.extensions.IndexTables4SparkExtensions
```

## Auto-Detected Settings

When `/local_disk0` is detected, these settings are automatically configured:

- **Temp directory**: `/local_disk0/temp`
- **Cache directory**: `/local_disk0/cache`
- **Disk cache**: Enabled

## Unity Catalog Integration

If using Unity Catalog External Locations to access S3 data, configure the Unity Catalog credential provider. We recommend setting these as cluster Spark properties:

```properties
spark.sql.extensions io.indextables.spark.extensions.IndexTables4SparkExtensions
spark.indextables.databricks.workspaceUrl https://<workspace>.cloud.databricks.com
spark.indextables.databricks.apiToken <your-token>
spark.indextables.aws.credentialsProviderClass io.indextables.spark.auth.unity.UnityCatalogAWSCredentialProvider
```

Alternatively, configure in your notebook:

```python
spark.conf.set("spark.indextables.databricks.workspaceUrl", "https://<workspace>.cloud.databricks.com")
spark.conf.set("spark.indextables.databricks.apiToken", dbutils.secrets.get("scope", "token"))

# Or use your notebook's token directly
spark.conf.set("spark.indextables.databricks.apiToken",
  dbutils.notebook.entry_point.getDbutils().notebook().getContext().apiToken().get())

spark.conf.set("spark.indextables.aws.credentialsProviderClass",
  "io.indextables.spark.auth.unity.UnityCatalogAWSCredentialProvider")
```

:::note External Location Requirements
Your S3 path must be configured as a Unity Catalog External Location. The following are required:
- The metastore must have `external_access_enabled` set to `true`
- You must have the `EXTERNAL_USE_LOCATION` privilege on the external location

See the [generateTemporaryPathCredentials API](https://docs.databricks.com/api/workspace/temporarypathcredentials/generatetemporarypathcredentials) for details.
:::

Credentials are resolved on the driver and broadcast to executors — no network calls from executors to Databricks.

## Recommended Cluster Configuration

:::note Photon
We recommend disabling Photon as it doesn't accelerate IndexTables workloads.
:::

For all clusters, set the following to ensure caching and prewarming works properly:

```properties
spark.locality.wait 30s
```

### Query Clusters

For query workloads, use instances with high memory and NVMe storage:

| Instance Type | vCPUs | Memory | Storage |
|---------------|-------|--------|---------|
| r6id.2xlarge | 8 | 64 GB | NVMe |
| i4i.2xlarge | 8 | 64 GB | NVMe |

```properties
spark.executor.memory 27016m
```

### Indexing Clusters

For write/indexing workloads, compute-optimized instances work well:

| Instance Type | vCPUs | Memory | Storage |
|---------------|-------|--------|---------|
| c6id.2xlarge | 8 | 32 GB | NVMe |

```properties
spark.executor.memory 16348m
```

## Companion Mode with Unity Catalog

[Companion Mode](/docs/core-concepts/companion-mode) on Databricks supports Unity Catalog table name resolution for Delta tables. Pass a table name instead of a storage path, and IndexTables resolves the storage location and credentials automatically:

```sql
BUILD INDEXTABLES COMPANION FOR DELTA 'schema.events'
  CATALOG 'my_catalog'
  INDEXING MODES ('message':'text', 'src_ip':'ipaddress')
  AT LOCATION 's3://warehouse/companion/events'
```

This requires the Unity Catalog credential provider to be configured (see [Unity Catalog Integration](#unity-catalog-integration) above).

:::note Scheduler Mode
Companion mode runs sync batches as concurrent Spark jobs. For this to work correctly, set `spark.scheduler.mode=FAIR` in your cluster configuration. This is the default on Databricks, but verify it is set if companion batches appear to run sequentially.
:::

## Performance Settings

```python
# Recommended for Databricks
spark.conf.set("spark.indextables.indexWriter.heapSize", "200M")
spark.conf.set("spark.indextables.s3.maxConcurrency", "8")
```

