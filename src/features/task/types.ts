export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & { order?: number };
