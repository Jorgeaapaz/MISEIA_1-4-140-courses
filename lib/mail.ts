import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '1025'),
  secure: false,
})

export async function sendMagicLink(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const link = `${baseUrl}/verify?token=${token}`

  await transporter.sendMail({
    from: '"Cursos SaaS" <noreply@cursos-saas.com>',
    to: email,
    subject: 'Tu enlace de acceso',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Accede a tu cuenta</h2>
        <p>Haz clic en el siguiente enlace para acceder. Caduca en 15 minutos.</p>
        <a href="${link}" style="
          display: inline-block;
          background: #6366f1;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          margin: 16px 0;
        ">Acceder ahora</a>
        <p style="color: #888; font-size: 13px;">Si no solicitaste este enlace, ignora este mensaje.</p>
        <p style="color: #888; font-size: 11px;">${link}</p>
      </div>
    `,
  })
}
