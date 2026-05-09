// ─── Imports ──────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/cron/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedCronFixture() {
  const user = await prisma.user.create({
    data: { email: `cron${Date.now()}@example.com`, name: 'Cron User', passwordHash: 'hashed' },
  })
  const ws = await prisma.workspace.create({
    data: { userId: user.id, name: 'Cron WS', color: '#000' },
  })
  const account = await prisma.account.create({
    data: { userId: user.id, name: 'Cuenta', type: 'BANK', currency: 'ARS', initialBalance: 1000, currentBalance: 1000 },
  })
  return { user, ws, account }
}

function cronRequest(token = 'test-cron-secret') {
  return new Request('http://localhost/api/cron', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ─── GET /api/cron ────────────────────────────────────────────────────────────

describe('GET /api/cron', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany()
    await prisma.account.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('rechaza sin token', async () => {
    const res = await GET(new Request('http://localhost/api/cron'))
    expect(res.status).toBe(401)
  })

  it('rechaza con token incorrecto', async () => {
    const res = await GET(cronRequest('token-incorrecto'))
    expect(res.status).toBe(401)
  })

  it('R14: marca como EXECUTED las transactions vencidas y deja intactas las futuras', async () => {
    const { ws, account } = await seedCronFixture()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await prisma.transaction.createMany({
      data: [
        { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 100, currency: 'ARS', description: 'Cuota 1', date: yesterday, status: 'SCHEDULED' },
        { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 100, currency: 'ARS', description: 'Cuota 2', date: yesterday, status: 'SCHEDULED' },
        // * Cuota futura — NO debe ejecutarse
        { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 100, currency: 'ARS', description: 'Cuota 3', date: nextMonth, status: 'SCHEDULED' },
      ],
    })

    const res  = await GET(cronRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.executed).toBe(2)

    const stillScheduled = await prisma.transaction.findMany({ where: { status: 'SCHEDULED' } })
    expect(stillScheduled).toHaveLength(1)
  })

  it('R10: recalcula el balance después de ejecutar las cuotas', async () => {
    const { ws, account } = await seedCronFixture()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // * initialBalance = 1000, 2 cuotas de 200 = 400 de gastos → balance final = 600
    await prisma.transaction.createMany({
      data: [
        { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 200, currency: 'ARS', description: 'Cuota 1', date: yesterday, status: 'SCHEDULED' },
        { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 200, currency: 'ARS', description: 'Cuota 2', date: yesterday, status: 'SCHEDULED' },
      ],
    })

    await GET(cronRequest())

    const updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(Number(updated!.currentBalance)).toBe(600)
  })

  it('devuelve executed=0 si no hay cuotas vencidas', async () => {
    const res  = await GET(cronRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.executed).toBe(0)
  })
})
