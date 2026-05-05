"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import type { Note } from "../types";

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotes(scope: "global" | "local", ownerId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: reemplazar con TanStack Query
    setIsLoading(false);
  }, [scope, ownerId]);

  return { notes, isLoading };
}
