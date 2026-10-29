"use client";

import Link from "next/link";
import { canSeeOrder, canSeePlant } from "@/domain/access";
import { orderById } from "@/domain/catalog/orders";
import { crossingStep } from "@/domain/freight";
import { plantByCode } from "@/domain/catalog/plants";
import type { MachineStatus, PlantCode } from "@/domain/types";
import { count, day, percent } from "@/lib/format";
import { seaLoads } from "@/live/freight";
import { useLive } from "@/live/store";
import { plantHealth } from "@/live/selectors";
import { sprintHealthLabel, sprintTotals } from "@/live/sprint";
import { Ring } from "@/components/charts/Ring";
import { useUserScope } from "@/components/shell/AppFrame";
import { Label, Panel, PersonRow, TextButton, healthColor, statusColor, statusLabel } from "@/components/ui/primitives";
import { BufferNote } from "./Freight";

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

/** What is on its way to a plant that finishes work from across the sea. */
function Inbound({ code, onShowFreight }: { code: PlantCode; onShowFreight?: () => void }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const orderIds = [...crossingStep].filter(([id, i]) => orderById[id].route[i].plant === code && canSeeOrder(scope, id)).map(([id]) => id);
  if (!snap || !orderIds.length) return null;
  const next = seaLoads(snap, scope)
    .filter((l) => l.arriveAt > snap.now)
    .sort((a, b) => a.arriveAt - b.arriveAt)[0];
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <Label>Coming from Pune by sea</Label>
      {next ? (
        <p className="text-[13px]">
          Next load arrives {day(next.arriveAt)}:{" "}
          {next.byOrder.map((o) => count(o.units, orderById[o.orderId].unitName.toLowerCase())).join(", ")}
        </p>
      ) : null}
      {orderIds.map((id) => (
        <div key={id} className="flex flex-col gap-1">
          <p className="text-[12px] font-semibold">{orderById[id].title}</p>
          <BufferNote orderId={id} onOpen={onShowFreight} />
        </div>
      ))}
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
            {plant.code}, established {plant.established}
            {plant.headcount ? `, ${plant.headcount.toLocaleString("en-IN")} people` : ""}
          </p>
          <h2 className="font-stretch-semi-expanded text-[19px] font-semibold leading-tight">{plant.name}</h2>
          <p className="text-[13px] text-muted">{plant.address}</p>
        </div>
        {onClose ? <TextButton onClick={onClose}>Close</TextButton> : null}
      </div>

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
        <Label>Plant manager</Label>
        <div className="mt-2">
          <PersonRow personId={plant.managerId} />
        </div>
      </div>

      {allowed ? (
        <Link
          href={`/plants/${code.toLowerCase()}`}
          className="rounded-xl bg-ink px-4 py-2.5 text-center text-[13px] font-semibold text-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Open {plant.code} floor
        </Link>
      ) : (
        <p className="rounded-xl bg-panel-strong px-3.5 py-3 text-[13px] text-muted">
          You can see this plant&apos;s status, but its machines and people are outside your access.
        </p>
      )}
    </Panel>
  );
}
