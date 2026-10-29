import { machines, runsStep } from "./catalog/machines";
import { orders } from "./catalog/orders";
import type { CommitLine } from "./types";

const WEEK_HOURS = 168;
/** Share of a machine's week the planner assumes it can actually run. */
export const PLANNED_AVAILABILITY = 0.9;
/** Commit a little more than the bare minimum so one bad day does not sink the due date. */
const BUFFER = 1.05;

export const lineId = (orderId: string, opIndex: number) => `${orderId}:${opIndex}`;

/**
 * Auto-plans the week. Orders are planned tightest due date first; each commits
 * the units it needs to stay on course, cut back to whatever capacity is left at
 * the most constrained step of its route. Every step commits the same units, so
 * the week's plan is a flow, not a pile of half-finished work.
 */
export function planWeek(remaining: Record<string, number>) {
  // Hours left on each machine; a step can use any machine that runs it.
  const capacity = new Map(machines.map((m) => [m.id, WEEK_HOURS * PLANNED_AVAILABILITY]));
  const eligible = (orderId: string, op: (typeof orders)[number]["route"][number]) => machines.filter((m) => runsStep(m, orderId, op));
  const hoursLeft = (ms: typeof machines) => ms.reduce((n, m) => n + (capacity.get(m.id) ?? 0), 0);

  const lines: CommitLine[] = [];
  const needed: Record<string, number> = {};

  for (const order of [...orders].sort((a, b) => a.dueInDays - b.dueInDays)) {
    const weeksLeft = Math.max(1, order.dueInDays / 7);
    const need = Math.ceil(((remaining[order.id] ?? 0) / weeksLeft) * BUFFER);
    needed[order.id] = need;

    let units = need;
    for (const op of order.route) units = Math.min(units, Math.floor(hoursLeft(eligible(order.id, op)) / (op.cycleMin / 60)));
    units = Math.max(0, units);

    order.route.forEach((op, i) => {
      const id = lineId(order.id, i);
      // Spread the hours over the machines that can run the step, in proportion to what each has left.
      const ms = eligible(order.id, op);
      const left = hoursLeft(ms);
      for (const m of ms) capacity.set(m.id, (capacity.get(m.id) ?? 0) * (1 - Math.min(1, (units * op.cycleMin) / 60 / Math.max(1e-9, left))));
      lines.push({
        id,
        orderId: order.id,
        opIndex: i,
        plant: op.plant,
        capability: op.capability,
        units,
        hoursPerUnit: op.cycleMin / 60,
      });
    });
  }

  return { lines, needed };
}
