import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'Zero 技術筆記',
  tagline: '從零開始的軟體生涯',
  favicon: 'img/zero_v2_192x192.png',

  // Set the production url of your site here
  url: 'https://zlrweb.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'zlrweb', // Usually your GitHub org/user name.
  projectName: 'zlrweb.github.io', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-TW',
    locales: ['zh-TW']
  },

  // Reference: https://ouch1978.github.io/docs/docusaurus/customization/use-google-fonts-with-correct-way
  stylesheets: [
    // {
    //   rel: 'preconnect',
    //   href: 'https://fonts.googleapis.com',
    // },
    // {
    //   rel: 'preconnect',
    //   href: 'https://fonts.gstatic.com',
    //   crossorigin: 'anonymous',
    // },
    // {
    //   rel: 'stylesheet',
    //   href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap',
    // },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/ZLRWeb/zlrweb.github.io/blob/main'
        },
        blog: {
          showReadingTime: true,
          blogTitle: '技術探索',
          routeBasePath: 'tech-explore',
          path: './blog/tech-explore',
          // Reference: https://docusaurus.io/docs/blog#feed
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Zero(Joseph Yang), Inc.`,
            xslt: {
              rss: true,
              atom: true
            },
            createFeedItems: async params => {
              const { blogPosts, defaultCreateFeedItems, ...rest } = params
              return defaultCreateFeedItems({
                // keep only the 10 most recent blog posts in the feed
                blogPosts: blogPosts.filter((item, index) => index < 10),
                ...rest
              })
            }
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/ZLRWeb/zlrweb.github.io/blob/main',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          blogSidebarCount: 0,
          postsPerPage: 10
        },
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options
    ]
  ],

  themes: ['@docusaurus/theme-mermaid'],
  // In order for Mermaid code blocks in Markdown to work,
  // you also need to enable the Remark plugin with this option
  markdown: {
    mermaid: true
  },

  themeConfig: {
    mermaid: {
      theme: { light: 'neutral', dark: 'forest' }
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',

    // Reference: https://ouch1978.github.io/docs/docusaurus/configuration/add-max-image-preview-meta-tag
    metadata: [{ name: 'robots', content: 'max-image-preview:large' }],

    // Reference: https://docusaurus.io/docs/api/themes/configuration#navbar
    navbar: {
      title: 'Zero',
      logo: {
        alt: 'Zero',
        src: 'img/zero_v2_192x192.png'
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '筆記'
        },
        { to: '/tech-explore', label: '技術探索', position: 'left' },
        { to: '/vulnerability-report', label: '漏洞報告', position: 'left' },
        {
          href: 'https://blog.zerolr.net',
          label: '部落格',
          position: 'left'
        },
        {
          to: '/about',
          label: '關於我',
          position: 'right'
        },
        {
          href: 'https://github.com/zeroLR',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: 'Tutorial',
        //       to: '/docs/intro',
        //     },
        //   ],
        // },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'Twitter',
        //       href: 'https://twitter.com/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'Blog',
        //       to: '/blog',
        //     },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/zeroLR',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Zero(Joseph Yang), Inc. Built with Docusaurus.`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula
    }
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'vulnerability-report',
        routeBasePath: 'vulnerability-report',
        path: './blog/vulnerability-report',
        blogTitle: '漏洞報告',
        blogDescription: 'AI 統整的漏洞報告，包含各種軟體的漏洞資訊和修復建議。',
        showReadingTime: true,
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        editUrl: 'https://github.com/ZLRWeb/zlrweb.github.io/blob/main',
        // Useful options to enforce blogging best practices
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
        blogSidebarCount: 0,
        postsPerPage: 10
      }
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'daily-chat-summary',
        routeBasePath: 'daily-chat-summary',
        path: './blog/daily-chat-summary',
        blogTitle: '每日 AI 聊天總結',
        blogDescription: 'AI 聊天記錄的每日總結，包含各種主題的討論和建議。',
        showReadingTime: true,
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        editUrl: 'https://github.com/ZLRWeb/zlrweb.github.io/blob/main',
        // Useful options to enforce blogging best practices
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
        blogSidebarCount: 0,
        postsPerPage: 10
      }
    ]
  ]
}

export default config
