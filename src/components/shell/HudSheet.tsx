"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const WIDE = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Whether the screen is wide enough for panels down both sides of a 3D view. */
export function useWideScreen() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => true);
}

/**
 * The HUD of a 3D view on a phone or narrow window: a bar along the bottom that
 * says what matters in one line and opens into the panels, so the scene stays
 * visible until the reader asks for detail.
 */
export function HudSheet({ summary, open, onToggle, children }: { summary: ReactNode; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 flex max-h-[calc(100dvh-92px)] flex-col gap-2">
      {open ? <div className="hud-column pointer-events-auto max-h-[58dvh] rounded-2xl">{children}</div> : null}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="pointer-events-auto flex min-h-12 shrink-0 items-center gap-3 rounded-2xl border border-line bg-panel-strong px-4 py-2.5 text-left shadow-panel focus-visible:outline-2 focus-visible:outline-ink"
      >
        <span className="min-w-0 flex-1 text-[13px]">{summary}</span>
        <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-muted">
          {open ? "Hide" : "Details"}
          <svg viewBox="0 0 12 12" className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
            <path d="M2.5 7.5 6 4l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}
