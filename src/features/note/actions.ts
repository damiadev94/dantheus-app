"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CreateNoteInput, UpdateNoteInput } from "./types";

export async function createNote(
  ownerKey: { userId: string } | { workspaceId: string },
  input: CreateNoteInput
) {
  const note = await prisma.note.create({
    data: {
      ...ownerKey,
      title: input.title,
      content: input.content ?? undefined,
      type: input.type,
      scope: input.scope,
      url: input.url,
      learningStatus: input.learningStatus,
    },
  });

  revalidatePath("/library");
  return note;
}

export async function updateNote(noteId: string, input: UpdateNoteInput) {
  return prisma.note.update({ where: { id: noteId }, data: input });
}

export async function archiveNote(noteId: string) {
  return prisma.note.update({
    where: { id: noteId },
    data: { status: "ARCHIVED" },
  });
}
