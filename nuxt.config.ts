// import Aura from '@primevue/themes/aura'
import path from 'path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/color-mode'
  ],

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
    }
  },

  icon: {
    clientBundle: {
      icons: ['mdi:metronome', 'solar:moon-bold', 'solar:sun-2-bold'],
      // scan all components in the project and include icons
      scan: false,

      // guard for uncompressed bundle size, will fail the build if exceeds
      sizeLimitKb: 1100
    }
  },

  colorMode: {
    classSuffix: '',
    storageKey: 'theme'
  },

  primevue: {
    options: {
      unstyled: true,
      ripple: true
    },
    importPT: {
      from: path.resolve(__dirname, './assets/primevuePresets/main/')
    }
  }
})
