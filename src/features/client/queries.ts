import { prisma } from "@/lib/prisma";

export async function getClients(workspaceId: string) {
  return prisma.client.findMany({
    where: { workspaceId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getClient(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: { projects: true },
  });
}
