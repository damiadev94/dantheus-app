"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import { getWorkspaces } from "../actions";

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const result = await getWorkspaces();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}
