// ─── Imports ──────────────────────────────────────────────────────────────────
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────
export const createTransactionSchema = z.object({
  workspaceId: z.string().cuid(),
  accountId: z.string().cuid(),
  projectId: z.string().cuid().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().positive("El monto debe ser positivo"),
  description: z.string().max(500).optional(),
  date: z.coerce.date(),
  status: z.enum(["EXECUTED", "SCHEDULED"]).default("EXECUTED"),
  destinationAccountId: z.string().cuid().optional(), // solo para type=TRANSFER (R11)
});

export const createInstallmentSchema = z.object({
  accountId: z.string().cuid(),
  workspaceId: z.string().cuid(),
  description: z.string().min(1),
  totalAmount: z.number().positive(),
  installmentCount: z.number().int().min(2).max(60),
  startDate: z.coerce.date(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;
export type CreateInstallmentSchema = z.infer<typeof createInstallmentSchema>;
