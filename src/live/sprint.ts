import { canSeeOrder, type Scope } from "@/domain/access";
import { machinesByPlant } from "@/domain/catalog/machines";
import type { CommitLine, Machine, PlantCode, Snapshot, StopMarker } from "@/domain/types";

const HOUR = 3_600_000;
const WEEK_HOURS = 168;

export type SprintHealth = "on-track" | "at-risk" | "behind";

export const sprintHealthLabel: Record<SprintHealth, string> = {
  "on-track": "On pace",
  "at-risk": "At risk",
  behind: "Behind",
};

/** Commitment lines the user may see, optionally narrowed to one plant or order. */
export function visibleLines(snap: Snapshot, scope: Scope, only?: { plant?: PlantCode; orderId?: string }) {
  return snap.sprint.lines.filter((l) => {
    const allowed = scope.user.role === "plant-manager" ? scope.plants.has(l.plant) : canSeeOrder(scope, l.orderId);
    return allowed && (!only?.plant || l.plant === only.plant) && (!only?.orderId || l.orderId === only.orderId);
  });
}

const doneAt = (snap: Snapshot, l: CommitLine, hour?: number) => {
  const units = hour === undefined ? snap.sprint.done[l.id] : (snap.sprint.doneByHour[l.id][hour] ?? snap.sprint.done[l.id]);
  return Math.min(units, l.units) * l.hoursPerUnit;
};

export type SprintTotals = {
  committedHours: number;
  doneHours: number;
  /** Share of the week gone, 0..1. */
  elapsed: number;
  /** Done against where an even pace would be by now; 1 is exactly on the line. */
  pace: number;
  health: SprintHealth;
  /** Hours expected done by the end of the week at the last day's rate. */
  forecastHours: number;
  /** Burn rate over the last 24 hours, hours per hour. */
  rate: number;
};

export function sprintTotals(snap: Snapshot, lines: CommitLine[]): SprintTotals {
  const { weekStart, weekEnd } = snap.sprint;
  const elapsed = Math.min(1, Math.max(0, (snap.now - weekStart) / (weekEnd - weekStart)));
  const hoursIn = elapsed * WEEK_HOURS;
  let committedHours = 0;
  let doneHours = 0;
  let doneDayAgo = 0;
  const dayAgo = Math.max(0, Math.floor(hoursIn) - 24);
  for (const l of lines) {
    committedHours += l.units * l.hoursPerUnit;
    doneHours += doneAt(snap, l);
    doneDayAgo += doneAt(snap, l, dayAgo);
  }
  const window = Math.max(1, hoursIn - dayAgo);
  const rate = (doneHours - doneDayAgo) / window;
  const forecastHours = Math.min(committedHours, doneHours + rate * (WEEK_HOURS - hoursIn));
  const expected = committedHours * elapsed;
  const pace = expected > 0 ? doneHours / expected : 1;
  const health: SprintHealth = elapsed < 0.05 || committedHours === 0 ? "on-track" : pace >= 0.98 ? "on-track" : pace >= 0.9 ? "at-risk" : "behind";
  return { committedHours, doneHours, elapsed, pace, health, forecastHours, rate };
}

export type BurndownPoint = { hour: number; remaining: number };

/** Remaining committed hours at each hour mark so far, plus a final point at "now". */
export function burndown(snap: Snapshot, lines: CommitLine[]): BurndownPoint[] {
  const hoursIn = ((snap.now - snap.sprint.weekStart) / HOUR) | 0;
  const committed = lines.reduce((n, l) => n + l.units * l.hoursPerUnit, 0);
  const points: BurndownPoint[] = [];
  for (let h = 0; h <= Math.min(hoursIn, WEEK_HOURS); h++) {
    points.push({ hour: h, remaining: committed - lines.reduce((n, l) => n + doneAt(snap, l, h), 0) });
  }
  const nowHour = (snap.now - snap.sprint.weekStart) / HOUR;
  if (nowHour > hoursIn) points.push({ hour: nowHour, remaining: committed - lines.reduce((n, l) => n + doneAt(snap, l), 0) });
  return points;
}

