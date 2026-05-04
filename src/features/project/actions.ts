'use server'
 
import { revalidatePath } from 'next/cache'
import { auth }           from '@/lib/auth'
import { prisma }         from '@/lib/prisma'
import { createProjectSchema } from '@/lib/validations/project'
 
// ── createProject ──────────────────────────────────────────────────────────────
export async function createProject(formData: unknown) {
 
  // ETAPA 1 — Autenticar
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
 
  // ETAPA 2 — Validar (incluye R1: clientId XOR categoryId via .refine())
  const parsed = createProjectSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.name }
  }
  const workspaceId = parsed.data.workspaceId // workspaceId es un campo oculto en el formulario, no viene del cliente
 
  // ETAPA 3 — Autorizar: el workspace pertenece al usuario
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  })
  if (!workspace) return { error: 'Workspace no encontrado' }
 
  // ETAPA 4 — Crear el proyecto
  const project = await prisma.project.create({ data: parsed.data })
 
  // ETAPA 5 — Revalidar
  revalidatePath(`/workspace/${parsed.data.workspaceId}/projects`)
  return { project }
}
 
// ── updateProjectStatus ────────────────────────────────────────────────────────
// Actualiza el estado de un proyecto (idea → active → paused → closed)
export async function updateProjectStatus(
  projectId: string,
  status: 'IDEA' | 'ACTIVE' | 'PAUSED' | 'CLOSED'
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
 
  // Verificar autorización via workspace
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: { userId: session.user.id },
    },
    select: { id: true, workspaceId: true },
  })
  if (!project) return { error: 'Proyecto no encontrado' }
 
  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  })
 
  revalidatePath(`/workspace/${project.workspaceId}/projects`)
  return { success: true }
}
 
// ── deleteProject ──────────────────────────────────────────────────────────────
// Implementa R2: el proyecto General (isGeneral=true) no puede eliminarse.
export async function deleteProject(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
 
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: { userId: session.user.id },
    },
    select: { id: true, workspaceId: true, isGeneral: true },
  })
  if (!project) return { error: 'Proyecto no encontrado' }
 
  // R2: el proyecto General no puede eliminarse
  if (project.isGeneral) {
    return { error: 'El proyecto General no puede eliminarse' }
  }
 
  // La cascada elimina también todas las tareas del proyecto
  await prisma.project.delete({ where: { id: projectId } })
 
  revalidatePath(`/workspace/${project.workspaceId}/projects`)
  return { success: true }
}