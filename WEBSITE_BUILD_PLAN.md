# IndexTables4Spark Website Build Plan

**Repository:** https://github.com/indextables/indextables_web
**Hosting:** GitHub Pages
**Framework:** Docusaurus 3.x
**Target URL:** https://indextables.github.io/indextables_web (initial)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Implementation Tasks](#4-implementation-tasks)
5. [Content Inventory](#5-content-inventory)
6. [Page Specifications](#6-page-specifications)
7. [Design System](#7-design-system)
8. [Deployment Configuration](#8-deployment-configuration)
9. [Content Templates](#9-content-templates)
10. [Quality Checklist](#10-quality-checklist)

---

## 1. Project Overview

### Mission Statement

> **IndexTables — your fast search data should be yours**
>
> Six years ago, the data world flipped upside down. A new idea emerged — the data lakehouse — combining the openness of data lakes with the performance of data warehouses.
>
> It wasn't just an architecture. It was a revolution. Data stopped belonging to vendors. It started belonging to you.
>
> For the first time, teams could choose the right tools — based on innovation, cost, and skill fit — not lock-in. Vendors had to compete on merit, not monopoly.
>
> But one domain missed the revolution: **search**. Observability and security search stacks are still dominated by closed, expensive ecosystems.
>
> **IndexTables brings that same open revolution to search** — with performance that rivals the biggest proprietary platforms, built entirely on open tech. Built on Spark. Powered by the community.
>
> *It's your data. Your performance. Your choice.*

### Goals

- Create a professional documentation website for IndexTables4Spark
- **Communicate the open data mission** — position IndexTables as part of the lakehouse revolution
- Enable users to get started in under 10 minutes
- Provide comprehensive reference documentation
- Support blog posts for announcements and tutorials
- Host on GitHub Pages with zero ongoing cost

### Success Criteria

- [ ] Homepage clearly communicates value proposition
- [ ] Quickstart guide works end-to-end
- [ ] All CLAUDE.md content migrated and organized
- [ ] Site builds and deploys automatically on push
- [ ] Search functionality works across all docs
- [ ] Mobile-responsive design

---

## 2. Technology Stack

### Core

| Component | Technology | Version |
|-----------|------------|---------|
| Static Site Generator | Docusaurus | 3.6.x |
| Runtime | Node.js | 20.x LTS |
| Package Manager | npm | 10.x |
| Hosting | GitHub Pages | - |
| CI/CD | GitHub Actions | - |

### Plugins

| Plugin | Purpose |
|--------|---------|
| `@docusaurus/preset-classic` | Docs + Blog + Pages |
| `@easyops-cn/docusaurus-search-local` | Offline search (no Algolia needed) |
| `@docusaurus/theme-mermaid` | Architecture diagrams |
| `prism-react-renderer` | Code syntax highlighting |

### Development Tools

```bash
# Required
node --version  # v20.x
npm --version   # v10.x

# Recommended
npx create-docusaurus@latest --help
```

---

## 3. Repository Structure

```
indextables_web/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages deployment
├── docs/                           # Documentation (versioned)
│   ├── getting-started/
│   │   ├── _category_.json
│   │   ├── installation.md
│   │   ├── quickstart.md
│   │   └── first-index.md
│   ├── core-concepts/
│   │   ├── _category_.json
│   │   ├── split-architecture.md
│   │   ├── transaction-log.md
│   │   ├── field-types.md
│   │   └── partitioning.md
│   ├── configuration/
│   │   ├── _category_.json
│   │   ├── essential-settings.md
│   │   ├── index-writer.md
│   │   ├── cache-settings.md
│   │   ├── s3-configuration.md
│   │   └── azure-configuration.md
│   ├── query-guide/
│   │   ├── _category_.json
│   │   ├── filter-pushdown.md
│   │   ├── indexquery-syntax.md
│   │   ├── aggregate-pushdown.md
│   │   └── bucket-aggregations.md
│   ├── sql-commands/
│   │   ├── _category_.json
│   │   ├── merge-splits.md
│   │   ├── purge-indextable.md
│   │   ├── drop-partitions.md
│   │   ├── prewarm-cache.md
│   │   ├── describe-disk-cache.md
│   │   └── describe-storage-stats.md
│   ├── advanced/
│   │   ├── _category_.json
│   │   ├── json-fields.md
│   │   ├── batch-optimization.md
│   │   ├── l2-disk-cache.md
│   │   ├── merge-on-write.md
│   │   └── purge-on-write.md
│   ├── performance/
│   │   ├── _category_.json
│   │   ├── tuning-guide.md
│   │   └── troubleshooting.md
│   ├── cloud/
│   │   ├── _category_.json
│   │   ├── databricks.md
│   │   ├── aws-emr.md
│   │   └── azure-hdinsight.md
│   └── reference/
│       ├── _category_.json
│       ├── configuration-reference.md
│       └── schema-types.md
├── blog/
│   ├── authors.yml
│   ├── 2024-12-31-welcome/
│   │   ├── index.md
│   │   └── social-card.png
│   └── tags.yml
├── src/
│   ├── components/
│   │   ├── HomepageFeatures/
│   │   │   ├── index.js
│   │   │   └── styles.module.css
│   │   └── CodeBlock/
│   │       └── index.js
│   ├── css/
│   │   └── custom.css
│   └── pages/
│       ├── index.js                # Homepage
│       ├── index.module.css
│       ├── why-indextables.md      # Mission/manifesto page
│       └── community.md            # Community page
├── static/
│   ├── img/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   ├── favicon.ico
│   │   ├── social-card.png
│   │   └── diagrams/
│   │       ├── architecture.svg
│   │       └── split-format.svg
│   └── CNAME                       # Custom domain (future)
├── versioned_docs/                 # Auto-generated for versions
├── versioned_sidebars/             # Auto-generated for versions
├── .gitignore
├── docusaurus.config.js
├── sidebars.js
├── package.json
├── babel.config.js
├── README.md
└── WEBSITE_BUILD_PLAN.md           # This file
```

---

## 4. Implementation Tasks

### Phase 1: Project Setup

#### Task 1.1: Initialize Docusaurus Project

```bash
cd /Users/schenksj/tmp/x/indextables_web

# Create Docusaurus project
npx create-docusaurus@latest . classic --typescript

# Install additional plugins
npm install @easyops-cn/docusaurus-search-local
npm install @docusaurus/theme-mermaid
```

#### Task 1.2: Configure docusaurus.config.js

Create `docusaurus.config.js`:

```javascript
// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'IndexTables4Spark',
  tagline: 'Your fast search data should be yours',
  favicon: 'img/favicon.ico',

  url: 'https://indextables.github.io',
  baseUrl: '/indextables_web/',

  organizationName: 'indextables',
  projectName: 'indextables_web',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/indextables/indextables_web/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/indextables/indextables_web/edit/main/',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All Posts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      navbar: {
        title: 'IndexTables4Spark',
        logo: {
          alt: 'IndexTables Logo',
          src: 'img/logo.svg',
          srcDark: 'img/logo-dark.svg',
        },
        items: [
          {to: '/why-indextables', label: 'Why IndexTables', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {to: '/community', label: 'Community', position: 'left'},
          {
            href: 'https://github.com/indextables/indextables',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {label: 'Why IndexTables', to: '/why-indextables'},
              {label: 'Getting Started', to: '/docs/getting-started/quickstart'},
              {label: 'Configuration', to: '/docs/configuration/essential-settings'},
              {label: 'SQL Commands', to: '/docs/sql-commands/merge-splits'},
            ],
          },
          {
            title: 'Community',
            items: [
              {label: 'GitHub Discussions', href: 'https://github.com/indextables/indextables/discussions'},
              {label: 'Issues', href: 'https://github.com/indextables/indextables/issues'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'Blog', to: '/blog'},
              {label: 'GitHub', href: 'https://github.com/indextables/indextables'},
              {label: 'Releases', href: 'https://github.com/indextables/indextables/releases'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} IndexTables Project. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['scala', 'java', 'bash', 'sql', 'json'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],
};

export default config;
```

#### Task 1.3: Configure sidebars.js

Create `sidebars.js`:

```javascript
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quickstart',
        'getting-started/first-index',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core-concepts/split-architecture',
        'core-concepts/transaction-log',
        'core-concepts/field-types',
        'core-concepts/partitioning',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/essential-settings',
        'configuration/index-writer',
        'configuration/cache-settings',
        'configuration/s3-configuration',
        'configuration/azure-configuration',
      ],
    },
    {
      type: 'category',
      label: 'Query Guide',
      items: [
        'query-guide/filter-pushdown',
        'query-guide/indexquery-syntax',
        'query-guide/aggregate-pushdown',
        'query-guide/bucket-aggregations',
      ],
    },
    {
      type: 'category',
      label: 'SQL Commands',
      items: [
        'sql-commands/merge-splits',
        'sql-commands/purge-indextable',
        'sql-commands/drop-partitions',
        'sql-commands/prewarm-cache',
        'sql-commands/describe-disk-cache',
        'sql-commands/describe-storage-stats',
        'sql-commands/flush-disk-cache',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      items: [
        'advanced/json-fields',
        'advanced/batch-optimization',
        'advanced/l2-disk-cache',
        'advanced/merge-on-write',
        'advanced/purge-on-write',
      ],
    },
    {
      type: 'category',
      label: 'Performance',
      items: [
        'performance/tuning-guide',
        'performance/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Cloud Deployment',
      items: [
        'cloud/databricks',
        'cloud/aws-emr',
        'cloud/azure-hdinsight',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/configuration-reference',
        'reference/schema-types',
      ],
    },
  ],
};

export default sidebars;
```

#### Task 1.4: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build website
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Task 1.5: Configure .gitignore

Create `.gitignore`:

```
# Dependencies
/node_modules

# Production
/build

# Generated files
.docusaurus
.cache-loader

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

### Phase 2: Homepage & Core Pages

#### Task 2.1: Create Homepage Component

Create `src/pages/index.js`:

```jsx
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">Your fast search data should be yours</p>
        <p className={styles.heroDescription}>
          The open revolution came to data lakes. Now it's coming to search.<br />
          Performance that rivals proprietary platforms — built entirely on open tech.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/quickstart">
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            to="https://github.com/indextables/indextables">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function MissionSection() {
  return (
    <section className={styles.mission}>
      <div className="container">
        <div className={styles.missionContent}>
          <h2>The Search Revolution</h2>
          <p>
            Six years ago, the data world flipped upside down. The data lakehouse
            combined the openness of data lakes with the performance of data warehouses.
            Data stopped belonging to vendors. It started belonging to <strong>you</strong>.
          </p>
          <p>
            But one domain missed the revolution: <strong>search</strong>. Observability
            and security search stacks are still dominated by closed, expensive ecosystems.
          </p>
          <p>
            IndexTables brings that same open revolution to search — with performance
            that rivals the biggest proprietary platforms, built entirely on open tech.
            Built on Spark. Powered by the community.
          </p>
          <p className={styles.tagline}>
            <em>It's your data. Your performance. Your choice.</em>
          </p>
        </div>
      </div>
    </section>
  );
}

function CodePreview() {
  const writeCode = `// Write with full-text indexing
df.write.format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.content", "text")
  .save("s3://bucket/logs")`;

  const queryCode = `// Query with IndexQuery syntax
spark.sql("""
  SELECT * FROM logs
  WHERE content indexquery 'error AND database'
""")`;

  const aggCode = `// Aggregations pushed to Tantivy
spark.sql("""
  SELECT COUNT(*), AVG(latency)
  FROM logs
  WHERE status = 500
""")`;

  return (
    <section className={styles.codePreview}>
      <div className="container">
        <h2>Simple API, Powerful Results</h2>
        <div className={styles.codeGrid}>
          <div>
            <h3>Write</h3>
            <CodeBlock language="scala">{writeCode}</CodeBlock>
          </div>
          <div>
            <h3>Search</h3>
            <CodeBlock language="scala">{queryCode}</CodeBlock>
          </div>
          <div>
            <h3>Aggregate</h3>
            <CodeBlock language="scala">{aggCode}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Open Search for Spark`}
      description="The open revolution came to data lakes. Now it's coming to search. High-performance full-text search for Apache Spark.">
      <HomepageHeader />
      <main>
        <MissionSection />
        <HomepageFeatures />
        <CodePreview />
      </main>
    </Layout>
  );
}
```

#### Task 2.2: Create HomepageFeatures Component

Create `src/components/HomepageFeatures/index.js`:

```jsx
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'No Infrastructure',
    icon: '🚀',
    description: (
      <>
        Runs inside Spark executors. No Elasticsearch servers to manage,
        scale, or pay for. Just add the library and start indexing.
      </>
    ),
  },
  {
    title: 'Spark Native',
    icon: '⚡',
    description: (
      <>
        DataSource V2 with full filter pushdown, aggregate pushdown
        (COUNT, SUM, AVG), and partition pruning. Works with Spark SQL.
      </>
    ),
  },
  {
    title: 'Cloud Ready',
    icon: '☁️',
    description: (
      <>
        QuickwitSplit format optimized for S3 and Azure. L2 disk cache
        auto-enables on Databricks and EMR NVMe storage.
      </>
    ),
  },
  {
    title: 'Full-Text Search',
    icon: '🔍',
    description: (
      <>
        IndexQuery operators with native Tantivy syntax. Boolean queries,
        phrase search, fuzzy matching, and more.
      </>
    ),
  },
  {
    title: 'Aggregate Pushdown',
    icon: '📊',
    description: (
      <>
        COUNT, SUM, AVG, MIN, MAX executed directly in Tantivy.
        Bucket aggregations for time-series and distribution analysis.
      </>
    ),
  },
  {
    title: 'Transaction Log',
    icon: '📝',
    description: (
      <>
        Delta Lake-style atomicity with checkpoints and GZIP compression.
        MERGE SPLITS and PURGE commands for maintenance.
      </>
    ),
  },
];

function Feature({icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### Task 2.3: Create "Why IndexTables" Page

Create `src/pages/why-indextables.md`:

```markdown
---
title: Why IndexTables
description: The open revolution came to data lakes. Now it's coming to search.
---

# Why IndexTables

<p className="hero__subtitle" style={{fontSize: '1.5rem', marginBottom: '2rem'}}>
Your fast search data should be yours
</p>

## The Data Lakehouse Revolution

Six years ago, the data world flipped upside down.

A new idea emerged — **the data lakehouse** — combining the openness of data lakes with the performance of data warehouses.

It wasn't just an architecture. It was a revolution.

**Data stopped belonging to vendors. It started belonging to you.**

For the first time, teams could choose the right tools — based on innovation, cost, and skill fit — not lock-in. Vendors had to compete on merit, not monopoly.

## Search Missed the Revolution

But one domain missed the revolution: **search**.

Observability and security search stacks are still dominated by closed, expensive ecosystems. You're locked into:

- **Proprietary formats** that only work with one vendor
- **Server infrastructure** that you have to manage and scale
- **Licensing costs** that grow with your data
- **Vendor roadmaps** that may not align with your needs

## IndexTables: Open Search for the Lakehouse Era

IndexTables brings that same open revolution to search — with performance that rivals the biggest proprietary platforms, built entirely on open tech.

### Built on Spark

IndexTables runs as a native Spark DataSource. No separate cluster. No new infrastructure. Your search indexes live alongside your data in the lakehouse.

### Powered by Tantivy

[Tantivy](https://github.com/quickwit-oss/tantivy) is the Rust-based search engine that powers [Quickwit](https://quickwit.io). It delivers Lucene-class performance with modern, memory-safe code.

### Open Format

The QuickwitSplit format is documented and open. Your indexes are stored in standard object storage (S3, Azure Blob). No proprietary lock-in.

### Community Driven

IndexTables is open source. You can inspect the code, contribute features, and shape the roadmap.

---

## The Bottom Line

| Traditional Search | IndexTables |
|--------------------|-------------|
| Separate cluster to manage | Runs in your Spark executors |
| Proprietary format | Open QuickwitSplit format |
| Per-GB licensing | Open source |
| Vendor lock-in | Your data, your choice |

---

<p style={{fontSize: '1.4rem', fontWeight: 600, textAlign: 'center', marginTop: '3rem'}}>
<em>It's your data. Your performance. Your choice.</em>
</p>

<div style={{textAlign: 'center', marginTop: '2rem'}}>
<a className="button button--primary button--lg" href="/docs/getting-started/quickstart">
Get Started
</a>
</div>
```

#### Task 2.4: Create Community Page

Create `src/pages/community.md`:

```markdown
---
title: Community
description: Get involved with the IndexTables4Spark community
---

# Community

IndexTables4Spark is an open-source project. We welcome contributions and feedback!

## Get Help

- **GitHub Discussions**: Ask questions and share ideas in [GitHub Discussions](https://github.com/indextables/indextables/discussions)
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/indextables/indextables/issues)

## Contribute

We welcome contributions of all kinds:

- **Bug fixes**: Found a bug? Submit a PR!
- **Documentation**: Help improve our docs
- **Features**: Propose and implement new features
- **Examples**: Share your use cases and examples

See our [Contributing Guide](https://github.com/indextables/indextables/blob/main/CONTRIBUTING.md) for details.

## Resources

- [GitHub Repository](https://github.com/indextables/indextables)
- [Releases](https://github.com/indextables/indextables/releases)
- [License](https://github.com/indextables/indextables/blob/main/LICENSE)
```

---

### Phase 3: Documentation Content

#### Task 3.1: Getting Started Section

**docs/getting-started/installation.md**

```markdown
---
sidebar_position: 1
---

# Installation

Add IndexTables4Spark to your project.

## Maven

```xml
<dependency>
  <groupId>io.indextables</groupId>
  <artifactId>indextables4spark_2.12</artifactId>
  <version>1.0.0</version>
</dependency>
```

## SBT

```scala
libraryDependencies += "io.indextables" %% "indextables4spark" % "1.0.0"
```

## Spark Shell

```bash
spark-shell --packages io.indextables:indextables4spark_2.12:1.0.0
```

## Requirements

- Apache Spark 3.x
- Java 11 or later
- Scala 2.12 or 2.13

## Register SQL Extensions

To use SQL commands like `MERGE SPLITS` and `PREWARM CACHE`:

```scala
spark.sql("SET spark.sql.extensions=io.indextables.spark.extensions.IndexTables4SparkExtensions")
```

Or in `spark-defaults.conf`:

```properties
spark.sql.extensions=io.indextables.spark.extensions.IndexTables4SparkExtensions
```
```

**docs/getting-started/quickstart.md**

```markdown
---
sidebar_position: 2
---

# Quickstart

Get up and running with IndexTables4Spark in 5 minutes.

## 1. Create Sample Data

```scala
import spark.implicits._

val data = Seq(
  (1, "Introduction to Machine Learning", "machine learning basics tutorial"),
  (2, "Advanced Deep Learning", "neural networks deep learning AI"),
  (3, "Data Engineering Best Practices", "spark hadoop data pipelines"),
  (4, "Search Engine Architecture", "elasticsearch lucene search indexing")
).toDF("id", "title", "content")
```

## 2. Write an Index

```scala
data.write
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .option("spark.indextables.indexing.typemap.title", "string")
  .option("spark.indextables.indexing.typemap.content", "text")
  .mode("overwrite")
  .save("/tmp/my_index")
```

## 3. Query the Index

```scala
val df = spark.read
  .format("io.indextables.spark.core.IndexTables4SparkTableProvider")
  .load("/tmp/my_index")

// Standard SQL filters (pushed down for string fields)
df.filter($"title" === "Introduction to Machine Learning").show()

// Full-text search with IndexQuery
import org.apache.spark.sql.indextables.IndexQueryExpression._
df.filter($"content" indexquery "machine learning").show()
```

## 4. Run Aggregations

```scala
// Aggregations are pushed down to Tantivy
df.agg(count("*")).show()

// With filters
df.filter($"content" indexquery "deep learning")
  .agg(count("*"))
  .show()
```

## Next Steps

- [Field Types](/docs/core-concepts/field-types) - Understand string vs text fields
- [Configuration](/docs/configuration/essential-settings) - Tune for your workload
- [IndexQuery Syntax](/docs/query-guide/indexquery-syntax) - Master full-text search
```

**docs/getting-started/first-index.md**

```markdown
---
sidebar_position: 3
---

# Your First Production Index

This guide walks through creating a production-ready index on S3.

## Configure S3 Access

```scala
spark.conf.set("spark.indextables.aws.accessKey", "YOUR_ACCESS_KEY")
spark.conf.set("spark.indextables.aws.secretKey", "YOUR_SECRET_KEY")
```

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
```

#### Task 3.2: SQL Commands Section (Example)

**docs/sql-commands/merge-splits.md**

```markdown
---
sidebar_position: 1
---

# MERGE SPLITS

Consolidate small splits into larger ones for improved query performance.

## Syntax

```sql
MERGE SPLITS '<path>'
  [TARGET SIZE <size>]
  [MAX DEST SPLITS <n>]
  [MAX SOURCE SPLITS PER MERGE <n>]
  [WHERE <partition_predicate>]
```

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `TARGET SIZE` | Maximum size of merged splits | 5GB |
| `MAX DEST SPLITS` | Limit number of destination splits | unlimited |
| `MAX SOURCE SPLITS PER MERGE` | Max source splits per merge operation | 1000 |
| `WHERE` | Partition filter predicate | all partitions |

## Examples

### Basic Merge

```sql
-- Merge all splits with default 5GB target
MERGE SPLITS 's3://bucket/my_index';
```

### With Target Size

```sql
-- Target 1GB merged splits
MERGE SPLITS 's3://bucket/my_index' TARGET SIZE 1G;
```

### Partition-Specific Merge

```sql
-- Only merge specific partition
MERGE SPLITS 's3://bucket/my_index'
  WHERE date = '2024-01-01'
  TARGET SIZE 500M;
```

### Limit Merge Scope

```sql
-- Merge at most 10 destination splits, 100 source splits each
MERGE SPLITS 's3://bucket/my_index'
  TARGET SIZE 1G
  MAX DEST SPLITS 10
  MAX SOURCE SPLITS PER MERGE 100;
```

## Configuration

```scala
// Default max source splits per merge
spark.conf.set("spark.indextables.merge.maxSourceSplitsPerMerge", "1000")
```

## When to Use

- After many small writes that create fragmented splits
- During scheduled maintenance windows
- Before running large analytical queries
- When storage costs need optimization

## Related

- [PURGE INDEXTABLE](/docs/sql-commands/purge-indextable) - Clean up after merges
- [Merge-On-Write](/docs/advanced/merge-on-write) - Automatic merging during writes
```

---

### Phase 4: Blog Setup

#### Task 4.1: Configure Blog Authors

Create `blog/authors.yml`:

```yaml
indextables:
  name: IndexTables Team
  title: Core Maintainers
  url: https://github.com/indextables
  image_url: https://github.com/indextables.png

# Add individual authors as needed:
# john:
#   name: John Doe
#   title: Contributor
#   url: https://github.com/johndoe
#   image_url: https://github.com/johndoe.png
```

#### Task 4.2: Create Welcome Blog Post

Create `blog/2024-12-31-welcome/index.md`:

```markdown
---
slug: welcome
title: "Your Fast Search Data Should Be Yours"
authors: [indextables]
tags: [announcement, mission]
---

We're excited to launch the official IndexTables4Spark website — and to share our vision for open search in the lakehouse era.

<!-- truncate -->

## The Search Revolution

Six years ago, the data lakehouse revolution changed everything. Data stopped belonging to vendors. It started belonging to **you**.

But one domain missed the revolution: **search**. Observability and security search stacks are still dominated by closed, expensive ecosystems.

**IndexTables brings that same open revolution to search** — with performance that rivals the biggest proprietary platforms, built entirely on open tech.

Read our full manifesto: [Why IndexTables](/why-indextables)

## What is IndexTables4Spark?

IndexTables4Spark brings high-performance full-text search to Apache Spark.
Built on [Tantivy](https://github.com/quickwit-oss/tantivy), it runs embedded
in Spark executors - no external servers required.

## Key Features

- **Full-Text Search**: Native Tantivy query syntax with IndexQuery operators
- **Aggregate Pushdown**: COUNT, SUM, AVG, MIN, MAX executed in Tantivy
- **Cloud Optimized**: QuickwitSplit format for S3 and Azure
- **Zero Infrastructure**: No Elasticsearch cluster to manage
- **Open Format**: Your data stays yours, in open formats on your storage

## Getting Started

Check out our [Quickstart Guide](/docs/getting-started/quickstart) to get
up and running in 5 minutes.

## Stay Connected

- Star us on [GitHub](https://github.com/indextables/indextables)
- Join the discussion in [GitHub Discussions](https://github.com/indextables/indextables/discussions)
- Report issues on [GitHub Issues](https://github.com/indextables/indextables/issues)

---

*It's your data. Your performance. Your choice.*
```

---

### Phase 5: Styling & Assets

#### Task 5.1: Custom CSS

Create `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #1a73e8;
  --ifm-color-primary-dark: #1765cc;
  --ifm-color-primary-darker: #1660c1;
  --ifm-color-primary-darkest: #124f9f;
  --ifm-color-primary-light: #3485ed;
  --ifm-color-primary-lighter: #408bf0;
  --ifm-color-primary-lightest: #6aa5f4;
  --ifm-code-font-size: 95%;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --ifm-color-primary: #4dabf7;
  --ifm-color-primary-dark: #339af0;
  --ifm-color-primary-darker: #228be6;
  --ifm-color-primary-darkest: #1c7ed6;
  --ifm-color-primary-light: #74c0fc;
  --ifm-color-primary-lighter: #a5d8ff;
  --ifm-color-primary-lightest: #d0ebff;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}

/* Hero section */
.hero--primary {
  background: linear-gradient(135deg, var(--ifm-color-primary-darkest) 0%, var(--ifm-color-primary) 100%);
}

.hero__subtitle {
  font-size: 1.5rem;
  font-weight: 400;
}

/* Feature cards */
.featureCard {
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--ifm-card-background-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.featureCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.featureIcon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

/* Code blocks */
.theme-code-block {
  border-radius: 8px;
}

/* Admonitions */
.admonition {
  border-radius: 8px;
}

/* Tables */
table {
  display: table;
  width: 100%;
}

th, td {
  padding: 0.75rem 1rem;
}

/* Navbar */
.navbar__title {
  font-weight: 700;
}

/* Footer */
.footer--dark {
  background: var(--ifm-color-primary-darkest);
}

/* Mission Section */
.mission {
  padding: 4rem 0;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

[data-theme='dark'] .mission {
  background: linear-gradient(180deg, #1b1b1d 0%, #242526 100%);
}

.missionContent {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.missionContent h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--ifm-color-primary-darkest);
}

[data-theme='dark'] .missionContent h2 {
  color: var(--ifm-color-primary-light);
}

.missionContent p {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.missionContent .tagline {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--ifm-color-primary);
  margin-top: 2rem;
}
```

#### Task 5.2: Create Placeholder Logo

Create `static/img/logo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
  <rect x="10" y="20" width="80" height="60" rx="5" fill="#1a73e8"/>
  <rect x="20" y="30" width="60" height="8" rx="2" fill="white"/>
  <rect x="20" y="45" width="45" height="8" rx="2" fill="white"/>
  <rect x="20" y="60" width="55" height="8" rx="2" fill="white"/>
  <circle cx="75" cy="65" r="15" fill="#4dabf7"/>
  <path d="M75 58 L75 72 M68 65 L82 65" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>
```

---

## 5. Content Inventory

### Content Migration from CLAUDE.md

| Source Section | Target Doc | Priority |
|----------------|------------|----------|
| Essential Commands | getting-started/installation | High |
| Core Features | core-concepts/* | High |
| Key Configuration Settings | configuration/* | High |
| Field Indexing | core-concepts/field-types | High |
| Common Usage | getting-started/quickstart | High |
| Bucket Aggregations | query-guide/bucket-aggregations | High |
| Batch Retrieval Optimization | advanced/batch-optimization | Medium |
| JSON Fields | advanced/json-fields | Medium |
| Partitioned Datasets | core-concepts/partitioning | Medium |
| Prewarm Cache | sql-commands/prewarm-cache | Medium |
| Merge Splits | sql-commands/merge-splits | High |
| Purge IndexTable | sql-commands/purge-indextable | Medium |
| Drop Partitions | sql-commands/drop-partitions | Medium |
| Describe Disk Cache | sql-commands/describe-disk-cache | Low |
| Describe Storage Stats | sql-commands/describe-storage-stats | Low |
| Azure Multi-Cloud | configuration/azure-configuration | Medium |
| Performance Tuning | performance/tuning-guide | Medium |
| Architecture Notes | core-concepts/split-architecture | Medium |
| Test Status | (internal only) | Skip |

### New Content to Create

| Document | Description | Priority |
|----------|-------------|----------|
| cloud/databricks.md | Databricks deployment guide | High |
| cloud/aws-emr.md | EMR deployment guide | Medium |
| performance/troubleshooting.md | Common issues and solutions | Medium |
| reference/configuration-reference.md | Complete config table | High |
| Blog: use cases | Real-world examples | Low |

---

## 6. Page Specifications

### Homepage Sections

1. **Hero**: Tagline, description, 2 CTAs (Get Started, GitHub)
2. **Features**: 6-card grid with icons
3. **Code Preview**: 3 code blocks (Write, Search, Aggregate)
4. **CTA Banner**: "Ready to get started?" with link to quickstart

### Documentation Pages

Each doc page includes:

- **Title** (H1)
- **Description** (front matter for SEO)
- **Sidebar position** (front matter)
- **Content** with:
  - Overview paragraph
  - Code examples (Scala/SQL)
  - Configuration tables
  - Related links

### Blog Posts

Each blog post includes:

- **Title**
- **Author(s)**
- **Tags**
- **Truncate marker** (for excerpts)
- **Content** with code, images, links

---

## 7. Design System

### Colors

| Name | Light | Dark | Usage |
|------|-------|------|-------|
| Primary | #1a73e8 | #4dabf7 | Links, buttons, accents |
| Primary Dark | #124f9f | #1c7ed6 | Hover states, hero bg |
| Background | #ffffff | #1b1b1d | Page background |
| Text | #1c1e21 | #e3e3e3 | Body text |
| Code BG | #f6f8fa | #2d2d2d | Code blocks |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | System | 2.5rem | 700 |
| H2 | System | 2rem | 600 |
| H3 | System | 1.5rem | 600 |
| Body | System | 1rem | 400 |
| Code | JetBrains Mono | 0.95rem | 400 |

### Components

- **Buttons**: Primary (filled), Secondary (outline)
- **Cards**: Elevated with hover effect
- **Code blocks**: Syntax highlighted, copy button
- **Admonitions**: Note, Tip, Warning, Danger
- **Tables**: Striped rows, sticky headers

---

## 8. Deployment Configuration

### GitHub Repository Settings

1. Go to **Settings > Pages**
2. Source: **GitHub Actions**
3. Custom domain: (leave blank initially)

### Environment Variables

None required for basic deployment.

### Custom Domain (Future)

1. Purchase domain (e.g., `indextables.dev`)
2. Add `CNAME` file to `static/` with domain name
3. Configure DNS:
   - A record: `185.199.108.153` (GitHub Pages IP)
   - CNAME: `www` → `indextables.github.io`
4. Enable HTTPS in repository settings

---

## 9. Content Templates

### Documentation Page Template

```markdown
---
sidebar_position: 1
description: Brief description for SEO
---

# Page Title

Brief introduction paragraph explaining what this page covers.

## Section 1

Content with code examples:

```scala
// Example code
val df = spark.read.format("indextables").load("path")
```

## Section 2

### Subsection

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value | Value | Value |

:::tip
Helpful tip for users.
:::

:::warning
Important warning about edge cases.
:::

## Related

- [Related Page 1](/docs/path/to/page)
- [Related Page 2](/docs/path/to/page)
```

### Blog Post Template

```markdown
---
slug: url-slug
title: Blog Post Title
authors: [author-id]
tags: [tag1, tag2]
image: ./social-card.png
---

Introduction paragraph that appears in the blog list.

<!-- truncate -->

## Main Content

Rest of the blog post content.

## Conclusion

Summary and call to action.
```

### Category Metadata Template

Create `_category_.json` in each docs folder:

```json
{
  "label": "Category Name",
  "position": 1,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "description": "Description of this category."
  }
}
```

---

## 10. Quality Checklist

### Pre-Launch

- [ ] All links work (internal and external)
- [ ] Code examples are tested and work
- [ ] Images have alt text
- [ ] Mobile responsive (test on phone)
- [ ] Dark mode works correctly
- [ ] Search returns relevant results
- [ ] Build has no warnings
- [ ] Lighthouse score > 90

### Content Review

- [ ] Spelling and grammar checked
- [ ] Technical accuracy verified
- [ ] Code examples are copy-paste ready
- [ ] Configuration values have defaults listed
- [ ] Related links point to correct pages

### SEO

- [ ] Each page has description meta tag
- [ ] Titles are descriptive and unique
- [ ] Social card image exists
- [ ] sitemap.xml generated
- [ ] robots.txt allows indexing

### Accessibility

- [ ] Headings follow hierarchy (H1 > H2 > H3)
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works

---

## Execution Commands

### Quick Start

```bash
# Clone and setup
cd /Users/schenksj/tmp/x/indextables_web

# Initialize Docusaurus (if not done)
npx create-docusaurus@latest temp classic
mv temp/* .
mv temp/.* . 2>/dev/null
rmdir temp

# Install plugins
npm install @easyops-cn/docusaurus-search-local @docusaurus/theme-mermaid

# Start development server
npm start

# Build for production
npm run build

# Test production build locally
npm run serve
```

### Common Commands

```bash
# Development
npm start                    # Start dev server at localhost:3000

# Build
npm run build               # Build static site to /build

# Deploy (manual)
npm run deploy              # Deploy to GitHub Pages

# Version docs
npm run docusaurus docs:version 1.0.0

# Clear cache
npm run clear
```

---

## Timeline Estimate

| Phase | Tasks | Files |
|-------|-------|-------|
| Phase 1 | Project setup, config, CI/CD | 6 files |
| Phase 2 | Homepage, community page | 4 files |
| Phase 3 | Documentation (all sections) | 25+ files |
| Phase 4 | Blog setup, first post | 3 files |
| Phase 5 | Styling, assets | 3 files |

---

## Notes

- Keep CLAUDE.md as the source of truth; sync changes to website
- Use Docusaurus versioning when releasing major versions
- Blog posts can be added incrementally after launch
- Consider Algolia DocSearch for production search (free for OSS)
