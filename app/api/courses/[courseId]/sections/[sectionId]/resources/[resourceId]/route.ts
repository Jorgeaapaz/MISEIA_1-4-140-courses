import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/apiAuth'
import type { Resource } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/courses/[courseId]/sections/[sectionId]/resources/[resourceId]'>
) {
  try {
    const { resourceId } = await ctx.params
    const db = await getDb()
    const resource = await db
      .collection<Resource>('resources')
      .findOne({ _id: new ObjectId(resourceId) })

    if (!resource) return Response.json({ error: 'No encontrado' }, { status: 404 })

    return Response.json({
      id: resource._id!.toString(),
      sectionId: resource.sectionId.toString(),
      title: resource.title,
      content: resource.content,
      order: resource.order,
      createdAt: resource.createdAt.toISOString(),
    })
  } catch {
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/courses/[courseId]/sections/[sectionId]/resources/[resourceId]'>
) {
  try {
    requireAdmin(request)
    const { resourceId } = await ctx.params
    const { title, content, order } = await request.json()
    const db = await getDb()
    await db
      .collection<Resource>('resources')
      .updateOne({ _id: new ObjectId(resourceId) }, { $set: { title, content, order } })
    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado' || msg === 'Acceso denegado') {
      return Response.json({ error: msg }, { status: 403 })
    }
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/courses/[courseId]/sections/[sectionId]/resources/[resourceId]'>
) {
  try {
    requireAdmin(request)
    const { resourceId } = await ctx.params
    const db = await getDb()
    await db.collection('feedback').deleteMany({ resourceId: new ObjectId(resourceId) })
    await db.collection('resources').deleteOne({ _id: new ObjectId(resourceId) })
    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado' || msg === 'Acceso denegado') {
      return Response.json({ error: msg }, { status: 403 })
    }
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
