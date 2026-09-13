import { test } from '@nuxt/test-utils/playwright'
import { fileURLToPath } from 'node:url'

test.use({
  nuxt: {
    setupTimeout: 120_000,
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
  },
})

test('test', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
})
