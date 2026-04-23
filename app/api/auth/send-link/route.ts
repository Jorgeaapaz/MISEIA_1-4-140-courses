import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { generateMagicLinkToken } from '@/lib/auth'
import { sendMagicLink } from '@/lib/mail'
import type { MagicLink } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.json({ error: 'Email inválido' }, { status: 400 })
    }

    const db = await getDb()
    const token = generateMagicLinkToken(email.toLowerCase())
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const magicLink: MagicLink = {
      email: email.toLowerCase(),
      token,
      expiresAt,
      used: false,
    }

    await db.collection<MagicLink>('magic_links').insertOne(magicLink)
    await sendMagicLink(email.toLowerCase(), token)

    return Response.json({ message: 'Enlace enviado. Revisa tu correo.' })
  } catch {
    return Response.json({ error: 'Error al enviar el enlace' }, { status: 500 })
  }
}
