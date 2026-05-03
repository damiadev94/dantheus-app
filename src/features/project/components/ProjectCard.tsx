import type { Project } from "../types";

type Props = { project: Project };

export function ProjectCard({ project }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{project.name}</h3>
      <span className="text-xs text-gray-500">{project.status}</span>
    </div>
  );
}
