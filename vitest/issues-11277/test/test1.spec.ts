import { it, expect, describe } from 'vitest'

describe('test1', () => {
  it('origin', () => {
    expect(location.origin).toBe('http://localhost:8080')
  })

  it('useAgent', () => {
    expect(navigator.userAgent).toBe('custom ua')
  })
})
