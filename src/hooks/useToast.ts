"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      // Auto-dismiss a los 4s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
