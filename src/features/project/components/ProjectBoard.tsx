"use client";

import { ProjectCard, type ProjectCardData } from "./ProjectCard";

type Props = { projects: ProjectCardData[] };

export function ProjectBoard({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
