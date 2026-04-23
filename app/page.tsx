import Link from 'next/link'

const features = [
  {
    icon: '◎',
    title: 'Aprende a tu ritmo',
    desc: 'Accede a los contenidos cuando quieras. Sin fechas límite, sin presión.',
  },
  {
    icon: '⊞',
    title: 'Contenido estructurado',
    desc: 'Cursos organizados en secciones y recursos numerados para una progresión clara.',
  },
  {
    icon: '◈',
    title: 'Feedback directo',
    desc: 'Deja comentarios en cada recurso. Tu opinión mejora el contenido del curso.',
  },
]

export default function LandingPage() {
  return (
    <div
      style={{ background: 'var(--bg-deepest)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glows */}
      <div
        style={{
          position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '0', right: '-100px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Nav */}
      <nav
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 48px', borderBottom: '1px solid var(--border)',
          background: 'rgba(15,15,20,0.8)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: 'white',
            }}
          >C</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
            CourseHub
          </span>
        </div>
        <Link href="/login" className="btn-primary" style={{ fontSize: '13px', padding: '9px 20px' }}>
          Acceder →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', position: 'relative', zIndex: 1 }}>
        <div
          className="badge badge-accent"
          style={{ marginBottom: '24px', display: 'inline-flex' }}
        >
          Plataforma de aprendizaje
        </div>

        <h1
          style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: '24px',
            maxWidth: '800px', margin: '0 auto 24px',
          }}
        >
          Aprende lo que<br />
          <span style={{ color: 'var(--accent-light)' }}>realmente importa</span>
        </h1>

        <p
          style={{
            fontSize: '1.1rem', color: 'var(--text-secondary)',
            maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7,
          }}
        >
          CourseHub te ofrece una experiencia de aprendizaje estructurada y fluida.
          Cursos, secciones y recursos — todo ordenado para tu progreso.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn-primary" style={{ fontSize: '15px', padding: '13px 32px' }}>
            Comenzar gratis →
          </Link>
          <Link href="/login" className="btn-secondary" style={{ fontSize: '15px', padding: '13px 32px' }}>
            Ver cursos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px', maxWidth: '1000px', margin: '0 auto 100px', padding: '0 24px',
          position: 'relative', zIndex: 1,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            className="card"
            style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                opacity: 0.6,
              }}
            />
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: 'var(--accent-light)', marginBottom: '20px',
              }}
            >
              {f.icon}
            </div>
            <h3
              style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem',
                color: 'var(--text-primary)', marginBottom: '10px',
              }}
            >
              {f.title}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* CTA bottom */}
      <section
        style={{
          textAlign: 'center', padding: '60px 24px 80px',
          borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1,
        }}
      >
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', marginBottom: '16px' }}>
          Listo para empezar
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '15px' }}>
          Sin contraseñas. Solo tu email y un enlace mágico.
        </p>
        <Link href="/login" className="btn-primary" style={{ fontSize: '15px', padding: '13px 36px' }}>
          Acceder con magic link →
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center', padding: '24px',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)', fontSize: '12px',
        }}
      >
        © 2026 CourseHub — Plataforma de aprendizaje SaaS
      </footer>
    </div>
  )
}
