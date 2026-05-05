// ─── Types ────────────────────────────────────────────────────────────────────
export type NoteType = "NOTE" | "RESOURCE" | "LEARNING";
export type NoteStatus = "ACTIVE" | "ARCHIVED";
// ? scope determina ownership: GLOBAL → userId presente, LOCAL → workspaceId presente (R4, R5)
export type ScopeType = "GLOBAL" | "LOCAL";
export type LearningStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type Note = {
  id: string;
  userId: string | null;      // presente si scope=GLOBAL
  workspaceId: string | null; // presente si scope=LOCAL
  title: string;
  content: unknown | null;    // JSON de Tiptap
  type: NoteType;
  scope: ScopeType;
  status: NoteStatus;
  url: string | null;
  learningStatus: LearningStatus | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateNoteInput = {
  title: string;
  content?: unknown;
  type: NoteType;
  scope: ScopeType;
  url?: string;
  learningStatus?: LearningStatus;
};

export type UpdateNoteInput = Partial<Pick<Note, "title" | "content" | "status" | "learningStatus" | "url">>;
