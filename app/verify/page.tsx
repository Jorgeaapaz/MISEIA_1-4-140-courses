import { Suspense } from 'react'
import VerifyContent from './VerifyContent'

export default function VerifyPage() {
  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-deepest)', padding: '24px',
      }}
    >
      <Suspense
        fallback={
          <div className="card" style={{ padding: '48px 40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 24px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cargando...</p>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  )
}
