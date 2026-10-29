"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { canSeeAlert, canSeeOrder, canSeePlant, type Scope } from "@/domain/access";
import { machineById } from "@/domain/catalog/machines";
import { customerById, orderById } from "@/domain/catalog/orders";
import { personById } from "@/domain/catalog/people";
import { plantByCode } from "@/domain/catalog/plants";
import type { Alert, PlantCode, Snapshot } from "@/domain/types";
import { dueDate, duration } from "@/lib/format";
import { isOpen, orderProgress, plantHealth } from "@/live/selectors";
import { burndown, paceHealth, sprintHealthLabel, sprintTotals, stopMarkers, topCauses, visibleLines } from "@/live/sprint";
import type { Block, PlantMeasure, Tone } from "@/brief/answer";
import { useTwin } from "@/store/twin";
import { Burndown } from "@/components/charts/Burndown";
import { CauseBars } from "@/components/charts/CauseBars";
import { PlantBars, type PlantBar } from "@/components/charts/PlantBars";
import { Ring } from "@/components/charts/Ring";
import { AlertRow } from "@/components/panels/AlertList";
import { StatusBar } from "@/components/panels/PlantSummary";
import { Avatar, Chip, Dot, PersonRow, TextButton, healthColor } from "@/components/ui/primitives";

export const toneColor: Record<Tone, string> = { good: "var(--run)", watch: "var(--idle)", bad: "var(--stop)" };
export const toneLabel: Record<Tone, string> = { good: "All good", watch: "Keep an eye on it", bad: "Needs action" };

/** Blocks that read best across the whole card; the rest sit two to a row. */
export const wideBlocks = new Set<Block["type"]>(["stats", "orders", "plants", "draft"]);

