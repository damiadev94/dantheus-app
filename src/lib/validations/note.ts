// ─── Imports ──────────────────────────────────────────────────────────────────
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────
// ? scope=GLOBAL → userId presente; scope=LOCAL → workspaceId presente (R4, R5)
export const createNoteSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(300),
  type: z.enum(["NOTE", "RESOURCE", "LEARNING"]),
  scope: z.enum(["GLOBAL", "LOCAL"]),
  url: z.string().url().optional(),
  learningStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type CreateNoteSchema = z.infer<typeof createNoteSchema>;
