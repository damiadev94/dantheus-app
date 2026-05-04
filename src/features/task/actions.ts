'use server'

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTaskSchema } from "@/lib/validations/task"

export async function createTask(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const parsed = createTaskSchema.safeParse(formData)
  if (!parsed.success) return {error: parsed.error.message}

  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, workspace: { userId: session.user.id } },
    select: { id: true, workspaceId: true }
  })

  if (!project) return { error: "Proyecto no encontrado" }

  const lastTask = await prisma.task.findFirst({
    where: { projectId: project.id },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  const newTask = await prisma.task.create({
    data: {... parsed.data, order: (lastTask ? lastTask.order + 1 : 0) }
  })

  revalidatePath(`/workspace/${project.workspaceId}/projects`)
  return { newTask }
}

// ── updateTaskStatus ───────────────────────────────────────────────────────────
// Actualiza el estado de una tarea. Se llama desde el kanban al arrastrar.
export async function updateTaskStatus(
  taskId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
 
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: { workspace: { userId: session.user.id } },
    },
    select: { id: true, project: { select: { workspaceId: true } } },
  })
  if (!task) return { error: 'Tarea no encontrada' }
 
  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  })
 
  revalidatePath(`/workspace/${task.project.workspaceId}/projects`)
  return { success: true }
}

export async function deleteTask(taskId: string) {

}

