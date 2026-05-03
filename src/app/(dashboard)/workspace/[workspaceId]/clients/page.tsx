import { PageHeader } from "@/components/layout/PageHeader";

export default async function ClientsPage({
  params,
}: PageProps<"/workspace/[workspaceId]/clients">) {
  const { workspaceId } = await params;

  return (
    <div>
      <PageHeader title="Clientes" description={`Workspace: ${workspaceId}`} />
    </div>
  );
}
