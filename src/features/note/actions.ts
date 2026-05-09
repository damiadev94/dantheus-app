"use server";

// ─── Imports ──────────────────────────────────────────────────────────────────
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CreateNoteInput, UpdateNoteInput } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Verifica ownership para GLOBAL (userId directo) y LOCAL (workspace.userId)
async function authorizeNote(noteId: string, userId: string) {
  return prisma.note.findFirst({
    where: {
      id: noteId,
      OR: [
        { userId },
        { workspace: { userId } },
      ],
    },
    select: { id: true },
  });
}

// ─── Actions ──────────────────────────────────────────────────────────────────

// ownerKey determina el scope: { userId } = GLOBAL, { workspaceId } = LOCAL (R4, R5)
export async function createNote(
  ownerKey: { userId: string } | { workspaceId: string },
  input: CreateNoteInput
) {
  // * 1. Autenticar
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // * 2. Autorizar — el ownerKey debe pertenecer al usuario en sesión
  if ("userId" in ownerKey) {
    // R5: nota global — el userId debe ser el del usuario en sesión
    if (ownerKey.userId !== session.user.id) return { error: "No autorizado" };
  } else {
    // R4: nota local — el workspace debe pertenecer al usuario
    const ws = await prisma.workspace.findFirst({
      where: { id: ownerKey.workspaceId, userId: session.user.id },
    });
    if (!ws) return { error: "Workspace no encontrado" };
  }

  // * 3. Ejecutar
  const note = await prisma.note.create({
    data: {
      ...ownerKey,
      title: input.title,
      content: input.content as Prisma.InputJsonValue ?? undefined,
      type: input.type,
      scope: input.scope,
      url: input.url,
      learningStatus: input.learningStatus,
    },
  });

  revalidatePath("/library");
  return { data: note };
}

export async function updateNote(noteId: string, input: UpdateNoteInput) {
  // * 1. Autenticar
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // * 2. Autorizar
  const note = await authorizeNote(noteId, session.user.id);
  if (!note) return { error: "Nota no encontrada" };

  // * 3. Ejecutar
  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      title: input.title,
      status: input.status,
      url: input.url,
      learningStatus: input.learningStatus,
      content: input.content as Prisma.InputJsonValue | undefined,
    },
  });

  revalidatePath("/library");
  return { data: updated };
}

export async function archiveNote(noteId: string) {
  // * 1. Autenticar
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // * 2. Autorizar
  const note = await authorizeNote(noteId, session.user.id);
  if (!note) return { error: "Nota no encontrada" };

  // * 3. Ejecutar
  await prisma.note.update({
    where: { id: noteId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/library");
  return { success: true };
}
