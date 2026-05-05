// ─── Imports ──────────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getClients(workspaceId: string) {
  return prisma.client.findMany({
    where: { workspaceId, isActive: true },
    orderBy: { name: "asc" },
  });
}

// ? Incluye proyectos — usar solo en vista de detalle de cliente
export async function getClient(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: { projects: true },
  });
}
