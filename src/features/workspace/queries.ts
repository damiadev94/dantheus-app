// ─── Imports ──────────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getWorkspace(workspaceId: string, userId: string) {
  return prisma.workspace.findFirst({
    where: { id: workspaceId, userId, isActive: true },
  });
}

export async function getWorkspacesWithMetrics(_userId: string) {
  // TODO: implementar métricas (tareas pendientes, transacciones del mes)
}
