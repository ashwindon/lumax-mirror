"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Width of an element, kept in sync with layout, so charts draw at real pixel size. */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** "0", "450", "1.2K" for axis ticks. */
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K` : `${Math.round(n)}`);

export const hoursLabel = (h: number) => (h >= 100 ? `${Math.round(h)} h` : `${h.toFixed(1)} h`);

/** Nice upper bound for an axis: 1, 2 or 5 times a power of ten. */
export function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

export function LegendLine({ color, dashed = false, children }: { color: string; dashed?: boolean; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="16" height="6" aria-hidden>
        <line x1="1" y1="3" x2="15" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={dashed ? "3 3" : undefined} />
      </svg>
      {children}
    </span>
  );
}

export function LegendSwatch({ color, children, shape = "rect" }: { color: string; children: ReactNode; shape?: "rect" | "triangle" }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="10" height="10" aria-hidden>
        {shape === "rect" ? <rect x="1" y="1" width="8" height="8" rx="2" fill={color} /> : <path d="M5 9 1 2h8Z" fill={color} />}
      </svg>
      {children}
    </span>
  );
}

/** Tooltip box placed in chart-local pixels, kept inside the chart. */
export function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const boxWidth = 180;
  const left = Math.min(Math.max(0, x + 12), Math.max(0, width - boxWidth));
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 rounded-lg border border-line bg-panel-strong px-2.5 py-2 text-[12px] shadow-panel"
      style={{ left, top: y, width: boxWidth }}
    >
      {children}
    </div>
  );
}
