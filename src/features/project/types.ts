// ─── Types ────────────────────────────────────────────────────────────────────
// ? R1: clientId XOR categoryId — un proyecto pertenece a un cliente O a una categoría, nunca ambos
export type ProjectStatus = "IDEA" | "ACTIVE" | "PAUSED" | "CLOSED";

export type Project = {
  id: string;
  workspaceId: string;
  clientId: string | null;
  categoryId: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  budgetCurrency: string | null;
  isGeneral: boolean; // R2: si true, no puede eliminarse
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  status?: ProjectStatus;
  clientId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  budgetCurrency?: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;
