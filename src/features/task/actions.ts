'use server'

// ─── Imports ──────────────────────────────────────────────────────────────────
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTaskSchema } from "@/lib/validations/task"

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  // * 1. Autenticar
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  // * 2. Validar — Zod v4 no parsea FormData nativo; convertir primero
  const raw = Object.fromEntries(formData.entries())
  const parsed = createTaskSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.message }

  // * 3. Autorizar
  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, workspace: { userId: session.user.id } },
    select: { id: true, workspaceId: true }
  })
  if (!project) return { error: "Proyecto no encontrado" }

  // * 4. Ejecutar — order = último + 1 para mantener posición en el kanban
  const lastTask = await prisma.task.findFirst({
    where: { projectId: project.id },
    orderBy: { order: 'desc' },
    select: { order: true }
  })
  const newTask = await prisma.task.create({
    data: { ...parsed.data, order: (lastTask ? lastTask.order + 1 : 0) }
  })

  // * 5. Revalidar
  revalidatePath(`/workspace/${project.workspaceId}/projects`)
  return { newTask }
}

// Se llama desde el kanban al arrastrar una tarjeta entre columnas
export async function updateTaskStatus(
  taskId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
) {
  // * 1. Autenticar
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  // * 2. Autorizar
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { workspace: { userId: session.user.id } } },
    select: { id: true, project: { select: { workspaceId: true } } },
  })
  if (!task) return { error: 'Tarea no encontrada' }

  // * 3. Ejecutar
  await prisma.task.update({ where: { id: taskId }, data: { status } })

  revalidatePath(`/workspace/${task.project.workspaceId}/projects`)
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { workspace: { userId: session.user.id } } },
    select: { id: true, project: { select: { workspaceId: true } } },
  })
  if (!task) return { error: "Tarea no encontrada" }

  await prisma.task.delete({ where: { id: taskId } })
  revalidatePath(`/workspace/${task.project.workspaceId}/projects`)
  return { success: true }
}
