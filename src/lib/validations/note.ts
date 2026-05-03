import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(300),
  type: z.enum(["NOTE", "RESOURCE", "LEARNING"]),
  scope: z.enum(["GLOBAL", "LOCAL"]),
  url: z.string().url().optional(),
  learningStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
});

export type CreateNoteSchema = z.infer<typeof createNoteSchema>;
