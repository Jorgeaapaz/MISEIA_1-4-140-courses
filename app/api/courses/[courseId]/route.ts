import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/apiAuth'
import type { Course } from '@/lib/types'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/courses/[courseId]'>) {
  try {
    const { courseId } = await ctx.params
    const db = await getDb()
    const course = await db.collection<Course>('courses').findOne({ _id: new ObjectId(courseId) })
    if (!course) return Response.json({ error: 'No encontrado' }, { status: 404 })

    return Response.json({
      id: course._id!.toString(),
      title: course.title,
      description: course.description,
      order: course.order,
      createdAt: course.createdAt.toISOString(),
    })
  } catch {
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/courses/[courseId]'>) {
  try {
    requireAdmin(request)
    const { courseId } = await ctx.params
    const { title, description, order } = await request.json()
    const db = await getDb()
    await db.collection<Course>('courses').updateOne(
      { _id: new ObjectId(courseId) },
      { $set: { title, description, order } }
    )
    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado' || msg === 'Acceso denegado') {
      return Response.json({ error: msg }, { status: 403 })
    }
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/courses/[courseId]'>) {
  try {
    requireAdmin(request)
    const { courseId } = await ctx.params
    const db = await getDb()
    await db.collection('courses').deleteOne({ _id: new ObjectId(courseId) })
    // Cascade: delete sections and resources
    const sections = await db
      .collection('sections')
      .find({ courseId: new ObjectId(courseId) })
      .toArray()
    for (const s of sections) {
      await db.collection('resources').deleteMany({ sectionId: s._id })
    }
    await db.collection('sections').deleteMany({ courseId: new ObjectId(courseId) })
    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado' || msg === 'Acceso denegado') {
      return Response.json({ error: msg }, { status: 403 })
    }
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
