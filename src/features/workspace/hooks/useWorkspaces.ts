"use client";

import { useState, useEffect } from "react";
import type { Workspace } from "../types";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch via SWR or React Query
    setIsLoading(false);
  }, []);

  return { workspaces, isLoading };
}
