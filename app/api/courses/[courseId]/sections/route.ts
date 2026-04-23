import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/apiAuth'
import type { Section } from '@/lib/types'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/courses/[courseId]/sections'>) {
  try {
    const { courseId } = await ctx.params
    const db = await getDb()
    const sections = await db
      .collection<Section>('sections')
      .find({ courseId: new ObjectId(courseId) })
      .sort({ order: 1 })
      .toArray()

    return Response.json(
      sections.map((s) => ({
        id: s._id!.toString(),
        courseId: s.courseId.toString(),
        title: s.title,
        description: s.description,
        order: s.order,
        createdAt: s.createdAt.toISOString(),
      }))
    )
  } catch {
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, ctx: RouteContext<'/api/courses/[courseId]/sections'>) {
  try {
    requireAdmin(request)
    const { courseId } = await ctx.params
    const { title, description, order } = await request.json()

    if (!title) return Response.json({ error: 'Título requerido' }, { status: 400 })

    const db = await getDb()
    const section: Section = {
      courseId: new ObjectId(courseId),
      title: title.trim(),
      description: description?.trim() || '',
      order: typeof order === 'number' ? order : 0,
      createdAt: new Date(),
    }
    const result = await db.collection<Section>('sections').insertOne(section)

    return Response.json(
      {
        id: result.insertedId.toString(),
        courseId,
        title: section.title,
        description: section.description,
        order: section.order,
        createdAt: section.createdAt.toISOString(),
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
