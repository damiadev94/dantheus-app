export type Client = {
  id: string;
  workspaceId: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateClientInput = {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type UpdateClientInput = Partial<CreateClientInput> & {
  isActive?: boolean;
};
