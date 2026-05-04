// ─────────────────────────────────────────────────────────────────────────────
// Layout del área autenticada. Se aplica a todas las rutas bajo (dashboard).
// Responsabilidades:
//   1. Verificar que hay sesión activa (si no → redirigir a /login)
//   2. Renderizar el sidebar y la estructura visual principal
// ─────────────────────────────────────────────────────────────────────────────
 
import { redirect }     from 'next/navigation'
import { auth }         from '@/lib/auth'
import { Sidebar }      from '@/components/layout/Sidebar'
import { prisma }       from '@/lib/prisma'
 
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar sesión — si no hay sesión, redirigir a login
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
 
  // Obtener los workspaces activos del usuario para el sidebar
  // Solo traemos los campos necesarios para el selector de workspaces
  const workspaces = await prisma.workspace.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      // Contamos las tareas pendientes para mostrar el badge en el sidebar
      projects: {
        select: {
          tasks: {
            where: { status: 'PENDING' },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
 
  // Calculamos el conteo de tareas pendientes por workspace
  const workspacesWithCount = workspaces.map(ws => ({
    ...ws,
    pendingTasksCount: ws.projects.reduce(
      (acc, project) => acc + project.tasks.length,
      0
    ),
  }))
 
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar: navegación global + selector de workspaces */}
      <Sidebar
        userId={session.user.id}
        userName={session.user.name ?? ''}
        workspaces={workspacesWithCount}
      />
      {/* Área principal: contenido de cada página */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}