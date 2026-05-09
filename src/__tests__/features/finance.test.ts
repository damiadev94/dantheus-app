// ─── Imports ──────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createTransaction, createInstallmentGroup } from '@/features/finance/actions'

// ─── Types ────────────────────────────────────────────────────────────────────
const mockAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedFinanceFixture() {
  const user = await prisma.user.create({
    data: { email: `finance${Date.now()}@example.com`, name: 'Finance User', passwordHash: 'hashed' },
  })
  const ws = await prisma.workspace.create({
    data: { userId: user.id, name: 'Finance WS', color: '#000' },
  })
  const account = await prisma.account.create({
    data: { userId: user.id, name: 'Cuenta Principal', type: 'BANK', currency: 'ARS', initialBalance: 1000, currentBalance: 1000 },
  })
  return { user, ws, account }
}

// ─── createTransaction ────────────────────────────────────────────────────────

describe('createTransaction', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany()
    await prisma.account.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('R10: INCOME suma al balance', async () => {
    const { user, ws, account } = await seedFinanceFixture()
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    await createTransaction({
      workspaceId: ws.id,
      accountId: account.id,
      type: 'INCOME',
      amount: 500,
      date: new Date().toISOString(),
      description: 'Cobro cliente',
    })

    const updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(Number(updated!.currentBalance)).toBe(1500)
  })

  it('R10: EXPENSE resta al balance', async () => {
    const { user, ws, account } = await seedFinanceFixture()
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    await createTransaction({
      workspaceId: ws.id,
      accountId: account.id,
      type: 'EXPENSE',
      amount: 200,
      date: new Date().toISOString(),
      description: 'Gasto',
    })

    const updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(Number(updated!.currentBalance)).toBe(800)
  })

  it('R11: TRANSFER genera 2 transactions y actualiza ambas cuentas', async () => {
    const { user, ws, account } = await seedFinanceFixture()
    const destAccount = await prisma.account.create({
      data: { userId: user.id, name: 'Cuenta Destino', type: 'CASH', currency: 'ARS', initialBalance: 0, currentBalance: 0 },
    })
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    await createTransaction({
      workspaceId: ws.id,
      accountId: account.id,
      destinationAccountId: destAccount.id,
      type: 'TRANSFER',
      amount: 300,
      date: new Date().toISOString(),
    })

    const transactions = await prisma.transaction.findMany({ where: { workspaceId: ws.id } })
    expect(transactions).toHaveLength(2)
    expect(transactions.map(t => t.type).sort()).toEqual(['EXPENSE', 'INCOME'])

    const origin = await prisma.account.findUnique({ where: { id: account.id } })
    const dest   = await prisma.account.findUnique({ where: { id: destAccount.id } })
    expect(Number(origin!.currentBalance)).toBe(700)
    expect(Number(dest!.currentBalance)).toBe(300)
  })

  it('no puede crear transaction en cuenta de otro usuario', async () => {
    const { account } = await seedFinanceFixture()

    const attacker = await prisma.user.create({
      data: { email: `attacker${Date.now()}@example.com`, name: 'Attacker', passwordHash: 'hashed' },
    })
    const attackerWs = await prisma.workspace.create({
      data: { userId: attacker.id, name: 'WS Attacker', color: '#000' },
    })
    mockAuth.mockResolvedValue({ user: { id: attacker.id } } as any)

    const result = await createTransaction({
      workspaceId: attackerWs.id,
      accountId: account.id,
      type: 'INCOME',
      amount: 9999,
      date: new Date().toISOString(),
      description: 'Robo',
    })

    expect(result).toEqual({ error: 'Cuenta no encontrada' })
  })
})

// ─── createInstallmentGroup ───────────────────────────────────────────────────

describe('createInstallmentGroup', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany()
    await prisma.installmentGroup.deleteMany()
    await prisma.account.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
  })

  it('R9: genera N transactions con status SCHEDULED', async () => {
    const { user, ws, account } = await seedFinanceFixture()
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    await createInstallmentGroup({
      workspaceId: ws.id,
      accountId: account.id,
      description: 'Laptop',
      totalAmount: 300,
      installmentCount: 3,
      startDate: new Date().toISOString(),
    })

    const transactions = await prisma.transaction.findMany({ where: { workspaceId: ws.id } })
    expect(transactions).toHaveLength(3)
    expect(transactions.every(t => t.status === 'SCHEDULED')).toBe(true)
  })

  it('R10: cuotas SCHEDULED NO impactan el balance', async () => {
    const { user, ws, account } = await seedFinanceFixture()
    mockAuth.mockResolvedValue({ user: { id: user.id } } as any)

    await createInstallmentGroup({
      workspaceId: ws.id,
      accountId: account.id,
      description: 'Suscripción',
      totalAmount: 600,
      installmentCount: 2,
      startDate: new Date().toISOString(),
    })

    // ! El balance no debe moverse — SCHEDULED no cuenta hasta que el cron las ejecute (R14)
    const updated = await prisma.account.findUnique({ where: { id: account.id } })
    expect(Number(updated!.currentBalance)).toBe(1000)
  })
})
