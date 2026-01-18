---
sidebar_position: 5
description: Configure Azure Blob Storage access
---

# Azure Configuration

Configure IndexTables for Azure Blob Storage.

## Authentication

### Account Key

```scala
spark.conf.set("spark.indextables.azure.accountName", "mystorageaccount")
spark.conf.set("spark.indextables.azure.accountKey", "YOUR_ACCOUNT_KEY")
```

### OAuth Service Principal

```scala
spark.conf.set("spark.indextables.azure.accountName", "mystorageaccount")
spark.conf.set("spark.indextables.azure.tenantId", "YOUR_TENANT_ID")
spark.conf.set("spark.indextables.azure.clientId", "YOUR_CLIENT_ID")
spark.conf.set("spark.indextables.azure.clientSecret", "YOUR_CLIENT_SECRET")
```

## Supported URL Formats

| Format | Example |
|--------|---------|
| ABFSS | `abfss://container@account.dfs.core.windows.net/path` |
| WASBS | `wasbs://container@account.blob.core.windows.net/path` |
| ABFS | `abfs://container@account.dfs.core.windows.net/path` |

## Usage

```scala
// Write to Azure Blob
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .save("abfss://container@account.dfs.core.windows.net/logs")

// Read from Azure Blob
val df = spark.read
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .load("abfss://container@account.dfs.core.windows.net/logs")
```

## Environment Variables

Azure credentials can also come from environment variables or `~/.azure/credentials`.

## Best Practices

1. **Use Service Principal** for production workloads
2. **Enable disk cache** on Azure HDInsight VMs
3. **Use ABFSS** for best performance (hierarchical namespace)
