// ─── Imports ──────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createWorkspace, deleteWorkspace } from '@/features/workspace/actions'

// ─── Types ────────────────────────────────────────────────────────────────────
const mockAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createTestUser(suffix = '') {
  return prisma.user.create({
    data: { email: `test${suffix}@example.com`, name: `Test User ${suffix}`, passwordHash: 'hashed' },
  })
}

// ─── createWorkspace ──────────────────────────────────────────────────────────

describe('createWorkspace', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('R15: auto-crea proyecto General al crear workspace', async () => {
    const user = await createTestUser('ws1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    // La action recibe FormData desde Next.js, pero safeParse espera un objeto plano.
    // En tests llamamos con objeto plano para saltear la capa de transporte de Next.
    await createWorkspace({ name: 'Mi Workspace' } as any)

    const projects = await prisma.project.findMany({
      where: { workspace: { userId: user.id } },
    })

    expect(projects).toHaveLength(1)
    expect(projects[0].isGeneral).toBe(true)
    expect(projects[0].name).toBe('General')
  })

  it('R3: el proyecto General es único por workspace', async () => {
    const user = await createTestUser('ws2')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    await createWorkspace({ name: 'Workspace Único' } as any)

    const generalProjects = await prisma.project.findMany({
      where: { workspace: { userId: user.id }, isGeneral: true },
    })

    expect(generalProjects).toHaveLength(1)
  })

  it('rechaza si no hay sesión', async () => {
    mockAuth.mockResolvedValue(null as any)

    const result = await createWorkspace({ name: 'Workspace Sin Auth' } as any)
    expect(result).toEqual({ error: 'No autorizado' })
  })
})

// ─── deleteWorkspace ──────────────────────────────────────────────────────────

describe('deleteWorkspace', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('R7: eliminar workspace borra proyectos y tareas en cascada', async () => {
    const user = await createTestUser('ws3')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const workspace = await prisma.workspace.create({
      data: { userId: user.id, name: 'A borrar', color: '#000' },
    })
    const project = await prisma.project.create({
      data: { workspaceId: workspace.id, name: 'Proyecto', isGeneral: false, status: 'ACTIVE' },
    })
    await prisma.task.create({
      data: { projectId: project.id, title: 'Tarea', status: 'PENDING', priority: 'LOW', order: 0 },
    })

    await deleteWorkspace(workspace.id)

    const tasks    = await prisma.task.findMany({ where: { projectId: project.id } })
    const projects = await prisma.project.findMany({ where: { workspaceId: workspace.id } })
    expect(tasks).toHaveLength(0)
    expect(projects).toHaveLength(0)
  })

  it('no puede borrar workspace de otro usuario', async () => {
    const owner    = await createTestUser('ws4a')
    const attacker = await createTestUser('ws4b')

    const workspace = await prisma.workspace.create({
      data: { userId: owner.id, name: 'Workspace ajeno', color: '#000' },
    })

    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const result = await deleteWorkspace(workspace.id)
    expect(result).toEqual({ error: 'Workspace no encontrado' })

    // ! El workspace debe seguir existiendo tras el intento fallido
    const ws = await prisma.workspace.findUnique({ where: { id: workspace.id } })
    expect(ws).not.toBeNull()
  })
})
