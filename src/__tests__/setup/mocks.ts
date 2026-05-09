// ─── Mocks globales de Next.js ────────────────────────────────────────────────
// Estas funciones explotan fuera del runtime de Next — se reemplazan con no-ops
// para que las actions puedan ejecutarse en el entorno de Vitest sin errores.
import { vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag:  vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))
