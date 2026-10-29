"use client";

import { canSeeOrder } from "@/domain/access";
import { customerById } from "@/domain/catalog/orders";
import { personById } from "@/domain/catalog/people";
import { duration, hours, num, plantClock } from "@/lib/format";
import { useLive } from "@/live/store";
import { machineContext, orderProgress } from "@/live/selectors";
import { machineTarget, paceHealth, sprintHealthLabel } from "@/live/sprint";
import { Ring } from "@/components/charts/Ring";
import { useUserScope } from "@/components/shell/AppFrame";
import { Chip, Label, Meter, Panel, PersonRow, TextButton, alertKindLabel, healthColor, statusLabel, stopTone } from "@/components/ui/primitives";
import type { Alert } from "@/domain/types";
import { OrderRoute } from "./OrderRoute";

const STOPS_SHOWN = 5;

/** One finished stop: when, for how long, what it was and how fast its owner picked it up. */
function PastStop({ alert, highlight = false }: { alert: Alert; highlight?: boolean }) {
  const owner = personById[alert.ownerId];
  const lasted = (alert.resolvedAt ?? alert.raisedAt) - alert.raisedAt;
  return (
    <div className={highlight ? "rounded-xl bg-panel-strong px-3.5 py-3" : "border-t border-line py-2.5 first:border-t-0"}>
      <p className="text-[13px] font-semibold">
        {highlight ? "Last stop: " : ""}
        {alertKindLabel[alert.kind]}, {alert.title} <span className="font-normal text-faint">{alert.code}</span>
      </p>
      <p className="mt-0.5 text-[12px] tabular-nums" style={{ color: "var(--stop)" }}>
        Stopped {duration(lasted)}, {plantClock(alert.raisedAt)} to {plantClock(alert.resolvedAt ?? alert.raisedAt)}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-muted">{alert.cause}</p>
      {alert.acknowledgedAt !== undefined && owner ? (
        <p className="mt-1 text-[12px] text-muted">
          {owner.name} picked it up in {duration(alert.acknowledgedAt - alert.raisedAt)}.
        </p>
      ) : null}
    </div>
  );
}

