import { prisma } from "@/lib/prisma";

export async function getWorkspace(workspaceId: string, userId: string) {
  return prisma.workspace.findFirst({
    where: { id: workspaceId, userId, isActive: true },
  });
}

export async function getWorkspacesWithMetrics (userId: string) {

}

