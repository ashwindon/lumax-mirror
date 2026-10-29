"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { plants } from "@/domain/catalog/plants";
import { canSeePlant } from "@/domain/access";
import { plantClock } from "@/lib/format";
import { tenant } from "@/lib/tenant";
import { useLive } from "@/live/store";
import { plantHealth } from "@/live/selectors";
import { useSession } from "@/store/session";
import { useTwin, type Lens } from "@/store/twin";
import { Avatar, Dot, Panel, statusColor } from "@/components/ui/primitives";
import { useUserScope } from "./AppFrame";

/** Mirror's own mark: a lamp and its beam. Not Lumax's logo. */
export function BrandMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`shrink-0 ${className}`} aria-hidden>
      <path d="M4 8h9a12 12 0 0 1 0 24H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" fill={tenant.accent} />
      <path d="M22 13h15M24 20h14M22 27h15" stroke={tenant.accent} strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

function subscribeClock(onTick: () => void) {
  const t = setInterval(onTick, 1000);
  return () => clearInterval(t);
}

function LiveClock() {
  const time = useSyncExternalStore(subscribeClock, () => plantClock(Date.now()), () => "--:--");
  return (
    <span
      className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12px] tabular-nums text-muted max-sm:hidden"
      title="Plants, OEMs and programmes are real; quantities, stops, machines and people are simulated."
    >
      <Dot color="var(--run)" className="size-1.5" pulse />
      Simulated · {time} IST
    </span>
  );
}

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function PlantMenu() {
  const scope = useUserScope();
  const pathname = usePathname();
  const snap = useLive((s) => s.snap);
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const current = plants.find((p) => pathname === `/plants/${p.code.toLowerCase()}`);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`rounded-xl px-3 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-ink ${current ? "bg-panel-strong text-ink shadow-sm" : "text-muted hover:text-ink"}`}
      >
        {current ? `${current.code} ${current.name}` : "Plants"}
      </button>
      {open ? (
        <div className="absolute top-full left-0 z-30 mt-2 w-[320px] rounded-2xl border border-line bg-panel-strong p-1.5 shadow-panel">
          {plants.map((p) => {
            const allowed = canSeePlant(scope, p.code);
            const health = snap ? plantHealth(snap, p.code) : null;
            const inner = (
              <>
                <Dot color={health ? statusColor[health.worst] : "var(--faint)"} />
                <span className="w-8 font-semibold tabular-nums">{p.code}</span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                {allowed ? (
                  health && health.alerts > 0 ? (
                    <span className="text-[12px] text-muted">
                      {health.alerts} alert{health.alerts > 1 ? "s" : ""}
                    </span>
                  ) : null
                ) : (
                  <span className="text-[12px] text-faint">No access</span>
                )}
              </>
            );
            return allowed ? (
              <Link
                key={p.code}
                href={`/plants/${p.code.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] hover:bg-panel focus-visible:outline-2 focus-visible:outline-ink"
              >
                {inner}
              </Link>
            ) : (
              <div key={p.code} className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-faint">
                {inner}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const views = [
  { href: "/", label: "Network" },
  { href: "/sprint", label: "Sprint board" },
  { href: "/brief", label: "Briefing" },
];

/** On a phone the views collapse into one menu named after where you are. */
function CompactNav() {
  const scope = useUserScope();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const plant = plants.find((p) => pathname === `/plants/${p.code.toLowerCase()}`);
  const current = plant ? plant.code : (views.find((v) => v.href === pathname)?.label ?? "Menu");
  const item = "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-ink";
  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl bg-panel-strong px-3 py-1.5 text-[13px] font-medium shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
      >
        <span className="truncate">{current}</span>
        <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-muted" aria-hidden>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="absolute top-full left-0 z-30 mt-2 max-h-[70dvh] w-[260px] scroller overflow-y-auto rounded-2xl border border-line bg-panel-strong p-1.5 shadow-panel">
          {views.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              onClick={() => setOpen(false)}
              className={`${item} font-medium ${pathname === v.href ? "bg-panel" : "hover:bg-panel"}`}
            >
              {v.label}
            </Link>
          ))}
          <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold text-muted">Plants</p>
          {plants.map((p) =>
            canSeePlant(scope, p.code) ? (
              <Link
                key={p.code}
                href={`/plants/${p.code.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className={`${item} ${plant?.code === p.code ? "bg-panel" : "hover:bg-panel"}`}
              >
                <span className="w-8 font-semibold tabular-nums">{p.code}</span>
                <span className="truncate">{p.name}</span>
              </Link>
            ) : (
              <div key={p.code} className={`${item} text-faint`}>
                <span className="w-8 font-semibold tabular-nums">{p.code}</span>
                <span className="truncate">No access</span>
              </div>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

function UserMenu() {
  const { user, summary } = useUserScope();
  const signOut = useSession((s) => s.signOut);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 hover:bg-panel-strong focus-visible:outline-2 focus-visible:outline-ink"
      >
        <Avatar initials={user.initials} className="size-8 text-[12px]" />
        <span className="hidden text-left lg:block">
          <span className="block text-[13px] font-semibold leading-tight">{user.name}</span>
          <span className="block text-[12px] leading-tight text-muted">{user.title}</span>
        </span>
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-30 mt-2 w-[280px] rounded-2xl border border-line bg-panel-strong p-3 shadow-panel">
          <p className="text-[13px] font-semibold">{user.name}</p>
          <p className="text-[12px] text-muted">{user.title}</p>
          <p className="mt-2 text-[12px] text-muted">You can see: {summary}.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="flex-1 rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium hover:bg-panel focus-visible:outline-2 focus-visible:outline-ink"
            >
              Switch person
            </button>
            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace("/sign-in");
              }}
              className="flex-1 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LensSwitch() {
  const lens = useTwin((s) => s.lens);
  const setLens = useTwin((s) => s.setLens);
  const options: { key: Lens; label: string; short: string }[] = [
    { key: "live", label: "Right now", short: "Now" },
    { key: "sprint", label: "This week", short: "Week" },
  ];
  return (
    <div className="flex gap-0.5 rounded-xl border border-line p-0.5" role="group" aria-label="What the views show">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={lens === o.key}
          onClick={() => setLens(o.key)}
          className="rounded-[10px] px-2.5 py-1 text-[12px] font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink aria-pressed:bg-panel-strong aria-pressed:text-ink aria-pressed:shadow-sm"
        >
          <span className="max-sm:hidden">{o.label}</span>
          <span className="sm:hidden">{o.short}</span>
        </button>
      ))}
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4">
      <Panel className="flex items-center gap-3 px-3 py-2">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg pr-2 focus-visible:outline-2 focus-visible:outline-ink">
          <BrandMark />
          <span className="font-stretch-semi-expanded text-[15px] font-bold tracking-tight max-md:hidden">{tenant.name}</span>
        </Link>
        <div className="min-w-0 border-l border-line pl-3 md:hidden">
          <CompactNav />
        </div>
        <nav className="flex min-w-0 items-center gap-1 border-l border-line pl-3 whitespace-nowrap max-md:hidden" aria-label="Views">
          <Link
            href="/"
            className={`rounded-xl px-3 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-ink ${pathname === "/" ? "bg-panel-strong text-ink shadow-sm" : "text-muted hover:text-ink"}`}
          >
            Network
          </Link>
          <PlantMenu />
          <Link
            href="/sprint"
            className={`rounded-xl px-3 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-ink ${pathname === "/sprint" ? "bg-panel-strong text-ink shadow-sm" : "text-muted hover:text-ink"}`}
          >
            Sprint board
          </Link>
          <Link
            href="/brief"
            className={`rounded-xl px-3 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-ink ${pathname === "/brief" ? "bg-panel-strong text-ink shadow-sm" : "text-muted hover:text-ink"}`}
          >
            Briefing
          </Link>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {pathname === "/sprint" || pathname === "/brief" ? null : <LensSwitch />}
          <LiveClock />
          <UserMenu />
        </div>
      </Panel>
    </header>
  );
}
