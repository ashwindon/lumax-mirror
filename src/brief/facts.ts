import { canSeeAlert, canSeeOrder, canSeePlant, type Scope } from "@/domain/access";
import { machineById, machinesByPlant } from "@/domain/catalog/machines";
import { customerById, orderById, stockById } from "@/domain/catalog/orders";
import { people, personById } from "@/domain/catalog/people";
import { plantByCode, plants } from "@/domain/catalog/plants";
import type { Alert, AlertKind, PlantCode, Snapshot } from "@/domain/types";
import { IMPORT_COVER_WEEKS, importLegs } from "@/domain/freight";
import { day, dayTime, dueDate, plantClock } from "@/lib/format";
import { boardSupplies, importSupply, longHaulTrucks } from "@/live/supply";
import { isOpen, machineContext, openAlerts, orderProgress, plantHealth, visibleOrders } from "@/live/selectors";
import { machineTarget, paceHealth, responseTimes, sprintTotals, topCauses, velocity, visibleLines } from "@/live/sprint";

// Compact, role-scoped views of the live state. The briefing presets read them
// directly and Claude reads them through tools, so both see the same facts and
// the same access rules as the rest of the app.

const HOUR = 3_600_000;
const MIN = 60_000;
const pct = (r: number) => Math.round(r * 100);
const h1 = (ms: number) => Math.round((ms / HOUR) * 10) / 10;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function clock(snap: Snapshot) {
  const elapsed = (snap.now - snap.sprint.weekStart) / (snap.sprint.weekEnd - snap.sprint.weekStart);
  return {
    asOf: `${DAYS[Math.min(6, Math.floor(elapsed * 7))]} ${plantClock(snap.now)} IST`,
    weekDay: Math.min(7, Math.floor(elapsed * 7) + 1),
    weekElapsedPct: pct(elapsed),
  };
}

export type StopFact = ReturnType<typeof stopFact>;

function stopFact(snap: Snapshot, a: Alert) {
  const machine = machineById[a.machineId];
  const wo = a.workOrderId ? snap.workOrders[a.workOrderId] : undefined;
  return {
    alertId: a.id,
    kind: a.kind,
    title: a.title,
    code: a.code,
    cause: a.cause,
    machine: machine.name,
    machineId: machine.id,
    plant: a.plant,
    openMinutes: Math.round((snap.now - a.raisedAt) / MIN),
    ownerId: a.ownerId,
    owner: personById[a.ownerId]?.name,
    acknowledged: a.acknowledgedAt !== undefined,
    orderId: wo?.orderId,
    unit: a.unit,
  };
}

/** Every plant the user can see in full, and status only for the rest. */
export function networkFacts(snap: Snapshot, scope: Scope) {
  const rows = plants.map((p) => {
    const health = plantHealth(snap, p.code);
    const t = sprintTotals(snap, snap.sprint.lines.filter((l) => l.plant === p.code));
    const base = {
      code: p.code,
      name: p.name,
      machines: { ...health.counts, total: health.total },
    };
    if (!canSeePlant(scope, p.code)) return { ...base, access: "status only" as const };
    return {
      ...base,
      access: "full" as const,
      manager: personById[p.managerId]?.name,
      managerId: p.managerId,
      utilizationTodayPct: pct(health.utilization),
      openStops: health.alerts,
      week: t.committedHours
        ? {
            committedHours: Math.round(t.committedHours),
            doneHours: Math.round(t.doneHours),
            pacePct: pct(t.pace),
            health: paceHealth(t.doneHours, t.committedHours, t.elapsed),
            hoursLost: h1(snap.sprint.causes.filter((c) => c.plant === p.code).reduce((n, c) => n + c.lostMs, 0)),
          }
        : null,
    };
  });
  const lines = visibleLines(snap, scope);
  const totals = sprintTotals(snap, lines);
  const alerts = openAlerts(snap, scope);
  const orders = visibleOrders(scope).map((o) => orderProgress(snap, o));
  return {
    ...clock(snap),
    week: {
      committedHours: Math.round(totals.committedHours),
      doneHours: Math.round(totals.doneHours),
      pacePct: pct(totals.pace),
      health: totals.health,
      forecastPct: totals.committedHours ? pct(totals.forecastHours / totals.committedHours) : 100,
    },
    unitsFinishedToday: orders.reduce((n, p) => n + p.finishedToday, 0),
    ordersAtRisk: orders.filter((p) => p.health !== "on-track").length,
    openStops: alerts.length,
    unacknowledgedStops: alerts.filter((a) => !a.acknowledgedAt).length,
    plants: rows,
  };
}

export type OrderFact = ReturnType<typeof orderFact>;

