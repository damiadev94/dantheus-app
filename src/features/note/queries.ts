import { prisma } from "@/lib/prisma";

export async function getGlobalNotes(userId: string) {
  return prisma.note.findMany({
    where: { userId, scope: "GLOBAL", status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getWorkspaceNotes(workspaceId: string) {
  return prisma.note.findMany({
    where: { workspaceId, scope: "LOCAL", status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNote(noteId: string) {
  return prisma.note.findUnique({ where: { id: noteId } });
}
