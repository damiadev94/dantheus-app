// ─── Imports ──────────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { AppProviders } from '@/components/providers/AppProviders'
import './globals.css'

// ─── Font ─────────────────────────────────────────────────────────────────────
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    template: '%s | LifeOS', // %s = título de cada página
    default: 'LifeOS',
  },
  description: 'Sistema de gestión personal — proyectos, finanzas y aprendizaje',
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
