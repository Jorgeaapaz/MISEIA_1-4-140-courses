'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '../components/AppShell'
import { useGlobal } from '../contexts/GlobalContext'

interface Stats {
  courses: number
  sections: number
  resources: number
}

export default function AdminDashboard() {
  const { token } = useGlobal()
  const [stats, setStats] = useState<Stats | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  useEffect(() => {
    if (!token) return
    // Fetch stats from courses API
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
    ]).then(([courses]) => {
      const courseList = Array.isArray(courses) ? courses : []
      // Fetch sections for all courses
      Promise.all(courseList.map((c: { id: string }) =>
        fetch(`/api/courses/${c.id}/sections`).then((r) => r.json())
      )).then((sectionGroups) => {
        const allSections = sectionGroups.flat().filter(Array.isArray(sectionGroups[0]) ? () => true : (s: unknown) => s)
        const sectionList = sectionGroups.flatMap((s) => (Array.isArray(s) ? s : []))
        Promise.all(sectionList.map((s: { id: string }) =>
          fetch(`/api/courses/_/sections/${s.id}/resources`).catch(() => ({ json: () => [] }))
        )).then(() => {
          setStats({ courses: courseList.length, sections: sectionList.length, resources: 0 })
        })
        setStats({ courses: courseList.length, sections: allSections.length, resources: 0 })
      })
    })
  }, [token])

  async function runSeed() {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      setSeedMsg(data.message || 'Seed completado')
      // Refresh stats
      setTimeout(() => window.location.reload(), 800)
    } catch {
      setSeedMsg('Error en seed')
    } finally {
      setSeeding(false)
    }
  }

  const statItems = [
    { label: 'Cursos', value: stats?.courses ?? '—', icon: '◎', color: '#6366f1' },
    { label: 'Secciones', value: stats?.sections ?? '—', icon: '⊞', color: '#22d3a5' },
    { label: 'Recursos', value: stats?.resources ?? '—', icon: '◈', color: '#f59e0b' },
  ]

  return (
    <AppShell role="admin" title="Dashboard" activeHref="/admin">
      <div style={{ maxWidth: '900px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {statItems.map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '20px', color: s.color }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: '2.2rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', marginBottom: '16px' }}>
            Acciones rápidas
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/admin/courses" className="btn-primary" style={{ fontSize: '13px', padding: '9px 18px' }}>
              Gestionar cursos →
            </Link>
            <Link href="/admin/courses/new" className="btn-secondary" style={{ fontSize: '13px', padding: '9px 18px' }}>
              + Nuevo curso
            </Link>
          </div>
        </div>

        {/* Seed */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>
            Datos de prueba
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Carga datos de ejemplo con 2 cursos, 5 secciones y 6 recursos. Borra los datos actuales.
          </p>
          {seedMsg && <div className="alert-success" style={{ marginBottom: '12px', fontSize: '13px' }}>{seedMsg}</div>}
          <button onClick={runSeed} disabled={seeding} className="btn-secondary" style={{ fontSize: '13px', padding: '9px 18px' }}>
            {seeding ? 'Cargando...' : '⟳ Ejecutar seed'}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
