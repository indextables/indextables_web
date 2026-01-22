---
sidebar_position: 1
description: Complete configuration reference
---

# Configuration Reference

Complete reference of all IndexTables configuration settings. Settings can be configured as:

- **Write options**: `.option("spark.indextables.setting", "value")` on DataFrameWriter
- **Read options**: `.option("spark.indextables.setting", "value")` on DataFrameReader
- **Spark config**: `spark.conf.set("spark.indextables.setting", "value")`
- **Cluster properties**: Set in your cluster configuration

:::tip Preferred Configuration Method
For write operations, prefer using `.option()` on the DataFrameWriter rather than Spark properties. This makes the configuration explicit and avoids affecting other operations.
:::

## Index Writer

Settings that control how data is indexed during write operations.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.indexWriter.heapSize` | 100M | Memory allocated for indexing (supports "100M", "2G" syntax) |
| `spark.indextables.indexWriter.batchSize` | 10000 | Documents per batch during indexing (1-1000000) |
| `spark.indextables.indexWriter.maxBatchBufferSize` | 90M | Maximum buffer size before flush |
| `spark.indextables.indexWriter.threads` | 2 | Indexing threads per executor (1-16) |
| `spark.indextables.indexWriter.tempDirectoryPath` | auto | Working directory for index creation |
| `spark.indextables.splitConversion.maxParallelism` | auto | Parallelism for split conversion |

### Write Optimization

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.optimizeWrite.enabled` | true | Enable optimized write with automatic partitioning |
| `spark.indextables.optimizeWrite.targetRecordsPerSplit` | 1000000 | Target records per split file |
| `spark.indextables.autoSize.enabled` | false | Enable auto-sizing based on historical data |
| `spark.indextables.autoSize.targetSplitSize` | 100M | Target split size (supports "100M", "1G" syntax) |
| `spark.indextables.autoSize.inputRowCount` | estimated | Explicit row count for V2 API |

## Transaction Log

Settings for transaction log management, checkpointing, and caching.

### Checkpointing

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.checkpoint.enabled` | true | Enable automatic checkpoints |
| `spark.indextables.checkpoint.interval` | 10 | Create checkpoint every N transactions |
| `spark.indextables.checkpoint.parallelism` | 8 | Thread pool size for parallel I/O |
| `spark.indextables.checkpoint.read.timeoutSeconds` | 30 | Timeout for parallel reads |
| `spark.indextables.transaction.compression.enabled` | true | Enable GZIP compression for transaction files |

### Transaction Log Cache

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.transaction.cache.enabled` | true | Enable transaction log caching |
| `spark.indextables.transaction.cache.expirationSeconds` | 300 | Legacy TTL for all caches (overrides individual TTLs) |
| `spark.indextables.cache.checkpoint.ttl` | 5 | Checkpoint info cache TTL in minutes |
| `spark.indextables.cache.checkpoint.size` | 200 | Maximum checkpoint cache entries |
| `spark.indextables.cache.log.ttl` | 5 | Version log cache TTL in minutes |
| `spark.indextables.cache.log.size` | 1000 | Maximum version log cache entries |
| `spark.indextables.cache.snapshot.ttl` | 10 | Snapshot cache TTL in minutes |
| `spark.indextables.cache.snapshot.size` | 100 | Maximum snapshot cache entries |
| `spark.indextables.cache.filelist.ttl` | 2 | File list cache TTL in minutes |
| `spark.indextables.cache.filelist.size` | 50 | Maximum file list cache entries |
| `spark.indextables.cache.metadata.ttl` | 30 | Metadata cache TTL in minutes |
| `spark.indextables.cache.metadata.size` | 100 | Maximum metadata cache entries |

### Retention

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.logRetention.duration` | 2592000000 | Log retention in milliseconds (30 days) |
| `spark.indextables.checkpointRetention.duration` | 7200000 | Checkpoint retention in milliseconds (2 hours) |
| `spark.indextables.cleanup.enabled` | true | Enable automatic file cleanup |

## Read Settings

Settings that control read operations and query execution.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.read.defaultLimit` | 250 | Default result limit when no LIMIT clause |
| `spark.indextables.docBatch.enabled` | true | Enable batch document retrieval |
| `spark.indextables.docBatch.maxSize` | 1000 | Documents per batch (1-10000) |

