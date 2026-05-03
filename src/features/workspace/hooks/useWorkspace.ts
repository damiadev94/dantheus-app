"use client";

import { useParams } from "next/navigation";

export function useWorkspace() {
  const params = useParams();
  return { workspaceId: params.workspaceId as string };
}
