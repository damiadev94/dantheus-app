"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import type { Workspace } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  workspaces: Workspace[];
  currentWorkspaceId: string;
};

// ─── Component ────────────────────────────────────────────────────────────────
export function WorkspaceSwitcher({ workspaces, currentWorkspaceId }: Props) {
  return (
    <select
      defaultValue={currentWorkspaceId}
      className="rounded border px-2 py-1 text-sm"
    >
      {workspaces.map((ws) => (
        <option key={ws.id} value={ws.id}>
          {ws.name}
        </option>
      ))}
    </select>
  );
}
