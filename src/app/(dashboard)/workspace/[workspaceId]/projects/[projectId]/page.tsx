import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTasksByProject } from "@/features/project/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskCard } from "@/features/task/components/TaskCard";
import { AddTaskInline } from "@/features/task/components/AddTaskInline";
import { type TaskStatus } from "@/features/task/types";
import { ChevronLeft } from "lucide-react";

// ─── Columnas del kanban ──────────────────────────────────────────────────────
// Cada columna tiene su estado de tarea, etiqueta y color de fondo
const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "PENDING",     label: "Pendiente",   color: "bg-slate-50 border-slate-200"     },
  { status: "IN_PROGRESS", label: "En progreso", color: "bg-blue-50 border-blue-200"       },
  { status: "DONE",        label: "Listo",       color: "bg-emerald-50 border-emerald-200" },
  { status: "CANCELLED",   label: "Cancelado",   color: "bg-red-50 border-red-200"         },
];

// ─── Estilos y etiquetas del estado del proyecto ──────────────────────────────
const STATUS_STYLES = {
  IDEA:   "bg-slate-100 text-slate-600",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PAUSED: "bg-amber-50 text-amber-700",
  CLOSED: "bg-red-50 text-red-600",
} as const;

const STATUS_LABELS = {
  IDEA:   "Idea",
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  CLOSED: "Cerrado",
} as const;

export default async function ProjectDetailPage({
  params,
}: PageProps<"/workspace/[workspaceId]/projects/[projectId]">) {
  const { workspaceId, projectId } = await params;

  // ─── Autenticacion ────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // ─── Carga de datos ───────────────────────────────────────────────────────
  // Verificar que el proyecto pertenece al usuario via workspace
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspace: { userId: session.user.id } },
    select: { id: true, name: true, status: true, description: true, workspaceId: true },
  });

  if (!project) notFound();

  // Tareas ya separadas por estado para mapear directamente a cada columna
  const tasks = await getTasksByProject(projectId);

  // ─── Agrupar tareas por columna ───────────────────────────────────────────
  const tasksByStatus: Record<TaskStatus, typeof tasks.pending> = {
    PENDING:     tasks.pending,
    IN_PROGRESS: tasks.inProgress,
    DONE:        tasks.done,
    CANCELLED:   tasks.cancelled,
  };

  // ─── Vista ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        eyebrow="Proyectos"
        title={project.name}
        description={project.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            {/* Badge con el estado actual del proyecto */}
            <span
              className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[project.status as keyof typeof STATUS_STYLES]}`}
            >
              {STATUS_LABELS[project.status as keyof typeof STATUS_LABELS]}
            </span>
            {/* Boton volver a la lista de proyectos */}
            <Link
              href={`/workspace/${workspaceId}/projects`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={14} />
              Proyectos
            </Link>
          </div>
        }
      />

      {/* Kanban: scroll horizontal si hay muchas columnas */}
      <div className="flex flex-1 gap-3 overflow-x-auto px-8 py-6">
        {COLUMNS.map(({ status, label, color }) => {
          const columnTasks = tasksByStatus[status];
          return (
            <div
              key={status}
              className={`flex w-64 shrink-0 flex-col rounded-lg border p-3 ${color}`}
            >
              {/* Encabezado de columna: nombre + contador */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <span className="rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                  {columnTasks.length}
                </span>
              </div>

              {/* Lista de tarjetas de tarea */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={{
                      id:       task.id,
                      title:    task.title,
                      priority: task.priority,
                      status:   task.status,
                      dueDate:  task.dueDate,
                    }}
                  />
                ))}
              </div>

              {/* Boton/form para agregar tarea al final de cada columna */}
              <div className="mt-2 border-t border-current/10 pt-2">
                <AddTaskInline projectId={projectId} status={status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