function orderFact(snap: Snapshot, scope: Scope, orderId: string) {
  const order = orderById[orderId];
  const p = orderProgress(snap, order);
  const last = snap.sprint.lines.find((l) => l.orderId === order.id && l.opIndex === order.route.length - 1);
  const blockers = snap.alerts
    .filter((a) => isOpen(a) && canSeeAlert(scope, a) && a.workOrderId && snap.workOrders[a.workOrderId]?.orderId === order.id)
    .map((a) => stopFact(snap, a));
  return {
    orderId: order.id,
    title: order.title,
    customer: customerById[order.customerId].name,
    customerGroup: customerById[order.customerId].group,
    unit: order.unitName,
    ...(order.unitPriceInr ? { unitPriceInr: order.unitPriceInr } : {}),
    ...(order.consumes && !order.fills ? { fitsLedBoardsFrom: "Bawal Electronics", boardStock: order.consumes.stockId } : {}),
    ...(order.fills ? { ledBoardsFor: stockById[order.fills].plant } : {}),
    due: dueDate(order.dueInDays, snap.sprint.weekStart),
    dueInDaysFromWeekStart: order.dueInDays,
    quantity: order.quantity,
    unitsDoneOverall: p.done,
    leadId: order.leadEngineerId,
    lead: personById[order.leadEngineerId]?.name,
    health: p.health,
    pacePct: pct(p.sprint.pace),
    thisWeek: {
      unitsOut: last ? snap.sprint.done[last.id] : 0,
      unitsCommitted: last?.units ?? 0,
      unitsNeededForDueDate: snap.sprint.needed[order.id] ?? 0,
      forecastPct: p.sprint.committedHours ? pct(p.sprint.forecastHours / p.sprint.committedHours) : 100,
      machineHoursLost: h1(snap.sprint.lostMs[order.id] ?? 0),
    },
    plants: [...new Set(order.route.map((op) => op.plant))],
    openStops: blockers,
  };
}

export function ordersFacts(snap: Snapshot, scope: Scope) {
  const rank = { behind: 0, "at-risk": 1, "on-track": 2 } as const;
  return visibleOrders(scope)
    .map((o) => orderFact(snap, scope, o.id))
    .sort((a, b) => rank[a.health] - rank[b.health] || a.dueInDaysFromWeekStart - b.dueInDaysFromWeekStart);
}

export function orderDetailFacts(snap: Snapshot, scope: Scope, orderId: string) {
  const order = orderById[orderId];
  if (!order) return { error: `No order ${orderId}.` };
  if (!canSeeOrder(scope, orderId)) return { error: `You do not have access to ${orderId}.` };
  const p = orderProgress(snap, order);
  const elapsed = p.sprint.elapsed;
  return {
    ...orderFact(snap, scope, orderId),
    route: order.route.map((op, i) => {
      const line = snap.sprint.lines.find((l) => l.orderId === order.id && l.opIndex === i);
      const done = line ? snap.sprint.done[line.id] : 0;
      return {
        step: i + 1,
        op: op.name,
        plant: op.plant,
        minutesPerUnit: op.cycleMin,
        doneThisWeek: done,
        committedThisWeek: line?.units ?? 0,
        health: line ? paceHealth(Math.min(done, line.units), line.units, elapsed) : "on-track",
        onMachine: p.flow[i].active,
        waiting: p.flow[i].queued,
        inTransitToHere: p.flow[i].inTransit,
      };
    }),
  };
}

export function plantDetailFacts(snap: Snapshot, scope: Scope, code: PlantCode) {
  const plant = plantByCode[code];
  if (!plant) return { error: `No plant ${code}.` };
  if (!canSeePlant(scope, code)) return { error: `You only see status for ${code}.`, ...networkFacts(snap, scope).plants.find((p) => p.code === code) };
  const elapsed = sprintTotals(snap, snap.sprint.lines.filter((l) => l.plant === code)).elapsed;
  return {
    code,
    name: plant.name,
    specialties: plant.specialties,
    headcount: plant.headcount,
    managerId: plant.managerId,
    manager: personById[plant.managerId]?.name,
    machines: (machinesByPlant[code] ?? []).map((m) => {
      const ctx = machineContext(snap, m.id);
      const week = machineTarget(snap, m);
      return {
        machineId: m.id,
        name: m.name,
        status: ctx.live.status,
        forMinutes: Math.round((snap.now - ctx.live.since) / MIN),
        workingOn: ctx.order
          ? `${ctx.order.id} ${ctx.order.unitName.toLowerCase()} ${ctx.live.unit}, ${ctx.op?.name}`
          : (ctx.live.otherWork ?? null),
        stop: ctx.alert ? { alertId: ctx.alert.id, title: ctx.alert.title, cause: ctx.alert.cause } : null,
        ownerId: m.ownerId,
        owner: personById[m.ownerId]?.name,
        week: week.target ? { targetHours: Math.round(week.target), doneHours: Math.round(week.done), health: paceHealth(week.done, week.target, elapsed) } : null,
      };
    }),
  };
}

export function stopsFacts(snap: Snapshot, scope: Scope, filter: { plant?: PlantCode; kind?: AlertKind; unacknowledgedOnly?: boolean } = {}) {
  return openAlerts(snap, scope, filter.plant)
    .filter((a) => (!filter.kind || a.kind === filter.kind) && (!filter.unacknowledgedOnly || !a.acknowledgedAt))
    .map((a) => stopFact(snap, a));
}

