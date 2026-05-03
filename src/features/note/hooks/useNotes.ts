"use client";

import { useState, useEffect } from "react";
import type { Note } from "../types";

export function useNotes(scope: "global" | "local", ownerId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch via SWR or React Query
    setIsLoading(false);
  }, [scope, ownerId]);

  return { notes, isLoading };
}
