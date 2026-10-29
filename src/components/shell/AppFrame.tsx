"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Scope } from "@/domain/access";
import { LiveFeed } from "@/live/store";
import { useScope, useSession, useSessionHydrated } from "@/store/session";
import { TopBar } from "./TopBar";

const ScopeContext = createContext<Scope | null>(null);

/** The signed-in user's scope. Only usable below <AppFrame>. */
export function useUserScope(): Scope {
  const scope = useContext(ScopeContext);
  if (!scope) throw new Error("useUserScope must be used inside <AppFrame>");
  return scope;
}

export function AppFrame({ children }: { children: ReactNode }) {
  const hydrated = useSessionHydrated();
  const scope = useScope();
  const router = useRouter();

  useEffect(() => {
    void useSession.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (hydrated && !scope) router.replace("/sign-in");
  }, [hydrated, scope, router]);

  if (!hydrated || !scope) return <div className="h-dvh bg-page" />;

  return (
    <ScopeContext value={scope}>
      <LiveFeed />
      <div className="relative h-dvh w-full overflow-hidden bg-page text-ink">
        {children}
        <TopBar />
      </div>
    </ScopeContext>
  );
}
