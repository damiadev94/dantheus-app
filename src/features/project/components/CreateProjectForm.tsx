"use client";

import { useState, useTransition, useRef } from "react";
import { X } from "lucide-react";
import { createProject } from "@/features/project/actions";

export function CreateProjectForm({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setError(null);
    startTransition(async () => {
      const result = await createProject(data);
      if (result && "error" in result) {
        setError(result.error ?? "Error al crear proyecto");
      } else {
        formRef.current?.reset();
        onClose();
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
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
        <input type="hidden" name="workspaceId" value={workspaceId} />

        <input
          name="name"
          placeholder="Nombre del proyecto *"
          required
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />

        <textarea
          name="description"
          placeholder="Descripción (opcional)"
          rows={2}
          disabled={isPending}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />

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

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

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
            {isPending ? "Creando…" : "Crear proyecto"}
          </button>
        </div>
      </form>
    </div>
  );
}
