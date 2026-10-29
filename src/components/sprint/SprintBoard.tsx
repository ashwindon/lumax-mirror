"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { canSeeAlert, canSeePlant } from "@/domain/access";
import { machineById } from "@/domain/catalog/machines";
import { customerById } from "@/domain/catalog/orders";
import { personById } from "@/domain/catalog/people";
import type { Alert, Order, Snapshot } from "@/domain/types";
import { dueDate } from "@/lib/format";
import { useLive } from "@/live/store";
import { isOpen, orderProgress, visibleOrders, type OrderProgress } from "@/live/selectors";
import { paceHealth, sprintHealthLabel, visibleLines } from "@/live/sprint";
import { useTwin } from "@/store/twin";
import { useUserScope } from "@/components/shell/AppFrame";
import { ResponseList, SprintCauses, SprintSummary, SprintVelocity } from "@/components/panels/Sprint";
import { Avatar, Chip, Panel, healthColor } from "@/components/ui/primitives";

const MAX_SQUARES = 10;
const healthRank = { behind: 0, "at-risk": 1, "on-track": 2 } as const;

/** Open alerts on machines currently working this order, keyed by the step they hold up. */
function blockersByStep(snap: Snapshot, orderId: string) {
  const map = new Map<number, Alert[]>();
  for (const a of snap.alerts) {
    if (!isOpen(a)) continue;
    const m = snap.machines[a.machineId];
    if (!m.workOrderId || m.opIndex === undefined || snap.workOrders[m.workOrderId]?.orderId !== orderId) continue;
    map.set(m.opIndex, [...(map.get(m.opIndex) ?? []), a]);
  }
  return map;
}

function Units({ active, queued }: { active: number; queued: number }) {
  const shownActive = Math.min(active, MAX_SQUARES);
  const shownQueued = Math.min(queued, MAX_SQUARES - shownActive);
  const more = active + queued - shownActive - shownQueued;
  if (active + queued === 0) return <p className="h-[10px] text-[11px] leading-[10px] text-faint">Empty</p>;
  return (
    <div className="flex flex-wrap items-center gap-[3px]" aria-label={`${active} on a machine, ${queued} waiting`}>
      {Array.from({ length: shownActive }, (_, i) => (
        <span key={`a${i}`} className="size-[10px] rounded-[3px] bg-ink" />
      ))}
      {Array.from({ length: shownQueued }, (_, i) => (
        <span key={`q${i}`} className="size-[10px] rounded-[3px] border-[1.5px] border-ink/60" />
      ))}
      {more > 0 ? <span className="pl-0.5 text-[11px] text-muted">+{more}</span> : null}
    </div>
  );
}

