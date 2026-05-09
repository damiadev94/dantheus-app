import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/cron/route'

async function seedCronFixture() {
  const user = await prisma.user.create({
    data: { email: `cron${Date.now()}@example.com`, name: 'Cron User', password: 'hashed' },
  })
  const ws = await prisma.workspace.create({
    data: { userId: user.id, name: 'Cron WS', color: '#000' },
  })
  const account = await prisma.account.create({
    data: { userId: user.id, name: 'Cuenta', type: 'BANK', currency: 'ARS', initialBalance: 1000, currentBalance: 1000 },
  })
  return { user, ws, account }
}

describe('GET /api/cron', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany()
    await prisma.account.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('rechaza sin token', async () => {
    const req = new Request('http://localhost/api/cron')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('rechaza con token incorrecto', async () => {
    const req = new Request('http://localhost/api/cron', {
      headers: { Authorization: 'Bearer token-incorrecto' },
    })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('R14: ejecuta transactions SCHEDULED cuya fecha ya venció', async () => {
    const { ws, account } = await seedCronFixture()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    await prisma.transaction.createMany({
      data: [
        { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 100, currency: 'ARS', description: 'Cuota 1', date: yesterday, status: 'SCHEDULED' },
        { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 100, currency: 'ARS', description: 'Cuota 2', date: yesterday, status: 'SCHEDULED' },
      ],
    })

    // Cuota futura — NO debe ejecutarse
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    await prisma.transaction.create({
      data: { workspaceId: ws.id, accountId: account.id, type: 'EXPENSE', amount: 100, currency: 'ARS', description: 'Cuota 3', date: nextMonth, status: 'SCHEDULED' },
    })

    const req = new Request('http://localhost/api/cron', {
      headers: { Authorization: `Bearer test-cron-secret` },
    })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.executed).toBe(2)

    const stillScheduled = await prisma.transaction.findMany({ where: { status: 'SCHEDULED' } })
    expect(stillScheduled).toHaveLength(1) // Solo la del mes siguiente
  })
})
