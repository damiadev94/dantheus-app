// ─── Imports ──────────────────────────────────────────────────────────────────
import type { Workspace } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  workspace: Workspace;
};

// ─── Component ────────────────────────────────────────────────────────────────
export function WorkspaceCard({ workspace }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{workspace.name}</h3>
      {workspace.description && (
        <p className="mt-1 text-sm text-gray-500">{workspace.description}</p>
      )}
    </div>
  );
}