function Frame({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-line bg-panel-strong/70 px-4 py-3">
      {title || action ? (
        <div className="flex items-center justify-between gap-2">
          {title ? <h3 className="text-[12px] font-semibold text-muted">{title}</h3> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function useShow() {
  const router = useRouter();
  const focusMachine = useTwin((s) => s.focusMachine);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  return {
    alert: (scope: Scope, a: Alert) => {
      if (canSeePlant(scope, a.plant)) {
        focusMachine(a.machineId);
        router.push(`/plants/${a.plant.toLowerCase()}`);
      } else {
        selectNetwork({ kind: "plant", code: a.plant });
        router.push("/");
      }
    },
    order: (id: string) => {
      selectNetwork({ kind: "order", id });
      router.push("/");
    },
  };
}

function Stats({ block }: { block: Extract<Block, { type: "stats" }> }) {
  return (
    <section
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line ${block.items.length >= 4 ? "sm:grid-cols-4" : block.items.length === 3 ? "sm:grid-cols-3" : ""}`}
    >
      {block.items.map((s, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-1 bg-panel-strong px-4 py-3 last:odd:col-span-2 sm:last:odd:col-span-1">
          <p className="truncate text-[12px] text-muted">{s.label}</p>
          <p className="flex items-center gap-2 font-stretch-semi-expanded text-[22px] leading-none font-semibold tabular-nums">
            {s.tone ? <Dot color={toneColor[s.tone]} /> : null}
            {s.value}
          </p>
          {s.sub ? <p className="truncate text-[12px] text-muted">{s.sub}</p> : null}
        </div>
      ))}
    </section>
  );
}

function Orders({ block, snap, scope }: { block: Extract<Block, { type: "orders" }>; snap: Snapshot; scope: Scope }) {
  const show = useShow();
  const ids = block.orderIds.filter((id) => orderById[id] && canSeeOrder(scope, id));
  return (
    <Frame title={block.title}>
      <ul className="flex flex-col">
        {ids.map((id) => {
          const order = orderById[id];
          const p = orderProgress(snap, order);
          const last = snap.sprint.lines.find((l) => l.orderId === id && l.opIndex === order.route.length - 1);
          const out = last ? snap.sprint.done[last.id] : 0;
          const committed = last?.units ?? 0;
          const stops = snap.alerts.filter((a) => isOpen(a) && a.workOrderId && snap.workOrders[a.workOrderId]?.orderId === id && canSeeAlert(scope, a)).length;
          const lead = personById[order.leadEngineerId];
          return (
            <li key={id} className="border-t border-line first:border-t-0">
              <button
                type="button"
                onClick={() => show.order(id)}
                className="-mx-2 flex w-[calc(100%+16px)] flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-2 py-2.5 text-left hover:bg-panel focus-visible:outline-2 focus-visible:outline-ink"
              >
                <span className="w-[92px] shrink-0">
                  <Chip color={healthColor[p.health]}>{sprintHealthLabel[p.health]}</Chip>
                </span>
                <span className="min-w-[180px] flex-1">
                  <span className="block truncate text-[14px] font-semibold">
                    {id} {order.title}
                  </span>
                  <span className="block truncate text-[12px] text-muted">
                    {customerById[order.customerId].name}, due {dueDate(order.dueInDays, snap.sprint.weekStart)}
                    {stops ? <span style={{ color: "var(--stop)" }}>, {stops} stop{stops > 1 ? "s" : ""} open</span> : null}
                  </span>
                </span>
                <span className="flex w-[210px] flex-col gap-1 max-sm:order-last max-sm:w-full">
                  <span className="flex justify-between gap-3 text-[12px] text-muted tabular-nums">
                    <span>
                      <span className="font-semibold text-ink">
                        {out}/{committed}
                      </span>{" "}
                      out this week
                    </span>
                    <span>{Math.round(p.sprint.pace * 100)}% pace</span>
                  </span>
                  <span className="h-1 w-full overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (out / Math.max(1, committed)) * 100)}%`, background: healthColor[p.health] }} />
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[12px] text-muted" title={`Lead: ${lead.name}`}>
                  <Avatar initials={lead.initials} className="size-7 text-[11px]" />
                  <span className="hidden w-[96px] truncate lg:inline">{lead.name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

function Plants({ block, snap, scope }: { block: Extract<Block, { type: "plants" }>; snap: Snapshot; scope: Scope }) {
  return (
    <Frame title={block.title}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {block.codes.map((code) => {
          const plant = plantByCode[code];
          const health = plantHealth(snap, code);
          const t = sprintTotals(snap, snap.sprint.lines.filter((l) => l.plant === code));
          const share = t.committedHours ? t.doneHours / t.committedHours : 1;
          const allowed = canSeePlant(scope, code);
          const inner = (
            <>
              <span className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold">
                    {code} {plant.name}
                  </span>
                  <span className="block text-[12px] text-muted">{allowed ? `${health.alerts} stop${health.alerts === 1 ? "" : "s"} open` : "Status only"}</span>
                </span>
                {t.committedHours ? (
                  <span className="flex items-center gap-1.5 text-[12px] text-muted tabular-nums">
                    <Ring value={share} color={healthColor[paceHealth(t.doneHours, t.committedHours, t.elapsed)]} size={18} label={`${Math.round(share * 100)}% of this week's commitment done`} />
                    {Math.round(share * 100)}%
                  </span>
                ) : null}
              </span>
              <StatusBar counts={health.counts} total={health.total} />
            </>
          );
          return (
            <li key={code}>
              {allowed ? (
                <Link href={`/plants/${code.toLowerCase()}`} className="flex flex-col gap-2 rounded-lg border border-line px-3 py-2.5 hover:bg-panel focus-visible:outline-2 focus-visible:outline-ink">
                  {inner}
                </Link>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg border border-line px-3 py-2.5 opacity-70">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

const measureCaption: Record<PlantMeasure, string> = {
  week_pace: "Pace against this week's plan, by plant",
  utilization_today: "Share of today each plant's machines have run",
  hours_lost_week: "Machine-hours lost to stops this week, by plant",
  open_stops: "Open stops by plant",
};

function ComparePlants({ block, snap, scope }: { block: Extract<Block, { type: "compare_plants" }>; snap: Snapshot; scope: Scope }) {
  const codes = (block.codes?.length ? block.codes : (Object.keys(plantByCode) as PlantCode[])).filter((c) => canSeePlant(scope, c));
  const bars: PlantBar[] = codes.flatMap((code) => {
    const name = plantByCode[code].name;
    const t = sprintTotals(snap, snap.sprint.lines.filter((l) => l.plant === code));
    const health = plantHealth(snap, code);
    switch (block.measure) {
      case "week_pace": {
        if (!t.committedHours) return [];
        const h = paceHealth(t.doneHours, t.committedHours, t.elapsed);
        const pace = t.doneHours / Math.max(1e-9, t.committedHours * t.elapsed);
        return [{ code, name, value: pace * 100, label: `${Math.round(pace * 100)}%`, color: healthColor[h], status: sprintHealthLabel[h], detail: `${Math.round(t.doneHours)} of ${Math.round(t.committedHours)} h committed done` }];
      }
      case "utilization_today":
        return [{ code, name, value: health.utilization * 100, label: `${Math.round(health.utilization * 100)}%`, color: "var(--chart-actual)", detail: `${health.counts.running} of ${health.total} machines running now` }];
      case "hours_lost_week": {
        const lost = snap.sprint.causes.filter((c) => c.plant === code).reduce((n, c) => n + c.lostMs, 0) / 3_600_000;
        return [{ code, name, value: lost, label: `${lost.toFixed(1)} h`, detail: `${snap.sprint.causes.filter((c) => c.plant === code).reduce((n, c) => n + c.count, 0)} stops this week` }];
      }
      case "open_stops":
        return [{ code, name, value: health.alerts, label: `${health.alerts}`, detail: `${health.counts.down} machines stopped now` }];
    }
  });
  const sorted = block.measure === "week_pace" ? bars.sort((a, b) => a.value - b.value) : bars.sort((a, b) => b.value - a.value);
  const top = Math.max(0, ...sorted.map((b) => b.value));
  const max = block.measure === "week_pace" ? Math.max(120, top * 1.05) : block.measure === "utilization_today" ? 100 : top * 1.15 || 1;
  return (
    <Frame title={block.title ?? measureCaption[block.measure]}>
      {sorted.length ? (
        <PlantBars bars={sorted} max={max} caption={measureCaption[block.measure]} reference={block.measure === "week_pace" ? { value: 100, label: "Plan" } : undefined} />
      ) : (
        <p className="text-[13px] text-muted">Nothing committed at these plants this week.</p>
      )}
    </Frame>
  );
}

function BurndownBlock({ block, snap, scope }: { block: Extract<Block, { type: "burndown" }>; snap: Snapshot; scope: Scope }) {
  const lines = visibleLines(snap, scope, { plant: block.plant, orderId: block.orderId });
  const totals = sprintTotals(snap, lines);
  return (
    <Frame
      title={block.title ?? "This week"}
      action={<Chip color={healthColor[totals.health]}>{`${sprintHealthLabel[totals.health]}, ${Math.round(totals.pace * 100)}%`}</Chip>}
    >
      <Burndown points={burndown(snap, lines)} totals={totals} markers={stopMarkers(snap, lines, 4)} height={150} />
    </Frame>
  );
}

function Causes({ block, snap, scope }: { block: Extract<Block, { type: "causes" }>; snap: Snapshot; scope: Scope }) {
  return (
    <Frame title={block.title ?? "What cost hours this week"}>
      <CauseBars rows={topCauses(snap, scope, { plant: block.plant, orderId: block.orderId }, 5)} />
    </Frame>
  );
}

function Stops({ block, snap, scope }: { block: Extract<Block, { type: "stops" }>; snap: Snapshot; scope: Scope }) {
  const show = useShow();
  const list = block.alertIds.map((id) => snap.alerts.find((a) => a.id === id)).filter((a): a is Alert => !!a && canSeeAlert(scope, a));
  return (
    <Frame title={block.title ?? "Stops"}>
      <ul>
        {list.map((a) =>
          isOpen(a) ? (
            <AlertRow key={a.id} alert={a} now={snap.now} onShow={(x) => show.alert(scope, x)} />
          ) : (
            <li key={a.id} className="flex items-center gap-3 border-t border-line py-2.5 text-[13px] text-muted first:border-t-0">
              <Dot color="var(--run)" />
              <span className="min-w-0 flex-1 truncate">
                {a.title}, {machineById[a.machineId].name}
              </span>
              <span className="shrink-0 text-[12px]">Cleared after {duration((a.resolvedAt ?? snap.now) - a.raisedAt)}</span>
            </li>
          ),
        )}
        {list.length === 0 ? <li className="text-[13px] text-muted">These stops have cleared.</li> : null}
      </ul>
    </Frame>
  );
}

function People({ block }: { block: Extract<Block, { type: "people" }> }) {
  return (
    <Frame title={block.title ?? "Who to call"}>
      <ul className="flex flex-col gap-3">
        {block.items.map((p) => (
          <li key={p.personId}>
            <PersonRow personId={p.personId} note={p.reason} />
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function Draft({ block }: { block: Extract<Block, { type: "draft" }> }) {
  const [copied, setCopied] = useState(false);
  const to = block.toPersonId ? personById[block.toPersonId] : undefined;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Frame title={block.title ?? "Draft"} action={<TextButton onClick={copy}>{copied ? "Copied" : "Copy"}</TextButton>}>
      {to || block.to ? (
        <p className="flex items-center gap-2 text-[12px] text-muted">
          To
          {to ? <Avatar initials={to.initials} className="size-5 text-[9px]" /> : null}
          <span className="font-medium text-ink">{to ? `${to.name}, ${to.title}` : block.to}</span>
        </p>
      ) : null}
      <p className="rounded-lg border border-line bg-page/60 px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap">{block.body}</p>
    </Frame>
  );
}

export function BlockView({ block, snap, scope }: { block: Block; snap: Snapshot; scope: Scope }) {
  switch (block.type) {
    case "stats":
      return <Stats block={block} />;
    case "orders":
      return <Orders block={block} snap={snap} scope={scope} />;
    case "plants":
      return <Plants block={block} snap={snap} scope={scope} />;
    case "compare_plants":
      return <ComparePlants block={block} snap={snap} scope={scope} />;
    case "burndown":
      return <BurndownBlock block={block} snap={snap} scope={scope} />;
    case "causes":
      return <Causes block={block} snap={snap} scope={scope} />;
    case "stops":
      return <Stops block={block} snap={snap} scope={scope} />;
    case "people":
      return <People block={block} />;
    case "note":
      return (
        <Frame title={block.title}>
          <p className="text-[13px] leading-relaxed">{block.text}</p>
        </Frame>
      );
    case "draft":
      return <Draft block={block} />;
  }
}
