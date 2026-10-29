import { canSeeAlert, canSeeOrder, type Scope } from "@/domain/access";
import { machineById, machinesByPlant } from "@/domain/catalog/machines";
import { orderById, orders } from "@/domain/catalog/orders";
import type { Alert, MachineStatus, Order, PlantCode, Snapshot } from "@/domain/types";
import { sprintTotals, type SprintHealth, type SprintTotals } from "./sprint";

export const isOpen = (a: Alert) => a.resolvedAt === undefined;

const alertRank: Record<Alert["kind"], number> = { breakdown: 0, quality: 1, material: 2, setup: 3 };

/** Unresolved alerts the user may see, most serious and oldest first. */
export function openAlerts(snap: Snapshot, scope: Scope, plant?: PlantCode) {
  return snap.alerts
    .filter((a) => isOpen(a) && canSeeAlert(scope, a) && (!plant || a.plant === plant))
    .sort((a, b) => alertRank[a.kind] - alertRank[b.kind] || a.raisedAt - b.raisedAt);
}

export const statusRank: Record<MachineStatus, number> = { down: 0, setup: 1, waiting: 2, running: 3 };

export type PlantHealth = {
  counts: Record<MachineStatus, number>;
  total: number;
  utilization: number;
  worst: MachineStatus;
  alerts: number;
};

export function plantHealth(snap: Snapshot, code: PlantCode): PlantHealth {
  const list = machinesByPlant[code] ?? [];
  const counts: Record<MachineStatus, number> = { running: 0, waiting: 0, setup: 0, down: 0 };
  let run = 0;
  let worst: MachineStatus = "running";
  const elapsed = Math.max(1, snap.now - snap.dayStart);
  for (const m of list) {
    const live = snap.machines[m.id];
    counts[live.status] += 1;
    run += live.runMs / elapsed;
    if (live.status !== "waiting" && statusRank[live.status] < statusRank[worst]) worst = live.status;
  }
  return {
    counts,
    total: list.length,
    utilization: list.length ? run / list.length : 0,
    worst,
    alerts: snap.alerts.filter((a) => isOpen(a) && a.plant === code).length,
  };
}

export type OrderHealth = SprintHealth;

export type OpFlow = { done: number; queued: number; active: number; inTransit: number };

export type OrderProgress = {
  done: number;
  finishedToday: number;
  lostMs: number;
  health: OrderHealth;
  sprint: SprintTotals;
  /** Units at each op of the route right now. */
  flow: OpFlow[];
  /** Units released to the floor in the current work orders. */
  released: number;
  workOrderIds: string[];
};

export function orderProgress(snap: Snapshot, order: Order): OrderProgress {
  const last = order.route.length - 1;
  const flow: OpFlow[] = order.route.map(() => ({ done: 0, queued: 0, active: 0, inTransit: 0 }));
  const workOrderIds: string[] = [];
  let done = order.shippedBefore;
  let released = 0;
  for (const [id, wo] of Object.entries(snap.workOrders)) {
    if (wo.orderId !== order.id) continue;
    workOrderIds.push(id);
    released += wo.units;
    done += wo.done[last];
    wo.done.forEach((d, i) => {
      flow[i].done += d;
      flow[i].queued += wo.queued[i];
      flow[i].active += wo.active[i];
    });
  }
  for (const s of snap.shipments) {
    if (snap.workOrders[s.workOrderId]?.orderId === order.id) flow[s.opIndex].inTransit += s.units;
  }
  const lostMs = snap.lostMs[order.id] ?? 0;
  // Health is the order's pace against this week's commitment, across every plant on its route.
  const sprint = sprintTotals(snap, snap.sprint.lines.filter((l) => l.orderId === order.id));
  return { done, finishedToday: snap.finishedToday[order.id] ?? 0, lostMs, health: sprint.health, sprint, flow, released, workOrderIds };
}

export function visibleOrders(scope: Scope) {
  return orders.filter((o) => canSeeOrder(scope, o.id));
}

/** Everything needed to explain what one machine is doing right now. */
export function machineContext(snap: Snapshot, machineId: string) {
  const def = machineById[machineId];
  const live = snap.machines[machineId];
  const alert = live.alertId ? snap.alerts.find((a) => a.id === live.alertId) : undefined;
  const workOrder = live.workOrderId ? snap.workOrders[live.workOrderId] : undefined;
  const order = workOrder ? orderById[workOrder.orderId] : undefined;
  const op = order && live.opIndex !== undefined ? order.route[live.opIndex] : undefined;
  return { def, live, alert, workOrder, order, op };
}

export { sprintHealthLabel as healthLabel } from "./sprint";
