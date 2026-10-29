"use client";

import { personById } from "@/domain/catalog/people";
import type { CommitLine, PlantCode } from "@/domain/types";
import { useLive } from "@/live/store";
import { burndown, responseTimes, sprintHealthLabel, sprintTotals, stopMarkers, topCauses, velocity } from "@/live/sprint";
import { useUserScope } from "@/components/shell/AppFrame";
import { Burndown } from "@/components/charts/Burndown";
import { CauseBars } from "@/components/charts/CauseBars";
import { Velocity } from "@/components/charts/Velocity";
import { Avatar, Chip, Label, Panel, SectionTitle, healthColor } from "@/components/ui/primitives";

const weekOf = (t: number) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/** The week at a glance for a set of commitment lines: where it stands and its burndown. */
export function SprintSummary({ lines, title, className = "" }: { lines: CommitLine[]; title: string; className?: string }) {
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const totals = sprintTotals(snap, lines);
  const day = Math.min(7, Math.floor(totals.elapsed * 7) + 1);
  const forecastShare = totals.committedHours ? totals.forecastHours / totals.committedHours : 1;

  return (
    <Panel className={`flex flex-col gap-3 px-4 py-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-muted">
            Week of {weekOf(snap.sprint.weekStart)}, day {day} of 7
          </p>
          <h2 className="text-[15px] font-semibold">{title}</h2>
        </div>
        <Chip color={healthColor[totals.health]}>{sprintHealthLabel[totals.health]}</Chip>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <Label>Done</Label>
          <p className="text-[18px] font-semibold leading-tight">{Math.round(totals.doneHours)} h</p>
          <p className="text-muted">of {Math.round(totals.committedHours)} h committed</p>
        </div>
        <div>
          <Label>Pace</Label>
          <p className="text-[18px] font-semibold leading-tight">{Math.round(totals.pace * 100)}%</p>
          <p className="text-muted">of an even week</p>
        </div>
        <div>
          <Label>By Monday</Label>
          <p className="text-[18px] font-semibold leading-tight">{Math.round(forecastShare * 100)}%</p>
          <p className="text-muted">at today&apos;s rate</p>
        </div>
      </div>
      <Burndown points={burndown(snap, lines)} totals={totals} markers={stopMarkers(snap, lines)} />
    </Panel>
  );
}

export function SprintCauses({ only, className = "" }: { only?: { plant?: PlantCode; orderId?: string }; className?: string }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  return (
    <Panel className={`flex flex-col gap-3 px-4 py-3 ${className}`}>
      <SectionTitle>What cost hours this week</SectionTitle>
      <CauseBars rows={topCauses(snap, scope, only)} />
    </Panel>
  );
}

export function SprintVelocity({ lines, className = "" }: { lines: CommitLine[]; className?: string }) {
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  return (
    <Panel className={`flex flex-col gap-3 px-4 py-3 ${className}`}>
      <SectionTitle>Commitment kept, week by week</SectionTitle>
      <Velocity weeks={velocity(snap, lines)} />
      <p className="text-[11px] text-faint">Earlier weeks are simulated for the demo.</p>
    </Panel>
  );
}

export function ResponseList({ only, className = "" }: { only?: { plant?: PlantCode }; className?: string }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const rows = responseTimes(snap, scope, only).slice(0, 6);
  return (
    <Panel className={`flex flex-col gap-2 px-4 py-3 ${className}`}>
      <SectionTitle>How fast stops get picked up</SectionTitle>
      {rows.length === 0 ? (
        <p className="text-[13px] text-muted">No stops acknowledged yet this week.</p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((r) => {
            const person = personById[r.ownerId];
            return (
              <li key={r.ownerId} className="flex items-center gap-3 border-t border-line py-2 first:border-t-0">
                <Avatar initials={person.initials} className="size-7 text-[11px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{person.name}</p>
                  <p className="truncate text-[12px] text-muted">{r.count} stops this week</p>
                </div>
                <span className="text-[13px] font-semibold tabular-nums">{r.avgMinutes.toFixed(1)} min</span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[11px] text-faint">Average time from the alert to the owner acknowledging it, slowest first.</p>
    </Panel>
  );
}

