'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '../components/AppShell'
import type { SerializedCourse } from '@/lib/types'

const ACCENT_ICONS = ['◎', '⊞', '◈', '◉', '⬡', '◇']
const ACCENT_COLORS = ['#6366f1', '#22d3a5', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6']

export default function StudentDashboard() {
  const [courses, setCourses] = useState<SerializedCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  return (
    <AppShell role="student" title="Mis Cursos" activeHref="/dashboard">
      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }} />
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>◎</div>
          <p>No hay cursos disponibles todavía.</p>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {courses.length} curso{courses.length !== 1 ? 's' : ''} disponible{courses.length !== 1 ? 's' : ''}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {courses.map((c, i) => {
              const color = ACCENT_COLORS[i % ACCENT_COLORS.length]
              const icon = ACCENT_ICONS[i % ACCENT_ICONS.length]
              return (
                <Link
                  key={c.id}
                  href={`/dashboard/courses/${c.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card"
                    style={{
                      padding: '28px', position: 'relative', overflow: 'hidden',
                      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.3)`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                      background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    }} />
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: `${color}18`, border: `1px solid ${color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', color: color, marginBottom: '18px',
                    }}>
                      {icon}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span className="num-pill" style={{ background: `${color}18`, color: color }}>{c.order}</span>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>
                        {c.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.6 }}>
                      {c.description}
                    </p>
                    <span style={{ fontSize: '12px', color: color, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      Ver contenido →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </AppShell>
  )
}
