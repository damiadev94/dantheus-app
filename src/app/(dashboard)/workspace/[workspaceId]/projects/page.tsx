"use client";
// Client Component porque necesita estado para mostrar/ocultar el formulario

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { getProjectsByWorkspace } from "@/features/project/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectCard, type ProjectCardData } from "@/features/project/components/ProjectCard";
import { CreateProjectForm } from "@/features/project/components/CreateProjectForm";

export default function ProjectsPage() {
  // ─── Parametros de la URL ──────────────────────────────────────────────────
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  // ─── Estado ────────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [showForm, setShowForm] = useState(false); // controla si se muestra el form
  const [loading, setLoading] = useState(true);

  // ─── Carga de datos ────────────────────────────────────────────────────────
  // Se re-ejecuta al cerrar el form (showForm cambia a false) para refrescar la lista
  useEffect(() => {
    getProjectsByWorkspace(workspaceId).then((data) => {
      setProjects(data as ProjectCardData[]);
      setLoading(false);
    });
  }, [workspaceId, showForm]);

  // Ocultar el proyecto General (solo es visible en el kanban)
  const visible = projects.filter((p) => !p.isGeneral);

  // ─── Vista ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Proyectos"
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} />
            Nuevo proyecto
          </button>
        }
      />

      <div className="px-8 py-6 space-y-5">
        {/* Formulario de creacion (se muestra al presionar el boton) */}
        {showForm && (
          <CreateProjectForm
            workspaceId={workspaceId}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Skeleton mientras carga | lista vacia | grilla de tarjetas */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg border border-border bg-muted"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-foreground">Sin proyectos</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Crea tu primer proyecto con el boton de arriba
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
