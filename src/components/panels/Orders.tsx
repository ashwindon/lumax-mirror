"use client";

import { customerById, orderById } from "@/domain/catalog/orders";
import { personById } from "@/domain/catalog/people";
import type { Alert } from "@/domain/types";
import { dueDate, hours } from "@/lib/format";
import { useLive } from "@/live/store";
import { healthLabel, isOpen, orderProgress, visibleOrders, type OrderHealth } from "@/live/selectors";
import { canSeeAlert } from "@/domain/access";
import { burndown, stopMarkers } from "@/live/sprint";
import { useTwin } from "@/store/twin";
import { useUserScope } from "@/components/shell/AppFrame";
import { Burndown } from "@/components/charts/Burndown";
import { Avatar, Chip, Dot, Label, Meter, Panel, PersonRow, SectionTitle, TextButton, healthColor } from "@/components/ui/primitives";
import { AlertRow } from "./AlertList";
import { crossingStep } from "@/domain/freight";
import { BufferNote } from "./Freight";
import { OrderRoute } from "./OrderRoute";

const healthRank: Record<OrderHealth, number> = { behind: 0, "at-risk": 1, "on-track": 2 };

export function OrdersList({ onSelect, className = "" }: { onSelect: (orderId: string) => void; className?: string }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const lens = useTwin((s) => s.lens);
  if (!snap) return null;
  const rows = visibleOrders(scope)
    .map((order) => ({ order, progress: orderProgress(snap, order) }))
    .sort((a, b) => healthRank[a.progress.health] - healthRank[b.progress.health] || a.order.dueInDays - b.order.dueInDays);

  return (
    <Panel className={`flex min-h-0 flex-col px-4 py-3 ${className}`}>
      <SectionTitle>Orders in production ({rows.length})</SectionTitle>
      <ul className="mt-1 min-h-0 scroller overflow-y-auto">
        {rows.map(({ order, progress }) => (
          <li key={order.id} className="border-t border-line first:border-t-0">
            <button
              type="button"
              onClick={() => onSelect(order.id)}
              className="flex w-full items-center gap-3 rounded-lg py-2.5 text-left hover:bg-panel-strong/60 focus-visible:outline-2 focus-visible:outline-ink"
            >
              <Dot color={healthColor[progress.health]} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">
                  {order.id} {order.title}
                </p>
                <p className="truncate text-[12px] text-muted">
                  {customerById[order.customerId].name}, due {dueDate(order.dueInDays, snap.sprint.weekStart)}
                </p>
                {lens === "sprint" ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <Meter value={progress.sprint.doneHours} max={progress.sprint.committedHours} tone={healthColor[progress.health]} />
                    <span className="shrink-0 text-[12px] tabular-nums text-muted">
                      {Math.round(progress.sprint.pace * 100)}% pace
                    </span>
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <Meter value={progress.done} max={order.quantity} tone={healthColor[progress.health]} />
                    <span className="shrink-0 text-[12px] tabular-nums text-muted">
                      {progress.done}/{order.quantity}
                    </span>
                  </div>
                )}
              </div>
              <Avatar initials={personById[order.leadEngineerId].initials} className="size-7 text-[11px]" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function OrderDetail({
  orderId,
  onBack,
  onShowAlert,
  onShowFreight,
  highlightOp,
  className = "",
}: {
  orderId: string;
  onBack?: () => void;
  onShowAlert: (alert: Alert) => void;
  /** Opens the sea freight panel, for orders finished across the sea. */
  onShowFreight?: () => void;
  highlightOp?: number;
  className?: string;
}) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const lens = useTwin((s) => s.lens);
  const order = orderById[orderId];
  if (!snap || !order) return null;
  const p = orderProgress(snap, order);
  const lines = snap.sprint.lines.filter((l) => l.orderId === order.id);
  const committedUnits = lines[0]?.units ?? 0;
  const neededUnits = snap.sprint.needed[order.id] ?? 0;
  const shippedThisWeek = snap.sprint.done[lines[lines.length - 1]?.id] ?? 0;
  const alerts = snap.alerts.filter(
    (a) => isOpen(a) && a.workOrderId && snap.workOrders[a.workOrderId]?.orderId === order.id && canSeeAlert(scope, a),
  );

  return (
    <Panel className={`flex min-h-0 flex-col gap-4 scroller overflow-y-auto px-5 py-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-2">
          <Chip color={healthColor[p.health]}>{healthLabel[p.health]}</Chip>
          <h2 className="font-stretch-semi-expanded text-[19px] font-semibold leading-tight">
            {order.id} {order.title}
          </h2>
          <p className="text-[13px] text-muted">
            {customerById[order.customerId].name}, {order.quantity} units due {dueDate(order.dueInDays, snap.sprint.weekStart)}
          </p>
        </div>
        {onBack ? <TextButton onClick={onBack}>All orders</TextButton> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-semibold tabular-nums">
            {p.done} of {order.quantity} done
          </span>
          <span className="text-muted">{p.finishedToday} finished today</span>
        </div>
        <Meter value={p.done} max={order.quantity} tone={healthColor[p.health]} />
        <p className="text-[12px] text-muted">
          This week: {shippedThisWeek} of {committedUnits} committed units through the last step, {Math.round(p.sprint.pace * 100)}% of an even
          pace. Stops on this order cost {hours(snap.sprint.lostMs[order.id] ?? 0)} of machine time so far.
        </p>
        {committedUnits < neededUnits ? (
          <p className="rounded-lg bg-panel-strong px-3 py-2 text-[12px]" style={{ color: "var(--idle)" }}>
            Capacity on its route covers {committedUnits} of the {neededUnits} units it needs this week to stay on course for its due date.
          </p>
        ) : null}
        {crossingStep.has(order.id) ? (
          <div className="mt-1">
            <BufferNote orderId={order.id} onOpen={onShowFreight} />
          </div>
        ) : null}
      </div>

      {lens === "sprint" ? (
        <div className="border-t border-line pt-4">
          <Label>This week across its plants</Label>
          <div className="mt-2">
            <Burndown points={burndown(snap, lines)} totals={p.sprint} markers={stopMarkers(snap, lines, 6)} height={140} />
          </div>
        </div>
      ) : null}

      <div className="border-t border-line pt-4">
        <Label>Lead engineer</Label>
        <div className="mt-2">
          <PersonRow personId={order.leadEngineerId} />
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <Label>Route and where the units are now</Label>
        <div className="mt-2.5">
          <OrderRoute order={order} flow={p.flow} released={p.released} highlight={highlightOp} />
        </div>
      </div>

      {alerts.length ? (
        <div className="border-t border-line pt-3">
          <Label>Holding this order up</Label>
          <ul className="mt-1">
            {alerts.map((a) => (
              <AlertRow key={a.id} alert={a} now={snap.now} onShow={onShowAlert} />
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}
