---
sidebar_position: 3
description: Create your first production index on S3 or Azure
---

# Your First Production Index

This guide walks through creating a production-ready index on cloud storage.

## Configure Cloud Access

### S3

If no credentials are configured, IndexTables will automatically use the EC2 instance's IAM role. This is the recommended approach for production.

To explicitly configure credentials:

```scala
spark.conf.set("spark.indextables.aws.accessKey", "YOUR_ACCESS_KEY")
spark.conf.set("spark.indextables.aws.secretKey", "YOUR_SECRET_KEY")
```

### Azure

```scala
spark.conf.set("spark.indextables.azure.accountName", "YOUR_ACCOUNT")
spark.conf.set("spark.indextables.azure.accountKey", "YOUR_KEY")
```

### Databricks Unity Catalog

If using Unity Catalog External Locations to access S3 data, configure the Unity Catalog credential provider. We recommend setting these as cluster Spark properties:

```properties
spark.indextables.databricks.workspaceUrl https://<workspace>.cloud.databricks.com
spark.indextables.databricks.apiToken <your-token>
spark.indextables.aws.credentialsProviderClass io.indextables.spark.auth.unity.UnityCatalogAWSCredentialProvider
```

Alternatively, you can configure these in your notebook:

```scala
spark.conf.set("spark.indextables.databricks.workspaceUrl", "https://<workspace>.cloud.databricks.com")
spark.conf.set("spark.indextables.databricks.apiToken", dbutils.secrets.get("scope", "token"))

// Or use your notebook's token directly
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

## Write with Partitioning

```scala
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .partitionBy("date")
  .option("spark.indextables.indexing.typemap.message", "text")
  .option("spark.indextables.indexing.fastfields", "timestamp,severity")
  .save("s3://my-bucket/logs")
```

## Query with Partition Pruning

```scala
val logs = spark.read
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .load("s3://my-bucket/logs")

// Partition filter + full-text search
logs.filter($"date" === "2024-01-15")
    .filter($"message" indexquery "error AND database")
    .show()
```

## Monitor with SQL Commands

```sql
-- Check disk cache usage
DESCRIBE INDEXTABLES DISK CACHE;

-- View storage statistics
DESCRIBE INDEXTABLES STORAGE STATS;
```

## Performance Tips

1. **Use partitioning** for time-series data
2. **Configure fast fields** for aggregation columns
3. **Enable L2 disk cache** on Databricks/EMR (auto-enabled on NVMe)

## Recommended Cluster Configurations

IndexTables benefits from NVMe storage for the L2 disk cache. Here are configurations we've tested.

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

### EMR NVMe Configuration

IndexTables auto-enables NVMe caching when `/local_disk0` is detected (standard on Databricks). On EMR, NVMe is typically mounted elsewhere, so you need to either:

**Option 1: Create a symlink** (recommended)

In your EMR bootstrap script, create a symlink to your NVMe mount:

```bash
ln -s /mnt/nvme /local_disk0
```

**Option 2: Configure paths manually**

Set the temp and cache directories explicitly:

```properties
spark.indextables.cache.disk.path /mnt/nvme/indextables_cache
spark.indextables.indexWriter.tempDirectoryPath /mnt/nvme/indextables_temp
spark.indextables.merge.tempDirectoryPath /mnt/nvme/indextables_merge
```

## Next Steps

- [S3 Configuration](/docs/configuration/s3-configuration) - Advanced S3 settings
- [Azure Configuration](/docs/configuration/azure-configuration) - Azure Blob Storage
- [Performance Tuning](/docs/cloud/databricks) - Databricks optimization