### Prescan Filtering

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.read.prescan.enabled` | false | Enable prescan filtering |
| `spark.indextables.read.prescan.minSplitThreshold` | 2 × defaultParallelism | Minimum splits to trigger prescan |
| `spark.indextables.read.prescan.maxConcurrency` | 4 × availableProcessors | Maximum concurrent prescan threads |
| `spark.indextables.read.prescan.timeoutMs` | 30000 | Timeout per split in milliseconds |

## Filter Pushdown

Settings that control which filter operations are pushed down to the index.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.filter.stringPattern.pushdown` | false | Master switch - enables all string pattern filters |
| `spark.indextables.filter.stringStartsWith.pushdown` | false | Enable prefix matching (most efficient) |
| `spark.indextables.filter.stringEndsWith.pushdown` | false | Enable suffix matching (less efficient) |
| `spark.indextables.filter.stringContains.pushdown` | false | Enable substring matching (least efficient) |

:::note String Pattern Performance
- **startsWith**: Most efficient - uses sorted index terms
- **endsWith**: Less efficient - requires term scanning
- **contains**: Least efficient - cannot leverage index structure

Enable only the patterns you need for best performance.
:::

## Prewarm Cache

Settings for the PREWARM CACHE SQL command.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.prewarm.enabled` | false | Enable prewarm on read |
| `spark.indextables.prewarm.segments` | TERM_DICT,FAST_FIELD,POSTINGS,FIELD_NORM | Segments to prewarm |
| `spark.indextables.prewarm.fields` | (all) | Specific fields to prewarm |
| `spark.indextables.prewarm.splitsPerTask` | 2 | Splits per Spark task |
| `spark.indextables.prewarm.partitionFilter` | (empty) | Partition filter clause |
| `spark.indextables.prewarm.failOnMissingField` | true | Fail if specified field doesn't exist |
| `spark.indextables.prewarm.catchUpNewHosts` | false | Prewarm on new hosts added to cluster |

### Async Prewarm

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.prewarm.async.maxConcurrent` | 1 | Maximum concurrent async prewarm jobs per worker |
| `spark.indextables.prewarm.async.completedJobRetentionMs` | 3600000 | Retention period for completed job metadata (1 hour) |

## Disk Cache (L2)

Settings for the L2 disk cache on NVMe storage.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.cache.disk.enabled` | auto | Enable disk cache (auto-enabled when NVMe detected) |
| `spark.indextables.cache.disk.path` | auto | Cache directory path |
| `spark.indextables.cache.disk.maxSize` | 0 (auto) | Maximum cache size (0 = auto 2/3 of disk) |
| `spark.indextables.cache.disk.manifestSyncInterval` | 30 | Seconds between manifest writes |

### In-Memory Cache

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.cache.maxSize` | 200000000 | Maximum in-memory cache size in bytes |
| `spark.indextables.cache.directoryPath` | auto | Custom cache directory |
| `spark.indextables.cache.prewarm.enabled` | false | Enable proactive cache warming |

## S3 Configuration

Settings for Amazon S3 storage access.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.aws.accessKey` | - | AWS access key ID |
| `spark.indextables.aws.secretKey` | - | AWS secret access key |
| `spark.indextables.aws.sessionToken` | - | AWS session token (for temporary credentials) |
| `spark.indextables.aws.credentialsProviderClass` | - | Custom credential provider class (FQN) |
| `spark.indextables.s3.maxConcurrency` | 4 | Parallel upload threads (1-32) |
| `spark.indextables.s3.partSize` | 64M | Multipart upload part size |
| `spark.indextables.s3.streamingThreshold` | 100M | Threshold for streaming upload |
| `spark.indextables.s3.multipartThreshold` | 100M | Threshold for multipart upload |

:::tip AWS Credentials
If no credentials are configured, IndexTables automatically uses the EC2 instance's IAM role. This is the recommended approach for production.
:::

## Azure Configuration

Settings for Azure Blob Storage access.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.azure.accountName` | - | Storage account name |
| `spark.indextables.azure.accountKey` | - | Storage account key |
| `spark.indextables.azure.connectionString` | - | Full connection string |
| `spark.indextables.azure.tenantId` | - | Azure AD tenant ID for OAuth |
| `spark.indextables.azure.clientId` | - | Service Principal client ID |
| `spark.indextables.azure.clientSecret` | - | Service Principal client secret |
| `spark.indextables.azure.bearerToken` | - | Explicit OAuth bearer token |
| `spark.indextables.azure.endpoint` | - | Custom Azure endpoint |

