"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "./types";

export async function createWorkspace(userId: string, input: CreateWorkspaceInput) {
  const workspace = await prisma.workspace.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
    },
  });

  // R15: create the default General project automatically
  await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: "General",
      isGeneral: true,
    },
  });

  revalidatePath("/");
  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput
) {
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: input,
  });

  revalidatePath(`/workspace/${workspaceId}`);
  return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
  await prisma.workspace.delete({ where: { id: workspaceId } });
  revalidatePath("/");
}