export function causesFacts(snap: Snapshot, scope: Scope, only?: { plant?: PlantCode; orderId?: string }) {
  const rows = topCauses(snap, scope, only, 8);
  return {
    totalHoursLost: Math.round(rows.reduce((n, r) => n + r.lostHours, 0) * 10) / 10,
    causes: rows.map((r) => ({ cause: r.title, hoursLost: Math.round(r.lostHours * 10) / 10, stops: r.count, plants: r.plants })),
  };
}

export function responseFacts(snap: Snapshot, scope: Scope, plant?: PlantCode) {
  return responseTimes(snap, scope, plant ? { plant } : undefined).map((r) => ({
    personId: r.ownerId,
    person: personById[r.ownerId]?.name,
    avgMinutesToAcknowledge: Math.round(r.avgMinutes * 10) / 10,
    stops: r.count,
  }));
}

export function velocityFacts(snap: Snapshot, scope: Scope, only?: { plant?: PlantCode; orderId?: string }) {
  return velocity(snap, visibleLines(snap, scope, only)).map((w) => ({
    weekOf: new Date(w.weekStart).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
    committedHours: Math.round(w.committed),
    doneHours: Math.round(w.done),
    keptPct: w.committed ? pct(w.done / w.committed) : 100,
    ...(w.current ? { current: true, forecastHours: Math.round(w.forecast ?? 0) } : {}),
  }));
}

/** People matching a name, role or plant, with what they lead and own right now. */
export function peopleFacts(snap: Snapshot, scope: Scope, query: string) {
  const q = query.trim().toLowerCase();
  return people
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.id === q)
    .slice(0, 8)
    .map((p) => {
      const owned = Object.values(machineById).filter((m) => m.ownerId === p.id);
      return {
        personId: p.id,
        name: p.name,
        title: p.title,
        extension: p.extension,
        leadsOrders: visibleOrders(scope).filter((o) => o.leadEngineerId === p.id).map((o) => o.id),
        ownsMachines: owned.length,
        ownsMachinesAt: [...new Set(owned.map((m) => m.plant))],
        openStopsOwned: openAlerts(snap, scope).filter((a) => a.ownerId === p.id).map((a) => a.id),
      };
    });
}

/**
 * What feeds the lamp lines: LED boards at each lamp plant and on the road from Bawal,
 * and the imported LED parts at Bawal and at sea.
 */
export function supplyFacts(snap: Snapshot, scope: Scope) {
  const imports = importSupply(snap);
  const seesImports = scope.user.role === "executive" || scope.plants.has("BWE");
  return {
    ...clock(snap),
    ledBoards: boardSupplies(snap, scope).map((b) => ({
      plant: b.plant,
      plantName: plantByCode[b.plant].name,
      schedule: `${b.userId} ${orderById[b.userId].title}`,
      boardOrder: b.supplierId,
      boardsOnHand: b.onHand,
      hoursOfCoverAtPlan: Number.isFinite(b.coverHours) ? Math.round(b.coverHours) : null,
      onTheRoad: b.onRoad,
      atBawalDock: b.atDock,
      roadTime: b.road,
      health: b.health,
      nextTruck: b.next
        ? { arrives: dayTime(b.next.arriveAt), units: b.next.units, ...(b.next.delay ? { heldHours: b.next.delay.hours, why: b.next.delay.reason } : {}) }
        : null,
    })),
    longHaulTrucks: longHaulTrucks(snap, scope).map((t) => ({
      to: t.to,
      left: dayTime(t.departAt),
      arrives: dayTime(t.arriveAt),
      contents: t.byOrder,
      ...(t.delay ? { heldHours: t.delay.hours, why: t.delay.reason } : {}),
    })),
    importedParts:
      imports && seesImports
        ? {
            what: imports.name,
            trip: importLegs.map((l) => `${l.name}: ${l.days.toLowerCase()}`),
            coverWeeks: Math.round(imports.coverWeeks * 10) / 10,
            onHandWeeks: Math.round(imports.onHandWeeks * 10) / 10,
            targetWeeks: `${IMPORT_COVER_WEEKS[0]} to ${IMPORT_COVER_WEEKS[1]} (Lumax says it holds about two months of inventory)`,
            health: imports.health,
            lots: imports.lots.map((l) => ({
              lot: l.id,
              weeksOfParts: imports.weeklyUse ? Math.round((l.kits / imports.weeklyUse) * 10) / 10 : null,
              now: l.leg === "origin" ? "booked, not yet sailed" : l.leg === "sea" ? "at sea" : "landed at JNPT, on rail inland",
              sails: day(l.sailAt),
              atJnpt: day(l.berthAt),
              atBawal: day(l.arriveAt),
              ...(l.rolledDays ? { rolledToNextSailing: true } : {}),
            })),
          }
        : "Outside your access",
    note: "Lanes, sailing day and transit times are assumptions; Lumax does not publish its logistics partners.",
  };
}
