import type { Environment } from 'vitest/runtime'
import { builtinEnvironments } from 'vitest/runtime'

export default <Environment>{
  name: 'custom',
  viteEnvironment: 'client',
  async setup(global, options) {
    console.log(JSON.stringify(options, null, 2))

    const dom: 'happy-dom' | 'jsdom' = options.custom.dom || 'happy-dom'
    const { setup } = builtinEnvironments[dom]

    return setup(global, options)
  },
}

declare module 'vitest/node' {
  interface EnvironmentOptions {
    custom?: {
      dom?: 'happy-dom' | 'jsdom'
      other?: string
    }
  }
}
