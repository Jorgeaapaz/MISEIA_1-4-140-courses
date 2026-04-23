import type { Metadata } from 'next'
import './globals.css'
import { GlobalProvider } from './contexts/GlobalContext'

export const metadata: Metadata = {
  title: 'CourseHub — Aprende sin límites',
  description: 'Plataforma SaaS para gestión y consumo de contenido formativo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  )
}
