export type NoteType = "NOTE" | "RESOURCE" | "LEARNING";
export type NoteStatus = "ACTIVE" | "ARCHIVED";
export type ScopeType = "GLOBAL" | "LOCAL";
export type LearningStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type Note = {
  id: string;
  userId: string | null;
  workspaceId: string | null;
  title: string;
  content: unknown | null;
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
