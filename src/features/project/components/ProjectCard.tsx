import Link from "next/link";
import { CheckSquare2 } from "lucide-react";

// ─── Estilos y etiquetas por estado ──────────────────────────────────────────
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

// ─── Tipo de dato que acepta la tarjeta ──────────────────────────────────────
// Coincide con el select que hace getProjectsByWorkspace()
export type ProjectCardData = {
  id: string;
  name: string;
  status: keyof typeof STATUS_LABELS;
  description: string | null;
  isGeneral: boolean;
  workspaceId: string;
  client: { name: string } | null;
  category: { name: string; color: string | null } | null;
  _count: { tasks: number };
};

// ─── Componente ──────────────────────────────────────────────────────────────
export function ProjectCard({ project }: { project: ProjectCardData }) {
  // Muestra el cliente o la categoría (solo uno puede existir a la vez — R1)
  const label = project.client?.name ?? project.category?.name;

  return (
    <Link
      href={`/workspace/${project.workspaceId}/projects/${project.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm hover:border-primary/30"
    >
      {/* Fila superior: nombre + badge de estado */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 font-medium text-foreground transition-colors group-hover:text-primary">
          {project.name}
        </h3>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[project.status]}`}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* Descripción (opcional) */}
      {project.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {project.description}
        </p>
      )}

      {/* Fila inferior: cliente/categoría + contador de tareas */}
      <div className="mt-auto flex items-center justify-between gap-2">
        {label && (
          <span className="truncate text-xs text-muted-foreground">{label}</span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <CheckSquare2 size={11} />
          {project._count.tasks}
        </span>
      </div>
    </Link>
  );
}
