'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGlobal } from '../contexts/GlobalContext'

interface NavLink {
  href: string
  label: string
  icon: string
}

interface AppShellProps {
  children: ReactNode
  role: 'admin' | 'student'
  title?: string
  activeHref?: string
}

const adminLinks: NavLink[] = [
  { href: '/admin', icon: '⊞', label: 'Dashboard' },
  { href: '/admin/courses', icon: '◎', label: 'Cursos' },
]

const studentLinks: NavLink[] = [
  { href: '/dashboard', icon: '⊞', label: 'Mi Panel' },
  { href: '/dashboard/courses', icon: '◎', label: 'Cursos' },
]

export default function AppShell({ children, role, title, activeHref }: AppShellProps) {
  const { user, token, clearAuth, isLoading } = useGlobal()
  const router = useRouter()
  const links = role === 'admin' ? adminLinks : studentLinks

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (!isLoading && user && user.role !== role) {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [isLoading, user, role, router])

  if (isLoading || !user) {
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
        width: '220px', flexShrink: 0,
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '0',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link href={role === 'admin' ? '/admin' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '7px', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '14px', color: 'white',
            }}>C</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              CourseHub
            </span>
          </Link>
          <div style={{ marginTop: '8px' }}>
            <span className="badge badge-accent" style={{ fontSize: '10px' }}>
              {role === 'admin' ? 'Admin' : 'Student'}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{ fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 4px 6px' }}>
            Navegación
          </div>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-item ${activeHref === l.href ? 'active' : ''}`}
            >
              <span style={{ fontSize: '16px' }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '2px' }}>
              {user.email}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); router.push('/login') }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {title && (
          <div style={{
            padding: '24px 32px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)',
          }}>
            <h1 style={{ fontSize: '1.4rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, margin: 0 }}>
              {title}
            </h1>
          </div>
        )}
        <div style={{ padding: '28px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
