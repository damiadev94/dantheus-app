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
  isGeneral: boolean;
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
