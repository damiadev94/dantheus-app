// ─── Imports ──────────────────────────────────────────────────────────────────
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).default('PENDING'),
  projectId: z.string().min(1, "El ID del proyecto es requerido"),
});
