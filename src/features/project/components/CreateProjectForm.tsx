"use client";

import { useState, useTransition, useRef } from "react";
import { X } from "lucide-react";
import { createProject } from "@/features/project/actions";

export function CreateProjectForm({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  // onClose: se llama cuando el form se cierra (cancel o exito)
  onClose: () => void;
}) {
  // ─── Estado ────────────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition(); // isPending = true mientras espera al server
  const formRef = useRef<HTMLFormElement>(null);         // referencia para hacer reset del form

  // ─── Envio del formulario ──────────────────────────────────────────────────
  function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    // Zod no parsea FormData nativo — convertir antes de pasar a la action
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setError(null);
    startTransition(async () => {
      const result = await createProject(data);
      if (result && "error" in result) {
        // Mostrar error inline bajo el form
        setError(result.error ?? "Error al crear proyecto");
      } else {
        formRef.current?.reset();
        onClose(); // cierra el panel y refresca la lista
      }
    });
  }

  // ─── Vista ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-lg border border-border bg-card p-5">

      {/* Encabezado con boton de cerrar */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Nuevo proyecto</h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        {/* workspaceId oculto — el server lo usa para saber a que workspace pertenece */}
        <input type="hidden" name="workspaceId" value={workspaceId} />

        {/* Nombre */}
        <input
          name="name"
          placeholder="Nombre del proyecto *"
          required
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />

        {/* Descripcion */}
        <textarea
          name="description"
          placeholder="Descripcion (opcional)"
          rows={2}
          disabled={isPending}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />

        {/* Estado inicial */}
        <select
          name="status"
          defaultValue="IDEA"
          disabled={isPending}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        >
          <option value="IDEA">Idea</option>
          <option value="ACTIVE">Activo</option>
          <option value="PAUSED">Pausado</option>
        </select>

        {/* Error de servidor */}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Creando..." : "Crear proyecto"}
          </button>
        </div>
      </form>
    </div>
  );
}
