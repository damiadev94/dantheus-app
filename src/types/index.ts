// ─── Re-exports ───────────────────────────────────────────────────────────────
// Punto de entrada único para tipos globales — importar desde @/types en lugar de cada feature
export type { AuthUser, LoginInput, RegisterInput } from "@/features/auth/types";
export type { Workspace, CreateWorkspaceInput, UpdateWorkspaceInput } from "@/features/workspace/types";
export type { Project, ProjectStatus, CreateProjectInput, UpdateProjectInput } from "@/features/project/types";
export type { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from "@/features/task/types";
export type { Client, CreateClientInput, UpdateClientInput } from "@/features/client/types";
export type {
  Account,
  AccountType,
  Transaction,
  TransactionType,
  TransactionStatus,
  CreateTransactionInput,
  MonthlySummary,
} from "@/features/finance/types";
export type {
  Note,
  NoteType,
  NoteStatus,
  ScopeType,
  LearningStatus,
  CreateNoteInput,
  UpdateNoteInput,
} from "@/features/note/types";
