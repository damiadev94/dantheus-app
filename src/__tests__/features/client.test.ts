// ─── Imports ──────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createClient, updateClient } from '@/features/client/actions'

// ─── Types ────────────────────────────────────────────────────────────────────
const mockAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedClientFixture(suffix = '') {
  const user = await prisma.user.create({
    data: { email: `client${suffix}@example.com`, name: `User ${suffix}`, passwordHash: 'hashed' },
  })
  const ws = await prisma.workspace.create({
    data: { userId: user.id, name: 'Client WS', color: '#000' },
  })
  return { user, ws }
}

// ─── createClient ─────────────────────────────────────────────────────────────

describe('createClient', () => {
  beforeEach(async () => {
    await prisma.client.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('crea cliente en workspace propio', async () => {
    const { user, ws } = await seedClientFixture('c1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const result = await createClient(ws.id, { name: 'Acme Corp' })

    expect(result).toHaveProperty('data')
    if ('data' in result) {
      expect(result.data.name).toBe('Acme Corp')
      expect(result.data.workspaceId).toBe(ws.id)
    }
  })

  it('no puede crear cliente en workspace ajeno', async () => {
    const { ws } = await seedClientFixture('c2a')
    const attacker = await prisma.user.create({
      data: { email: 'attacker-client@example.com', name: 'Attacker', passwordHash: 'hashed' },
    })
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const result = await createClient(ws.id, { name: 'Robo Inc' })

    expect(result).toEqual({ error: 'Workspace no encontrado' })

    // ! No debe haberse creado ningún cliente
    const clients = await prisma.client.findMany({ where: { workspaceId: ws.id } })
    expect(clients).toHaveLength(0)
  })

  it('rechaza si no hay sesión', async () => {
    const { ws } = await seedClientFixture('c3')
    mockAuth.mockResolvedValue(null as any)

    const result = await createClient(ws.id, { name: 'Sin auth' })

    expect(result).toEqual({ error: 'No autorizado' })
  })
})

// ─── updateClient ─────────────────────────────────────────────────────────────

describe('updateClient', () => {
  beforeEach(async () => {
    await prisma.client.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('actualiza cliente propio', async () => {
    const { user, ws } = await seedClientFixture('u1')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const client = await prisma.client.create({
      data: { workspaceId: ws.id, name: 'Original' },
    })

    const result = await updateClient(client.id, ws.id, { name: 'Actualizado' })

    expect(result).toHaveProperty('data')
    if ('data' in result) expect(result.data.name).toBe('Actualizado')
  })

  it('puede desactivar cliente (isActive=false)', async () => {
    const { user, ws } = await seedClientFixture('u2')
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    const client = await prisma.client.create({
      data: { workspaceId: ws.id, name: 'Cliente activo' },
    })

    await updateClient(client.id, ws.id, { isActive: false })

    const updated = await prisma.client.findUnique({ where: { id: client.id } })
    expect(updated!.isActive).toBe(false)
  })

  it('no puede actualizar cliente ajeno', async () => {
    const { ws } = await seedClientFixture('u3a')
    const attacker = await prisma.user.create({
      data: { email: 'attacker-upd@example.com', name: 'Attacker', passwordHash: 'hashed' },
    })
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const client = await prisma.client.create({
      data: { workspaceId: ws.id, name: 'Ajeno' },
    })

    const result = await updateClient(client.id, ws.id, { name: 'Hackeado' })

    expect(result).toEqual({ error: 'Cliente no encontrado' })

    // ! El nombre no debe haber cambiado
    const unchanged = await prisma.client.findUnique({ where: { id: client.id } })
    expect(unchanged!.name).toBe('Ajeno')
  })
})
