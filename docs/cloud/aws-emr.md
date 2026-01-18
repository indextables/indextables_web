---
sidebar_position: 2
description: Deploy IndexTables on AWS EMR
---

# AWS EMR Deployment

IndexTables is optimized for EMR with automatic NVMe storage detection.

## Installation

Add to EMR cluster configuration:

```json
[
  {
    "Classification": "spark-defaults",
    "Properties": {
      "spark.jars.packages": "io.indextables:indextables4spark_2.12:1.0.0",
      "spark.sql.extensions": "io.indextables.spark.extensions.IndexTables4SparkExtensions"
    }
  }
]
```

## Instance Storage

EMR instances with NVMe storage (i3, r5d, etc.) automatically enable disk cache:

| Instance | Storage | Cache Size |
|----------|---------|------------|
| i3.xlarge | 950GB NVMe | ~630GB |
| i3.2xlarge | 1.9TB NVMe | ~1.2TB |
| r5d.xlarge | 150GB NVMe | ~100GB |

## IAM Role Configuration

Use instance profile for S3 access (no credentials needed):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::your-bucket"
    }
  ]
}
```

## Performance Settings

```python
# Recommended for EMR
spark.conf.set("spark.indextables.indexWriter.heapSize", "200M")
spark.conf.set("spark.indextables.s3.maxConcurrency", "8")
```

## EMR Serverless

IndexTables works with EMR Serverless. Package the JAR with your application:

```bash
aws emr-serverless start-job-run \
  --application-id $APP_ID \
  --execution-role-arn $ROLE_ARN \
  --job-driver '{
    "sparkSubmit": {
      "entryPoint": "s3://bucket/app.jar",
      "sparkSubmitParameters": "--packages io.indextables:indextables4spark_2.12:1.0.0"
    }
  }'
```
