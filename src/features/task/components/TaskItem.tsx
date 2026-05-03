import type { Task } from "../types";

type Props = { task: Task };

export function TaskItem({ task }: Props) {
  return (
    <div className="flex items-center gap-3 rounded border p-3">
      <span className="flex-1 text-sm">{task.title}</span>
      <span className="text-xs text-gray-400">{task.status}</span>
    </div>
  );
}
