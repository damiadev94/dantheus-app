"use client";

import { useState, useEffect } from "react";
import type { AuthUser } from "@/features/auth/types";

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch session from NextAuth
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}
