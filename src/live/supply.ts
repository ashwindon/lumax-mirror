import { canSeeOrder, type Scope } from "@/domain/access";
import { orderById, orders, stockById, stocks, stockSupplier, stockUser } from "@/domain/catalog/orders";
import { sameRegion } from "@/domain/catalog/plants";
import { IMPORT_COVER_WEEKS, importLegAt, roadTime, type ImportLeg } from "@/domain/freight";
import { lineId } from "@/domain/planning";
import type { ImportLot, PlantCode, Shipment, Snapshot } from "@/domain/types";
import type { SprintHealth } from "./sprint";

// What feeds the lamp lines: LED boards trucked from Bawal Electronics, and the imported
// LED packages, driver ICs and connectors Bawal builds them from.

const HOUR = 3_600_000;

type Feed = Pick<Snapshot, "now" | "shipments" | "docks" | "stocks" | "imports" | "sprint">;

export type BoardSupply = {
  stockId: string;
  name: string;
  unitName: string;
  /** The lamp plant that fits the boards. */
  plant: PlantCode;
  /** The board order at Bawal and the lamp schedule that uses them. */
  supplierId: string;
  userId: string;
  onHand: number;
  onRoad: number;
  /** Finished at Bawal, waiting for the next truck. */
  atDock: number;
  hourlyUse: number;
  /** Hours the boards on hand last at this week's planned rate. */
  coverHours: number;
  /** The next truck in, if one is on the road. */
  next?: Shipment;
  /** How long the road takes, e.g. "overnight" or "2 days". */
  road: string;
  health: SprintHealth;
};

/** Boards at, and on their way to, one lamp plant. */
export function boardSupply(snap: Feed, stockId: string): BoardSupply | null {
  const stock = stockById[stockId];
  const supplierId = stockSupplier[stockId];
  const userId = stockUser[stockId];
  if (!stock || stock.imported || !supplierId || !userId) return null;
  const user = orderById[userId];
  const use = snap.sprint.lines.find((l) => l.id === lineId(userId, user.consumes!.opIndex))?.units ?? 0;
  const hourlyUse = use / 168;
  const trucks = snap.shipments.filter((s) => s.stockId === stockId).sort((a, b) => a.arriveAt - b.arriveAt);
  const onHand = Math.max(0, snap.stocks[stockId] ?? 0);
  const coverHours = hourlyUse ? onHand / hourlyUse : Infinity;
  const next = trucks[0];
  const untilNext = next ? (next.arriveAt - snap.now) / HOUR : Infinity;
  const from = orderById[supplierId].route[orderById[supplierId].route.length - 1].plant;
  return {
    stockId,
    name: stock.name,
    unitName: stock.unitName,
    plant: stock.plant,
    supplierId,
    userId,
    onHand,
    onRoad: trucks.reduce((n, s) => n + s.units, 0),
    atDock: snap.docks.filter((d) => d.stockId === stockId).reduce((n, d) => n + d.units, 0),
    hourlyUse,
    coverHours,
    next,
    road: roadTime(from, stock.plant),
    health: onHand <= 0 ? "behind" : coverHours < Math.min(untilNext, 24) ? "at-risk" : "on-track",
  };
}

/** Board supply for every lamp schedule the user can see. */
export function boardSupplies(snap: Feed, scope?: Scope) {
  return stocks
    .filter((s) => !s.imported && (!scope || canSeeOrder(scope, stockUser[s.id]) || canSeeOrder(scope, stockSupplier[s.id])))
    .flatMap((s) => boardSupply(snap, s.id) ?? []);
}

export type ImportLoad = ImportLot & { leg: ImportLeg; /** 0 at the origin port, 1 at JNPT. */ progress: number };

export type ImportSupply = {
  stockId: string;
  name: string;
  onHand: number;
  onTheWay: number;
  /** Board sets' worth the SMT lines plan to use this week. */
  weeklyUse: number;
  onHandWeeks: number;
  coverWeeks: number;
  health: SprintHealth;
  lots: ImportLoad[];
};

