import { prisma } from "@/lib/prisma";

export async function getAccountBalance(accountId: string) {
  return prisma.account.findUnique({
    where: { id: accountId },
    select: { currentBalance: true, currency: true },
  });
}

export async function getMonthlySummary(workspaceId: string, period: string) {
  const [year, month] = period.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      workspaceId,
      status: "EXECUTED",
      date: { gte: start, lt: end },
      type: { in: ["INCOME", "EXPENSE"] },
    },
    select: { type: true, amount: true },
  });

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return { income, expenses, savings: income - expenses, period };
}

export async function getTransactions(workspaceId: string) {
  return prisma.transaction.findMany({
    where: { workspaceId },
    orderBy: { date: "desc" },
    take: 50,
  });
}
