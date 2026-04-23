'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '../../../components/AppShell'
import { useGlobal } from '../../../contexts/GlobalContext'

export default function NewCoursePage() {
  const { token } = useGlobal()
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', order: '1' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, order: parseInt(form.order) }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setLoading(false)
    } else {
      router.push(`/admin/courses/${data.id}`)
    }
  }

  return (
    <AppShell role="admin" title="Nuevo Curso" activeHref="/admin/courses">
      <div style={{ maxWidth: '600px' }}>
        <Link href="/admin/courses" className="btn-ghost" style={{ marginBottom: '20px', display: 'inline-flex' }}>
          ← Volver a cursos
        </Link>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Crear nuevo curso</h2>
          {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label" htmlFor="title">Título del curso</label>
              <input
                id="title" className="input" placeholder="Ej: Desarrollo Web con React"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                required autoFocus
              />
            </div>
            <div>
              <label className="label" htmlFor="description">Descripción</label>
              <textarea
                id="description" className="textarea" placeholder="Describe el contenido del curso..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ minHeight: '100px' }}
              />
            </div>
            <div>
              <label className="label" htmlFor="order">Número de orden</label>
              <input
                id="order" type="number" className="input" min="1"
                value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creando...' : 'Crear curso →'}
              </button>
              <Link href="/admin/courses" className="btn-secondary">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
