// ─── Imports ──────────────────────────────────────────────────────────────────
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>;
