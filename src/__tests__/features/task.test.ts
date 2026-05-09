// ─── Imports ──────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createTask, updateTaskStatus } from '@/features/task/actions'

// ─── Types ────────────────────────────────────────────────────────────────────
const mockAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedTaskFixture(suffix = '') {
  const user = await prisma.user.create({
    data: { email: `task${suffix}@example.com`, name: `User ${suffix}`, passwordHash: 'hashed' },
  })
  const ws = await prisma.workspace.create({
    data: { userId: user.id, name: 'Task WS', color: '#000' },
  })
  const project = await prisma.project.create({
    data: { workspaceId: ws.id, name: 'Proyecto', isGeneral: false, status: 'ACTIVE' },
  })
  return { user, ws, project }
}

// ─── createTask ───────────────────────────────────────────────────────────────

describe('createTask', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('crea tarea en proyecto propio con order=0 si es la primera', async () => {
    const { user, project } = await seedTaskFixture('t1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const result = await createTask({
      title: 'Primera tarea',
      projectId: project.id,
    } as any)

    expect(result).toHaveProperty('newTask')
    if ('newTask' in result) {
      expect(result.newTask.order).toBe(0)
      expect(result.newTask.title).toBe('Primera tarea')
    }
  })

  it('asigna order incremental a cada nueva tarea', async () => {
    const { user, project } = await seedTaskFixture('t2')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    await createTask({ title: 'Tarea 1', projectId: project.id } as any)
    await createTask({ title: 'Tarea 2', projectId: project.id } as any)
    const result = await createTask({ title: 'Tarea 3', projectId: project.id } as any)

    expect(result).toHaveProperty('newTask')
    if ('newTask' in result) expect(result.newTask.order).toBe(2)
  })

  it('no puede crear tarea en proyecto ajeno', async () => {
    const { project } = await seedTaskFixture('t3a')
    const attacker = await prisma.user.create({
      data: { email: 'attacker-task@example.com', name: 'Attacker', passwordHash: 'hashed' },
    })
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const result = await createTask({ title: 'Robo', projectId: project.id } as any)

    expect(result).toEqual({ error: 'Proyecto no encontrado' })
  })

  it('rechaza si no hay sesión', async () => {
    mockAuth.mockResolvedValue(null as any)

    await expect(
      createTask({ title: 'Sin auth', projectId: 'cualquiera' } as any)
    ).rejects.toThrow('No autorizado')
  })
})

// ─── updateTaskStatus ─────────────────────────────────────────────────────────

describe('updateTaskStatus', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('actualiza status de tarea propia', async () => {
    const { user, project } = await seedTaskFixture('s1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Tarea', status: 'PENDING', priority: 'LOW', order: 0 },
    })

    const result = await updateTaskStatus(task.id, 'IN_PROGRESS')
    expect(result).toEqual({ success: true })

    const updated = await prisma.task.findUnique({ where: { id: task.id } })
    expect(updated!.status).toBe('IN_PROGRESS')
  })

  it('no puede actualizar tarea ajena', async () => {
    const { project } = await seedTaskFixture('s2a')
    const attacker = await prisma.user.create({
      data: { email: 'attacker-status@example.com', name: 'Attacker', passwordHash: 'hashed' },
    })
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Ajena', status: 'PENDING', priority: 'LOW', order: 0 },
    })

    const result = await updateTaskStatus(task.id, 'DONE')
    expect(result).toEqual({ error: 'Tarea no encontrada' })

    // ! El status no debe haber cambiado
    const unchanged = await prisma.task.findUnique({ where: { id: task.id } })
    expect(unchanged!.status).toBe('PENDING')
  })
})
