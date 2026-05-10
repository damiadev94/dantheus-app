"use client";

import { useRef, useTransition, useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/features/task/actions";
import { type TaskStatus } from "../types";

export function AddTaskInline({
  projectId,
  // status: columna del kanban donde se creara la tarea
  status,
}: {
  projectId: string;
  status: TaskStatus;
}) {
  // ─── Estado ────────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);              // controla si el form esta visible
  const [isPending, startTransition] = useTransition(); // true mientras espera al server
  const formRef = useRef<HTMLFormElement>(null);         // para hacer reset al enviar

  // ─── Envio del formulario ──────────────────────────────────────────────────
  function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTask(formData);
      // Si no hubo error, limpiar y cerrar
      if (!result || !("error" in result)) {
        formRef.current?.reset();
        setOpen(false);
      }
    });
  }

  // ─── Vista colapsada (boton "+ Agregar tarea") ─────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Plus size={12} />
        Agregar tarea
      </button>
    );
  }

  // ─── Vista expandida (formulario inline) ──────────────────────────────────
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      {/* Campos ocultos: le dicen al server donde crear la tarea */}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="status" value={status} />

      {/* Titulo — autoFocus para escribir directamente al abrir */}
      <input
        name="title"
        placeholder="Titulo de la tarea..."
        autoFocus
        required
        disabled={isPending}
        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
      />

      {/* Acciones */}
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "..." : "Crear"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
