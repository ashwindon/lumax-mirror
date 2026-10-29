"use client";

import Link from "next/link";
import { canSeeOrder, canSeePlant } from "@/domain/access";
import { stocks, stockUser } from "@/domain/catalog/orders";
import { plantByCode } from "@/domain/catalog/plants";
import type { MachineStatus, PlantCode } from "@/domain/types";
import { percent } from "@/lib/format";
import { importSupply, weeks } from "@/live/supply";
import { useLive } from "@/live/store";
import { plantHealth } from "@/live/selectors";
import { sprintHealthLabel, sprintTotals } from "@/live/sprint";
import { Ring } from "@/components/charts/Ring";
import { useUserScope } from "@/components/shell/AppFrame";
import { Label, Panel, PersonRow, TextButton, healthColor, statusColor, statusLabel } from "@/components/ui/primitives";
import { BoardsNote } from "./Supply";

const order: MachineStatus[] = ["running", "setup", "down", "waiting"];

export function StatusBar({ counts, total }: { counts: Record<MachineStatus, number>; total: number }) {
  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {order.map((s) =>
          counts[s] ? <span key={s} style={{ flex: counts[s], background: statusColor[s] }} title={`${statusLabel[s]}: ${counts[s]}`} /> : null,
        )}
      </div>
      <p className="mt-1.5 text-[12px] text-muted">
        {counts.running} of {total} running
        {order
          .filter((s) => s !== "running" && counts[s])
          .map((s) => `, ${counts[s]} ${statusLabel[s].toLowerCase()}`)
          .join("")}
      </p>
    </div>
  );
}

/** What feeds the plant: LED boards from Bawal at a lamp plant, imported parts at Bawal itself. */
function Inbound({ code, onShowFreight }: { code: PlantCode; onShowFreight?: () => void }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const boards = stocks.filter((s) => !s.imported && s.plant === code && canSeeOrder(scope, stockUser[s.id]));
  const imports = code === "BWE" ? importSupply(snap) : null;
  if (!boards.length && !imports) return null;
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <Label>{imports ? "Imported LED parts" : "LED boards from Bawal Electronics"}</Label>
      {boards.map((s) => (
        <BoardsNote key={s.id} stockId={s.id} onOpen={onShowFreight} />
      ))}
      {imports ? (
        <button
          type="button"
          onClick={onShowFreight}
          disabled={!onShowFreight}
          className="flex w-full flex-col gap-1 rounded-lg bg-panel-strong px-3 py-2.5 text-left enabled:hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
        >
          <span className="text-[13px] font-semibold">{weeks(imports.coverWeeks)} of parts at Bawal and at sea</span>
          <span className="text-[12px] text-muted">
            {weeks(imports.onHandWeeks)} on hand · {imports.lots.length} lots on their way through JNPT{onShowFreight ? " · see the ships" : ""}
          </span>
        </button>
      ) : null}
    </div>
  );
}

/** A plant at a glance: who runs it, how its machines are doing, and a way in. */
export function PlantSummary({
  code,
  onClose,
  onShowFreight,
  className = "",
}: {
  code: PlantCode;
  onClose?: () => void;
  onShowFreight?: () => void;
  className?: string;
}) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const plant = plantByCode[code];
  const allowed = canSeePlant(scope, code);
  const health = snap ? plantHealth(snap, code) : null;
  const week = snap ? sprintTotals(snap, snap.sprint.lines.filter((l) => l.plant === code)) : null;

  return (
    <Panel className={`flex min-h-0 flex-col gap-4 scroller overflow-y-auto px-5 py-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-muted">
            {plant.code}
            {plant.established ? `, since ${plant.established}` : ""}
            {plant.headcount ? `, ${plant.headcount.toLocaleString("en-IN")} people` : ""}
          </p>
          <h2 className="font-stretch-semi-expanded text-[19px] font-semibold leading-tight">{plant.name}</h2>
          <p className="text-[13px] text-muted">{plant.address}</p>
        </div>
        {onClose ? <TextButton onClick={onClose}>Close</TextButton> : null}
      </div>

      <p className="text-[13px]">
        <span className="text-muted">Serves </span>
        {plant.customers}
        {plant.mixToConfirm ? (
          <span className="ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: "var(--idle)", background: "color-mix(in oklab, var(--idle) 13%, transparent)" }}>
            Mix to confirm
          </span>
        ) : null}
      </p>

      <ul className="flex flex-wrap gap-1.5">
        {plant.specialties.map((s) => (
          <li key={s} className="rounded-full border border-line px-2.5 py-1 text-[12px] text-muted">
            {s}
          </li>
        ))}
      </ul>

      {health ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex items-baseline justify-between">
            <Label>Machines right now</Label>
            <span className="text-[12px] text-muted">{percent(health.utilization)} running time today</span>
          </div>
          <StatusBar counts={health.counts} total={health.total} />
        </div>
      ) : null}

      {week && week.committedHours > 0 ? (
        <div className="flex items-center gap-3 border-t border-line pt-4">
          <Ring value={week.doneHours / week.committedHours} color={healthColor[week.health]} size={34} stroke={4} label="Share of this week's commitment done" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">
              This week: {Math.round(week.doneHours)} of {Math.round(week.committedHours)} committed hours
            </p>
            <p className="text-[12px] text-muted">
              {sprintHealthLabel[week.health]}, {Math.round(week.pace * 100)}% of an even pace
            </p>
          </div>
        </div>
      ) : null}

      <Inbound code={code} onShowFreight={onShowFreight} />

      <div className="border-t border-line pt-4">
        <Label>Plant head</Label>
        <div className="mt-2">
          <PersonRow personId={plant.managerId} />
        </div>
      </div>

      {allowed ? (
        <Link
          href={`/plants/${code.toLowerCase()}`}
          className="rounded-xl bg-ink px-4 py-2.5 text-center text-[13px] font-semibold text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Open the {plant.name} floor
        </Link>
      ) : (
        <p className="rounded-xl bg-panel-strong px-3.5 py-3 text-[13px] text-muted">
          You can see this plant&apos;s status, but its machines and people are outside your access.
        </p>
      )}
    </Panel>
  );
}
