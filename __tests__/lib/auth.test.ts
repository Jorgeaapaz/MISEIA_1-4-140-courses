import {
  generateMagicLinkToken,
  verifyMagicLinkToken,
  generateSessionToken,
  verifySessionToken,
} from '../../lib/auth'

describe('generateMagicLinkToken / verifyMagicLinkToken', () => {
  it('generates a token that can be verified', () => {
    const token = generateMagicLinkToken('user@test.com')
    const payload = verifyMagicLinkToken(token)
    expect(payload.email).toBe('user@test.com')
    expect(payload.type).toBe('magic-link')
  })

  it('throws on a tampered token', () => {
    const token = generateMagicLinkToken('user@test.com')
    expect(() => verifyMagicLinkToken(token + 'tampered')).toThrow()
  })

  it('throws on an expired token', () => {
    // sign with immediate expiry
    const jwt = require('jsonwebtoken')
    const expired = jwt.sign(
      { email: 'user@test.com', type: 'magic-link' },
      process.env.JWT_SECRET,
      { expiresIn: -1 }
    )
    expect(() => verifyMagicLinkToken(expired)).toThrow()
  })
})

describe('generateSessionToken / verifySessionToken', () => {
  const payload = { sub: 'abc123', email: 'admin@test.com', role: 'admin' as const }

  it('generates a session token with correct payload', () => {
    const token = generateSessionToken(payload)
    const verified = verifySessionToken(token)
    expect(verified.sub).toBe('abc123')
    expect(verified.email).toBe('admin@test.com')
    expect(verified.role).toBe('admin')
  })

  it('throws on an invalid token', () => {
    expect(() => verifySessionToken('not.a.valid.token')).toThrow()
  })

  it('preserves role field for student', () => {
    const studentPayload = { sub: 'stu001', email: 'student@test.com', role: 'student' as const }
    const token = generateSessionToken(studentPayload)
    const verified = verifySessionToken(token)
    expect(verified.role).toBe('student')
  })
})