export function importHealth(weeks: number): SprintHealth {
  return weeks >= IMPORT_COVER_WEEKS[0] ? "on-track" : weeks >= IMPORT_COVER_WEEKS[0] - 1.5 ? "at-risk" : "behind";
}

/** Imported parts at Bawal and on their way, in weeks of what the SMT lines use. */
export function importSupply(snap: Feed): ImportSupply | null {
  const stock = stocks.find((s) => s.imported);
  if (!stock) return null;
  const weeklyUse = orders
    .filter((o) => o.consumes?.stockId === stock.id)
    .reduce((n, o) => n + (snap.sprint.lines.find((l) => l.id === lineId(o.id, o.consumes!.opIndex))?.units ?? 0), 0);
  const onHand = Math.max(0, snap.stocks[stock.id] ?? 0);
  const lots = snap.imports
    .map((l) => ({ ...l, leg: importLegAt(l, snap.now), progress: Math.min(1, Math.max(0, (snap.now - l.sailAt) / (l.berthAt - l.sailAt))) }))
    .sort((a, b) => a.arriveAt - b.arriveAt);
  // Lots not yet sailed are bookings, not stock on its way.
  const onTheWay = lots.filter((l) => l.leg !== "origin").reduce((n, l) => n + l.kits, 0);
  const onHandWeeks = weeklyUse ? onHand / weeklyUse : 0;
  const coverWeeks = weeklyUse ? (onHand + onTheWay) / weeklyUse : 0;
  return { stockId: stock.id, name: stock.name, onHand, onTheWay, weeklyUse, onHandWeeks, coverWeeks, health: importHealth(coverWeeks), lots };
}

/** Lots on the water, for drawing ships: one per sailing. */
export const lotsAtSea = (supply: ImportSupply | null) => (supply?.lots ?? []).filter((l) => l.leg !== "origin");

export type Truck = {
  key: string;
  from: PlantCode;
  to: PlantCode;
  departAt: number;
  arriveAt: number;
  units: number;
  byOrder: { orderId: string; units: number }[];
  delay?: Shipment["delay"];
};

/**
 * Long-haul trucks between clusters right now. Loads that left on the same evening
 * for the same plant ride one truck.
 */
export function longHaulTrucks(snap: Pick<Snapshot, "shipments">, scope?: Scope): Truck[] {
  const trucks = new Map<string, Truck>();
  for (const s of snap.shipments) {
    if (sameRegion(s.from, s.to) || (scope && !canSeeOrder(scope, s.orderId))) continue;
    const key = `${s.from}>${s.to}@${s.departAt}`;
    const t = trucks.get(key) ?? { key, from: s.from, to: s.to, departAt: s.departAt, arriveAt: s.arriveAt, units: 0, byOrder: [], delay: s.delay };
    t.units += s.units;
    t.arriveAt = Math.max(t.arriveAt, s.arriveAt);
    const row = t.byOrder.find((o) => o.orderId === s.orderId);
    if (row) row.units += s.units;
    else t.byOrder.push({ orderId: s.orderId, units: s.units });
    trucks.set(key, t);
  }
  return [...trucks.values()].sort((a, b) => a.arriveAt - b.arriveAt);
}

/** Share of the trip done, for placing a truck on its road. */
export const tripProgress = (t: { departAt: number; arriveAt: number }, now: number) =>
  Math.min(1, Math.max(0, (now - t.departAt) / Math.max(1, t.arriveAt - t.departAt)));

export const weeks = (w: number) => `${w.toFixed(1)} weeks`;

/** "14 h", "1.5 days": how long boards on hand last. */
export function coverLabel(hours: number) {
  if (!Number.isFinite(hours)) return "no use planned";
  if (hours < 1) return "under an hour";
  if (hours < 36) return `${Math.round(hours)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}

