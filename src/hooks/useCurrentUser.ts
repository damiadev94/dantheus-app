"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useSession } from "next-auth/react";
import type { AuthUser } from "@/features/auth/types";

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCurrentUser(): { user: AuthUser | null; isLoading: boolean } {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        avatarUrl: session.user.image ?? null,
      }
    : null;

  return {
    user,
    isLoading: status === "loading",
  };
}
