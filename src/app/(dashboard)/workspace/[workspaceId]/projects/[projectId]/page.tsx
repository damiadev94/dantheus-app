import { PageHeader } from "@/components/layout/PageHeader";

export default async function ProjectDetailPage({
  params,
}: PageProps<"/workspace/[workspaceId]/projects/[projectId]">) {
  const { workspaceId, projectId } = await params;

  return (
    <div>
      <PageHeader
        title="Detalle del Proyecto"
        description={`Proyecto ${projectId} · Workspace ${workspaceId}`}
      />
    </div>
  );
}
