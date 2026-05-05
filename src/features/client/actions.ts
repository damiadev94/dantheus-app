"use server";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CreateClientInput, UpdateClientInput } from "./types";

// ─── Actions ──────────────────────────────────────────────────────────────────
// ! Falta autenticación y autorización — cualquier llamada puede crear/editar clientes ajenos

export async function createClient(workspaceId: string, input: CreateClientInput) {
  const client = await prisma.client.create({
    data: { workspaceId, ...input },
  });

  revalidatePath(`/workspace/${workspaceId}/clients`);
  return client;
}

export async function updateClient(
  clientId: string,
  workspaceId: string,
  input: UpdateClientInput
) {
  const client = await prisma.client.update({
    where: { id: clientId },
    data: input,
  });

  revalidatePath(`/workspace/${workspaceId}/clients`);
  return client;
}
