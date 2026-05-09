// ─── Imports ──────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { deleteProject, createProject } from '@/features/project/actions'

// ─── Types ────────────────────────────────────────────────────────────────────
const mockAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createTestUser(suffix = '') {
  return prisma.user.create({
    data: { email: `proj${suffix}@example.com`, name: `User ${suffix}`, passwordHash: 'hashed' },
  })
}

async function createWorkspaceWithGeneral(userId: string) {
  const ws = await prisma.workspace.create({
    data: { userId, name: 'Test WS', color: '#000' },
  })
  const general = await prisma.project.create({
    data: { workspaceId: ws.id, name: 'General', isGeneral: true, status: 'ACTIVE' },
  })
  return { ws, general }
}

// ─── deleteProject ────────────────────────────────────────────────────────────

describe('deleteProject', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('R2: no puede borrar el proyecto General', async () => {
    const user = await createTestUser('p1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const { general } = await createWorkspaceWithGeneral(user.id)

    const result = await deleteProject(general.id)
    expect(result).toEqual({ error: 'El proyecto General no puede eliminarse' })

    // ! El proyecto debe seguir existiendo tras el intento fallido
    const stillExists = await prisma.project.findUnique({ where: { id: general.id } })
    expect(stillExists).not.toBeNull()
  })

  it('puede borrar un proyecto normal', async () => {
    const user = await createTestUser('p2')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const { ws } = await createWorkspaceWithGeneral(user.id)
    const project = await prisma.project.create({
      data: { workspaceId: ws.id, name: 'Borrable', isGeneral: false, status: 'ACTIVE' },
    })

    const result = await deleteProject(project.id)
    expect(result).toEqual({ success: true })

    const gone = await prisma.project.findUnique({ where: { id: project.id } })
    expect(gone).toBeNull()
  })

  it('no puede borrar proyecto de otro usuario', async () => {
    const owner    = await createTestUser('p3a')
    const attacker = await createTestUser('p3b')

    const { ws } = await createWorkspaceWithGeneral(owner.id)
    const project = await prisma.project.create({
      data: { workspaceId: ws.id, name: 'Ajeno', isGeneral: false, status: 'ACTIVE' },
    })

    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const result = await deleteProject(project.id)
    expect(result).toEqual({ error: 'Proyecto no encontrado' })
  })
})

// ─── createProject ────────────────────────────────────────────────────────────

describe('createProject', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('R1: rechaza si se pasan clientId y categoryId juntos', async () => {
    const user = await createTestUser('p4')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const { ws } = await createWorkspaceWithGeneral(user.id)

    const result = await createProject({
      workspaceId: ws.id,
      name: 'Proyecto inválido',
      status: 'ACTIVE',
      clientId: 'algún-id',
      categoryId: 'otro-id',
    })

    expect(result).toHaveProperty('error')
  })
})
