"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CreateTransactionInput } from "./types";

export async function createTransaction(
  workspaceId: string,
  input: CreateTransactionInput
) {
  const account = await prisma.account.findUniqueOrThrow({
    where: { id: input.accountId },
  });

  const transaction = await prisma.transaction.create({
    data: {
      workspaceId,
      accountId: input.accountId,
      projectId: input.projectId,
      type: input.type,
      amount: input.amount,
      currency: account.currency,
      description: input.description,
      date: input.date,
      status: input.status ?? "EXECUTED",
    },
  });

  // R10: update currentBalance only for executed transactions
  if (transaction.status === "EXECUTED") {
    const delta =
      input.type === "INCOME" ? input.amount : -input.amount;
    await prisma.account.update({
      where: { id: input.accountId },
      data: { currentBalance: { increment: delta } },
    });
  }

  revalidatePath(`/workspace/${workspaceId}/finances`);
  return transaction;
}

export async function createInstallmentGroup(
  workspaceId: string,
  accountId: string,
  description: string,
  totalAmount: number,
  installmentCount: number,
  startDate: Date
) {
  const account = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
  });

  const group = await prisma.installmentGroup.create({
    data: {
      workspaceId,
      accountId,
      description,
      totalAmount,
      installmentCount,
      startDate,
    },
  });

  const installmentAmount = totalAmount / installmentCount;

  // R9: generate N scheduled transactions
  const transactions = Array.from({ length: installmentCount }, (_, i) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    return {
      workspaceId,
      accountId,
      type: "EXPENSE" as const,
      amount: installmentAmount,
      currency: account.currency,
      description: `${description} (cuota ${i + 1}/${installmentCount})`,
      date,
      status: "SCHEDULED" as const,
      recurrenceId: group.id,
    };
  });

  await prisma.transaction.createMany({ data: transactions });

  revalidatePath(`/workspace/${workspaceId}/finances`);
  return group;
}
