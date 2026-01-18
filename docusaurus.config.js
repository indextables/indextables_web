// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'IndexTables for Spark',
  tagline: 'Your fast search data should be yours',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://www.indextables.io',
  baseUrl: '/',

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
          editUrl: 'https://github.com/indextables/indextables_spark_web/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/indextables/indextables_spark_web/edit/main/',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All Posts',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
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
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'IndexTables',
        logo: {
          alt: 'IndexTables Logo',
          src: 'img/logo.png',
          srcDark: 'img/logo-dark.png',
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
            href: 'https://github.com/indextables/indextables_spark',
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
              {label: 'GitHub Discussions', href: 'https://github.com/indextables/indextables_spark/discussions'},
              {label: 'Issues', href: 'https://github.com/indextables/indextables_spark/issues'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'Blog', to: '/blog'},
              {label: 'GitHub', href: 'https://github.com/indextables/indextables_spark'},
              {label: 'Releases', href: 'https://github.com/indextables/indextables_spark/releases'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} IndexTables Project. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java', 'bash', 'json'],
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
