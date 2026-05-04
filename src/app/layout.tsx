// src/app/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layout raíz de la aplicación.
// Aplica a TODAS las páginas sin excepción.
// Responsabilidades: fuente global, metadatos base, proveedores globales.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

// Fuente principal — Geist es limpia y moderna, alineada con el estilo Notion/Linear
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = { // Metadatos globales para SEO y redes sociales
  title: {
    // template: el %s se reemplaza por el título específico de cada página
    // Ejemplo: 'Dashboard | LifeOS', 'SaaS | LifeOS'
    template: '%s | LifeOS',
    default: 'LifeOS',
  },
  description: 'Sistema de gestión personal — proyectos, finanzas y aprendizaje',
}

export default function RootLayout({ // El prop "children" representa el contenido de cada página específica
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}