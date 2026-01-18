import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
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
            className="button button--outline button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            to="https://github.com/indextables/indextables_spark">
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
          <Heading as="h2">The Search Revolution</Heading>
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

  const aggCode = `// Aggregations pushed to the search engine
spark.sql("""
  SELECT COUNT(*), AVG(latency)
  FROM logs
  WHERE status = 500
""")`;

  return (
    <section className={styles.codePreview}>
      <div className="container">
        <Heading as="h2" className={styles.codePreviewTitle}>Simple API, Powerful Results</Heading>
        <div className={styles.codeGrid}>
          <div className={styles.codeBlock}>
            <h3>Write</h3>
            <CodeBlock language="scala">{writeCode}</CodeBlock>
          </div>
          <div className={styles.codeBlock}>
            <h3>Search</h3>
            <CodeBlock language="scala">{queryCode}</CodeBlock>
          </div>
          <div className={styles.codeBlock}>
            <h3>Aggregate</h3>
            <CodeBlock language="scala">{aggCode}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <Heading as="h2">Ready to free your search?</Heading>
        <p>Get up and running in 5 minutes with our quickstart guide.</p>
        <Link
          className="button button--primary button--lg"
          to="/docs/getting-started/quickstart">
          Get Started
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Open Search for Spark"
      description="The open revolution came to data lakes. Now it's coming to search. High-performance full-text search for Apache Spark.">
      <HomepageHeader />
      <main>
        <MissionSection />
        <HomepageFeatures />
        <CodePreview />
        <CTASection />
      </main>
    </Layout>
  );
}
