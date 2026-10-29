import { canSeeOrder, type Scope } from "@/domain/access";
import { orderById } from "@/domain/catalog/orders";
import { BUFFER_TARGET_WEEKS, crossesSea, crossingStep, legAt, voyageFor, type FreightLeg } from "@/domain/freight";
import { lineId } from "@/domain/planning";
import type { Snapshot } from "@/domain/types";
import { sprintTotals, type SprintHealth } from "./sprint";

// What is on its way to Conroe, and how long the stock at sea and on site will last.

const DAY = 86_400_000;

/** One ship: every load on the same weekly sailing. Before it sails, the load is gathering at JNPT. */
export type SeaLoad = {
  sailAt: number;
  berthAt: number;
  arriveAt: number;
  leg: Exclude<FreightLeg, "road">;
  /** 0 at JNPT, 1 at Houston. */
  progress: number;
  units: number;
  byOrder: { orderId: string; units: number }[];
  /** Units still on a truck to the port. */
  onRoad: number;
};

type Feed = Pick<Snapshot, "shipments" | "workOrders" | "now">;

const visibleSea = (snap: Feed, scope?: Scope) =>
  snap.shipments.filter(crossesSea).filter((s) => !scope || canSeeOrder(scope, snap.workOrders[s.workOrderId]?.orderId ?? ""));

export function seaLoads(snap: Feed, scope?: Scope): SeaLoad[] {
  const loads = new Map<number, SeaLoad & { orders: Map<string, number> }>();
  for (const s of visibleSea(snap, scope)) {
    const orderId = snap.workOrders[s.workOrderId]?.orderId ?? "";
    let load = loads.get(s.sea.sailAt);
    if (!load) {
      const leg = legAt(s, snap.now);
      const progress = Math.min(1, Math.max(0, (snap.now - s.sea.sailAt) / (s.sea.berthAt - s.sea.sailAt)));
      load = { ...s.sea, arriveAt: s.arriveAt, leg: leg === "road" ? "port" : leg, progress, units: 0, byOrder: [], onRoad: 0, orders: new Map() };
      loads.set(s.sea.sailAt, load);
    }
    load.units += s.units;
    if (snap.now < s.sea.atPortAt) load.onRoad += s.units;
    load.orders.set(orderId, (load.orders.get(orderId) ?? 0) + s.units);
  }
  return [...loads.values()]
    .map(({ orders, ...l }) => ({ ...l, byOrder: [...orders].sort().map(([orderId, units]) => ({ orderId, units })) }))
    .sort((a, b) => a.sailAt - b.sailAt);
}

/** Units in each leg of the trip right now. */
export function unitsByLeg(snap: Feed, scope?: Scope) {
  const out: Record<FreightLeg, number> = { road: 0, port: 0, sea: 0, import: 0 };
  for (const s of visibleSea(snap, scope)) out[legAt(s, snap.now)] += s.units;
  return out;
}

export type BufferHealth = SprintHealth;

export type OrderBuffer = {
  orderId: string;
  /** Between leaving Pune and reaching Conroe. */
  onTheWay: number;
  /** In Conroe, not yet dispatched. */
  onSite: number;
  /** Units Conroe plans to use this week. */
  weeklyUse: number;
  coverWeeks: number;
  health: BufferHealth;
};

function bufferHealth(weeks: number): BufferHealth {
  return weeks >= BUFFER_TARGET_WEEKS[0] ? "on-track" : weeks >= BUFFER_TARGET_WEEKS[0] - 2 ? "at-risk" : "behind";
}

/** Stock at sea and on site in Conroe for one order finished there, in weeks of Conroe's use. */
export function orderBuffer(snap: Snapshot, orderId: string): OrderBuffer | null {
  const crossing = crossingStep.get(orderId);
  if (!crossing) return null;
  const last = orderById[orderId].route.length - 1;
  let pastPune = 0;
  for (const wo of Object.values(snap.workOrders)) if (wo.orderId === orderId) pastPune += wo.done[crossing - 1] - wo.done[last];
  const onTheWay = snap.shipments
    .filter((s) => crossesSea(s) && snap.workOrders[s.workOrderId]?.orderId === orderId)
    .reduce((n, s) => n + s.units, 0);
  const weeklyUse = snap.sprint.lines.find((l) => l.id === lineId(orderId, crossing))?.units ?? 0;
  const coverWeeks = weeklyUse ? pastPune / weeklyUse : 0;
  return { orderId, onTheWay, onSite: pastPune - onTheWay, weeklyUse, coverWeeks, health: bufferHealth(coverWeeks) };
}

export function usBuffers(snap: Snapshot, scope?: Scope) {
  return [...crossingStep.keys()].filter((id) => !scope || canSeeOrder(scope, id)).flatMap((id) => orderBuffer(snap, id) ?? []);
}

export type PuneOutlook = {
  orderId: string;
  committed: number;
  done: number;
  /** Units expected through the last Pune step by the end of the week. */
  forecast: number;
  short: number;
  /** When this week's output reaches Conroe, on the sailing it makes. */
  landsAt: number;
  /** When units that miss it reach Conroe, a sailing later. */
  lateAt: number;
  /** Cover once this week's shortfall would have landed. */
  coverAfter: number;
};

/** Whether Pune ships this week what Conroe will need in two months, and what a shortfall costs the buffer. */
export function puneOutlook(snap: Snapshot, orderId: string): PuneOutlook | null {
  const crossing = crossingStep.get(orderId);
  const buffer = orderBuffer(snap, orderId);
  const line = snap.sprint.lines.find((l) => l.id === lineId(orderId, (crossing ?? 0) - 1));
  if (!crossing || !buffer || !line) return null;
  const totals = sprintTotals(snap, [line]);
  const done = Math.min(line.units, snap.sprint.done[line.id] ?? 0);
  const forecast = Math.min(line.units, Math.round(totals.forecastHours / line.hoursPerUnit));
  const short = Math.max(0, line.units - forecast);
  const landsAt = voyageFor(snap.sprint.weekEnd - DAY).arriveAt;
  const lateAt = voyageFor(snap.sprint.weekEnd + 6 * DAY).arriveAt;
  const coverAfter = buffer.weeklyUse ? buffer.coverWeeks - short / buffer.weeklyUse : 0;
  return { orderId, committed: line.units, done, forecast, short, landsAt, lateAt, coverAfter };
}
