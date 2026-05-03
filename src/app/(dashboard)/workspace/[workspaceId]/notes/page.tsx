import { PageHeader } from "@/components/layout/PageHeader";

export default async function WorkspaceNotesPage({
  params,
}: PageProps<"/workspace/[workspaceId]/notes">) {
  const { workspaceId } = await params;

  return (
    <div>
      <PageHeader title="Notas" description={`Workspace: ${workspaceId}`} />
    </div>
  );
}
