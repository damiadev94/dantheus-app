import { prisma } from "@/lib/prisma";

export async function getWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getWorkspace(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
}
