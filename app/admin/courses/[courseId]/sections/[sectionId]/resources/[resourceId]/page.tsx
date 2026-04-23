'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '../../../../../../../components/AppShell'
import { useGlobal } from '../../../../../../../contexts/GlobalContext'
import type { SerializedResource } from '@/lib/types'

export default function EditResourcePage() {
  const { courseId, sectionId, resourceId } = useParams<{ courseId: string; sectionId: string; resourceId: string }>()
  const { token } = useGlobal()
  const router = useRouter()
  const [resource, setResource] = useState<SerializedResource | null>(null)
  const [form, setForm] = useState({ title: '', content: '', order: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/courses/${courseId}/sections/${sectionId}/resources/${resourceId}`)
      .then((r) => r.json())
      .then((data) => {
        setResource(data)
        setForm({ title: data.title, content: data.content, order: String(data.order) })
        setLoading(false)
      })
  }, [courseId, sectionId, resourceId])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/courses/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, order: parseInt(form.order) || 1 }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <AppShell role="admin" title="Cargando..." activeHref="/admin/courses">
        <div className="spinner" style={{ margin: '40px auto' }} />
      </AppShell>
    )
  }

  return (
    <AppShell role="admin" title={`Editar: ${resource?.title}`} activeHref="/admin/courses">
      <div style={{ maxWidth: '800px' }}>
        <Link href={`/admin/courses/${courseId}`} className="btn-ghost" style={{ marginBottom: '20px', display: 'inline-flex' }}>
          ← Volver al curso
        </Link>

        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="label" htmlFor="title">Título</label>
              <input id="title" className="input" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="order">Orden</label>
              <input id="order" type="number" className="input" style={{ maxWidth: '120px' }}
                value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="content">Contenido (Markdown)</label>
              <textarea id="content" className="textarea" value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                style={{ minHeight: '400px', fontFamily: 'Courier New, monospace', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {saved && <span style={{ color: 'var(--success)', fontSize: '13px' }}>✓ Guardado</span>}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
