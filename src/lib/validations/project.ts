import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(["IDEA", "ACTIVE", "PAUSED", "CLOSED"]).default("IDEA"),
  clientId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.number().positive().optional(),
  budgetCurrency: z.string().length(3).optional(),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
