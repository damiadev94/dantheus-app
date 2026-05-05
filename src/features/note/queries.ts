// ─── Imports ──────────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";

// ─── Queries ──────────────────────────────────────────────────────────────────

// R5: notas globales pertenecen al usuario, visibles en cualquier workspace
export async function getGlobalNotes(userId: string) {
  return prisma.note.findMany({
    where: { userId, scope: "GLOBAL", status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
}

// R4: notas locales son exclusivas del workspace donde se crearon
export async function getWorkspaceNotes(workspaceId: string) {
  return prisma.note.findMany({
    where: { workspaceId, scope: "LOCAL", status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNote(noteId: string) {
  return prisma.note.findUnique({ where: { id: noteId } });
}