export function MachineDetail({
  machineId,
  onOpenOrder,
  className = "",
}: {
  machineId: string;
  onOpenOrder: (orderId: string) => void;
  className?: string;
}) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const { def, live, alert, workOrder, order, op } = machineContext(snap, machineId);
  const orderVisible = order ? canSeeOrder(scope, order.id) : false;
  const progress = order ? orderProgress(snap, order) : null;
  const elapsed = Math.max(1, snap.now - snap.dayStart);
  const week = machineTarget(snap, def);
  const weekElapsed = Math.min(1, (snap.now - snap.sprint.weekStart) / (snap.sprint.weekEnd - snap.sprint.weekStart));
  const weekHealth = paceHealth(week.done, week.target, weekElapsed);
  // Finished stops on this machine since 06:00, newest first.
  const pastStops = snap.alerts
    .filter((a) => a.machineId === machineId && a.resolvedAt !== undefined && a.raisedAt >= snap.dayStart)
    .sort((a, b) => b.raisedAt - a.raisedAt);

  return (
    <Panel className={`flex min-h-0 flex-col gap-4 scroller overflow-y-auto px-5 py-4 ${className}`}>
      <div className="flex flex-col items-start gap-2">
        <Chip color={stopTone(live.status, alert?.kind)}>
          {live.status === "down" && alert?.kind === "minor" ? "Minor stop" : statusLabel[live.status]} for {duration(snap.now - live.since)}
        </Chip>
        <h2 className="font-stretch-semi-expanded text-[19px] font-semibold leading-tight">{def.name}</h2>
      </div>

      {alert ? (
        <div className="rounded-xl bg-panel-strong px-3.5 py-3">
          <p className="text-[13px] font-semibold">
            {alertKindLabel[alert.kind]}: {alert.title} <span className="font-normal text-faint">{alert.code}</span>
          </p>
          <p className="mt-1 text-[13px] leading-snug text-muted">{alert.cause}</p>
          <p className="mt-2 text-[12px]" style={{ color: alert.acknowledgedAt ? "var(--muted)" : "var(--idle)" }}>
            Raised at {plantClock(alert.raisedAt)}.{" "}
            {alert.acknowledgedAt
              ? `${personById[alert.ownerId].name} acknowledged at ${plantClock(alert.acknowledgedAt)}.`
              : `Waiting for ${personById[alert.ownerId].name} to respond.`}
          </p>
        </div>
      ) : pastStops[0] ? (
        <PastStop alert={pastStops[0]} highlight />
      ) : null}

      <div className={alert || pastStops[0] ? "" : "border-t border-line pt-4"}>
        <Label>Making now</Label>
        {workOrder && order && op ? (
          <>
            <p className="mt-0.5 text-[15px] font-semibold">
              {order.unitName} {num(live.unit ?? 0)} of {num(order.quantity)}
            </p>
            <p className="text-[13px] text-muted">
              {op.name}, work order {live.workOrderId}
            </p>
            {live.progress !== undefined ? (
              <div className="mt-2 flex items-center gap-2">
                <Meter value={live.progress} max={1} />
                <span className="shrink-0 text-[12px] tabular-nums text-muted">{Math.round(live.progress * 100)}%</span>
              </div>
            ) : null}
          </>
        ) : live.otherWork ? (
          <>
            <p className="mt-0.5 text-[15px] font-semibold">{live.otherWork}</p>
            <p className="text-[13px] text-muted">Another programme&apos;s job, not one of the schedules tracked in this view</p>
          </>
        ) : (
          <p className="mt-0.5 text-[13px] text-muted">Nothing is queued for this machine. It starts again when work arrives.</p>
        )}
      </div>

      {order && progress ? (
        orderVisible ? (
          <div className="flex flex-col gap-3 border-t border-line pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Label>For schedule</Label>
                <p className="mt-0.5 text-[15px] font-semibold">
                  {order.id} {order.title}
                </p>
                <p className="text-[13px] text-muted">{customerById[order.customerId].name}</p>
              </div>
              <TextButton onClick={() => onOpenOrder(order.id)}>Open schedule</TextButton>
            </div>
            <OrderRoute order={order} flow={progress.flow} released={progress.released} highlight={live.opIndex} />
          </div>
        ) : (
          <p className="border-t border-line pt-4 text-[13px] text-muted">This machine is working on a schedule outside your access.</p>
        )
      ) : null}

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <Label>Who to contact</Label>
        <PersonRow personId={def.ownerId} note={`Owns this machine, ${personById[def.ownerId]?.title.split(",")[0].toLowerCase()}`} />
        {order && orderVisible ? <PersonRow personId={order.leadEngineerId} note={`Leads ${order.id}`} /> : null}
      </div>

      {alert && order && orderVisible ? (
        <p className="rounded-xl bg-panel-strong px-3.5 py-3 text-[13px] leading-snug">
          {order.unitName} {num(live.unit ?? 0)} has been held {duration(snap.now - alert.raisedAt)}. Stops on {order.id} today add up to{" "}
          {hours(progress!.lostMs)} against {order.slackHours} h of float.
        </p>
      ) : null}

      {week.target > 0 ? (
        <div className="flex items-center gap-3 border-t border-line pt-4">
          <Ring value={week.done / week.target} color={healthColor[weekHealth]} size={34} stroke={4} label="Share of this machine's weekly plan done" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">
              This week: {week.done.toFixed(0)} of {week.target.toFixed(0)} planned hours
            </p>
            <p className="text-[12px] text-muted">
              {sprintHealthLabel[weekHealth]}, its share of the plant&apos;s commitment
            </p>
          </div>
        </div>
      ) : null}

      <div className="border-t border-line pt-4">
        <Label>Today since 06:00</Label>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-line">
          <span style={{ width: `${(live.runMs / elapsed) * 100}%`, background: "var(--run)" }} />
          <span style={{ width: `${(live.setupMs / elapsed) * 100}%`, background: "var(--idle)" }} />
          <span style={{ width: `${(live.downMs / elapsed) * 100}%`, background: "var(--stop)" }} />
        </div>
        <p className="mt-1.5 text-[12px] text-muted">
          Running {hours(live.runMs)}, changeovers {hours(live.setupMs)}, stopped {hours(live.downMs)}
        </p>
      </div>

      <div className="border-t border-line pt-4">
        <Label>
          Stops today {pastStops.length ? `(${pastStops.length}${alert ? " finished, 1 open" : ""})` : ""}
        </Label>
        {pastStops.length ? (
          <div className="mt-1">
            {pastStops.slice(0, STOPS_SHOWN).map((a) => (
              <PastStop key={a.id} alert={a} />
            ))}
            {pastStops.length > STOPS_SHOWN ? (
              <p className="pt-1 text-[12px] text-faint">and {pastStops.length - STOPS_SHOWN} earlier</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-1 text-[13px] text-muted">{alert ? "This is the first stop today." : "No stops since 06:00."}</p>
        )}
      </div>
    </Panel>
  );
}
