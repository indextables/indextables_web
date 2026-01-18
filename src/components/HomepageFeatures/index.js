import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'No Infrastructure',
    icon: '🚀',
    description: (
      <>
        Runs inside Spark executors. No specialty servers to manage, scale, or pay for.
        Just add the library and start indexing.
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
        makes massive queries instant.
      </>
    ),
  },
  {
    title: '10-1000x Faster Analytics',
    icon: '📊',
    description: (
      <>
        Aggregations run directly in the search engine, not Spark.
        Evaluate billions of rows in seconds, not minutes or hours.
      </>
    ),
  },
  {
    title: 'Full-Text Search',
    icon: '🔍',
    description: (
      <>
        IndexQuery operators with Tantivy/Quickwit syntax. Boolean queries,
        phrase search, fuzzy matching, and more.
      </>
    ),
  },
  {
    title: 'Time-Series Analytics',
    icon: '📈',
    description: (
      <>
        Built-in date histograms and bucket aggregations. Analyze logs
        by hour, day, or month with a single SQL query.
      </>
    ),
  },
];

function Feature({icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3">{title}</Heading>
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