function Transit({ count }: { count: number }) {
  return (
    <div className="relative mx-1 mt-[37px] h-0 min-w-[84px] flex-1 border-t-[1.5px] border-dashed border-ink/25">
      {Array.from({ length: Math.min(count, 3) }, (_, i) => (
        // The track is the connector less one dot, and moves by its own width, so the
        // dot runs end to end using only transforms (no layout while it animates).
        <span key={i} className="travel absolute inset-y-0 right-2 left-0" style={{ animationDelay: `${-i * 1.1}s` }} aria-hidden>
          <span className="absolute -top-[5px] left-0 size-2 rounded-full bg-ink/70" />
        </span>
      ))}
      {count > 0 ? (
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-muted">{count} on the way</span>
      ) : null}
    </div>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={`size-3 shrink-0 ${className}`} aria-hidden>
      <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One step of a route. Opens the plant it runs at, when the user may see that plant. */
function StepButton({ plant, enabled, children }: { plant: string; enabled: boolean; children: React.ReactNode }) {
  const cls = "flex flex-col gap-2 rounded-xl p-2 text-left";
  if (!enabled) return <div className={cls}>{children}</div>;
  return (
    <Link
      href={`/plants/${plant.toLowerCase()}`}
      title={`Open ${plant}`}
      className={`${cls} -m-px border border-transparent hover:border-line hover:bg-panel-strong hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink`}
    >
      {children}
    </Link>
  );
}

function OrderLane({ order, progress, snap }: { order: Order; progress: OrderProgress; snap: Snapshot }) {
  const scope = useUserScope();
  const router = useRouter();
  const focusMachine = useTwin((s) => s.focusMachine);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  const blockers = blockersByStep(snap, order.id);
  const elapsed = progress.sprint.elapsed;
  const lead = personById[order.leadEngineerId];
  const lastLine = snap.sprint.lines.find((l) => l.orderId === order.id && l.opIndex === order.route.length - 1);
  const mine = (plant: string) => scope.user.role !== "plant-manager" || scope.plants.has(plant as never);

  const openBlocker = (a: Alert) => {
    if (!canSeePlant(scope, a.plant)) return;
    focusMachine(a.machineId);
    router.push(`/plants/${a.plant.toLowerCase()}`);
  };
  const openOrder = () => {
    selectNetwork({ kind: "order", id: order.id });
    router.push("/");
  };

  return (
    <Panel className="flex flex-col gap-3 px-3 py-3">
      <button
        type="button"
        onClick={openOrder}
        className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-2 py-1.5 text-left hover:bg-panel-strong hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
      >
        <Chip color={healthColor[progress.health]}>{sprintHealthLabel[progress.health]}</Chip>
        <span className="min-w-0 flex-1 basis-[220px]">
          <span className="block truncate text-[15px] font-semibold group-hover:underline group-hover:decoration-ink/30 group-hover:underline-offset-4">
            {order.id} {order.title}
          </span>
          <span className="block truncate text-[12px] text-muted">
            {customerById[order.customerId].name}, due {dueDate(order.dueInDays, snap.sprint.weekStart)}
          </span>
        </span>
        <span className="flex items-center gap-4 text-[12px] max-sm:w-full max-sm:justify-between">
          <span className="text-muted">
            <span className="text-[15px] font-semibold text-ink tabular-nums">
              {lastLine ? snap.sprint.done[lastLine.id] : 0}/{lastLine?.units ?? 0}
            </span>{" "}
            {order.unitName.toLowerCase()}s out, {Math.round(progress.sprint.pace * 100)}% pace
          </span>
          <span className="flex items-center gap-2">
            <Avatar initials={lead.initials} className="size-7 text-[11px]" />
            <span className="hidden text-muted xl:inline">{lead.name}</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-muted group-hover:text-ink">
            <span className="max-md:hidden">On the map</span>
            <Arrow />
          </span>
        </span>
      </button>

      <ol className="flex items-start overflow-x-auto px-2 pb-1">
        {order.route.map((op, i) => {
          const f = progress.flow[i];
          const line = snap.sprint.lines.find((l) => l.orderId === order.id && l.opIndex === i);
          const done = line ? snap.sprint.done[line.id] : 0;
          const health = line ? paceHealth(Math.min(done, line.units), line.units, elapsed) : "on-track";
          const stepBlockers = (blockers.get(i) ?? []).filter((a) => canSeeAlert(scope, a));
          const atMine = mine(op.plant);
          const nextPlant = order.route[i + 1]?.plant;
          const transit = i < order.route.length - 1 ? progress.flow[i + 1].inTransit : 0;
          const wip = f.active + f.queued;
          return (
            <li key={i} className="contents">
              <div className={`flex w-[140px] shrink-0 flex-col gap-1.5 ${atMine ? "" : "opacity-45"}`}>
                <StepButton plant={op.plant} enabled={canSeePlant(scope, op.plant)}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3.5 shrink-0 rounded-full border-2"
                      style={{
                        borderColor: stepBlockers.length ? "var(--stop)" : wip ? "var(--accent)" : "var(--line)",
                        background: stepBlockers.length ? "var(--stop)" : "var(--panel-strong)",
                      }}
                    />
                    <span className="text-[11px] font-semibold text-muted tabular-nums">{op.plant}</span>
                  </span>
                  <span className="text-[13px] leading-tight font-semibold">{op.name}</span>
                  <Units active={f.active} queued={f.queued} />
                  {line ? (
                    <span className="flex flex-col gap-1">
                      <span className="h-1 w-full overflow-hidden rounded-full bg-line">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${Math.min(100, (done / Math.max(1, line.units)) * 100)}%`, background: healthColor[health] }}
                        />
                      </span>
                      <span className="text-[11px] text-muted tabular-nums">
                        {done}/{line.units} this week
                      </span>
                    </span>
                  ) : null}
                </StepButton>
                {stepBlockers.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => openBlocker(a)}
                    disabled={!canSeePlant(scope, a.plant)}
                    title={`${a.title} on ${machineById[a.machineId].name}. Go to the machine.`}
                    className="group/stop flex items-start gap-1.5 rounded-xl py-1 pr-1.5 pl-1 text-left text-[11px] leading-tight font-medium hover:brightness-95 focus-visible:outline-2 focus-visible:outline-ink enabled:cursor-pointer disabled:cursor-default"
                    style={{ color: "var(--stop)", background: "color-mix(in oklab, var(--stop) 12%, transparent)" }}
                  >
                    <Avatar initials={personById[a.ownerId].initials} className="size-5 shrink-0 text-[9px]" />
                    <span className="line-clamp-2 flex-1">{a.title}</span>
                    {canSeePlant(scope, a.plant) ? <Arrow className="mt-0.5 opacity-60 group-hover/stop:opacity-100" /> : null}
                  </button>
                ))}
              </div>
              {nextPlant ? (
                nextPlant !== op.plant ? (
                  <Transit count={transit} />
                ) : (
                  <div className="mx-1 mt-[37px] h-0 w-6 shrink-0 border-t-[1.5px] border-ink/25" />
                )
              ) : null}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export function SprintBoard() {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);

  if (!snap) {
    return <p className="grid h-full place-items-center text-[13px] text-muted">Replaying this week at the plants…</p>;
  }

  const lanes = visibleOrders(scope)
    .map((order) => ({ order, progress: orderProgress(snap, order) }))
    .sort((a, b) => healthRank[a.progress.health] - healthRank[b.progress.health] || a.order.dueInDays - b.order.dueInDays);
  const lines = visibleLines(snap, scope);
  const title =
    scope.user.role === "executive" ? "All plants this week" : scope.user.role === "plant-manager" ? "Your plant this week" : "Your orders this week";

  return (
    <div className="absolute inset-0 scroller overflow-y-auto px-4 pt-[84px] pb-6">
      <div className="mx-auto flex max-w-[1560px] items-start gap-4">
        <main className="flex min-w-0 flex-1 flex-col gap-3">
          <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
            <div>
              <h1 className="font-stretch-semi-expanded text-[19px] font-semibold">Sprint board</h1>
              <p className="text-[12px] text-muted">Each order runs left to right through its route. The plan resets every Monday at 06:00.</p>
              <p className="mt-1 text-[12px] text-ink">Open an order to see it on the map, a step to open its plant, or a red stop to go to the machine.</p>
            </div>
            <ul className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
              <li className="flex items-center gap-1.5">
                <span className="size-[10px] rounded-[3px] bg-ink" /> On a machine
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-[10px] rounded-[3px] border-[1.5px] border-ink/60" /> Waiting
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-ink/70" /> On a truck between plants
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: "var(--stop)" }} /> Stopped, with who owns it
              </li>
            </ul>
          </Panel>
          {lanes.map(({ order, progress }) => (
            <OrderLane key={order.id} order={order} progress={progress} snap={snap} />
          ))}
        </main>
        <aside className="hud-column sticky top-0 max-h-[calc(100dvh-108px)] w-[380px] shrink-0 max-xl:hidden">
          <SprintSummary lines={lines} title={title} />
          <SprintVelocity lines={lines} />
          <SprintCauses />
          <ResponseList />
        </aside>
      </div>
    </div>
  );
}
