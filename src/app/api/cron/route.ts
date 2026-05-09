// ─── Imports ──────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Handler ──────────────────────────────────────────────────────────────────
// R14: ejecuta las transactions SCHEDULED cuya fecha ya pasó
// R10: recalcula el balance de cada cuenta afectada dentro de la misma transacción
export async function GET(request: Request) {
  // ! Guard: autenticación por Bearer token — Vercel Cron envía CRON_SECRET en el header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Obtener las transactions a ejecutar antes de actualizarlas — necesitamos los accountIds
  const toExecute = await prisma.transaction.findMany({
    where: { status: "SCHEDULED", date: { lte: today } },
    select: { accountId: true },
  });

  if (toExecute.length === 0) {
    return NextResponse.json({ executed: 0 });
  }

  // IDs únicos de cuentas afectadas
  const accountIds = [...new Set(toExecute.map((t) => t.accountId))];

  await prisma.$transaction(async (tx) => {
    // R14: marcar como EXECUTED todas las cuotas vencidas
    await tx.transaction.updateMany({
      where: { status: "SCHEDULED", date: { lte: today } },
      data: { status: "EXECUTED" },
    });

    // R10: recalcular balance para cada cuenta afectada
    for (const accountId of accountIds) {
      const account = await tx.account.findUniqueOrThrow({
        where: { id: accountId },
        select: { initialBalance: true },
      });

      const [incomes, expenses] = await Promise.all([
        tx.transaction.aggregate({
          where: { accountId, type: "INCOME", status: "EXECUTED" },
          _sum: { amount: true },
        }),
        tx.transaction.aggregate({
          where: { accountId, type: "EXPENSE", status: "EXECUTED" },
          _sum: { amount: true },
        }),
      ]);

      await tx.account.update({
        where: { id: accountId },
        data: {
          currentBalance:
            Number(account.initialBalance) +
            Number(incomes._sum.amount ?? 0) -
            Number(expenses._sum.amount ?? 0),
        },
      });
    }
  });

  return NextResponse.json({ executed: toExecute.length });
}
