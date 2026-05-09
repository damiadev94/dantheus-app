import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getWorkspace } from "@/features/workspace/queries";
import { getProjectsByWorkspace, getPendingTasksByWorkspace } from "@/features/project/queries";
import { getMonthlySummary } from "@/features/finance/queries";
import { getCurrentPeriod, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectCard } from "@/features/project/components/ProjectCard";
import { FolderKanban, ListTodo, TrendingUp, ArrowRight } from "lucide-react";

export default async function WorkspacePage({
  params,
}: PageProps<"/workspace/[workspaceId]">) {
  const { workspaceId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [workspace, projects, pendingTasks, summary] = await Promise.all([
    getWorkspace(workspaceId, session.user.id),
    getProjectsByWorkspace(workspaceId),
    getPendingTasksByWorkspace(workspaceId),
    getMonthlySummary(workspaceId, getCurrentPeriod()),
  ]);

  if (!workspace) notFound();

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const visibleProjects = projects.filter((p) => !p.isGeneral).slice(0, 6);

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title={workspace.name}
        description={workspace.description ?? undefined}
        actions={
          <Link
            href={`/workspace/${workspaceId}/projects`}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Ver proyectos
            <ArrowRight size={14} />
          </Link>
        }
      />

      <div className="px-8 py-6 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<FolderKanban size={16} className="text-primary" />}
            label="Proyectos activos"
            value={activeProjects}
          />
          <StatCard
            icon={<ListTodo size={16} className="text-amber-500" />}
            label="Tareas pendientes"
            value={pendingTasks.length}
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-emerald-500" />}
            label="Ingresos del mes"
            value={formatCurrency(summary.income)}
          />
        </div>

        {/* Projects grid */}
        {visibleProjects.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Proyectos</h2>
              <Link
                href={`/workspace/${workspaceId}/projects`}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Tareas pendientes
            </h2>
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 px-4 py-2.5"
                >
                  <p className="text-sm text-foreground">{task.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {task.project.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleProjects.length === 0 && pendingTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban size={32} className="mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Workspace vacío</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Creá tu primer proyecto para empezar
            </p>
            <Link
              href={`/workspace/${workspaceId}/projects`}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Crear proyecto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
