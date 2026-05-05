"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useParams } from "next/navigation";

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWorkspace() {
  const params = useParams();
  return { workspaceId: params.workspaceId as string };
}
