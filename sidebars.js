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
        'core-concepts/companion-mode',
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
        'configuration/memory-management',
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
        'sql-commands/describe-commands',
        'sql-commands/profiler',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      items: [
        'advanced/json-fields',
        'advanced/l2-disk-cache',
        'advanced/optimize-write',
        'advanced/merge-on-write',
        'advanced/purge-on-write',
      ],
    },
    {
      type: 'category',
      label: 'Cloud Deployment',
      items: [
        'cloud/databricks',
        'cloud/aws-emr',
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
