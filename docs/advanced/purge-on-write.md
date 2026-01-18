---
sidebar_position: 5
description: Automatic cleanup during write operations
---

# Purge-On-Write

Automatic cleanup of orphaned splits and old transaction logs during writes.

## Configuration

```scala
// Enable purge-on-write
spark.conf.set("spark.indextables.purgeOnWrite.enabled", "true")

// Run after merge-on-write
spark.conf.set("spark.indextables.purgeOnWrite.triggerAfterMerge", "true")

// Run after N writes (0 = disabled)
spark.conf.set("spark.indextables.purgeOnWrite.triggerAfterWrites", "10")

// Retention periods
spark.conf.set("spark.indextables.purgeOnWrite.splitRetentionHours", "168")  // 7 days
spark.conf.set("spark.indextables.purgeOnWrite.txLogRetentionHours", "720")  // 30 days
```

## Trigger Modes

1. **After merge-on-write**: Runs automatically after each merge
2. **After N writes**: Runs after configured number of writes

## Usage

```scala
// Complete automatic table hygiene
df.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.mergeOnWrite.enabled", "true")
  .option("spark.indextables.purgeOnWrite.enabled", "true")
  .option("spark.indextables.purgeOnWrite.triggerAfterMerge", "true")
  .option("spark.indextables.purgeOnWrite.triggerAfterWrites", "20")
  .save("s3://bucket/path")
```

## Safety Features

- Disabled by default
- Respects minimum retention periods
- Propagates credentials automatically
- Graceful failure handling (doesn't fail writes)
- Per-session counters (reset between sessions)

## When to Use

- High-frequency write workloads
- Tables with frequent merge operations
- Long-running Spark applications
- Development/testing with rapid iteration
