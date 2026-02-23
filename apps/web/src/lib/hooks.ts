"use client";

import { useEffect } from "react";
import { getCurrentUser } from "../lib/api/auth.api";
import { useAuthStore } from "../lib/store/useAuthStore";

export function useAuthHydration() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    async function hydrate() {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setHydrated(true);
      }
    }

    hydrate();
  }, [setUser, setHydrated]);
}
