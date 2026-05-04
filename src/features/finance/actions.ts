// ─────────────────────────────────────────────────────────────────────────────
// finance/actions.ts
//
// QUÉ:      Mutaciones del módulo financiero (Server Actions)
// REGLAS:   R9 (cuotas→scheduled), R10 (balance), R11 (transfer), R14 (cron)
// EXPORTS:  createTransaction · createInstallmentGroup
// DEPENDE:  lib/prisma · lib/auth · lib/validations/finance
// ─────────────────────────────────────────────────────────────────────────────

'use server'

// ── IMPORTS ───────────────────────────────────────────────────────────────────

import { revalidatePath } from 'next/cache'
import { auth }           from '@/lib/auth'           // sesión del usuario
import { prisma }         from '@/lib/prisma'         // cliente DB singleton
import {
  createTransactionSchema,
  createInstallmentSchema,
} from '@/lib/validations/finance'                    // validación Zod compartida

//* ── TIPOS ─────────────────────────────────────────────────────────────────────

// Tipo de retorno uniforme para todas las actions de este archivo.
// El caller distingue éxito/error sin necesidad de try/catch.
type ActionResult = { success: true } | { error: string }

// Alias del tipo de transacción Prisma dentro de una transacción ($transaction)
// Evita repetir el tipo genérico largo en cada helper
type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

//* ── HELPERS INTERNOS (no exportados) ──────────────────────────────────────────

/**
 * Recalcula y persiste el current_balance de una cuenta.
 *
 * @regla   R10: balance = initialBalance + Σ(incomes EXECUTED) - Σ(expenses EXECUTED)
 * @detalle Las transactions SCHEDULED no afectan el balance hasta ejecutarse.
 *          Se llama siempre dentro de una $transaction para garantizar consistencia.
 * @param   tx         Instancia de Prisma dentro de una transacción activa
 * @param   accountId  ID de la cuenta a recalcular
 */
async function recalculateBalance(tx: PrismaTx, accountId: string): Promise<void> {
  const account = await tx.account.findUniqueOrThrow({
    where: { id: accountId },
    select: { initialBalance: true },
  })

  const [incomes, expenses] = await Promise.all([
    tx.transaction.aggregate({
      where: { accountId, type: 'INCOME',  status: 'EXECUTED' },
      _sum: { amount: true },
    }),
    tx.transaction.aggregate({
      where: { accountId, type: 'EXPENSE', status: 'EXECUTED' },
      _sum: { amount: true },
    }),
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

//* ── EXPORTS PÚBLICOS ──────────────────────────────────────────────────────────

/**
 * Registra un movimiento financiero (ingreso, gasto o transferencia).
 *
 * @reglas  R10 — actualiza el balance de la cuenta al finalizar
 *          R11 — si type=TRANSFER, genera 2 transactions en lugar de 1:
 *                  · EXPENSE en la cuenta origen
 *                  · INCOME  en la cuenta destino
 * @flujo   [1] Autenticar → [2] Validar → [3] Autorizar → [4] Ejecutar → [5] Revalidar
 * @param   formData  Objeto con: workspaceId, accountId, type, amount, date,
 *                    description?, projectId?, destinationAccountId? (solo TRANSFER)
 * @returns { success: true } o { error: string }
 */
export async function createTransaction(formData: unknown): Promise<ActionResult> {

  // ── [1/5] AUTENTICAR ────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  // ── [2/5] VALIDAR (Zod) ─────────────────────────────────────────────────────
  const parsed = createTransactionSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.name }
  const data = parsed.data

  const workspaceId = data.workspaceId

  // ── [3/5] AUTORIZAR ─────────────────────────────────────────────────────────
  // La cuenta debe pertenecer al usuario — evita que usuario A use la cuenta de B
  const [account, workspace] = await Promise.all([
    prisma.account.findFirst({
      where: { id: data.accountId, userId: session.user.id },
      select: { id: true, currency: true, name: true },
    }),
    prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
      select: { id: true },
    }),
  ])
  if (!account)   return { error: 'Cuenta no encontrada'    }
  if (!workspace) return { error: 'Workspace no encontrado' }

  // ── [4/5] EJECUTAR ──────────────────────────────────────────────────────────

  if (data.type === 'TRANSFER' && data.destinationAccountId) {
    // R11: TRANSFER → 2 transactions atómicas
    // Si falla cualquiera de las dos, se revierte todo (prisma.$transaction)
    const destAccount = await prisma.account.findFirst({
      where: { id: data.destinationAccountId, userId: session.user.id },
      select: { id: true, currency: true, name: true },
    })
    if (!destAccount) return { error: 'Cuenta destino no encontrada' }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          workspaceId: data.workspaceId,
          accountId:   data.accountId,
          type:        'EXPENSE',
          amount:      data.amount,
          currency:    account.currency,
          description: `Transferencia → ${destAccount.name}`,
          date:        new Date(data.date),
          status:      'EXECUTED',
        },
      })
      await tx.transaction.create({
        data: {
          workspaceId: data.workspaceId,
          accountId:   data.destinationAccountId!,
          type:        'INCOME',
          amount:      data.amount,
          currency:    destAccount.currency,
          description: `Transferencia ← ${account.name}`,
          date:        new Date(data.date),
          status:      'EXECUTED',
        },
      })
      // R10: recalcular ambas cuentas dentro de la misma transacción
      await recalculateBalance(tx, data.accountId)
      await recalculateBalance(tx, data.destinationAccountId!)
    })

  } else {
    // Ingreso o gasto simple
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          workspaceId: data.workspaceId,
          accountId:   data.accountId,
          projectId:   data.projectId,     // opcional: vincula a un proyecto
          type:        data.type,
          amount:      data.amount,
          currency:    account.currency,
          description: data.description,
          date:        new Date(data.date),
          status:      'EXECUTED',
        },
      })
      // R10: recalcular balance de la cuenta afectada
      await recalculateBalance(tx, data.accountId)
    })
  }

  // ── [5/5] REVALIDAR ─────────────────────────────────────────────────────────
  revalidatePath(`/workspace/${data.workspaceId}/finances`)
  return { success: true }
}

