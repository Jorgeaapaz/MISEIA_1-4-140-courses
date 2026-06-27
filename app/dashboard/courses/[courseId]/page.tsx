'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGlobal } from '../../../contexts/GlobalContext'
import type { SerializedCourse, SerializedSection, SerializedResource } from '@/lib/types'

interface SectionWithResources extends SerializedSection {
  resources: SerializedResource[]
}

export default function CourseViewPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user, token, isLoading } = useGlobal()
  const router = useRouter()

  const [course, setCourse] = useState<SerializedCourse | null>(null)
  const [sections, setSections] = useState<SectionWithResources[]>([])
  const [loading, setLoading] = useState(true)
  const [activeResource, setActiveResource] = useState<SerializedResource | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [isLoading, user, router])

  useEffect(() => {
    if (!courseId) return
    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/courses/${courseId}/sections`).then((r) => r.json()),
    ]).then(async ([c, secs]) => {
      setCourse(c)
      const sectionList: SerializedSection[] = Array.isArray(secs) ? secs : []
      const withResources = await Promise.all(
        sectionList.map(async (s) => {
          const r = await fetch(`/api/courses/${courseId}/sections/${s.id}/resources`).then((r) => r.json())
          return { ...s, resources: Array.isArray(r) ? r : [] }
        })
      )
      setSections(withResources)
      setExpandedSections(new Set(sectionList.map((s) => s.id)))
      // Auto-select first resource
      const first = withResources[0]?.resources[0]
      if (first) setActiveResource(first)
      setLoading(false)
    })
  }, [courseId])

  const [feedback, setFeedback] = useState<{ id: string; userEmail: string; comment: string; createdAt: string }[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!activeResource) return
    setFeedback([])
    fetch(`/api/feedback/${activeResource.id}`)
      .then((r) => r.json())
      .then((data) => setFeedback(Array.isArray(data) ? data : []))
  }, [activeResource])

  async function submitFeedback() {
    if (!comment.trim() || !activeResource || !token) return
    setSubmitting(true)
    const res = await fetch(`/api/feedback/${activeResource.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ comment }),
    })
    const data = await res.json()
    if (!data.error) {
      setFeedback([data, ...feedback])
      setComment('')
    }
    setSubmitting(false)
  }

  if (loading || isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deepest)' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deepest)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px', flexShrink: 0,
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
            ← Dashboard
          </Link>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {course?.title}
          </h2>
        </div>

        {/* Sections tree */}
        <nav style={{ padding: '10px 10px', flex: 1 }}>
          {sections.map((section) => (
            <div key={section.id} style={{ marginBottom: '4px' }}>
              <button
                onClick={() => {
                  const next = new Set(expandedSections)
                  next.has(section.id) ? next.delete(section.id) : next.add(section.id)
                  setExpandedSections(next)
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '7px', border: 'none',
                  background: 'none', cursor: 'pointer', textAlign: 'left',
                  color: 'var(--text-secondary)',
                }}
              >
                <span className="num-pill">{section.order}</span>
                <span style={{ flex: 1, fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                  {section.title}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {expandedSections.has(section.id) ? '▲' : '▼'}
                </span>
              </button>

              {expandedSections.has(section.id) && (
                <div style={{ paddingLeft: '10px' }}>
                  {section.resources.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveResource(r)}
                      className={`tree-item ${activeResource?.id === r.id ? 'active' : ''}`}
                      style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: '10px', width: '16px', textAlign: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
                        {r.order}
                      </span>
                      <span style={{ fontSize: '12px', lineHeight: 1.4 }}>{r.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{user?.email}</div>
          <button
            onClick={() => router.push('/login')}
            className="btn-ghost"
            style={{ fontSize: '11px', padding: '4px 8px', width: '100%', justifyContent: 'center' }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', maxWidth: '860px' }}>
        {activeResource ? (
          <div className="fade-in">
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{course?.title}</span>
              <span>›</span>
              <span>{sections.find((s) => s.resources.some((r) => r.id === activeResource.id))?.title}</span>
              <span>›</span>
              <span style={{ color: 'var(--text-secondary)' }}>{activeResource.title}</span>
            </div>

            {/* Resource title */}
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', marginBottom: '28px', lineHeight: 1.2 }}>
              {activeResource.title}
            </h1>

            {/* Markdown */}
            <MarkdownContent content={activeResource.content} />

            {/* Feedback */}
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', marginBottom: '20px' }}>
                Feedback ({feedback.length})
              </h3>

              {/* Write feedback */}
              <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <label className="label" htmlFor="comment">Tu comentario</label>
                <textarea
                  id="comment" className="textarea"
                  placeholder="Escribe tu feedback sobre este recurso..."
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  style={{ minHeight: '90px', marginBottom: '12px' }}
                />
                <button onClick={submitFeedback} disabled={submitting || !comment.trim()} className="btn-primary" style={{ fontSize: '13px' }}>
                  {submitting ? 'Enviando...' : 'Enviar feedback →'}
                </button>
              </div>

              {/* Feedback list */}
              {feedback.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sin feedback aún. ¡Sé el primero!</p>
              ) : (
                feedback.map((f) => (
                  <div key={f.id} className="feedback-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--accent-light)' }}>
                        {f.userEmail}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(f.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {f.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>◎</div>
            <p>Selecciona un recurso del menú lateral.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// Simple markdown renderer using dangerouslySetInnerHTML with basic transformations
function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

function renderMarkdown(md: string): string {
  const html = md
    // Escape existing HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Code blocks (must be before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
    )
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links with image (YouTube thumbnail)
    .replace(/\[!\[([^\]]+)\]\(([^)]+)\)\]\(([^)]+)\)/g,
      '<a href="$3" target="_blank" rel="noopener"><img src="$2" alt="$1" style="max-width:320px;border-radius:8px;" /></a>'
    )
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm, (match) => {
      const rows = match.trim().split('\n').filter((r) => !r.match(/^\|[-| :]+\|$/))
      const headers = rows[0].split('|').filter(Boolean).map((h) => `<th>${h.trim()}</th>`).join('')
      const body = rows.slice(1).map((r) => {
        const cells = r.split('|').filter(Boolean).map((c) => `<td>${c.trim()}</td>`).join('')
        return `<tr>${cells}</tr>`
      }).join('')
      return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`
    })
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Emoji shorthand for YouTube links
    .replace(/🎥 \[([^\]]+)\]\(([^)]+)\)/g,
      '🎥 <a href="$2" target="_blank" rel="noopener" style="color:var(--accent-light)">$1</a>'
    )
    // Paragraphs (non-tag lines)
    .replace(/^(?!<[a-z]).+$/gm, (line) => {
      if (line.trim() === '') return ''
      return `<p>${line}</p>`
    })
    // Clean up empty lines
    .replace(/\n{3,}/g, '\n\n')

  return html
}
