"use client";

import type { CauseRow } from "@/live/sprint";
import { hoursLabel } from "./common";

/** Where the week's hours went: one neutral bar per cause, longest first, value at the tip. */
export function CauseBars({ rows }: { rows: CauseRow[] }) {
  if (!rows.length) return <p className="text-[13px] text-muted">No stops recorded yet this week.</p>;
  const max = rows[0].lostHours || 1;
  return (
    <figure>
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.title} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-[12px]">
              <span className="truncate">{r.title}</span>
              <span className="shrink-0 tabular-nums text-muted">
                <span className="font-semibold text-ink">{hoursLabel(r.lostHours)}</span>, {r.count} stop{r.count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="h-2 w-full" title={`${r.plants.join(", ")}`}>
              <div className="h-full rounded-r" style={{ width: `${Math.max(2, (r.lostHours / max) * 100)}%`, background: "var(--chart-loss)" }} />
            </div>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>Hours lost this week by cause</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.title}>
              <td>{r.title}</td>
              <td>{r.lostHours.toFixed(1)} hours</td>
              <td>{r.count} stops</td>
              <td>{r.plants.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
