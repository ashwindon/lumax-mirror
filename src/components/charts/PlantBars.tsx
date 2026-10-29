"use client";

import { useState } from "react";
import { Tooltip, useWidth } from "./common";

export type PlantBar = {
  code: string;
  name: string;
  value: number;
  /** Text at the tip of the bar, e.g. "96%". */
  label: string;
  /** Status fill for pace bars; neutral when absent. */
  color?: string;
  /** Status in words, so the colour is never the only signal. */
  status?: string;
  detail: string;
};

const ROW = 26;
const LABEL_W = 36;
const VALUE_W = 64;

/**
 * One horizontal bar per plant on a shared scale, longest scale end at the right.
 * `reference` draws a recessive line at a target value, such as 100% of plan.
 */
export function PlantBars({ bars, max, reference, caption }: { bars: PlantBar[]; max: number; reference?: { value: number; label: string }; caption: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const plotW = Math.max(0, width - LABEL_W - VALUE_W);
  const x = (v: number) => LABEL_W + (Math.max(0, v) / (max || 1)) * plotW;
  const height = bars.length * ROW + (reference ? 14 : 0);
  const top = reference ? 14 : 0;
  const hovered = hover === null ? null : bars[hover];

  return (
    <figure className="flex flex-col gap-1">
      <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
        {width > 0 ? (
          <svg width={width} height={height} role="img" aria-label={caption} className="block">
            {reference ? (
              <g>
                <line x1={x(reference.value)} x2={x(reference.value)} y1={top - 4} y2={height} stroke="var(--chart-ref)" strokeWidth={1} strokeDasharray="3 3" />
                <text x={x(reference.value)} y={9} textAnchor="middle" fontSize={10} fill="var(--muted)">
                  {reference.label}
                </text>
              </g>
            ) : null}
            {bars.map((b, i) => {
              const y = top + i * ROW;
              const end = x(b.value);
              return (
                <g key={b.code} onPointerEnter={() => setHover(i)} opacity={hover === null || hover === i ? 1 : 0.55}>
                  <rect x={0} y={y} width={width} height={ROW} fill="transparent" />
                  <text x={0} y={y + ROW / 2 + 4} fontSize={11} fontWeight={600} fill="var(--ink)">
                    {b.code}
                  </text>
                  <rect x={LABEL_W} y={y + 7} width={plotW} height={12} rx={4} fill="var(--line)" opacity={0.5} />
                  <rect x={LABEL_W} y={y + 7} width={Math.max(4, end - LABEL_W)} height={12} rx={4} fill={b.color ?? "var(--chart-loss)"} />
                  <text x={end + 6} y={y + ROW / 2 + 4} fontSize={11} fill="var(--muted)" className="tabular-nums">
                    <tspan fontWeight={600} fill="var(--ink)">
                      {b.label}
                    </tspan>
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <div style={{ height }} />
        )}
        {hovered && hover !== null ? (
          <Tooltip x={x(hovered.value)} y={top + hover * ROW + ROW} width={width}>
            <p className="font-semibold">
              {hovered.code} {hovered.name}
            </p>
            <p className="text-muted">
              {hovered.status ? `${hovered.status}, ` : ""}
              {hovered.detail}
            </p>
          </Tooltip>
        ) : null}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {bars.map((b) => (
            <tr key={b.code}>
              <td>
                {b.code} {b.name}
              </td>
              <td>{b.label}</td>
              <td>{b.status}</td>
              <td>{b.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
