import { PageHeader } from "@/components/layout/PageHeader";

export default async function WorkspacePage({
  params,
}: PageProps<"/workspace/[workspaceId]">) {
  const { workspaceId } = await params;

  return (
    <div>
      <PageHeader title="Workspace" description={`ID: ${workspaceId}`} />
    </div>
  );
}
