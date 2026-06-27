import { getTokenFromRequest, requireAuth, requireAdmin } from '../../lib/apiAuth'
import { generateSessionToken } from '../../lib/auth'
import { NextRequest } from 'next/server'

function makeRequest(authHeader?: string): NextRequest {
  return new NextRequest('http://localhost/api/test', {
    headers: authHeader ? { Authorization: authHeader } : {},
  })
}

describe('getTokenFromRequest', () => {
  it('extracts Bearer token from Authorization header', () => {
    const req = makeRequest('Bearer mytoken123')
    expect(getTokenFromRequest(req)).toBe('mytoken123')
  })

  it('returns null when Authorization header is missing', () => {
    const req = makeRequest()
    expect(getTokenFromRequest(req)).toBeNull()
  })

  it('returns null when header does not start with Bearer', () => {
    const req = makeRequest('Basic somebase64value')
    expect(getTokenFromRequest(req)).toBeNull()
  })
})

describe('requireAuth', () => {
  it('returns payload for valid admin token', () => {
    const token = generateSessionToken({ sub: 'u1', email: 'admin@test.com', role: 'admin' })
    const req = makeRequest(`Bearer ${token}`)
    const payload = requireAuth(req)
    expect(payload.email).toBe('admin@test.com')
    expect(payload.role).toBe('admin')
  })

  it('throws when no Authorization header', () => {
    const req = makeRequest()
    expect(() => requireAuth(req)).toThrow('No autorizado')
  })

  it('throws when token is invalid', () => {
    const req = makeRequest('Bearer invalidtoken')
    expect(() => requireAuth(req)).toThrow()
  })
})

describe('requireAdmin', () => {
  it('returns payload for admin role', () => {
    const token = generateSessionToken({ sub: 'u2', email: 'admin@test.com', role: 'admin' })
    const req = makeRequest(`Bearer ${token}`)
    const payload = requireAdmin(req)
    expect(payload.role).toBe('admin')
  })

  it('throws Acceso denegado when role is student', () => {
    const token = generateSessionToken({ sub: 'u3', email: 'student@test.com', role: 'student' })
    const req = makeRequest(`Bearer ${token}`)
    expect(() => requireAdmin(req)).toThrow('Acceso denegado')
  })

  it('throws when no token provided', () => {
    const req = makeRequest()
    expect(() => requireAdmin(req)).toThrow()
  })
})
