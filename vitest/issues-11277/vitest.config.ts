import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'custom',
    environment: 'custom',
    environmentOptions: {
      custom: {
        dom: 'happy-dom',
        other: 'other option',
      },
      happyDOM: {
        url: 'http://localhost:8080',
        settings: {
          navigator: {
            userAgent: 'custom ua',
          },
        },
      },
      jsdom: {
        url: 'http://localhost:8080',
        userAgent: 'custom ua',
      },
    },
  },
})
