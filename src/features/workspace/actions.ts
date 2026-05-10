'use server'
 
import { revalidatePath } from 'next/cache'
import { redirect }       from 'next/navigation'
import { auth }           from '@/lib/auth'
import { prisma }         from '@/lib/prisma'
import { createWorkspaceSchema } from '@/lib/validations/workspace'
 
// ── createWorkspace ────────────────────────────────────────────────────────────
// Crea un nuevo workspace con su proyecto General incluido.
// Implementa R15: al crear un workspace se crea automáticamente Project{isGeneral:true}
// La creación es atómica: o se crean ambos o ninguno (transacción de DB).
// Acepta FormData (form nativo) y objeto plano (componente cliente) — Zod no parsea FormData directamente
export async function createWorkspace(formData: FormData | Record<string, unknown>) {

  // ETAPA 1 — Autenticar
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autorizado' }
  const userId = session.user.id

  // ETAPA 2 — Validar
  const raw = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData
  const parsed = createWorkspaceSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.name }
  }
  const { name, description, color, icon } = parsed.data

  // ETAPA 3 — Autorizar (implícito: userId viene de la sesión, no del cliente)

  // ETAPA 4 — Ejecutar en transacción atómica
  // prisma.$transaction garantiza que si falla la creación del proyecto General,
  // también se revierte la creación del workspace (R15, R3)
  const workspace = await prisma.$transaction(async (tx) => {
    // Crear el workspace
    const ws = await tx.workspace.create({
      data: {
        userId,
        name,
        description,
        color: color ?? '#7F77DD',
        icon,
      },
    })
 
    // Crear el proyecto General automáticamente (R15)
    // Este proyecto NO puede eliminarse (R2) y es único por workspace (R3)
    await tx.project.create({
      data: {
        workspaceId: ws.id,
        name: 'General',
        isGeneral: true,
        status: 'ACTIVE',
        // Sin clientId ni categoryId: es el proyecto especial
      },
    })
 
    return ws
  })
 
  // ETAPA 5 — Revalidar y redirigir al nuevo workspace
  revalidatePath('/')
  redirect(`/workspace/${workspace.id}`)
}
 
// ── updateWorkspace ────────────────────────────────────────────────────────────
export async function updateWorkspace(workspaceId: string, formData: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
 
  const parsed = createWorkspaceSchema.partial().safeParse(formData)
  if (!parsed.success) return { error: parsed.error.name }
 
  // Verificar que el workspace pertenece al usuario (autorización)
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  })
  if (!workspace) return { error: 'Workspace no encontrado' }
 
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: parsed.data,
  })
 
  revalidatePath(`/workspace/${workspaceId}`)
  return { success: true }
}
 
// ── deleteWorkspace ────────────────────────────────────────────────────────────
// Implementa R7: eliminar workspace elimina todas sus entidades locales en cascada.
// La cascada está configurada en el schema de Prisma (onDelete: Cascade).
export async function deleteWorkspace(workspaceId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
 
  // Verificar que el workspace pertenece al usuario
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  })
  if (!workspace) return { error: 'Workspace no encontrado' }
 
  // La eliminación en cascada borra: projects, tasks, transactions, notes locales, tags locales
  // Las entidades globales (accounts, notes globales) NO se ven afectadas (R8)
  await prisma.workspace.delete({ where: { id: workspaceId } })
 
  revalidatePath('/')
  redirect('/')
}