/**
 * Crea un gasto en cuotas y genera automáticamente las N transactions futuras.
 *
 * @regla   R9  — genera N transactions con status=SCHEDULED al crear el grupo
 * @regla   R14 — el cron diario (/api/cron) marca cada cuota como EXECUTED
 *                cuando llega su fecha; recién ahí impacta el balance
 * @detalle El monto de la última cuota absorbe el diferencial de redondeo
 *          para garantizar que: SUM(cuotas) === totalAmount exactamente.
 *          Ejemplo: $100 en 3 cuotas → $33.33, $33.33, $33.34
 * @flujo   [1] Autenticar → [2] Validar → [3] Autorizar → [4] Ejecutar → [5] Revalidar
 * @param   formData  Objeto con: workspaceId, accountId, description,
 *                    totalAmount, installmentCount, startDate
 * @returns { success: true } o { error: string }
 */
export async function createInstallmentGroup(formData: unknown): Promise<ActionResult> {

  // ── [1/5] AUTENTICAR ────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  // ── [2/5] VALIDAR ───────────────────────────────────────────────────────────
  const parsed = createInstallmentSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.name }
  const data = parsed.data

  // ── [3/5] AUTORIZAR ─────────────────────────────────────────────────────────
  const [account, workspace] = await Promise.all([
    prisma.account.findFirst({
      where: { id: data.accountId, userId: session.user.id },
      select: { id: true, currency: true },
    }),
    prisma.workspace.findFirst({
      where: { id: data.workspaceId, userId: session.user.id },
      select: { id: true },
    }),
  ])
  if (!account)   return { error: 'Cuenta no encontrada'    }
  if (!workspace) return { error: 'Workspace no encontrado' }

  // ── [4/5] EJECUTAR (atómico) ─────────────────────────────────────────────
  await prisma.$transaction(async (tx) => {

    // 4a. Crear el grupo padre
    const group = await tx.installmentGroup.create({
      data: {
        workspaceId:      data.workspaceId,
        accountId:        data.accountId,
        description:      data.description,
        totalAmount:      data.totalAmount,
        installmentCount: data.installmentCount,
        startDate:        new Date(data.startDate),
      },
    })

    // 4b. Calcular monto por cuota (redondeo a 2 decimales)
    const n         = data.installmentCount
    const baseAmt   = Math.floor((data.totalAmount / n) * 100) / 100
    const lastAmt   = data.totalAmount - baseAmt * (n - 1) // absorbe diferencial

    // 4c. Generar N transactions SCHEDULED (R9)
    // Cada cuota se programa para el mismo día del mes siguiente
    const start = new Date(data.startDate)

    for (let i = 0; i < n; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)

      await tx.transaction.create({
        data: {
          workspaceId:  data.workspaceId,
          accountId:    data.accountId,
          type:         'EXPENSE',
          amount:       i === n - 1 ? lastAmt : baseAmt,
          currency:     account.currency,
          description:  `${data.description} — Cuota ${i + 1}/${n}`,
          date:         dueDate,
          status:       'SCHEDULED',  // R14: el cron las ejecuta en su fecha
          isRecurring:  true,
          recurrenceId: group.id,     // vincula al grupo padre
        },
      })
    }
    // Nota: el balance NO se recalcula aquí.
    // Las cuotas SCHEDULED no impactan el balance hasta que el cron las ejecute (R14).
  })

  // ── [5/5] REVALIDAR ─────────────────────────────────────────────────────────
  revalidatePath(`/workspace/${data.workspaceId}/finances`)
  return { success: true }
}