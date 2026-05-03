"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "./types";

export async function createProject(
  workspaceId: string,
  input: CreateProjectInput
) {
  const project = await prisma.project.create({
    data: {
      workspaceId,
      name: input.name,
      description: input.description,
      status: input.status ?? "IDEA",
      clientId: input.clientId,
      categoryId: input.categoryId,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
      budgetCurrency: input.budgetCurrency,
    },
  });

  revalidatePath(`/workspace/${workspaceId}/projects`);
  return project;
}

export async function updateProject(
  projectId: string,
  workspaceId: string,
  input: UpdateProjectInput
) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: input,
  });

  revalidatePath(`/workspace/${workspaceId}/projects`);
  return project;
}

export async function deleteProject(projectId: string, workspaceId: string) {
  // R2: cannot delete the General project
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project?.isGeneral) throw new Error("No se puede eliminar el proyecto General");

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath(`/workspace/${workspaceId}/projects`);
}
