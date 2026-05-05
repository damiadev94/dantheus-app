'use server'

// ─── Imports ──────────────────────────────────────────────────────────────────
import { revalidatePath } from 'next/cache'
import { auth }           from '@/lib/auth'
import { prisma }         from '@/lib/prisma'
import {
  createTransactionSchema,
  createInstallmentSchema,
} from '@/lib/validations/finance'

// ─── Types ────────────────────────────────────────────────────────────────────
type ActionResult = { success: true } | { error: string }

// Alias del tipo de Prisma dentro de $transaction — evita repetir el genérico largo
type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// R10: balance = initialBalance + Σ(incomes EXECUTED) - Σ(expenses EXECUTED)
// ! Llamar siempre dentro de una $transaction para garantizar consistencia
async function recalculateBalance(tx: PrismaTx, accountId: string): Promise<void> {
  const account = await tx.account.findUniqueOrThrow({
    where: { id: accountId },
    select: { initialBalance: true },
  })

  const [incomes, expenses] = await Promise.all([
    tx.transaction.aggregate({ where: { accountId, type: 'INCOME',  status: 'EXECUTED' }, _sum: { amount: true } }),
    tx.transaction.aggregate({ where: { accountId, type: 'EXPENSE', status: 'EXECUTED' }, _sum: { amount: true } }),
  ])

  await tx.account.update({
    where: { id: accountId },
    data: {
      currentBalance:
        Number(account.initialBalance) +
        Number(incomes._sum.amount  ?? 0) -
        Number(expenses._sum.amount ?? 0),
    },
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createTransaction(formData: unknown): Promise<ActionResult> {
  // * 1. Autenticar
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  // * 2. Validar
  const parsed = createTransactionSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.name }
  const data = parsed.data

  // * 3. Autorizar — la cuenta y el workspace deben pertenecer al usuario
  const [account, workspace] = await Promise.all([
    prisma.account.findFirst({ where: { id: data.accountId, userId: session.user.id }, select: { id: true, currency: true, name: true } }),
    prisma.workspace.findFirst({ where: { id: data.workspaceId, userId: session.user.id }, select: { id: true } }),
  ])
  if (!account)   return { error: 'Cuenta no encontrada'    }
  if (!workspace) return { error: 'Workspace no encontrado' }

  // * 4. Ejecutar
  if (data.type === 'TRANSFER' && data.destinationAccountId) {
    // R11: TRANSFER genera 2 transactions atómicas — EXPENSE en origen, INCOME en destino
    const destAccount = await prisma.account.findFirst({
      where: { id: data.destinationAccountId, userId: session.user.id },
      select: { id: true, currency: true, name: true },
    })
    if (!destAccount) return { error: 'Cuenta destino no encontrada' }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({ data: { workspaceId: data.workspaceId, accountId: data.accountId, type: 'EXPENSE', amount: data.amount, currency: account.currency, description: `Transferencia → ${destAccount.name}`, date: new Date(data.date), status: 'EXECUTED' } })
      await tx.transaction.create({ data: { workspaceId: data.workspaceId, accountId: data.destinationAccountId!, type: 'INCOME', amount: data.amount, currency: destAccount.currency, description: `Transferencia ← ${account.name}`, date: new Date(data.date), status: 'EXECUTED' } })
      // R10: recalcular ambas cuentas dentro de la misma transacción
      await recalculateBalance(tx, data.accountId)
      await recalculateBalance(tx, data.destinationAccountId!)
    })
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({ data: { workspaceId: data.workspaceId, accountId: data.accountId, projectId: data.projectId, type: data.type, amount: data.amount, currency: account.currency, description: data.description, date: new Date(data.date), status: 'EXECUTED' } })
      await recalculateBalance(tx, data.accountId)
    })
  }

  // * 5. Revalidar
  revalidatePath(`/workspace/${data.workspaceId}/finances`)
  return { success: true }
}

export async function createInstallmentGroup(formData: unknown): Promise<ActionResult> {
  // * 1. Autenticar
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  // * 2. Validar
  const parsed = createInstallmentSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.name }
  const data = parsed.data

  // * 3. Autorizar
  const [account, workspace] = await Promise.all([
    prisma.account.findFirst({ where: { id: data.accountId, userId: session.user.id }, select: { id: true, currency: true } }),
    prisma.workspace.findFirst({ where: { id: data.workspaceId, userId: session.user.id }, select: { id: true } }),
  ])
  if (!account)   return { error: 'Cuenta no encontrada'    }
  if (!workspace) return { error: 'Workspace no encontrado' }

  // * 4. Ejecutar
  await prisma.$transaction(async (tx) => {
    // 4a. Crear grupo padre
    const group = await tx.installmentGroup.create({
      data: { workspaceId: data.workspaceId, accountId: data.accountId, description: data.description, totalAmount: data.totalAmount, installmentCount: data.installmentCount, startDate: new Date(data.startDate) },
    })

    // 4b. Calcular monto por cuota — la última absorbe el diferencial de redondeo
    const n       = data.installmentCount
    const baseAmt = Math.floor((data.totalAmount / n) * 100) / 100
    const lastAmt = data.totalAmount - baseAmt * (n - 1)

    // 4c. R9: generar N transactions SCHEDULED — el cron las ejecuta en su fecha (R14)
    const start = new Date(data.startDate)
    for (let i = 0; i < n; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)

      await tx.transaction.create({
        data: { workspaceId: data.workspaceId, accountId: data.accountId, type: 'EXPENSE', amount: i === n - 1 ? lastAmt : baseAmt, currency: account.currency, description: `${data.description} — Cuota ${i + 1}/${n}`, date: dueDate, status: 'SCHEDULED', isRecurring: true, recurrenceId: group.id },
      })
    }
    // ! balance NO se recalcula aquí — SCHEDULED no impacta hasta que el cron las ejecute
  })

  // * 5. Revalidar
  revalidatePath(`/workspace/${data.workspaceId}/finances`)
  return { success: true }
}
