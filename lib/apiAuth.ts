import { NextRequest } from 'next/server'
import { verifySessionToken } from './auth'
import type { JWTPayload } from './types'

export function getTokenFromRequest(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization')
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7)
  }
  return null
}

export function requireAuth(request: NextRequest): JWTPayload {
  const token = getTokenFromRequest(request)
  if (!token) throw new Error('No autorizado')
  return verifySessionToken(token)
}

export function requireAdmin(request: NextRequest): JWTPayload {
  const payload = requireAuth(request)
  if (payload.role !== 'admin') throw new Error('Acceso denegado')
  return payload
}
