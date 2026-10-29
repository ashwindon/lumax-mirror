"use client";

import { useState } from "react";
import { machineById } from "@/domain/catalog/machines";
import type { StopMarker } from "@/domain/types";
import type { BurndownPoint, SprintTotals } from "@/live/sprint";
import { LegendLine, LegendSwatch, Tooltip, compact, hoursLabel, niceMax, useWidth } from "./common";

const WEEK_HOURS = 168;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const M = { left: 34, right: 12, top: 16, bottom: 20 };

const when = (hour: number) => {
  const day = DAYS[Math.min(6, Math.floor(hour / 24))];
  const clock = (6 + Math.floor(hour % 24)) % 24;
  return `${day} ${String(clock).padStart(2, "0")}:00`;
};

/**
 * Remaining committed hours through the week against an even plan, with a
 * forecast from the last day's pace and the long stops pinned along the top.
 */
export function Burndown({
  points,
  totals,
  markers,
  height = 168,
}: {
  points: BurndownPoint[];
  totals: SprintTotals;
  markers: (StopMarker & { hour: number })[];
  height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ kind: "time"; hour: number } | { kind: "stop"; index: number } | null>(null);

  const committed = totals.committedHours;
  const yMax = niceMax(committed);
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const x = (h: number) => M.left + (h / WEEK_HOURS) * plotW;
  const y = (v: number) => M.top + plotH - (v / yMax) * plotH;

  const last = points[points.length - 1];
  const nowHour = last?.hour ?? 0;
  const remainingNow = last?.remaining ?? committed;
  const forecastEnd = Math.max(0, committed - totals.forecastHours);
  const actualPath = points.map((p, i) => `${i ? "L" : "M"}${x(p.hour).toFixed(1)},${y(p.remaining).toFixed(1)}`).join("");
  const ideal = (h: number) => committed * (1 - h / WEEK_HOURS);

  const hovered = hover?.kind === "time" ? points.reduce((best, p) => (Math.abs(p.hour - hover.hour) < Math.abs(best.hour - hover.hour) ? p : best), points[0]) : null;
  const stop = hover?.kind === "stop" ? markers[hover.index] : null;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        <LegendLine color="var(--chart-actual)">Hours left</LegendLine>
        <LegendLine color="var(--chart-ref)">Even pace</LegendLine>
        <LegendLine color="var(--chart-actual)" dashed>
          Forecast
        </LegendLine>
        {markers.length ? (
          <LegendSwatch color="var(--stop)" shape="triangle">
            Long stops
          </LegendSwatch>
        ) : null}
      </figcaption>
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 ? (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`Burndown: ${Math.round(remainingNow)} of ${Math.round(committed)} committed hours left`}
            onPointerMove={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              const h = ((e.clientX - box.left - M.left) / plotW) * WEEK_HOURS;
              if (h >= 0 && h <= nowHour) setHover({ kind: "time", hour: h });
            }}
            onPointerLeave={() => setHover(null)}
          >
            {/* Day bands and value grid */}
            {DAYS.map((d, i) => (
              <g key={d}>
                <line x1={x(i * 24)} x2={x(i * 24)} y1={M.top} y2={M.top + plotH} stroke="var(--chart-grid)" />
                <text x={x(i * 24 + 12)} y={height - 5} textAnchor="middle" className="fill-faint text-[10px]">
                  {d}
                </text>
              </g>
            ))}
            {[0, yMax / 2, yMax].map((v) => (
              <g key={v}>
                <line x1={M.left} x2={M.left + plotW} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" />
                <text x={M.left - 6} y={y(v) + 3} textAnchor="end" className="fill-faint text-[10px] tabular-nums">
                  {compact(v)}
                </text>
              </g>
            ))}

            <line x1={x(0)} y1={y(committed)} x2={x(WEEK_HOURS)} y2={y(0)} stroke="var(--chart-ref)" strokeWidth={1.5} strokeLinecap="round" />
            {nowHour < WEEK_HOURS ? (
              <line
                x1={x(nowHour)}
                y1={y(remainingNow)}
                x2={x(WEEK_HOURS)}
                y2={y(forecastEnd)}
                stroke="var(--chart-actual)"
                strokeWidth={2}
                strokeDasharray="4 4"
                strokeLinecap="round"
                opacity={0.8}
              />
            ) : null}
            <path d={actualPath} fill="none" stroke="var(--chart-actual)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(nowHour)} cy={y(remainingNow)} r={4} fill="var(--chart-actual)" stroke="var(--panel-strong)" strokeWidth={2} />
            <text
              x={Math.min(x(nowHour) + 7, M.left + plotW - 2)}
              y={y(remainingNow) - 7}
              textAnchor={x(nowHour) + 60 > M.left + plotW ? "end" : "start"}
              className="fill-ink text-[11px] font-semibold"
            >
              {Math.round(remainingNow)} h left
            </text>

            {markers.map((m, i) => (
              <g
                key={`${m.machineId}${m.at}`}
                tabIndex={0}
                onPointerEnter={() => setHover({ kind: "stop", index: i })}
                onPointerMove={(e) => e.stopPropagation()}
                onFocus={() => setHover({ kind: "stop", index: i })}
                onBlur={() => setHover(null)}
                className="cursor-default outline-none"
              >
                <rect x={x(m.hour) - 9} y={0} width={18} height={M.top + 2} fill="transparent" />
                <path d={`M${x(m.hour)} ${M.top - 2} l-4.5 -8 h9 Z`} fill="var(--stop)" stroke="var(--panel-strong)" strokeWidth={1} />
              </g>
            ))}

            {hovered ? (
              <line x1={x(hovered.hour)} x2={x(hovered.hour)} y1={M.top} y2={M.top + plotH} stroke="var(--ink)" strokeOpacity={0.25} />
            ) : null}
          </svg>
        ) : null}

        {hovered ? (
          <Tooltip x={x(hovered.hour)} y={M.top} width={width}>
            <p className="text-faint">{when(hovered.hour)}</p>
            <p>
              <span className="font-semibold tabular-nums">{hoursLabel(hovered.remaining)}</span> <span className="text-muted">left</span>
            </p>
            <p>
              <span className="font-semibold tabular-nums">{hoursLabel(ideal(hovered.hour))}</span> <span className="text-muted">at even pace</span>
            </p>
          </Tooltip>
        ) : null}
        {stop ? (
          <Tooltip x={x(stop.hour)} y={M.top} width={width}>
            <p className="font-semibold">{stop.title}</p>
            <p className="text-muted">
              {machineById[stop.machineId]?.name}, {stop.plant}
            </p>
            <p className="text-muted">
              {when(stop.hour)}, <span className="font-semibold text-ink">{hoursLabel(stop.lostMs / 3_600_000)}</span> lost
            </p>
          </Tooltip>
        ) : null}
      </div>

      <table className="sr-only">
        <caption>Committed hours left at the start of each day</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Hours left</th>
            <th>Even pace</th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map((d, i) => {
            const p = points.find((pt) => pt.hour === i * 24);
            return p ? (
              <tr key={d}>
                <td>{d}</td>
                <td>{Math.round(p.remaining)}</td>
                <td>{Math.round(ideal(p.hour))}</td>
              </tr>
            ) : null;
          })}
        </tbody>
      </table>
    </figure>
  );
}
