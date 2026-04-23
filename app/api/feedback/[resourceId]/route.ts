import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/apiAuth'
import type { Feedback, User } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/feedback/[resourceId]'>
) {
  try {
    const { resourceId } = await ctx.params
    const db = await getDb()
    const feedbacks = await db
      .collection<Feedback>('feedback')
      .find({ resourceId: new ObjectId(resourceId) })
      .sort({ createdAt: -1 })
      .toArray()

    const userIds = [...new Set(feedbacks.map((f) => f.userId.toString()))]
    const users = await db
      .collection<User>('users')
      .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
      .toArray()

    const userMap: Record<string, string> = {}
    for (const u of users) {
      userMap[u._id!.toString()] = u.email
    }

    return Response.json(
      feedbacks.map((f) => ({
        id: f._id!.toString(),
        resourceId: f.resourceId.toString(),
        userId: f.userId.toString(),
        userEmail: userMap[f.userId.toString()] || 'Usuario desconocido',
        comment: f.comment,
        createdAt: f.createdAt.toISOString(),
      }))
    )
  } catch {
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/feedback/[resourceId]'>
) {
  try {
    const payload = requireAuth(request)
    const { resourceId } = await ctx.params
    const { comment } = await request.json()

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return Response.json({ error: 'Comentario requerido' }, { status: 400 })
    }

    const db = await getDb()
    const feedback: Feedback = {
      resourceId: new ObjectId(resourceId),
      userId: new ObjectId(payload.sub),
      comment: comment.trim(),
      createdAt: new Date(),
    }
    const result = await db.collection<Feedback>('feedback').insertOne(feedback)

    return Response.json(
      {
        id: result.insertedId.toString(),
        resourceId,
        userId: payload.sub,
        userEmail: payload.email,
        comment: feedback.comment,
        createdAt: feedback.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado') {
      return Response.json({ error: msg }, { status: 401 })
    }
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
