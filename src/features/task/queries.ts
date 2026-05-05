// ─── Imports ──────────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import type { TaskStatus } from "./types";

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTasks(projectId: string, status?: TaskStatus) {
  return prisma.task.findMany({
    where: { projectId, ...(status ? { status } : {}) },
    orderBy: { order: "asc" },
  });
}
