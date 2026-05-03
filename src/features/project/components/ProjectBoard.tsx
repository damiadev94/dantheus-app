"use client";

import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";

type Props = { projects: Project[] };

export function ProjectBoard({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
