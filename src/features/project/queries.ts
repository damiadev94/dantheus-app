// ─── Imports ──────────────────────────────────────────────────────────────────
import { prisma } from '@/lib/prisma'

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProjectsByWorkspace(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    include: {
      client:   { select: { name: true } },
      category: { select: { name: true, color: true } },
      _count:   { select: { tasks: true } },
    },
    orderBy: [
      { isGeneral: 'asc' }, // el proyecto General va al final
      { createdAt: 'desc' },
    ],
  })
}

// ? Incluye tasks completas — usar solo en vista de detalle, no en listados
export async function getTasksByProject(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
  })

  // Agrupamos en memoria para evitar múltiples queries al kanban
  return {
    pending:    tasks.filter(t => t.status === 'PENDING'),
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS'),
    done:       tasks.filter(t => t.status === 'DONE'),
    cancelled:  tasks.filter(t => t.status === 'CANCELLED'),
  }
}

export async function getPendingTasksByWorkspace(workspaceId: string) {
  return prisma.task.findMany({
    where: {
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      project: { workspaceId },
    },
    include: {
      project: { select: { name: true, isGeneral: true } },
    },
    orderBy: [
      { priority: 'desc' }, // HIGH primero
      { dueDate: 'asc' },
    ],
    take: 10, // limitado para el widget del dashboard
  })
}
