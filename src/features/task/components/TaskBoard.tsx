"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import type { Task } from "../types";
import { TaskItem } from "./TaskItem";

// ─── Constants ────────────────────────────────────────────────────────────────
// CANCELLED excluido del kanban — se gestiona desde la vista de detalle
const COLUMNS: Task["status"][] = ["PENDING", "IN_PROGRESS", "DONE"];

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = { tasks: Task[] };

// ─── Component ────────────────────────────────────────────────────────────────
export function TaskBoard({ tasks }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {COLUMNS.map((status) => (
        <div key={status} className="min-w-65">
          <h4 className="mb-3 text-sm font-medium text-gray-600">{status}</h4>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status === status)
              .map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
