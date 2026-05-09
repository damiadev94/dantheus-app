// ─── Imports ──────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Orden de limpieza ────────────────────────────────────────────────────────
// Las tablas se borran de hoja a raíz para respetar las foreign keys
const tablesToClear = [
  'noteTag',
  'noteProject',
  'transactionTag',
  'transaction',
  'installmentGroup',
  'task',
  'project',
  'client',
  'workspaceGoal',
  'note',
  'tag',
  'workspace',
  'account',
  'user',
]

// ─── Hooks de Vitest ──────────────────────────────────────────────────────────

export async function setup() {
  for (const table of tablesToClear) {
    await (prisma as any)[table].deleteMany()
  }
}

export async function teardown() {
  for (const table of tablesToClear) {
    await (prisma as any)[table].deleteMany()
  }
  await prisma.$disconnect()
}
