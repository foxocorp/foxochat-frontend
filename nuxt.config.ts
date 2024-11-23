export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Foxogram - New discovery in the world of messengers',
      meta: [
        { property: 'og:image', content: '/image/favicon.svg' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.svg' }
      ],
    },
  },

  devtools: {
    enabled: true
  }
})
