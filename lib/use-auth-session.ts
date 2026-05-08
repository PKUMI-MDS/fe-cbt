"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutParticipant } from "@/lib/auth-api";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuthSession() {
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch {
      clearAuthToken();
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSession = useCallback(
    async (token: string) => {
      setAuthToken(token);
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      if (getAuthToken()) {
        await logoutParticipant();
      }
    } finally {
      clearAuthToken();
      setUser(null);
      setStatus("unauthenticated");
      router.push("/login");
    }
  }, [router]);

  return {
    isAuthenticated: status === "authenticated",
    logout,
    refresh,
    saveSession,
    status,
    user,
  };
}