## Databricks Unity Catalog

Settings for Unity Catalog credential provider integration.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.databricks.workspaceUrl` | - | Databricks workspace URL (required) |
| `spark.indextables.databricks.apiToken` | - | Databricks API token (required) |
| `spark.indextables.databricks.credential.refreshBuffer.minutes` | 40 | Minutes before expiration to refresh credentials |
| `spark.indextables.databricks.cache.maxSize` | 100 | Maximum cached credential entries |
| `spark.indextables.databricks.fallback.enabled` | true | Fallback to READ if READ_WRITE fails |
| `spark.indextables.databricks.retry.attempts` | 3 | Retry attempts on API failure |

See [Unity Catalog Configuration](/docs/configuration/s3-configuration#databricks-unity-catalog) for setup instructions.

## Field Indexing

Settings that control how fields are indexed.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.indexing.typemap.<field>` | string | Field indexing type: `string`, `text`, `json` |
| `spark.indextables.indexing.fastfields` | (auto) | Comma-separated list of fast fields |
| `spark.indextables.indexing.storeonlyfields` | (empty) | Fields stored but not indexed |
| `spark.indextables.indexing.indexonlyfields` | (empty) | Fields indexed but not stored |
| `spark.indextables.indexing.tokenizer.<field>` | default | Tokenizer: `default`, `whitespace`, `raw` |
| `spark.indextables.indexing.json.mode` | full | JSON indexing mode |
| `spark.indextables.indexing.text.indexRecordOption` | position | Index record option |
| `spark.indextables.indexing.indexrecordoption.<field>` | - | Per-field index record option |

## Merge Settings

Settings for the MERGE SPLITS operation.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.merge.heapSize` | 1G | Heap size for merge operations |
| `spark.indextables.merge.batchSize` | (defaultParallelism) | Merge groups per batch |
| `spark.indextables.merge.maxConcurrentBatches` | 2 | Maximum concurrent merge batches |
| `spark.indextables.merge.maxSourceSplitsPerMerge` | 1000 | Maximum source splits per merge operation |
| `spark.indextables.merge.tempDirectoryPath` | auto | Temporary directory for merge working files |
| `spark.indextables.merge.debug` | false | Enable merge debug logging |

### Merge-on-Write

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.mergeOnWrite.enabled` | false | Enable automatic merging during writes |
| `spark.indextables.mergeOnWrite.targetSize` | 4G | Target merged split size |

## Purge Settings

Settings for the PURGE operation and automatic cleanup.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.purge.defaultRetentionHours` | 168 | Default retention period (7 days) |
| `spark.indextables.purge.minRetentionHours` | 24 | Minimum retention period (1 day) |
| `spark.indextables.purge.retentionCheckEnabled` | true | Enable retention validation |
| `spark.indextables.purge.parallelism` | auto | Parallelism for purge operations |
| `spark.indextables.purge.maxFilesToDelete` | 1000000 | Maximum files to delete per operation |

### Purge-on-Write

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.purgeOnWrite.enabled` | false | Enable automatic purging during writes |
| `spark.indextables.purgeOnWrite.triggerAfterMerge` | true | Trigger purge after merge operations |
| `spark.indextables.purgeOnWrite.triggerAfterWrites` | 0 | Trigger purge after N writes (0 = disabled) |
| `spark.indextables.purgeOnWrite.splitRetentionHours` | 168 | Split file retention (7 days) |
| `spark.indextables.purgeOnWrite.txLogRetentionHours` | 720 | Transaction log retention (30 days) |

## Protocol Management

Advanced settings for protocol version management.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.protocol.checkEnabled` | true | Enable protocol version checking |
| `spark.indextables.protocol.autoUpgrade` | false | Automatically upgrade protocol version |
| `spark.indextables.protocol.enforceReaderVersion` | true | Enforce minimum reader version |
| `spark.indextables.protocol.enforceWriterVersion` | true | Enforce minimum writer version |

## Skipped Files Tracking

Settings for handling problematic files during operations.

| Setting | Default | Description |
|---------|---------|-------------|
| `spark.indextables.skippedFiles.trackingEnabled` | true | Enable skipped files tracking |
| `spark.indextables.skippedFiles.cooldownDuration` | 24 | Hours before retrying skipped files |
