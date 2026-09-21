// @vitest-environment-options { "dom": "jsdom" }
import { it, expect, describe } from 'vitest'

describe('test2', () => {
  it('origin', () => {
    expect(location.origin).toBe('http://localhost:8080')
  })

  it('userAgent', () => {
    expect(navigator.userAgent).toBe('custom ua')
  })
})
