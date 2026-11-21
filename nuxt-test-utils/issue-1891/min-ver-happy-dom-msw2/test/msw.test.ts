// @vitest-environment nuxt
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
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
  http.post('https://api.example.com/upload-form', async ({ request }) => {
    const formData = await request.formData()
    const name = formData.get('name')
    const file = formData.get('file')
    const fileText = file && typeof file === 'object' && 'text' in file ? await file.text() : null
    const fileType = file && typeof file === 'object' && 'type' in file ? file.type : null
    return HttpResponse.json({
      method: request.method,
      name,
      fileText,
      fileType,
    })
  }),
  http.post('https://api.example.com/upload-blob', async ({ request }) => {
    const body = await request.text()
    return HttpResponse.json({
      method: request.method,
      contentType: request.headers.get('content-type'),
      body,
    })
  }),
  http.post('https://api.example.com/read-blob', async ({ request }) => {
    const blob = await request.blob()
    return HttpResponse.json({
      method: request.method,
      size: blob.size,
      type: blob.type,
      text: await blob.text(),
    })
  }),
  http.post('https://api.example.com/form-data-request', async ({ request }) => {
    const formData = await request.formData()
    return HttpResponse.json({
      method: request.method,
      field: formData.get('field'),
    })
  }),
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('msw v2 with happy-dom 20.0.11 in nuxt environment', () => {
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
    const data = await $fetch('https://api.example.com/user', {
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

  it('intercepts POST fetch with FormData', async () => {
    const formData = new FormData()
    formData.append('name', 'nuxt')
    formData.append('file', new Blob(['hello formdata'], { type: 'text/plain' }), 'hello.txt')

    const res = await fetch('https://api.example.com/upload-form', {
      method: 'POST',
      body: formData,
    })
    expect(await res.json()).toEqual({
      method: 'POST',
      name: 'nuxt',
      fileText: 'hello formdata',
      fileType: 'text/plain',
    })
  })

  it('intercepts POST fetch with Request and FormData', async () => {
    const formData = new FormData()
    formData.append('name', 'nuxt-request')
    formData.append('file', new Blob(['request formdata'], { type: 'text/plain' }), 'req.txt')

    const res = await fetch(new Request('https://api.example.com/upload-form', {
      method: 'POST',
      body: formData,
    }))
    expect(await res.json()).toEqual({
      method: 'POST',
      name: 'nuxt-request',
      fileText: 'request formdata',
      fileType: 'text/plain',
    })
  })

  it('intercepts POST $fetch with FormData', async () => {
    const formData = new FormData()
    formData.append('name', 'ofetch')
    formData.append('file', new Blob(['ofetch formdata'], { type: 'text/plain' }), 'ofetch.txt')

    const data = await $fetch('https://api.example.com/upload-form', {
      method: 'POST',
      body: formData,
    })
    expect(data).toEqual({
      method: 'POST',
      name: 'ofetch',
      fileText: 'ofetch formdata',
      fileType: 'text/plain',
    })
  })

  it('intercepts POST fetch with Blob', async () => {
    const blob = new Blob(['hello blob'], { type: 'text/plain' })

    const res = await fetch('https://api.example.com/upload-blob', {
      method: 'POST',
      body: blob,
    })
    expect(await res.json()).toEqual({
      method: 'POST',
      contentType: 'text/plain',
      body: 'hello blob',
    })
  })

  it('intercepts POST fetch with Request and Blob', async () => {
    const blob = new Blob(['request blob'], { type: 'application/octet-stream' })

    const res = await fetch(new Request('https://api.example.com/upload-blob', {
      method: 'POST',
      body: blob,
    }))
    expect(await res.json()).toEqual({
      method: 'POST',
      contentType: 'application/octet-stream',
      body: 'request blob',
    })
  })

  it('intercepts POST $fetch with Blob', async () => {
    const blob = new Blob(['ofetch blob'], { type: 'text/plain' })

    const data = await $fetch('https://api.example.com/upload-blob', {
      method: 'POST',
      body: blob,
    })
    expect(data).toEqual({
      method: 'POST',
      contentType: 'text/plain',
      body: 'ofetch blob',
    })
  })

  it('reads Blob via request.blob() in handler', async () => {
    const blob = new Blob(['read blob'], { type: 'text/plain' })

    const res = await fetch(new Request('https://api.example.com/read-blob', {
      method: 'POST',
      body: blob,
    }))
    expect(await res.json()).toEqual({
      method: 'POST',
      size: 9,
      type: 'text/plain',
      text: 'read blob',
    })
  })

  describe('Request.formData()', () => {
    it.each([
      ['lower-case', 'application/x-www-form-urlencoded'],
      ['upper-case', 'APPLICATION/X-WWW-FORM-URLENCODED'],
      ['mixed-case', 'Application/X-Www-Form-Urlencoded'],
    ])('intercepts POST fetch with %s content-type', async (_, contentType) => {
      const res = await fetch(new Request('https://api.example.com/form-data-request', {
        method: 'POST',
        headers: { 'content-type': contentType },
        body: 'field=value',
      }))
      expect(await res.json()).toEqual({
        method: 'POST',
        field: 'value',
      })
    })

    it('intercepts POST fetch with mixed-case boundary', async () => {
      const boundary = '----MixedCaseBoundary123'
      const res = await fetch(new Request('https://api.example.com/form-data-request', {
        method: 'POST',
        headers: { 'content-type': `Multipart/Form-Data; boundary=${boundary}` },
        body: [
          `--${boundary}`,
          'Content-Disposition: form-data; name="field"',
          '',
          'value',
          `--${boundary}--`,
          '',
        ].join('\r\n'),
      }))
      expect(await res.json()).toEqual({
        method: 'POST',
        field: 'value',
      })
    })
  })
})
