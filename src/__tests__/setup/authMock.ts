// ─── Helper: mock de sesión NextAuth ─────────────────────────────────────────
// auth() depende del runtime de Next — se mockea a nivel de módulo para que
// cada test pueda controlar qué sesión "ve" la action bajo prueba.
import { vi } from 'vitest'

// * Llamar al inicio del describe que requiera usuario autenticado
export function mockAuthSession(userId: string) {
  vi.mock('@/lib/auth', () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: userId } }),
  }))
}

// * Llamar para simular request sin sesión activa
export function mockAuthUnauthenticated() {
  vi.mock('@/lib/auth', () => ({
    auth: vi.fn().mockResolvedValue(null),
  }))
}
