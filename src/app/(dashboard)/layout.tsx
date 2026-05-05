// ─── Imports ──────────────────────────────────────────────────────────────────
import { redirect } from 'next/navigation'
import { auth }     from '@/lib/auth'
import { Sidebar }  from '@/components/layout/Sidebar'
import { prisma }   from '@/lib/prisma'

// ─── Layout ───────────────────────────────────────────────────────────────────
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ! Guard: sin sesión activa redirige a /login
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // * Cargar workspaces para el sidebar — solo campos necesarios para el selector
  const workspaces = await prisma.workspace.findMany({
    where: { userId: session.user.id, isActive: true },
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      projects: {
        select: {
          // Solo tareas PENDING para calcular el badge de cada workspace
          tasks: { where: { status: 'PENDING' }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const workspacesWithCount = workspaces.map(ws => ({
    ...ws,
    pendingTasksCount: ws.projects.reduce((acc, p) => acc + p.tasks.length, 0),
  }))

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar
        userId={session.user.id}
        userName={session.user.name ?? ''}
        workspaces={workspacesWithCount}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
