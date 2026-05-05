"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { SessionProvider } from "next-auth/react";

// ─── Component ────────────────────────────────────────────────────────────────
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
