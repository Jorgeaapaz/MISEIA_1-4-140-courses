import jwt from 'jsonwebtoken'
import type { JWTPayload, MagicLinkPayload } from './types'

const JWT_SECRET = process.env.JWT_SECRET!

export function generateMagicLinkToken(email: string): string {
  const payload: MagicLinkPayload = { email, type: 'magic-link' }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export function verifyMagicLinkToken(token: string): MagicLinkPayload {
  return jwt.verify(token, JWT_SECRET) as MagicLinkPayload
}

export function generateSessionToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifySessionToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}
