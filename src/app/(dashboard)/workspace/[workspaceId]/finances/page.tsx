import { PageHeader } from "@/components/layout/PageHeader";

export default async function FinancesPage({
  params,
}: PageProps<"/workspace/[workspaceId]/finances">) {
  const { workspaceId } = await params;

  return (
    <div>
      <PageHeader title="Finanzas" description={`Workspace: ${workspaceId}`} />
    </div>
  );
}
