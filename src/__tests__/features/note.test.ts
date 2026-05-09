// ─── Imports ──────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createNote, updateNote, archiveNote } from '@/features/note/actions'

// ─── Types ────────────────────────────────────────────────────────────────────
const mockAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createTestUser(suffix = '') {
  return prisma.user.create({
    data: { email: `note${suffix}@example.com`, name: `User ${suffix}`, passwordHash: 'hashed' },
  })
}

async function createTestWorkspace(userId: string) {
  return prisma.workspace.create({
    data: { userId, name: 'Test WS', color: '#000' },
  })
}

// ─── createNote ───────────────────────────────────────────────────────────────

describe('createNote', () => {
  beforeEach(async () => {
    await prisma.note.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('crea nota GLOBAL con userId del usuario en sesión', async () => {
    const user = await createTestUser('n1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const result = await createNote(
      { userId: user.id },
      { title: 'Mi nota', type: 'NOTE', scope: 'GLOBAL' }
    )

    expect(result).toHaveProperty('data')
    if ('data' in result) {
      expect(result.data.userId).toBe(user.id)
      expect(result.data.scope).toBe('GLOBAL')
    }
  })

  it('crea nota LOCAL vinculada a workspace del usuario', async () => {
    const user = await createTestUser('n2')
    const ws = await createTestWorkspace(user.id)
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const result = await createNote(
      { workspaceId: ws.id },
      { title: 'Nota local', type: 'NOTE', scope: 'LOCAL' }
    )

    expect(result).toHaveProperty('data')
    if ('data' in result) {
      expect(result.data.workspaceId).toBe(ws.id)
      expect(result.data.scope).toBe('LOCAL')
    }
  })

  it('R5: no puede crear nota GLOBAL con userId ajeno', async () => {
    const owner    = await createTestUser('n3a')
    const attacker = await createTestUser('n3b')
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const result = await createNote(
      { userId: owner.id },
      { title: 'Robo', type: 'NOTE', scope: 'GLOBAL' }
    )

    expect(result).toEqual({ error: 'No autorizado' })
  })

  it('R4: no puede crear nota LOCAL en workspace ajeno', async () => {
    const owner    = await createTestUser('n4a')
    const attacker = await createTestUser('n4b')
    const ws = await createTestWorkspace(owner.id)
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const result = await createNote(
      { workspaceId: ws.id },
      { title: 'Robo local', type: 'NOTE', scope: 'LOCAL' }
    )

    expect(result).toEqual({ error: 'Workspace no encontrado' })
  })

  it('rechaza si no hay sesión', async () => {
    mockAuth.mockResolvedValue(null as any)

    const result = await createNote(
      { userId: 'cualquiera' },
      { title: 'Sin auth', type: 'NOTE', scope: 'GLOBAL' }
    )

    expect(result).toEqual({ error: 'No autorizado' })
  })
})

// ─── updateNote ───────────────────────────────────────────────────────────────

describe('updateNote', () => {
  beforeEach(async () => {
    await prisma.note.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('actualiza nota propia', async () => {
    const user = await createTestUser('u1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const note = await prisma.note.create({
      data: { userId: user.id, title: 'Original', type: 'NOTE', scope: 'GLOBAL', status: 'ACTIVE' },
    })

    const result = await updateNote(note.id, { title: 'Actualizada' })

    expect(result).toHaveProperty('data')
    if ('data' in result) expect(result.data.title).toBe('Actualizada')
  })

  it('no puede actualizar nota ajena', async () => {
    const owner    = await createTestUser('u2a')
    const attacker = await createTestUser('u2b')
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const note = await prisma.note.create({
      data: { userId: owner.id, title: 'Ajena', type: 'NOTE', scope: 'GLOBAL', status: 'ACTIVE' },
    })

    const result = await updateNote(note.id, { title: 'Hackeada' })

    expect(result).toEqual({ error: 'Nota no encontrada' })

    // ! El título no debe haber cambiado
    const unchanged = await prisma.note.findUnique({ where: { id: note.id } })
    expect(unchanged!.title).toBe('Ajena')
  })
})

// ─── archiveNote ──────────────────────────────────────────────────────────────

describe('archiveNote', () => {
  beforeEach(async () => {
    await prisma.note.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('archiva nota propia', async () => {
    const user = await createTestUser('a1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const note = await prisma.note.create({
      data: { userId: user.id, title: 'A archivar', type: 'NOTE', scope: 'GLOBAL', status: 'ACTIVE' },
    })

    const result = await archiveNote(note.id)
    expect(result).toEqual({ success: true })

    const archived = await prisma.note.findUnique({ where: { id: note.id } })
    expect(archived!.status).toBe('ARCHIVED')
  })

  it('no puede archivar nota ajena', async () => {
    const owner    = await createTestUser('a2a')
    const attacker = await createTestUser('a2b')
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const note = await prisma.note.create({
      data: { userId: owner.id, title: 'Ajena', type: 'NOTE', scope: 'GLOBAL', status: 'ACTIVE' },
    })

    const result = await archiveNote(note.id)
    expect(result).toEqual({ error: 'Nota no encontrada' })

    const unchanged = await prisma.note.findUnique({ where: { id: note.id } })
    expect(unchanged!.status).toBe('ACTIVE')
  })
})
