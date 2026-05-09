"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspace } from "@/features/workspace/actions";

const COLORS = [
  "#6366F1", "#0EA5E9", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6",
];

export default function NewWorkspacePage() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setError(null);
    startTransition(async () => {
      const result = await createWorkspace({ ...data, color: selectedColor });
      if (result && "error" in result) {
        setError(result.error);
      }
      // En éxito, createWorkspace hace redirect() internamente
    });
  }

  return (
    <div className="flex min-h-full items-start justify-center px-8 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-lg font-semibold text-foreground">
          Nuevo workspace
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Cada workspace es un contexto de negocio independiente.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Nombre *
            </label>
            <input
              name="name"
              placeholder="Ej: SaaS, Freelance, YouTube…"
              required
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Descripción
            </label>
            <textarea
              name="description"
              placeholder="Para qué es este workspace (opcional)"
              rows={2}
              disabled={isPending}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-foreground">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="size-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    outline: selectedColor === color ? `2px solid ${color}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Creando…" : "Crear workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
