'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGlobal } from '../contexts/GlobalContext'
import type { SerializedUser } from '@/lib/types'
import Link from 'next/link'

export default function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setAuth } = useGlobal()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Token no encontrado en la URL.')
      return
    }

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStatus('error')
          setMessage(data.error)
        } else {
          setAuth(data.user as SerializedUser, data.token)
          setStatus('success')
          setTimeout(() => {
            router.push(data.user.role === 'admin' ? '/admin' : '/dashboard')
          }, 1200)
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Error de conexión')
      })
  }, [searchParams, router, setAuth])

  return (
    <div className="card fade-in" style={{ padding: '48px 40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
      {status === 'loading' && (
        <>
          <div className="spinner" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Verificando enlace...</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Un momento por favor</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', margin: '0 auto 20px',
          }}>✓</div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--success)' }}>
            ¡Acceso verificado!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Redirigiendo a tu panel...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', margin: '0 auto 20px',
          }}>✕</div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--error)' }}>
            Enlace inválido
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {message || 'El enlace ha caducado o ya fue utilizado.'}
          </p>
          <Link href="/login" className="btn-primary" style={{ width: '100%' }}>
            Solicitar nuevo enlace
          </Link>
        </>
      )}
    </div>
  )
}
