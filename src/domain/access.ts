import { machineById, machines, runsStep } from "./catalog/machines";
import { orders, workOrderById } from "./catalog/orders";
import { plants } from "./catalog/plants";
import type { Alert, Person, PlantCode } from "./types";

// Role-based scope. Everything a view shows goes through these checks, so the same
// rules can move behind an API once real data and real sign-in exist.
export type Scope = {
  user: Person;
  /** Plants whose machines, people and work the user can open. */
  plants: ReadonlySet<PlantCode>;
  /** Orders the user can open. */
  orders: ReadonlySet<string>;
  /** Machines the user is the named owner of. */
  ownMachines: ReadonlySet<string>;
  summary: string;
};

export function scopeFor(user: Person): Scope {
  const ownMachines = new Set(machines.filter((m) => m.ownerId === user.id).map((m) => m.id));

  if (user.role === "executive") {
    return {
      user,
      plants: new Set(plants.map((p) => p.code)),
      orders: new Set(orders.map((o) => o.id)),
      ownMachines,
      summary: `all ${plants.length} plants and every schedule`,
    };
  }

  if (user.role === "plant-manager") {
    const mine = new Set(user.plants ?? []);
    return {
      user,
      plants: mine,
      orders: new Set(orders.filter((o) => o.route.some((op) => mine.has(op.plant))).map((o) => o.id)),
      ownMachines,
      summary: `${[...mine].join(", ")} and the schedules that pass through it`,
    };
  }

  // Lead engineers see the orders they lead, plus any order that runs on a machine they own.
  const ownCaps = [...ownMachines].map((id) => machineById[id]);
  const myOrders = orders.filter((o) => o.leadEngineerId === user.id || o.route.some((op) => ownCaps.some((m) => runsStep(m, o.id, op))));
  const myPlants = new Set<PlantCode>([
    ...myOrders.flatMap((o) => o.route.map((op) => op.plant)),
    ...ownCaps.map((m) => m.plant),
  ]);
  const led = orders.filter((o) => o.leadEngineerId === user.id);
  return {
    user,
    plants: myPlants,
    orders: new Set(myOrders.map((o) => o.id)),
    ownMachines,
    summary: led.length
      ? led.map((o) => `${o.id} ${o.title}`).join(", ")
      : `${ownMachines.size} machine${ownMachines.size === 1 ? "" : "s"} at ${[...new Set(ownCaps.map((m) => m.plant))].join(", ")}`,
  };
}

export function canSeePlant(scope: Scope, code: PlantCode) {
  return scope.plants.has(code);
}

export function canSeeOrder(scope: Scope, orderId: string) {
  return scope.orders.has(orderId);
}

export function canSeeAlert(scope: Scope, alert: Alert) {
  const { user } = scope;
  if (user.role === "executive") return true;
  if (user.role === "plant-manager") return (user.plants ?? []).includes(alert.plant);
  if (scope.ownMachines.has(alert.machineId)) return true;
  const wo = alert.workOrderId ? workOrderById[alert.workOrderId] : undefined;
  return !!wo && scope.orders.has(wo.orderId);
}
