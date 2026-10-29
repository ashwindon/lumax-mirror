"use client";

import { useMemo, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { scopeFor, type Scope } from "@/domain/access";
import { personById } from "@/domain/catalog/people";

// Demo sign-in: picks a persona and remembers it in this browser. Real identity
// (SSO with the customer's directory) replaces this without touching the scope rules.
type SessionState = {
  userId: string | null;
  signIn: (userId: string) => void;
  signOut: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      userId: null,
      signIn: (userId) => set({ userId }),
      signOut: () => set({ userId: null }),
    }),
    { name: "mirror-session", skipHydration: true },
  ),
);

export function useSessionHydrated() {
  return useSyncExternalStore(
    (cb) => useSession.persist.onFinishHydration(cb),
    () => useSession.persist.hasHydrated(),
    () => false,
  );
}

export function useScope(): Scope | null {
  const userId = useSession((s) => s.userId);
  return useMemo(() => (userId && personById[userId] ? scopeFor(personById[userId]) : null), [userId]);
}
