export type AccountType =
  | "CASH"
  | "BANK"
  | "DIGITAL_WALLET"
  | "CREDIT"
  | "INVESTMENT";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type TransactionStatus = "EXECUTED" | "SCHEDULED";

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  color: string | null;
  icon: string | null;
  isActive: boolean;
};

export type Transaction = {
  id: string;
  workspaceId: string;
  accountId: string;
  projectId: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string | null;
  date: Date;
  status: TransactionStatus;
  isRecurring: boolean;
  recurrenceId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTransactionInput = {
  accountId: string;
  projectId?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  date: Date;
  status?: TransactionStatus;
};

export type MonthlySummary = {
  income: number;
  expenses: number;
  savings: number;
  period: string;
};