/** Long stops that hit the given lines' plants and orders, biggest first. */
export function stopMarkers(snap: Snapshot, lines: CommitLine[], limit = 8): (StopMarker & { hour: number })[] {
  const plants = new Set(lines.map((l) => l.plant));
  const orderIds = new Set(lines.map((l) => l.orderId));
  return snap.sprint.markers
    .filter((m) => plants.has(m.plant) && (!m.orderId || orderIds.has(m.orderId)))
    .sort((a, b) => b.lostMs - a.lostMs)
    .slice(0, limit)
    .map((m) => ({ ...m, hour: (m.at - snap.sprint.weekStart) / HOUR }));
}

/**
 * A machine's share of its plant's commitment: each line's hours split evenly
 * across the machines at that plant able to do it.
 */
export function machineTarget(snap: Snapshot, machine: Machine) {
  const peers = machinesByPlant[machine.plant] ?? [];
  let target = 0;
  for (const l of snap.sprint.lines) {
    if (l.plant !== machine.plant || !machine.capabilities.includes(l.capability)) continue;
    const able = peers.filter((p) => p.capabilities.includes(l.capability)).length || 1;
    target += (l.units * l.hoursPerUnit) / able;
  }
  return { target, done: snap.sprint.machineHours[machine.id] ?? 0 };
}

export function paceHealth(done: number, target: number, elapsed: number): SprintHealth {
  if (target <= 0 || elapsed < 0.05) return "on-track";
  const pace = done / (target * elapsed);
  return pace >= 0.98 ? "on-track" : pace >= 0.9 ? "at-risk" : "behind";
}

export type CauseRow = { title: string; lostHours: number; count: number; plants: PlantCode[] };

/** Where this week's hours went, merged by cause, for the user's slice of the network. */
export function topCauses(snap: Snapshot, scope: Scope, only?: { plant?: PlantCode; orderId?: string }, limit = 6): CauseRow[] {
  const rows = new Map<string, CauseRow>();
  for (const c of snap.sprint.causes) {
    if (only?.plant && c.plant !== only.plant) continue;
    if (only?.orderId && c.orderId !== only.orderId) continue;
    const allowed =
      scope.user.role === "executive" ||
      (scope.user.role === "plant-manager" ? scope.plants.has(c.plant) : !!c.orderId && canSeeOrder(scope, c.orderId));
    if (!allowed) continue;
    const row = rows.get(c.title) ?? { title: c.title, lostHours: 0, count: 0, plants: [] };
    row.lostHours += c.lostMs / HOUR;
    row.count += c.count;
    if (!row.plants.includes(c.plant)) row.plants.push(c.plant);
    rows.set(c.title, row);
  }
  return [...rows.values()].sort((a, b) => b.lostHours - a.lostHours).slice(0, limit);
}

export type ResponseRow = { ownerId: string; avgMinutes: number; count: number };

/** How fast each owner acknowledges alerts this week, slowest first. */
export function responseTimes(snap: Snapshot, scope: Scope, only?: { plant?: PlantCode }): ResponseRow[] {
  const rows = new Map<string, { ack: number; count: number }>();
  for (const r of snap.sprint.responses) {
    if (only?.plant && r.plant !== only.plant) continue;
    if (scope.user.role === "plant-manager" && !scope.plants.has(r.plant)) continue;
    if (scope.user.role === "lead-engineer" && !scope.plants.has(r.plant)) continue;
    const row = rows.get(r.ownerId) ?? { ack: 0, count: 0 };
    row.ack += r.ackMs;
    row.count += r.count;
    rows.set(r.ownerId, row);
  }
  return [...rows.entries()]
    .map(([ownerId, r]) => ({ ownerId, avgMinutes: r.ack / r.count / 60_000, count: r.count }))
    .sort((a, b) => b.avgMinutes - a.avgMinutes);
}

export type VelocityWeek = { weekStart: number; committed: number; done: number; current?: boolean; forecast?: number };

/** Committed against done hours for the past weeks, and this week so far. */
export function velocity(snap: Snapshot, lines: CommitLine[]): VelocityWeek[] {
  const ids = new Set(lines.map((l) => l.id));
  const past = snap.sprint.history.map((w) => {
    let committed = 0;
    let done = 0;
    for (const [id, v] of Object.entries(w.lines)) {
      if (!ids.has(id)) continue;
      committed += v.committedHours;
      done += v.doneHours;
    }
    return { weekStart: w.weekStart, committed, done };
  });
  const t = sprintTotals(snap, lines);
  return [...past, { weekStart: snap.sprint.weekStart, committed: t.committedHours, done: t.doneHours, current: true, forecast: t.forecastHours }];
}
