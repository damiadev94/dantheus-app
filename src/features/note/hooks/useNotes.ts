"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import { getNotes } from "../actions";

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotes(scope: "global" | "local", ownerId: string) {
  return useQuery({
    queryKey: ["notes", scope, ownerId],
    queryFn: async () => {
      const result = await getNotes(scope, ownerId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!ownerId,
  });
}
