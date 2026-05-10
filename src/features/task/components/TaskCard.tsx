"use client";

import { useTransition } from "react";
import { updateTaskStatus, deleteTask } from "@/features/task/actions";
import { type TaskStatus, type TaskPriority } from "../types";
import { Trash2 } from "lucide-react";

// ─── Estilos y etiquetas por prioridad ───────────────────────────────────────
const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW:    "bg-slate-100 text-slate-500",
  MEDIUM: "bg-amber-50 text-amber-600",
  HIGH:   "bg-red-50 text-red-600",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW:    "Baja",
  MEDIUM: "Media",
  HIGH:   "Alta",
};

// Opciones del selector de estado (mover la tarjeta entre columnas)
const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "PENDING",     label: "Pendiente"   },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "DONE",        label: "Listo"       },
  { value: "CANCELLED",   label: "Cancelado"   },
];

// ─── Tipo de dato que recibe la tarjeta ──────────────────────────────────────
type Props = {
  task: {
    id: string;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date | null;
  };
};

// ─── Componente ──────────────────────────────────────────────────────────────
export function TaskCard({ task }: Props) {
  // isPending = true mientras se espera respuesta del server (bloquea interaccion)
  const [isPending, startTransition] = useTransition();

  // Cambia la columna de la tarea al seleccionar otro estado
  function moveTask(status: TaskStatus) {
    // void: startTransition espera funcion void, pero updateTaskStatus retorna Promise
    startTransition(() => { void updateTaskStatus(task.id, status) });
  }

  // Elimina la tarea y revalida la pagina
  function handleDelete() {
    startTransition(() => { void deleteTask(task.id) });
  }

  // ─── Vista ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`group rounded-md border border-border bg-background p-3 space-y-2.5 transition-opacity ${
        isPending ? "opacity-40 pointer-events-none" : "" // bloquear mientras carga
      }`}
    >
      {/* Titulo de la tarea */}
      <p className="text-sm text-foreground leading-snug">{task.title}</p>

      {/* Fila inferior: badge de prioridad + selector de estado + boton eliminar */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[task.priority]}`}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>

        <div className="flex items-center gap-1">
          {/* Selector de estado — al cambiar mueve la tarjeta a otra columna */}
          <select
            value={task.status}
            onChange={(e) => moveTask(e.target.value as TaskStatus)}
            disabled={isPending}
            className="cursor-pointer border-0 bg-transparent text-[11px] text-muted-foreground focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Boton eliminar — visible solo al hacer hover sobre la tarjeta */}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
