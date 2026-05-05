"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import type { Workspace } from "../types";

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: reemplazar con TanStack Query
    setIsLoading(false);
  }, []);

  return { workspaces, isLoading };
}
