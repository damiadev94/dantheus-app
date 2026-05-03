"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CreateTaskInput, UpdateTaskInput } from "./types";

export async function createTask(projectId: string, input: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      projectId,
      title: input.title,
      description: input.description,
      status: input.status ?? "PENDING",
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate,
    },
  });

  revalidatePath(`/workspace/[workspaceId]/projects/${projectId}`);
  return task;
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  return prisma.task.update({ where: { id: taskId }, data: input });
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({ where: { id: taskId } });
}

export async function reorderTasks(
  tasks: { id: string; order: number }[]
) {
  await prisma.$transaction(
    tasks.map((t) =>
      prisma.task.update({ where: { id: t.id }, data: { order: t.order } })
    )
  );
}
