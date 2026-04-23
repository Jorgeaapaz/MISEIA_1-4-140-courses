import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/apiAuth'
import type { Section } from '@/lib/types'

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/courses/[courseId]/sections/[sectionId]'>
) {
  try {
    requireAdmin(request)
    const { sectionId } = await ctx.params
    const { title, description, order } = await request.json()
    const db = await getDb()
    await db
      .collection<Section>('sections')
      .updateOne({ _id: new ObjectId(sectionId) }, { $set: { title, description, order } })
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
  ctx: RouteContext<'/api/courses/[courseId]/sections/[sectionId]'>
) {
  try {
    requireAdmin(request)
    const { sectionId } = await ctx.params
    const db = await getDb()
    await db.collection('resources').deleteMany({ sectionId: new ObjectId(sectionId) })
    await db.collection('sections').deleteOne({ _id: new ObjectId(sectionId) })
    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado' || msg === 'Acceso denegado') {
      return Response.json({ error: msg }, { status: 403 })
    }
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
