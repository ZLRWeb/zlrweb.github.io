// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Zero's Notes",
  tagline: "Dinosaurs are cool",
  url: "https://zlrweb.github.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/zero_v2_192x192.png",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "zlrweb", // Usually your GitHub org/user name.
  projectName: "zlrweb.github.io", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
          docItemComponent: "@theme/doc",
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: false,
          autoCollapseCategories: false,
        },
      },
      colorMode: {
        defaultMode: "light",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Zero",
        logo: {
          alt: "My Site Logo",
          src: "img/zero_v2_192x192.png",
        },
        items: [
          {
            type: "doc",
            docId: "index",
            position: "left",
            label: "Notes",
          },
          { href: "https://blog.zerolr.net", label: "Blog", position: "left" },
          {
            href: "https://www.linkedin.com/in/cheng-en-yang-84a641173",
            label: "Linkedin",
            position: "right",
          },
          {
            href: "https://github.com/zerolr",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Docusauras",
                href: "https://docusaurus.io/",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Linkedin",
                href: "https://www.linkedin.com/in/cheng-en-yang-84a641173",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                href: "https://blog.zeroler.net",
              },
              {
                label: "GitHub",
                href: "https://github.com/zerolr",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Zero, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        magicComments: [
          // Remember to extend the default highlight class name as well!
          {
            className: "theme-code-block-highlighted-line",
            line: "highlight-next-line",
            block: { start: "highlight-start", end: "highlight-end" },
          },
          {
            className: "code-block-error-line",
            line: "error-line",
            block: { start: "error-start", end: "error-end" },
          },
          {
            className: "code-block-add-line",
            line: "add-line",
            block: { start: "add-start", end: "add-end" },
          },
          {
            className: "code-block-remove-line",
            line: "remove-line",
            block: { start: "remove-start", end: "remove-end" },
          },
        ],
      },
    }),
  themes: [require.resolve("@docusaurus/theme-live-codeblock")],
};

module.exports = config;
