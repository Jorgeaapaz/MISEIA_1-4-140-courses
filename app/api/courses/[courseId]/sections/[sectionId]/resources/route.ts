import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/apiAuth'
import type { Resource } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/courses/[courseId]/sections/[sectionId]/resources'>
) {
  try {
    const { sectionId } = await ctx.params
    const db = await getDb()
    const resources = await db
      .collection<Resource>('resources')
      .find({ sectionId: new ObjectId(sectionId) })
      .sort({ order: 1 })
      .toArray()

    return Response.json(
      resources.map((r) => ({
        id: r._id!.toString(),
        sectionId: r.sectionId.toString(),
        title: r.title,
        content: r.content,
        order: r.order,
        createdAt: r.createdAt.toISOString(),
      }))
    )
  } catch {
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/courses/[courseId]/sections/[sectionId]/resources'>
) {
  try {
    requireAdmin(request)
    const { sectionId } = await ctx.params
    const { title, content, order } = await request.json()

    if (!title) return Response.json({ error: 'Título requerido' }, { status: 400 })

    const db = await getDb()
    const resource: Resource = {
      sectionId: new ObjectId(sectionId),
      title: title.trim(),
      content: content || '',
      order: typeof order === 'number' ? order : 0,
      createdAt: new Date(),
    }
    const result = await db.collection<Resource>('resources').insertOne(resource)

    return Response.json(
      {
        id: result.insertedId.toString(),
        sectionId,
        title: resource.title,
        content: resource.content,
        order: resource.order,
        createdAt: resource.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado' || msg === 'Acceso denegado') {
      return Response.json({ error: msg }, { status: 403 })
    }
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
