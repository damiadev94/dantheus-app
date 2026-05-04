// src/lib/utils.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helpers globales reutilizables en toda la app.
// ─────────────────────────────────────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── cn ────────────────────────────────────────────────────────────────────────
// Combina clases de Tailwind resolviendo conflictos.
// Ejemplo: cn('px-4 py-2', condition && 'bg-red-500', 'px-8')
// Resultado: 'py-2 bg-red-500 px-8' (px-4 es reemplazado por px-8)
// shadcn/ui usa esta función internamente — la exportamos para usarla en toda la app.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── formatCurrency ─────────────────────────────────────────────────────────────
// Formatea un número como moneda según el código ISO.
// Ejemplo: formatCurrency(1234.5, 'ARS') → '$1.234,50'
//          formatCurrency(99.99, 'USD')  → 'US$99.99'
export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// ── formatDate ────────────────────────────────────────────────────────────────
// Formatea una fecha en formato legible.
// Ejemplo: formatDate(new Date()) → '3 jun 2025'
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

// ── formatMonth ───────────────────────────────────────────────────────────────
// Formatea un período YYYY-MM en formato legible.
// Ejemplo: formatMonth('2025-06') → 'Junio 2025'
export function formatMonth(period: string): string {
  const [year, month] = period.split('-')
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1))
}

// ── getCurrentPeriod ──────────────────────────────────────────────────────────
// Retorna el período actual en formato YYYY-MM.
// Ejemplo: getCurrentPeriod() → '2025-06'
// Se usa para inicializar el resumen financiero en el mes actual.
export function getCurrentPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// ── getInitials ───────────────────────────────────────────────────────────────
// Extrae las iniciales de un nombre para mostrar en el avatar.
// Ejemplo: getInitials('Juan Dev') → 'JD'
//          getInitials('María')    → 'MA'
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ── slugify ───────────────────────────────────────────────────────────────────
// Convierte un string en un slug URL-safe.
// Ejemplo: slugify('Mi SaaS 2025') → 'mi-saas-2025'
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    .replace(/[^a-z0-9\s-]/g, '')    // elimina caracteres especiales
    .trim()
    .replace(/\s+/g, '-')            // espacios → guiones
}