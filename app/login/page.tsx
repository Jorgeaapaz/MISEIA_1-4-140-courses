'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al enviar')
      } else {
        setSent(true)
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-deepest)', padding: '24px', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)',
        width: '500px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: 'white',
            }}>C</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
              CourseHub
            </span>
          </Link>
        </div>

        <div className="card" style={{ padding: '40px' }}>
          {sent ? (
            <div className="fade-in" style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', margin: '0 auto 20px',
              }}>✉</div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Revisa tu correo</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                Hemos enviado un enlace de acceso a <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                Caduca en 15 minutos.
              </p>
              <div className="alert-success" style={{ textAlign: 'left' }}>
                Si no lo ves, revisa la carpeta de spam. El link viene de Mailhog (localhost).
              </div>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="btn-ghost"
                style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
              >
                ← Enviar a otro email
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Acceder</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                Introduce tu email y te enviamos un enlace mágico.
              </p>

              {error && <div className="alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace de acceso →'
                  )}
                </button>
              </form>

              <div className="divider" />

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Sin contraseña · Acceso seguro · Magic Link
              </p>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
