import { logger } from 'nuxt/kit'

export default defineNuxtConfig({
  devtools: { enabled: true },
  hooks: {
    async ready() {
      logger.info('========== wait 30s start ==========')
      await new Promise((resolve) => setTimeout(resolve, 30_000))
      logger.info('========== wait 30s end ==========')
    },
  },
  typescript: {
    nodeTsConfig: {
      include: ['../playwright.config.ts'],
    },
  },
})
