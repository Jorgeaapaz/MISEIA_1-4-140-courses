import { test, expect } from '@playwright/test'

test.describe('API — unauthenticated access', () => {
  test('GET /api/courses returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/courses')
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  test('POST /api/courses returns 401 without token', async ({ request }) => {
    const res = await request.post('/api/courses', {
      data: { title: 'Test', description: 'Test', order: 1 },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('API — auth send-link validation', () => {
  test('POST /api/auth/send-link with missing email returns 400', async ({ request }) => {
    const res = await request.post('/api/auth/send-link', { data: {} })
    expect([400, 422]).toContain(res.status())
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  test('POST /api/auth/send-link with valid email returns 200', async ({ request }) => {
    const res = await request.post('/api/auth/send-link', {
      data: { email: 'admin@coursehub.dev' },
    })
    expect(res.status()).toBe(200)
  })

  test('POST /api/auth/verify with invalid token returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/verify', {
      data: { token: 'invalid.jwt.token' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })
})
