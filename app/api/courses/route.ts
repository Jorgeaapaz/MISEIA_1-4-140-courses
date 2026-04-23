import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/apiAuth'
import type { Course } from '@/lib/types'

export async function GET() {
  try {
    const db = await getDb()
    const courses = await db
      .collection<Course>('courses')
      .find({})
      .sort({ order: 1 })
      .toArray()

    return Response.json(
      courses.map((c) => ({
        id: c._id!.toString(),
        title: c.title,
        description: c.description,
        order: c.order,
        createdAt: c.createdAt.toISOString(),
      }))
    )
  } catch {
    return Response.json({ error: 'Error al obtener cursos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request)
    const { title, description, order } = await request.json()

    if (!title || typeof title !== 'string') {
      return Response.json({ error: 'Título requerido' }, { status: 400 })
    }

    const db = await getDb()
    const course: Course = {
      title: title.trim(),
      description: description?.trim() || '',
      order: typeof order === 'number' ? order : 0,
      createdAt: new Date(),
    }
    const result = await db.collection<Course>('courses').insertOne(course)

    return Response.json(
      { id: result.insertedId.toString(), ...course, createdAt: course.createdAt.toISOString() },
      { status: 201 }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    if (msg === 'No autorizado' || msg === 'Acceso denegado') {
      return Response.json({ error: msg }, { status: 403 })
    }
    return Response.json({ error: 'Error al crear curso' }, { status: 500 })
  }
}
