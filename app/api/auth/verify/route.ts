import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyMagicLinkToken, generateSessionToken } from '@/lib/auth'
import type { User, MagicLink } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return Response.json({ error: 'Token requerido' }, { status: 400 })
    }

    // Verify JWT
    let payload: { email: string }
    try {
      payload = verifyMagicLinkToken(token)
    } catch {
      return Response.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }

    const db = await getDb()

    // Check token in DB and mark as used
    const magicLink = await db.collection<MagicLink>('magic_links').findOneAndUpdate(
      { token, used: false, expiresAt: { $gt: new Date() } },
      { $set: { used: true } }
    )

    if (!magicLink) {
      return Response.json({ error: 'Token inválido o ya utilizado' }, { status: 401 })
    }

    // Find or create user
    let user = await db.collection<User>('users').findOne({ email: payload.email })
    if (!user) {
      const result = await db.collection<User>('users').insertOne({
        email: payload.email,
        role: 'student',
        createdAt: new Date(),
      })
      user = {
        _id: result.insertedId,
        email: payload.email,
        role: 'student',
        createdAt: new Date(),
      }
    }

    const sessionToken = generateSessionToken({
      sub: user._id!.toString(),
      email: user.email,
      role: user.role,
    })

    return Response.json({
      token: sessionToken,
      user: {
        id: user._id!.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch {
    return Response.json({ error: 'Error en la verificación' }, { status: 500 })
  }
}
