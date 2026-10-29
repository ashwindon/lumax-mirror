"use client";

import { useState } from "react";
import type { VelocityWeek } from "@/live/sprint";
import { LegendSwatch, Tooltip, hoursLabel, niceMax, useWidth } from "./common";

const M = { left: 6, right: 6, top: 18, bottom: 20 };

const weekLabel = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/** Committed against done hours, week by week; this week shows done so far and its forecast. */
export function Velocity({ weeks, height = 132 }: { weeks: VelocityWeek[]; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const yMax = niceMax(Math.max(...weeks.map((w) => Math.max(w.committed, w.done, w.forecast ?? 0))));
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const band = plotW / weeks.length;
  const bar = Math.min(12, (band - 10) / 2);
  const y = (v: number) => M.top + plotH - (v / yMax) * plotH;
  const h = (v: number) => Math.max(0, (v / yMax) * plotH);
  const current = weeks.find((w) => w.current);
  const focus = hover !== null ? weeks[hover] : null;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        <LegendSwatch color="var(--chart-ref)">Committed</LegendSwatch>
        <LegendSwatch color="var(--chart-actual)">Done</LegendSwatch>
        <span className="inline-flex items-center gap-1.5">
          <svg width="10" height="10" aria-hidden>
            <rect x="1.5" y="1.5" width="7" height="7" rx="2" fill="none" stroke="var(--chart-actual)" strokeDasharray="2 2" />
          </svg>
          Forecast
        </span>
      </figcaption>
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 ? (
          <svg width={width} height={height} role="img" aria-label="Committed and done hours for the last weeks">
            <line x1={M.left} x2={M.left + plotW} y1={y(0)} y2={y(0)} stroke="var(--chart-grid)" />
            {weeks.map((w, i) => {
              const cx = M.left + band * i + band / 2;
              const radius = 3;
              return (
                <g
                  key={w.weekStart}
                  tabIndex={0}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="outline-none"
                  opacity={hover === null || hover === i ? 1 : 0.55}
                >
                  <rect x={cx - band / 2} y={M.top} width={band} height={plotH} fill="transparent" />
                  <path d={column(cx - bar - 1, y(w.committed), bar, h(w.committed), radius)} fill="var(--chart-ref)" />
                  {w.current && w.forecast !== undefined && w.forecast > w.done ? (
                    <path
                      d={column(cx + 1, y(w.forecast), bar, h(w.forecast), radius)}
                      fill="none"
                      stroke="var(--chart-actual)"
                      strokeDasharray="3 2"
                    />
                  ) : null}
                  <path d={column(cx + 1, y(w.done), bar, h(w.done), radius)} fill="var(--chart-actual)" />
                  <text x={cx} y={height - 5} textAnchor="middle" className={`text-[10px] ${w.current ? "fill-ink font-semibold" : "fill-faint"}`}>
                    {w.current ? "This week" : weekLabel(w.weekStart)}
                  </text>
                </g>
              );
            })}
            {current ? (
              <text x={M.left + band * (weeks.length - 0.5)} y={Math.max(11, y(Math.max(current.committed, current.forecast ?? 0)) - 5)} textAnchor="middle" className="fill-ink text-[11px] font-semibold">
                {Math.round((current.done / Math.max(1, current.committed)) * 100)}%
              </text>
            ) : null}
          </svg>
        ) : null}
        {focus ? (
          <Tooltip x={M.left + band * (hover! + 0.5)} y={M.top} width={width}>
            <p className="text-faint">{focus.current ? "This week so far" : `Week of ${weekLabel(focus.weekStart)}`}</p>
            <p>
              <span className="font-semibold tabular-nums">{hoursLabel(focus.done)}</span> <span className="text-muted">done of {hoursLabel(focus.committed)}</span>
            </p>
            {focus.current && focus.forecast !== undefined ? (
              <p>
                <span className="font-semibold tabular-nums">{hoursLabel(focus.forecast)}</span> <span className="text-muted">forecast by Monday</span>
              </p>
            ) : (
              <p className="text-muted">{Math.round((focus.done / Math.max(1, focus.committed)) * 100)}% of commitment</p>
            )}
          </Tooltip>
        ) : null}
      </div>
      <table className="sr-only">
        <caption>Committed and done hours by week (earlier weeks are simulated)</caption>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.weekStart}>
              <td>{w.current ? "This week" : weekLabel(w.weekStart)}</td>
              <td>{Math.round(w.committed)} committed</td>
              <td>{Math.round(w.done)} done</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Column with a rounded top and a square base on the axis. */
function column(x: number, top: number, w: number, h: number, r: number) {
  if (h <= 0) return "";
  const rr = Math.min(r, h, w / 2);
  const bottom = top + h;
  return `M${x},${bottom}V${top + rr}Q${x},${top} ${x + rr},${top}H${x + w - rr}Q${x + w},${top} ${x + w},${top + rr}V${bottom}Z`;
}
