"use server";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CreateClientInput, UpdateClientInput } from "./types";

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createClient(workspaceId: string, input: CreateClientInput) {
  // * 1. Autenticar
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // * 2. Autorizar — el workspace debe pertenecer al usuario
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  });
  if (!ws) return { error: "Workspace no encontrado" };

  // * 3. Ejecutar
  const client = await prisma.client.create({
    data: { workspaceId, ...input },
  });

  revalidatePath(`/workspace/${workspaceId}/clients`);
  return { data: client };
}

export async function updateClient(
  clientId: string,
  workspaceId: string,
  input: UpdateClientInput
) {
  // * 1. Autenticar
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // * 2. Autorizar — el cliente debe pertenecer a un workspace del usuario
  const existing = await prisma.client.findFirst({
    where: { id: clientId, workspace: { userId: session.user.id } },
    select: { id: true },
  });
  if (!existing) return { error: "Cliente no encontrado" };

  // * 3. Ejecutar
  const client = await prisma.client.update({
    where: { id: clientId },
    data: input,
  });

  revalidatePath(`/workspace/${workspaceId}/clients`);
  return { data: client };
}
