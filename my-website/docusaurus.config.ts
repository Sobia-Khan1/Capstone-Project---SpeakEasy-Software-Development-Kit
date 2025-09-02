import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'SpeakEasy SDK',
  tagline: '',
  favicon: 'img/SpeakEasyLogo.svg',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'SpeakEasy SDK',
      logo: {
        alt: 'My Site Logo',
        src: 'img/SpeakEasyLogo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial',
        },
        {
          to: 'APIReference',
          label: 'API Reference',
          position: 'left',
        },
        {
          to: '/docs/AboutUs',
          label: 'About Us',
          position: 'left',
        },
        {
          href: 'https://bitbucket.org/motivstudio/capstone2025/src/main/',
          label: 'BitBucket',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: 'APIReference',
            },
            {
              label: 'About Us',
              to: '/docs/AboutUs'
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'BitBucket',
              href: 'https://bitbucket.org/motivstudio/capstone2025/src/main/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TypeTalk Capstone. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
