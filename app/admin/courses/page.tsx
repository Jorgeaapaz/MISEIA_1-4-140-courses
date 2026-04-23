'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '../../components/AppShell'
import { useGlobal } from '../../contexts/GlobalContext'
import type { SerializedCourse } from '@/lib/types'

export default function AdminCoursesPage() {
  const { token } = useGlobal()
  const [courses, setCourses] = useState<SerializedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este curso y todo su contenido?')) return
    setDeleting(id)
    await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    await load()
    setDeleting(null)
  }

  return (
    <AppShell role="admin" title="Cursos" activeHref="/admin/courses">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {courses.length} curso{courses.length !== 1 ? 's' : ''} en total
          </p>
          <Link href="/admin/courses/new" className="btn-primary" style={{ fontSize: '13px', padding: '9px 18px' }}>
            + Nuevo curso
          </Link>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : courses.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>◎</div>
              <p>No hay cursos. Crea el primero o ejecuta el seed.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <Link href="/admin/courses/new" className="btn-primary" style={{ fontSize: '13px' }}>+ Nuevo curso</Link>
                <Link href="/admin" className="btn-secondary" style={{ fontSize: '13px' }}>Ir al dashboard</Link>
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th style={{ width: '140px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="num-pill">{c.order}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontFamily: 'Syne, sans-serif', fontSize: '14px' }}>
                        {c.title}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '280px' }}>
                      {c.description}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link
                          href={`/admin/courses/${c.id}`}
                          className="btn-ghost"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="btn-danger"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          {deleting === c.id ? '...' : 'Borrar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  )
}
