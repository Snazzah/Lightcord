const meta = {
  title: 'Lightcord',
  description: 'A webapp for discord bots',
  accent: '#7AE4FF',
  url: 'https://lightcord.js.org/',
};

export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'spa',
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'static',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    titleTemplate: (chunk) => (chunk ? `${chunk} - Lightcord` : 'Lightcord'),
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: meta.descriptio },

      // Theme Color
      { name: 'theme-color', content: meta.accent },
      { name: 'msapplication-TileColor', content: meta.accent },

      // Twitter
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:url', content: meta.url },
      { name: 'twitter:title', content: meta.title },
      { name: 'twitter:description', content: meta.description },
      { name: 'twitter:image', content: '/lightcord.png' },

      // OpenGraph
      { name: 'og:type', content: 'website' },
      { name: 'og:url', content: meta.url },
      { name: 'og:title', content: meta.title },
      { name: 'og:description', content: meta.description },
      { name: 'og:locale', content: 'en_US' },
      { name: 'og:image', content: '/lightcord.png' },
    ],
    link: [
      // Manifest
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'manifest', href: '/manifest.json' },

      // Icons
      {
        rel: 'mask-icon',
        href: '/safari-pinned-tab.svg',
        color: meta.accent,
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'icon', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'icon', sizes: '32x32', href: '/favicon-32x32.png' },
      {
        rel: 'icon',
        sizes: '192x192',
        href: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        sizes: '512x512',
        href: '/android-chrome-512x512.png',
      },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#7AE4FF' },

  pwa: {
    icon: {
      fileName: 'lightcord.png',
    },
  },

  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    '~/plugins/polyfill.ts',
    '~/plugins/discord.client.ts',
    '~/plugins/vue-tippy.ts',
    '~/plugins/virtual-scroller.ts',
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: [
    '~/components/',
    { path: '~/components/svg/', prefix: 'svg-' },
    { path: '~/components/svg/userarea/', prefix: 'svg-userarea-' },
    { path: '~/components/svg/start/', prefix: 'svg-start-' },
    { path: '~/components/options/', prefix: 'opt-' },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build'],

  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa', '@nuxtjs/markdownit'],

  // https://github.com/markdown-it/markdown-it
  markdownit: {
    preset: 'default',
    linkify: true,
    breaks: true,
    use: ['markdown-it-div', 'markdown-it-attrs'],
  },

  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
};
