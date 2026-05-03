import { PageHeader } from "@/components/layout/PageHeader";

export default async function ProjectsPage({
  params,
}: PageProps<"/workspace/[workspaceId]/projects">) {
  const { workspaceId } = await params;

  return (
    <div>
      <PageHeader title="Proyectos" description={`Workspace: ${workspaceId}`} />
    </div>
  );
}
