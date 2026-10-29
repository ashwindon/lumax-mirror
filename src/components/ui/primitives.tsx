"use client";

import type { ReactNode } from "react";
import { personById } from "@/domain/catalog/people";
import type { AlertKind, MachineStatus } from "@/domain/types";
import type { OrderHealth } from "@/live/selectors";

export function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <section className={`pointer-events-auto rounded-2xl border border-line bg-panel shadow-panel ${className}`}>
      {children}
    </section>
  );
}

export const statusLabel: Record<MachineStatus, string> = {
  running: "Running",
  waiting: "Waiting for work",
  setup: "In set-up",
  down: "Stopped",
};

export const statusColor: Record<MachineStatus, string> = {
  running: "var(--run)",
  waiting: "var(--faint)",
  setup: "var(--idle)",
  down: "var(--stop)",
};

export const alertKindLabel: Record<AlertKind, string> = {
  breakdown: "Breakdown",
  quality: "Quality hold",
  material: "Material short",
  setup: "Set-up",
};

export const alertColor = (kind: AlertKind) => (kind === "breakdown" || kind === "quality" ? "var(--stop)" : "var(--idle)");

export const healthColor: Record<OrderHealth, string> = { "on-track": "var(--run)", "at-risk": "var(--idle)", behind: "var(--stop)" };

export function Dot({ color, pulse = false, className = "size-2" }: { color: string; pulse?: boolean; className?: string }) {
  return <span className={`inline-block shrink-0 rounded-full ${pulse ? "animate-pulse" : ""} ${className}`} style={{ background: color }} />;
}

export function Chip({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{ color, background: `color-mix(in oklab, ${color} 13%, transparent)` }}
    >
      <Dot color={color} className="size-1.5" />
      {children}
    </span>
  );
}

export function Meter({ value, max, tone = "var(--accent)" }: { value: number; max: number; tone?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-line" role="presentation">
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="text-[12px] text-muted">{children}</p>;
}

export function Stat({ label, value, sub, children }: { label: string; value: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
      <Label>{label}</Label>
      <p className="font-stretch-semi-expanded text-[24px] font-semibold leading-none tabular-nums">{value}</p>
      {sub ? <p className="truncate text-[12px] text-muted">{sub}</p> : null}
      {children}
    </div>
  );
}

export function Avatar({ initials, className = "size-9 text-[12px]" }: { initials: string; className?: string }) {
  return <span className={`grid shrink-0 place-items-center rounded-full bg-ink font-semibold text-page ${className}`}>{initials}</span>;
}

/** A named person with a one-tap call, used wherever someone owns something. */
export function PersonRow({ personId, note }: { personId: string; note?: string }) {
  const person = personById[personId];
  if (!person) return null;
  return (
    <div className="flex items-center gap-3">
      <Avatar initials={person.initials} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-tight">{person.name}</p>
        <p className="truncate text-[12px] text-muted">{note ?? person.title}</p>
      </div>
      <a
        href={`tel:${person.extension}`}
        className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Call ext. {person.extension}
      </a>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-[13px] font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function TextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium whitespace-nowrap hover:bg-panel-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {children}
    </button>
  );
}
