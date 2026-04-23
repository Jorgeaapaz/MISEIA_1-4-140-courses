'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '../../../components/AppShell'
import { useGlobal } from '../../../contexts/GlobalContext'
import type { SerializedCourse, SerializedSection, SerializedResource } from '@/lib/types'

interface SectionWithResources extends SerializedSection {
  resources: SerializedResource[]
  expanded: boolean
}

export default function AdminCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { token } = useGlobal()
  const router = useRouter()

  const [course, setCourse] = useState<SerializedCourse | null>(null)
  const [sections, setSections] = useState<SectionWithResources[]>([])
  const [loading, setLoading] = useState(true)

  // Section form
  const [newSection, setNewSection] = useState({ title: '', description: '', order: '' })
  const [addingSection, setAddingSection] = useState(false)
  const [showSectionForm, setShowSectionForm] = useState(false)

  // Resource form
  const [addingResource, setAddingResource] = useState<string | null>(null)
  const [newResource, setNewResource] = useState({ title: '', content: '', order: '' })

  async function load() {
    const [courseRes, sectionsRes] = await Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/courses/${courseId}/sections`).then((r) => r.json()),
    ])
    setCourse(courseRes)
    const sectionList: SerializedSection[] = Array.isArray(sectionsRes) ? sectionsRes : []
    const withResources = await Promise.all(
      sectionList.map(async (s) => {
        const rRes = await fetch(`/api/courses/${courseId}/sections/${s.id}/resources`)
        const resources = await rRes.json()
        return { ...s, resources: Array.isArray(resources) ? resources : [], expanded: true }
      })
    )
    setSections(withResources)
    setLoading(false)
  }

  useEffect(() => { if (courseId) load() }, [courseId])

  async function addSection() {
    if (!newSection.title) return
    setAddingSection(true)
    await fetch(`/api/courses/${courseId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newSection, order: parseInt(newSection.order) || sections.length + 1 }),
    })
    setNewSection({ title: '', description: '', order: '' })
    setShowSectionForm(false)
    setAddingSection(false)
    await load()
  }

  async function deleteSection(sectionId: string) {
    if (!confirm('¿Eliminar esta sección y sus recursos?')) return
    await fetch(`/api/courses/${courseId}/sections/${sectionId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    await load()
  }

  async function addResource(sectionId: string) {
    if (!newResource.title) return
    await fetch(`/api/courses/${courseId}/sections/${sectionId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newResource, order: parseInt(newResource.order) || 1 }),
    })
    setNewResource({ title: '', content: '', order: '' })
    setAddingResource(null)
    await load()
  }

  async function deleteResource(sectionId: string, resourceId: string) {
    if (!confirm('¿Eliminar este recurso?')) return
    await fetch(`/api/courses/${courseId}/sections/${sectionId}/resources/${resourceId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    await load()
  }

  if (loading) {
    return (
      <AppShell role="admin" title="Cargando..." activeHref="/admin/courses">
        <div className="spinner" style={{ margin: '40px auto' }} />
      </AppShell>
    )
  }

  return (
    <AppShell role="admin" title={course?.title || 'Curso'} activeHref="/admin/courses">
      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/admin/courses" className="btn-ghost">← Volver</Link>
          <span className="badge badge-accent">Orden #{course?.order}</span>
        </div>

        {course && (
          <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{course.description}</div>
          </div>
        )}

        {/* Sections */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Secciones ({sections.length})</h2>
          <button onClick={() => setShowSectionForm(!showSectionForm)} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            + Sección
          </button>
        </div>

        {showSectionForm && (
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '14px' }}>Nueva sección</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input className="input" placeholder="Título de la sección" value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} />
              <input className="input" placeholder="Descripción (opcional)" value={newSection.description}
                onChange={(e) => setNewSection({ ...newSection, description: e.target.value })} />
              <input className="input" type="number" placeholder={`Orden (${sections.length + 1})`} value={newSection.order}
                onChange={(e) => setNewSection({ ...newSection, order: e.target.value })} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={addSection} disabled={addingSection} className="btn-primary" style={{ fontSize: '13px' }}>
                  {addingSection ? 'Guardando...' : 'Crear sección'}
                </button>
                <button onClick={() => setShowSectionForm(false)} className="btn-secondary" style={{ fontSize: '13px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {sections.length === 0 && !showSectionForm && (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Este curso no tiene secciones todavía.</p>
          </div>
        )}

        {sections.map((section) => (
          <div key={section.id} className="card" style={{ marginBottom: '12px', overflow: 'hidden' }}>
            {/* Section header */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                cursor: 'pointer', borderBottom: section.expanded ? '1px solid var(--border)' : 'none',
              }}
              onClick={() => setSections(sections.map((s) => s.id === section.id ? { ...s, expanded: !s.expanded } : s))}
            >
              <span className="num-pill">{section.order}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px' }}>{section.title}</div>
                {section.description && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{section.description}</div>
                )}
              </div>
              <span className="badge badge-muted">{section.resources.length} recursos</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSection(section.id) }}
                className="btn-danger" style={{ fontSize: '11px', padding: '4px 8px' }}
              >Borrar</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{section.expanded ? '▲' : '▼'}</span>
            </div>

            {section.expanded && (
              <div style={{ padding: '12px 20px' }}>
                {section.resources.map((r) => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px',
                    background: 'var(--bg-elevated)', marginBottom: '8px',
                  }}>
                    <span className="num-pill">{r.order}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{r.title}</div>
                    </div>
                    <Link
                      href={`/admin/courses/${courseId}/sections/${section.id}/resources/${r.id}`}
                      className="btn-ghost" style={{ fontSize: '11px', padding: '4px 8px' }}
                    >Editar</Link>
                    <button
                      onClick={() => deleteResource(section.id, r.id)}
                      className="btn-danger" style={{ fontSize: '11px', padding: '4px 8px' }}
                    >Borrar</button>
                  </div>
                ))}

                {addingResource === section.id ? (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'var(--bg-deepest)', borderRadius: '8px' }}>
                    <input className="input" placeholder="Título del recurso" value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} />
                    <textarea className="textarea" placeholder="Contenido en Markdown..." value={newResource.content}
                      onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                      style={{ minHeight: '100px' }} />
                    <input className="input" type="number" placeholder={`Orden (${section.resources.length + 1})`} value={newResource.order}
                      onChange={(e) => setNewResource({ ...newResource, order: e.target.value })} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => addResource(section.id)} className="btn-primary" style={{ fontSize: '12px' }}>Crear recurso</button>
                      <button onClick={() => setAddingResource(null)} className="btn-secondary" style={{ fontSize: '12px' }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingResource(section.id); setNewResource({ title: '', content: '', order: '' }) }}
                    className="btn-ghost"
                    style={{ fontSize: '12px', marginTop: '6px' }}
                  >+ Añadir recurso</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  )
}
