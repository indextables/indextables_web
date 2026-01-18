---
sidebar_position: 4
description: Configure AWS S3 access and performance
---

# S3 Configuration

Configure IndexTables for AWS S3 storage.

## Authentication

### Access Keys

```scala
spark.conf.set("spark.indextables.aws.accessKey", "YOUR_ACCESS_KEY")
spark.conf.set("spark.indextables.aws.secretKey", "YOUR_SECRET_KEY")
```

### Custom Credential Provider

```scala
spark.conf.set("spark.indextables.aws.credentialsProviderClass",
  "com.example.MyCredentialsProvider")
```

### IAM Roles (EMR)

On EMR, no configuration needed - IndexTables uses the EC2 instance's IAM role automatically.

### Databricks Unity Catalog

If using Unity Catalog External Locations to access S3 data, configure the Unity Catalog credential provider. We recommend setting these as cluster Spark properties:

```properties
spark.indextables.databricks.workspaceUrl https://<workspace>.cloud.databricks.com
spark.indextables.databricks.apiToken <your-token>
spark.indextables.aws.credentialsProviderClass io.indextables.spark.auth.unity.UnityCatalogAWSCredentialProvider
```

Alternatively, configure in your notebook:

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

## Performance Tuning

```scala
// Parallel upload threads
spark.conf.set("spark.indextables.s3.maxConcurrency", "4")

// Upload part size
spark.conf.set("spark.indextables.s3.partSize", "64M")
```

| Setting | Default | Description |
|---------|---------|-------------|
| `s3.maxConcurrency` | 4 | Parallel upload threads |
| `s3.partSize` | 64M | Multipart upload size |

## Usage

```scala
// Write to S3
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .save("s3://bucket/path")

// Read from S3
val df = spark.read
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .load("s3://bucket/path")
```

## Monitoring

```sql
-- View S3 access statistics
DESCRIBE INDEXTABLES STORAGE STATS;
```

## Best Practices

1. **Use IAM roles** when possible (no credentials to manage)
2. **Increase concurrency** for large writes (`s3.maxConcurrency=8`)
3. **Enable disk cache** to reduce S3 requests
