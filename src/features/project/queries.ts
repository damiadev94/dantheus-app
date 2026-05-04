import { prisma } from '@/lib/prisma'
 
// Proyectos de un workspace con conteo de tareas por estado
export async function getProjectsByWorkspace(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    include: {
      client:   { select: { name: true } },
      category: { select: { name: true, color: true } },
      _count: {
        select: {
          tasks: true,
          // Contamos solo tareas pendientes para el badge
        },
      },
    },
    orderBy: [
      { isGeneral: 'asc' }, // el General va al final
      { createdAt: 'desc' },
    ],
  })
}
 
// Tareas de un proyecto agrupadas por estado (para el kanban)
export async function getTasksByProject(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
  })
 
  // Agrupamos en memoria para evitar múltiples queries
  return {
    pending:    tasks.filter(t => t.status === 'PENDING'),
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS'),
    done:       tasks.filter(t => t.status === 'DONE'),
    cancelled:  tasks.filter(t => t.status === 'CANCELLED'),
  }
}
 
// Tareas pendientes de todos los proyectos del workspace (para el dashboard)
export async function getPendingTasksByWorkspace(workspaceId: string) {
  return prisma.task.findMany({
    where: {
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      project: { workspaceId },
    },
    include: {
      project: {
        select: { name: true, isGeneral: true },
      },
    },
    orderBy: [
      { priority: 'desc' }, // HIGH primero
      { dueDate: 'asc' },   // más urgentes primero
    ],
    take: 10, // limitamos para el dashboard
  })
}