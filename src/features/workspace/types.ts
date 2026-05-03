export type Workspace = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateWorkspaceInput = {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
};

export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput> & {
  isActive?: boolean;
};
