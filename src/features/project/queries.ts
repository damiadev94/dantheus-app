import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "./types";

export async function getProjects(workspaceId: string, status?: ProjectStatus) {
  return prisma.project.findMany({
    where: {
      workspaceId,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: true, client: true, category: true },
  });
}
