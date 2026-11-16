// @vitest-environment nuxt
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createFetch } from 'ofetch'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

const server = setupServer(
  http.get('https://api.example.com/user', ({ request }) => {
    return HttpResponse.json({
      method: request.method,
      header: request.headers.get('x-custom'),
    })
  }),
  http.post('https://api.example.com/items', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      method: request.method,
      body,
    })
  }),
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  // MSW v2 patches `globalThis.fetch` on `server.listen()`, so recreate `$fetch` to use the patched `fetch`
  window.$fetch = createFetch() as typeof $fetch
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('msw v2 in nuxt environment', () => {
  it('intercepts GET fetch with string URL', async () => {
    const res = await fetch('https://api.example.com/user', {
      headers: { 'x-custom': 'hello' },
    })
    expect(await res.json()).toEqual({
      method: 'GET',
      header: 'hello',
    })
  })

  it('intercepts GET fetch with Request', async () => {
    const res = await fetch(new Request('https://api.example.com/user', {
      headers: { 'x-custom': 'from-request' },
    }))
    expect(await res.json()).toEqual({
      method: 'GET',
      header: 'from-request',
    })
  })

  it('intercepts POST fetch with Request body', async () => {
    const res = await fetch(new Request('https://api.example.com/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'nuxt' }),
    }))
    expect(await res.json()).toEqual({
      method: 'POST',
      body: { name: 'nuxt' },
    })
  })

  it('intercepts $fetch', async () => {
    const data = await globalThis.$fetch('https://api.example.com/user', {
      headers: { 'x-custom': 'ofetch' },
    })
    expect(data).toEqual({
      method: 'GET',
      header: 'ofetch',
    })
  })

  it('supports AbortController with Request', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      fetch(new Request('https://api.example.com/user', { signal: controller.signal })),
    ).rejects.toThrow(/aborted/i)
  })
})
