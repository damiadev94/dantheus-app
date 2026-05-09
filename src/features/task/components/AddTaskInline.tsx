"use client";

import { useRef, useTransition, useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/features/task/actions";
import { type TaskStatus } from "../types";

export function AddTaskInline({
  projectId,
  status,
}: {
  projectId: string;
  status: TaskStatus;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTask(formData);
      if (!result || !("error" in result)) {
        formRef.current?.reset();
        setOpen(false);
      }
    });
  }

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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="status" value={status} />

      <input
        name="title"
        placeholder="Título de la tarea…"
        autoFocus
        required
        disabled={isPending}
        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
      />

      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "…" : "Crear"}
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
