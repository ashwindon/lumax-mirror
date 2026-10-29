import { machines, runsStep } from "@/domain/catalog/machines";
import { orderById, orders, stockById, stocks, workOrders } from "@/domain/catalog/orders";
import { plantByCode, sameRegion } from "@/domain/catalog/plants";
import { chronicTroubles, faultProfiles, genericMajorFault, type ChronicTrouble, type FaultCause, type FaultProfile } from "@/domain/faults";
import { IMPORT_ON_HAND_WEEKS, importLot, importSailings, nextDeparture, roadDelay, transitMs } from "@/domain/freight";
import { lineId, planWeek } from "@/domain/planning";
import type {
  Alert,
  CommitLine,
  DockLoad,
  ImportLot,
  Machine,
  MachineKind,
  MachineStatus,
  PastWeek,
  PlantCode,
  ResponseTime,
  Shipment,
  Snapshot,
  StopCause,
  StopMarker,
  WorkOrderLive,
} from "@/domain/types";
import { between, mulberry32, pick, type Rng } from "./rng";

export const STEP_MS = 5_000;
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const SHIFT = 8 * HOUR;
const IST_OFFSET = 5.5 * HOUR;
/** Resolved stops stay in the snapshot this long, so a machine can show what stopped it today. */
const ALERT_HISTORY_MS = 12 * HOUR;
/** Work-in-progress cap per order, in batches. New batches are released as old ones finish. */
const WIP_BATCHES = 4;
/** OEM call-offs arrive daily, so a week's schedule is released evenly, this far ahead of an even pace. */
const RELEASE_AHEAD = 0.04;
/**
 * Plants level-load to the schedule: a step runs at most this far ahead of an even
 * week, and the machine spends spare time on other programmes instead of building stock.
 */
const LEVEL_AHEAD = 0.025;
/** Chance per step that an idle machine with nothing queued picks up another programme's work. */
const OTHER_WORK_CHANCE = 0.006;
/** A machine that serves a tracked schedule waits this long for it before taking other work. */
const OTHER_WORK_AFTER_MS = 30 * MIN;
/** Stops at least this long get pinned on burndown charts. */
const MARKER_MIN_MS = 25 * MIN;
const MAX_MARKERS = 400;
const HISTORY_WEEKS = 6;
/** Long stops per week: one or two that decide the week, as at most plants. */
const MAJOR_STOPS = 2;

/** Start of the production day (06:00 IST, the start of A shift) that contains `now`. */
export function productionDayStart(now: number) {
  const local = now + IST_OFFSET;
  return Math.floor((local - 6 * HOUR) / DAY) * DAY + 6 * HOUR - IST_OFFSET;
}

/** Monday 06:00 IST of the production week that contains `now`. */
export function productionWeekStart(now: number) {
  const day = productionDayStart(now);
  const weekday = new Date(day + IST_OFFSET).getUTCDay(); // 0 = Sunday
  return day - ((weekday + 6) % 7) * DAY;
}

/** What each kind of machine runs for other programmes between tracked jobs. */
const otherWork: Partial<Record<MachineKind, { label: string; minutes: [number, number] }>> = {
  "imm-xl": { label: "Housings, other programmes", minutes: [60, 180] },
  imm: { label: "Bezels and inner lenses, other programmes", minutes: [40, 120] },
  "imm-2k": { label: "Tail lamp lenses, other programmes", minutes: [60, 180] },
  "bmc-press": { label: "Fog lamp reflectors, other programmes", minutes: [60, 120] },
  "hardcoat-line": { label: "Lenses for other programmes", minutes: [30, 90] },
  metallizer: { label: "Reflectors for other programmes", minutes: [30, 60] },
  "paint-booth": { label: "Bezel masks, other programmes", minutes: [40, 120] },
  "smt-line": { label: "LED boards, other programmes", minutes: [40, 120] },
  "board-tester": { label: "Boards for other programmes", minutes: [20, 60] },
};

const otherWorkFor = (m: Machine) => m.otherWork ?? otherWork[m.kind];

/** Route steps each machine can work on, worked out once from the catalog. */
const stepsFor = new Map<string, { orderId: string; opIndex: number }[]>(
  machines.map((m) => [
    m.id,
    orders.flatMap((o) =>
      o.route
        .map((op, i) => ({ op, i }))
        .filter(({ op }) => runsStep(m, o.id, op))
        .map(({ i }) => ({ orderId: o.id, opIndex: i })),
    ),
  ]),
);

const troublesFor = new Map<string, ChronicTrouble[]>();
for (const t of chronicTroubles) for (const id of t.machines) troublesFor.set(id, [...(troublesFor.get(id) ?? []), t]);

/** The parts stock a step draws one unit from when it starts, if any. */
const stockAt = (orderId: string, opIndex: number) => {
  const c = orderById[orderId].consumes;
  return c && c.opIndex === opIndex ? c.stockId : undefined;
};

type Job = { workOrderId?: string; label?: string; op: number; unit: number; cycleMs: number; progress: number };

type MachineRuntime = {
  def: Machine;
  status: MachineStatus;
  since: number;
  job?: Job;
  /** Order and step (or other work) of the last job, to tell when a change of job needs a set-up. */
  lastJobKey?: string;
  /** A press keeps its mould in until this time unless its job runs out. */
  campaignUntil: number;
  /** End of the current set-up, repair or wait. */
  until: number;
  alertId?: string;
  /** Set while the machine waits on an empty parts stock, with the order it would work on. */
  starved?: { stockId: string; orderId: string };
  /** Its plant's queue version when this machine last found nothing to do. */
  idleAt: number;
  runMs: number;
  downMs: number;
  setupMs: number;
};

/**
 * Deterministic network simulation for one production week. The same week always
 * replays the same way, so two people watching the demo see the same state.
 */
export class PlantSimulation {
  readonly weekStart: number;
  private dayStart: number;
  private t: number;
  private readonly rng: Rng;
  private readonly machines: MachineRuntime[];
  private readonly wos: Record<string, WorkOrderLive> = {};
  /** Unfinished work order ids per order, oldest first. Finished batches drop out. */
  private readonly wosByOrder = new Map<string, string[]>();
  /** Units released per order; `thisWeek` counts this week's releases plus what was waiting at its first step on Monday. */
  private readonly released: Record<string, { units: number; batches: number; thisWeek: number }> = {};
  /** Bumped per plant whenever work or parts reach it, so idle machines only rescan then. */
  private readonly queueVersion: Record<string, number> = {};
  private shipments: Shipment[] = [];
  private docks: DockLoad[] = [];
  private readonly stocks: Record<string, number> = {};
  private imports: ImportLot[] = [];
  private alerts: Alert[] = [];
  private finishedToday: Record<string, number> = {};
  private opsToday: Record<string, number> = {};
  private lostToday: Record<string, number> = {};
  private seq = 0;

  // Sprint tracking
  private readonly lines: CommitLine[];
  private readonly lineById: Map<string, CommitLine>;
  private readonly needed: Record<string, number>;
  private readonly lineDone: Record<string, number> = {};
  private readonly doneByHour: Record<string, number[]> = {};
  private readonly machineHours: Record<string, number> = {};
  private readonly causes = new Map<string, StopCause>();
  private readonly responses = new Map<string, ResponseTime>();
  private markers: StopMarker[] = [];
  private readonly lostWeek: Record<string, number> = {};
  private readonly history: PastWeek[];
  private readonly majors = new Map<string, { at: number; durationMs: number; fired: boolean }>();

  constructor(now: number) {
    this.weekStart = productionWeekStart(now);
    this.dayStart = this.weekStart;
    this.t = this.weekStart;
    this.rng = mulberry32(Math.floor(this.weekStart / DAY) + 7);
    this.machines = machines.map((def) => ({
      def,
      status: def.capabilities.length || otherWorkFor(def) ? "waiting" : "running",
      since: this.weekStart,
      until: 0,
      campaignUntil: 0,
      idleAt: -1,
      runMs: 0,
      downMs: 0,
      setupMs: 0,
    }));

    for (const o of orders) this.released[o.id] = { units: o.shippedBefore, batches: 0, thisWeek: 0 };
    const finishedBefore: Record<string, number> = {};
    for (const wo of workOrders) {
      const r = this.released[wo.orderId];
      this.addWorkOrder(wo.id, {
        orderId: wo.orderId,
        units: wo.units,
        firstUnit: r.units + 1,
        releasedAt: this.weekStart,
        done: [...wo.startDone],
        queued: wo.startDone.map((d, i) => (i === 0 ? wo.units : wo.startDone[i - 1]) - d),
        active: wo.startDone.map(() => 0),
      });
      r.units += wo.units;
      r.thisWeek += wo.units - wo.startDone[0];
      r.batches = Number(wo.id.split("-").pop());
      finishedBefore[wo.orderId] = (finishedBefore[wo.orderId] ?? 0) + wo.startDone[wo.startDone.length - 1];
    }

    const remaining = Object.fromEntries(orders.map((o) => [o.id, o.quantity - o.shippedBefore - (finishedBefore[o.id] ?? 0)]));
    const plan = planWeek(remaining);
    this.lines = plan.lines;
    this.needed = plan.needed;
    this.lineById = new Map(this.lines.map((l) => [l.id, l]));
    for (const l of this.lines) {
      this.lineDone[l.id] = 0;
      this.doneByHour[l.id] = [0];
    }
    this.seedParts();
    this.history = this.makeHistory();
    this.scheduleMajorStops();
  }

  /**
   * Parts at the start of the week: boards on hand at each lamp plant, boards already on
   * the overnight trucks from Bawal, imported parts at Bawal and the lots still on their way.
   */
  private seedParts() {
    for (const s of stocks) this.stocks[s.id] = s.startUnits;
    for (const order of orders.filter((o) => o.fills)) {
      const to = stockById[order.fills!].plant;
      const from = order.route[order.route.length - 1].plant;
      if (sameRegion(from, to)) continue;
      const daily = Math.round((this.lineById.get(lineId(order.id, order.route.length - 1))?.units ?? 0) / 7);
      const transit = transitMs(from, to);
      for (let k = 1; k <= Math.ceil(transit / DAY) + 1; k++) {
        const departAt = nextDeparture(from, to, this.weekStart - k * DAY);
        if (departAt + transit <= this.weekStart || departAt > this.weekStart) continue;
        this.shipments.push({
          id: `SH-${++this.seq}`,
          orderId: order.id,
          workOrderId: this.wosByOrder.get(order.id)?.[0] ?? "",
          from,
          to,
          departAt,
          arriveAt: departAt + transit,
          units: daily,
          opIndex: -1,
          stockId: order.fills,
        });
      }
    }

    const imported = stocks.find((s) => s.imported);
    if (!imported) return;
    const weeklyUse = this.lines
      .filter((l) => l.opIndex === 0 && orderById[l.orderId].consumes?.stockId === imported.id)
      .reduce((n, l) => n + l.units, 0);
    this.stocks[imported.id] = Math.round(weeklyUse * IMPORT_ON_HAND_WEEKS);
    this.imports = importSailings(this.weekStart)
      .map((n) => importLot(n, weeklyUse))
      .filter((l) => l.arriveAt > this.weekStart)
      .sort((a, b) => a.arriveAt - b.arriveAt);
  }

  /**
   * Picks this week's long stops at seeded times. One lands on a single-machine step
   * (one welder, one tester), where a lost shift shows.
   */
  private scheduleMajorStops() {
    const rng = mulberry32(Math.floor(this.weekStart / DAY) + 31);
    const used = machines.filter((m) => stepsFor.get(m.id)?.length && faultProfiles[m.kind].major);
    const alone = used.filter((m) =>
      m.capabilities.some((c) => used.filter((o) => o.plant === m.plant && o.capabilities.includes(c)).length === 1),
    );
    const pools = [alone.length ? alone : used, used];
    for (let i = 0; i < MAJOR_STOPS; i++) {
      const pool = pools[i].filter((m) => !this.majors.has(m.id));
      if (!pool.length) continue;
      const m = pool[Math.floor(rng() * pool.length)];
      this.majors.set(m.id, {
        at: this.weekStart + Math.round(between(rng, [10, 140])) * HOUR,
        durationMs: Math.round(between(rng, [8, 18])) * 15 * MIN,
        fired: false,
      });
    }
  }

  /** Steps forward on a fixed 5 s grid. Returns whether anything advanced. */
  advanceTo(now: number) {
    const end = Math.min(now, this.weekStart + WEEK);
    let stepped = false;
    while (this.t + STEP_MS <= end) {
      this.t += STEP_MS;
      this.step(this.t);
      stepped = true;
    }
    return stepped;
  }

  snapshot(): Snapshot {
    const now = this.t;
    return {
      now,
      dayStart: this.dayStart,
      machines: Object.fromEntries(
        this.machines.map((m) => [
          m.def.id,
          {
            status: m.status,
            since: m.since,
            workOrderId: m.job?.workOrderId,
            otherWork: m.job?.label,
            opIndex: m.job?.workOrderId ? m.job.op : undefined,
            unit: m.job?.workOrderId ? m.job.unit : undefined,
            progress: m.job ? Math.min(1, m.job.progress) : undefined,
            alertId: m.alertId,
            runMs: m.runMs,
            downMs: m.downMs,
            setupMs: m.setupMs,
          },
        ]),
      ),
      workOrders: Object.fromEntries(
        Object.entries(this.wos).map(([id, w]) => [id, { ...w, done: [...w.done], queued: [...w.queued], active: [...w.active] }]),
      ),
      shipments: this.shipments.map((s) => ({ ...s })),
      docks: this.docks.map((d) => ({ ...d })),
      stocks: { ...this.stocks },
      imports: this.imports.map((l) => ({ ...l })),
      alerts: this.alerts.map((a) => ({
        ...a,
        acknowledgedAt: a.acknowledgedAt !== undefined && a.acknowledgedAt <= now ? a.acknowledgedAt : undefined,
      })),
      finishedToday: { ...this.finishedToday },
      opsToday: { ...this.opsToday },
      lostMs: { ...this.lostToday },
      sprint: {
        weekStart: this.weekStart,
        weekEnd: this.weekStart + WEEK,
        lines: this.lines,
        needed: this.needed,
        done: { ...this.lineDone },
        doneByHour: Object.fromEntries(Object.entries(this.doneByHour).map(([k, v]) => [k, [...v]])),
        machineHours: { ...this.machineHours },
        causes: [...this.causes.values()].map((c) => ({ ...c })),
        responses: [...this.responses.values()].map((r) => ({ ...r })),
        markers: [...this.markers],
        history: this.history,
        lostMs: { ...this.lostWeek },
      },
    };
  }

  private step(t: number) {
    if ((t - this.weekStart) % DAY === 0) this.startDay(t);
    if (this.shipments.length) this.deliver(t);
    if (this.imports.length && this.imports[0].arriveAt <= t) this.landImports(t);
    if ((t - this.weekStart) % MIN === 0) {
      this.releaseWork(t);
      if (this.docks.length) this.dispatch(t);
    }
    const shiftStart = (t - this.weekStart) % SHIFT === 0;
    for (const m of this.machines) {
      if (shiftStart) this.shiftCheck(m, t);
      this.stepMachine(m, t);
    }
    if ((t - this.weekStart) % HOUR === 0) {
      for (const l of this.lines) this.doneByHour[l.id].push(this.lineDone[l.id]);
    }
    if ((t - this.weekStart) % (10 * MIN) === 0) {
      this.alerts = this.alerts.filter((a) => a.resolvedAt === undefined || t - a.resolvedAt < ALERT_HISTORY_MS);
      // The level-loading cap moves with the clock, so idle machines look again.
      for (const code of Object.keys(this.queueVersion)) this.bump(code as PlantCode);
    }
  }

  /** 06:00 IST: today's counters start again. */
  private startDay(t: number) {
    this.dayStart = t;
    this.finishedToday = {};
    this.opsToday = {};
    this.lostToday = {};
    for (const m of this.machines) {
      m.runMs = 0;
      m.downMs = 0;
      m.setupMs = 0;
    }
  }

  private deliver(t: number) {
    const inTransit: Shipment[] = [];
    for (const s of this.shipments) {
      if (s.arriveAt > t) {
        inTransit.push(s);
        continue;
      }
      if (s.stockId) this.stocks[s.stockId] = (this.stocks[s.stockId] ?? 0) + s.units;
      else this.wos[s.workOrderId].queued[s.opIndex] += s.units;
      this.bump(s.to);
    }
    this.shipments = inTransit;
  }

  private landImports(t: number) {
    while (this.imports.length && this.imports[0].arriveAt <= t) {
      const lot = this.imports.shift()!;
      const stock = stocks.find((s) => s.imported)!;
      this.stocks[stock.id] += lot.kits;
      this.bump(stock.plant);
    }
    this.imports.sort((a, b) => a.arriveAt - b.arriveAt);
  }

  /** Trucks that are due to leave take everything waiting at the dock for their lane. */
  private dispatch(t: number) {
    const staying: DockLoad[] = [];
    for (const d of this.docks) {
      if (d.departAt > t) {
        staying.push(d);
        continue;
      }
      const { departAt, ...load } = d;
      const delay = roadDelay(d.from, d.to, departAt);
      this.shipments.push({
        ...load,
        id: `SH-${++this.seq}`,
        departAt,
        arriveAt: departAt + transitMs(d.from, d.to) + (delay?.hours ?? 0) * HOUR,
        delay,
      });
    }
    this.docks = staying;
  }

  private toDock(load: Omit<DockLoad, "departAt" | "units">, t: number) {
    const key = (d: DockLoad) => d.workOrderId === load.workOrderId && d.opIndex === load.opIndex && d.stockId === load.stockId;
    const waiting = this.docks.find(key);
    if (waiting) waiting.units++;
    else this.docks.push({ ...load, units: 1, departAt: nextDeparture(load.from, load.to, t) });
  }

  private addWorkOrder(id: string, wo: WorkOrderLive) {
    this.wos[id] = wo;
    const list = this.wosByOrder.get(wo.orderId) ?? [];
    list.push(id);
    this.wosByOrder.set(wo.orderId, list);
    for (const op of orderById[wo.orderId].route) this.bump(op.plant);
  }

  private bump(plant: PlantCode) {
    this.queueVersion[plant] = (this.queueVersion[plant] ?? 0) + 1;
  }

  /**
   * Releases a new batch for each order whose floor WIP has room and whose last batch has
   * fully started, keeping to this week's plan the way daily call-offs spread it out.
   */
  private releaseWork(t: number) {
    for (const order of orders) {
      const r = this.released[order.id];
      if (r.units >= order.quantity) continue;
      const plan = this.lineById.get(lineId(order.id, 0))?.units ?? 0;
      const allowed = plan * Math.min(1, (t - this.weekStart) / WEEK + RELEASE_AHEAD);
      if (r.thisWeek >= allowed) continue;
      const ids = this.wosByOrder.get(order.id) ?? [];
      const newest = ids.length ? this.wos[ids[ids.length - 1]] : undefined;
      if (ids.length >= WIP_BATCHES || (newest && newest.queued[0] > 0)) continue;

      const units = Math.min(order.batchSize, order.quantity - r.units, Math.max(1, plan - r.thisWeek));
      r.batches += 1;
      this.addWorkOrder(`WO-${order.id.slice(3)}-${String(r.batches).padStart(2, "0")}`, {
        orderId: order.id,
        units,
        firstUnit: r.units + 1,
        releasedAt: t,
        done: order.route.map(() => 0),
        queued: order.route.map((_, i) => (i === 0 ? units : 0)),
        active: order.route.map(() => 0),
      });
      r.units += units;
      r.thisWeek += units;
    }
  }

  /** At each shift change a line can start short of operators. */
  private shiftCheck(m: MachineRuntime, t: number) {
    const manpower = faultProfiles[m.def.kind].manpower;
    if (!manpower || !m.job?.workOrderId || m.status !== "running" || m.alertId) return;
    if (this.rng() >= manpower.chance) return;
    this.raise(m, t, {
      kind: "manpower",
      title: "Line short of operators",
      code: "MP-01",
      cause: "Contract operators for this shift did not all report; the line is held until the agency sends cover or the shift in-charge moves people across.",
    });
    m.until = t + between(this.rng, manpower.minutes) * MIN;
    this.setStatus(m, "waiting", t);
  }

  private stepMachine(m: MachineRuntime, t: number) {
    // Account for the 5 s that just passed, in the state the machine was in.
    if (m.status === "running") m.runMs += STEP_MS;
    else if (m.status === "setup") m.setupMs += STEP_MS;
    else if (m.status === "down") {
      m.downMs += STEP_MS;
      this.addLoss(m);
    } else if (m.alertId) this.addLoss(m);

    const profile = faultProfiles[m.def.kind];
    const support = m.def.capabilities.length === 0 && !otherWorkFor(m.def);

    const major = this.majors.get(m.def.id);
    if (major && !major.fired && t >= major.at && m.status !== "down") {
      major.fired = true;
      this.resolve(m, t);
      this.raise(m, t, profile.major ?? genericMajorFault);
      m.until = t + major.durationMs;
      this.setStatus(m, "down", t);
      return;
    }

    switch (m.status) {
      case "down":
      case "setup":
        if (t >= m.until) {
          this.resolve(m, t);
          this.setStatus(m, m.job || support ? "running" : "waiting", t);
        }
        return;

      case "waiting":
        if (m.starved) {
          if ((this.stocks[m.starved.stockId] ?? 0) <= 0) return;
          this.resolve(m, t);
          m.starved = undefined;
          m.idleAt = -1;
          this.tryStart(m, t, profile);
          return;
        }
        if (m.alertId) {
          if (t >= m.until) {
            this.resolve(m, t);
            this.setStatus(m, m.job ? "running" : "waiting", t);
          }
          return;
        }
        // Nothing new has reached this plant since it last looked: stay idle.
        if (m.idleAt === (this.queueVersion[m.def.plant] ?? 0) && !otherWorkFor(m.def)) return;
        this.tryStart(m, t, profile);
        return;

      case "running": {
        if (this.stops(m, t, profile)) return;
        if (support) return;
        if (!m.job) {
          this.tryStart(m, t, profile);
          return;
        }
        m.job.progress += STEP_MS / m.job.cycleMs;
        if (m.job.progress >= 1) {
          // Time past the end of this unit carries into the next, so short cycles keep their rate.
          const carry = (m.job.progress - 1) * m.job.cycleMs;
          this.complete(m, t);
          this.tryStart(m, t, profile);
          if (m.job && m.status === "running" && m.job.progress === 0) m.job.progress = Math.min(0.99, carry / m.job.cycleMs);
        }
      }
    }
  }

  /** Rolls for the stops a running machine can have this step. Returns whether one started. */
  private stops(m: MachineRuntime, t: number, profile: FaultProfile) {
    const jobOrder = m.job?.workOrderId ? this.wos[m.job.workOrderId]?.orderId : undefined;
    const trouble = troublesFor.get(m.def.id)?.find((tr) => !tr.orderId || tr.orderId === jobOrder);
    if (trouble && (!trouble.orderId || m.job) && this.rng() < STEP_MS / (trouble.mtbfHours * HOUR)) {
      this.stop(m, t, trouble.fault, trouble.repairMin, trouble.ackMin);
      return true;
    }
    const tracked = !!m.job?.workOrderId;
    for (const stops of [profile.breakdown, profile.minor, tracked ? profile.quality : undefined]) {
      if (stops && this.rng() < STEP_MS / (stops.meanHours * HOUR)) {
        this.stop(m, t, pick(this.rng, stops.causes), stops.minutes);
        return true;
      }
    }
    return false;
  }

  private stop(m: MachineRuntime, t: number, cause: FaultCause, minutes: [number, number], ackMin?: [number, number]) {
    this.raise(m, t, cause, ackMin ?? (cause.kind === "minor" ? [0, 2] : [1, 5]));
    m.until = t + between(this.rng, minutes) * MIN;
    this.setStatus(m, "down", t);
  }

  private tryStart(m: MachineRuntime, t: number, profile: FaultProfile) {
    const job = this.nextJob(m, t) ?? this.otherJob(m, t);
    if (!job) {
      this.setStatus(m, "waiting", t);
      if (m.starved && !m.alertId) this.raiseStarved(m, t);
      return;
    }
    m.starved = undefined;
    const key = job.workOrderId ? `${this.wos[job.workOrderId].orderId}:${job.op}` : `other:${job.label}`;
    const changeover = m.lastJobKey !== undefined && m.lastJobKey !== key;
    m.job = job;
    m.lastJobKey = key;

    if (changeover && profile.setup && this.rng() < profile.setup.chance) {
      const { setup } = profile;
      m.until = t + between(this.rng, setup.minutes) * MIN;
      m.campaignUntil = m.until + (setup.campaignMin ?? 0) * MIN;
      if (this.rng() < setup.waitChance) {
        this.raise(m, t, { kind: "setup", title: setup.title, code: "SETUP", cause: setup.cause });
      }
      this.setStatus(m, "setup", t);
      return;
    }
    if (changeover && job.workOrderId && profile.material && this.rng() < profile.material.chance) {
      const { material } = profile;
      m.until = t + between(this.rng, material.minutes) * MIN;
      this.raise(m, t, { kind: "material", title: material.title, code: "MAT", cause: material.cause });
      this.setStatus(m, "waiting", t);
      return;
    }
    this.setStatus(m, "running", t);
  }

  /** A line with work waiting but none of the parts it fits raises a material stop until a truck brings them. */
  private raiseStarved(m: MachineRuntime, t: number) {
    const { stockId, orderId } = m.starved!;
    const stock = stockById[stockId];
    const next = this.shipments.filter((s) => s.stockId === stockId).sort((a, b) => a.arriveAt - b.arriveAt)[0];
    const lot = stock.imported ? this.imports[0] : undefined;
    const when = (at: number) => new Date(at).toLocaleString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const cause = stock.imported
      ? `No imported LED parts left at Bawal for the next boards.${lot ? ` The next lot reaches Bawal ${when(lot.arriveAt)}.` : ""}`
      : `${stock.name}: none left at the line.${next ? ` The next truck from Bawal Electronics arrives ${when(next.arriveAt)} with ${next.units}.` : " Nothing is on the road from Bawal yet."}`;
    this.raise(
      m,
      t,
      {
        kind: "material",
        title: stock.imported ? "Waiting for imported LED parts" : "Waiting for LED boards from Bawal",
        code: "MAT-PCB",
        cause,
      },
      [2, 8],
    );
    const woId = (this.wosByOrder.get(orderId) ?? []).find((id) => this.wos[id].queued[orderById[orderId].consumes!.opIndex] > 0);
    const alert = this.alerts[this.alerts.length - 1];
    alert.workOrderId = woId;
  }

  /**
   * Picks the queued step this machine should work on next: the one furthest behind
   * its weekly commitment, then the tightest order, then the oldest batch. A press in
   * the middle of a campaign keeps its mould in while that job still has work.
   */
  private nextJob(m: MachineRuntime, t: number): Job | undefined {
    const version = this.queueVersion[m.def.plant] ?? 0;
    if (m.idleAt === version) return undefined;
    let best: { woId: string; op: number; score: number; slack: number } | undefined;
    let starved: MachineRuntime["starved"];
    let held = false;

    for (const { orderId, opIndex } of stepsFor.get(m.def.id) ?? []) {
      const woId = (this.wosByOrder.get(orderId) ?? []).find((id) => this.wos[id].queued[opIndex] > 0);
      if (!woId) continue;
      const stockId = stockAt(orderId, opIndex);
      if (stockId && (this.stocks[stockId] ?? 0) <= 0) {
        starved ??= { stockId, orderId };
        continue;
      }
      const line = this.lineById.get(lineId(orderId, opIndex));
      const current = t < m.campaignUntil && m.lastJobKey === `${orderId}:${opIndex}`;
      if (line && this.lineDone[line.id] >= line.units * Math.min(1, (t - this.weekStart) / WEEK + LEVEL_AHEAD)) {
        // Ahead of plan: a press mid-campaign waits with its mould in rather than changing it.
        held ||= current;
        continue;
      }
      const keep = current ? 10 : 0;
      const score = (line && line.units > 0 ? 1 - this.lineDone[line.id] / line.units : -1) + keep;
      const slack = orderById[orderId].slackHours;
      if (!best || score > best.score + 1e-9 || (Math.abs(score - best.score) < 1e-9 && slack < best.slack)) {
        best = { woId, op: opIndex, score, slack };
      }
    }

    if (!best || (held && best.score < 10)) {
      m.idleAt = version;
      m.starved = best ? undefined : starved;
      return undefined;
    }
    const live = this.wos[best.woId];
    const op = orderById[live.orderId].route[best.op];
    const stockId = stockAt(live.orderId, best.op);
    if (stockId) this.stocks[stockId]--;
    live.queued[best.op]--;
    live.active[best.op]++;
    return {
      workOrderId: best.woId,
      op: best.op,
      unit: live.firstUnit + live.done[best.op] + live.active[best.op] - 1,
      cycleMs: op.cycleMin * MIN * between(this.rng, [0.9, 1.1]),
      progress: 0,
    };
  }

  /** Another programme's job, for a machine with nothing tracked to do for a while. */
  private otherJob(m: MachineRuntime, t: number): Job | undefined {
    const work = otherWorkFor(m.def);
    if (!work || this.rng() > OTHER_WORK_CHANCE) return undefined;
    if (stepsFor.get(m.def.id)?.length && (m.status !== "waiting" || t - m.since < OTHER_WORK_AFTER_MS)) return undefined;
    return { label: work.label, op: 0, unit: 0, cycleMs: between(this.rng, work.minutes) * MIN, progress: 0 };
  }

  private complete(m: MachineRuntime, t: number) {
    const job = m.job!;
    m.job = undefined;
    if (!job.workOrderId) return;

    const live = this.wos[job.workOrderId];
    const order = orderById[live.orderId];
    live.active[job.op]--;
    live.done[job.op]++;
    this.opsToday[m.def.plant] = (this.opsToday[m.def.plant] ?? 0) + 1;

    const line = this.lineById.get(lineId(order.id, job.op));
    if (line) {
      this.lineDone[line.id]++;
      this.machineHours[m.def.id] = (this.machineHours[m.def.id] ?? 0) + line.hoursPerUnit;
    }

    const next = job.op + 1;
    if (next >= order.route.length) {
      this.finishedToday[order.id] = (this.finishedToday[order.id] ?? 0) + 1;
      if (live.done[job.op] >= live.units) {
        const ids = this.wosByOrder.get(order.id) ?? [];
        this.wosByOrder.set(order.id, ids.filter((id) => id !== job.workOrderId));
      }
      // Finished LED boards go on the next truck to the lamp plant that fits them.
      if (order.fills) {
        const to = stockById[order.fills].plant;
        this.toDock({ orderId: order.id, workOrderId: job.workOrderId, from: m.def.plant, to, opIndex: -1, stockId: order.fills }, t);
      }
      return;
    }
    if (order.route[job.op].plant === order.route[next].plant) {
      live.queued[next]++;
      this.bump(order.route[next].plant);
      return;
    }
    this.toDock({ orderId: order.id, workOrderId: job.workOrderId, from: m.def.plant, to: order.route[next].plant, opIndex: next }, t);
  }

  private raise(m: MachineRuntime, t: number, cause: FaultCause, ackMin: [number, number] = [1, 4]) {
    const alert: Alert = {
      id: `AL-${++this.seq}`,
      machineId: m.def.id,
      plant: m.def.plant,
      kind: cause.kind,
      title: cause.title,
      code: cause.code,
      cause: cause.cause,
      raisedAt: t,
      ownerId: m.def.ownerId,
      acknowledgedAt: t + Math.round(between(this.rng, ackMin)) * MIN,
      workOrderId: m.job?.workOrderId,
      unit: m.job?.workOrderId ? m.job.unit : undefined,
    };
    this.alerts.push(alert);
    m.alertId = alert.id;
  }

  private resolve(m: MachineRuntime, t: number) {
    if (!m.alertId) return;
    const alert = this.alerts.find((a) => a.id === m.alertId);
    m.alertId = undefined;
    if (!alert) return;
    alert.resolvedAt = t;
    this.recordStop(alert, t);
  }

  /** Folds a finished stop into the week's cause, response-time and marker tallies. */
  private recordStop(alert: Alert, t: number) {
    const lost = t - alert.raisedAt;
    const orderId = alert.workOrderId ? this.wos[alert.workOrderId]?.orderId : undefined;

    const causeKey = `${alert.plant}|${orderId ?? ""}|${alert.title}`;
    const cause = this.causes.get(causeKey) ?? { plant: alert.plant, orderId, title: alert.title, kind: alert.kind, lostMs: 0, count: 0 };
    cause.lostMs += lost;
    cause.count += 1;
    this.causes.set(causeKey, cause);

    if (alert.acknowledgedAt !== undefined) {
      const key = `${alert.ownerId}|${alert.plant}`;
      const r = this.responses.get(key) ?? { ownerId: alert.ownerId, plant: alert.plant, ackMs: 0, count: 0 };
      r.ackMs += Math.min(alert.acknowledgedAt, t) - alert.raisedAt;
      r.count += 1;
      this.responses.set(key, r);
    }

    if (lost >= MARKER_MIN_MS) {
      this.markers.push({ at: alert.raisedAt, lostMs: lost, machineId: alert.machineId, plant: alert.plant, orderId, title: alert.title });
      if (this.markers.length > MAX_MARKERS) {
        this.markers.sort((a, b) => b.lostMs - a.lostMs);
        this.markers = this.markers.slice(0, MAX_MARKERS).sort((a, b) => a.at - b.at);
      }
    }
  }

  private setStatus(m: MachineRuntime, status: MachineStatus, t: number) {
    if (m.status === status) return;
    m.status = status;
    m.since = t;
  }

  /** Stopped time counts against the order the machine was working on, or waiting to work on. */
  private addLoss(m: MachineRuntime) {
    const orderId = m.job?.workOrderId ? this.wos[m.job.workOrderId].orderId : m.starved?.orderId;
    if (!orderId) return;
    this.lostToday[orderId] = (this.lostToday[orderId] ?? 0) + STEP_MS;
    this.lostWeek[orderId] = (this.lostWeek[orderId] ?? 0) + STEP_MS;
  }

  /** Earlier weeks, generated from this week's plan with their own seed. Labelled as simulated in the UI. */
  private makeHistory(): PastWeek[] {
    const rng = mulberry32(Math.floor(this.weekStart / DAY) + 99);
    return Array.from({ length: HISTORY_WEEKS }, (_, i) => {
      const weekStart = this.weekStart - (HISTORY_WEEKS - i) * WEEK;
      const lines: PastWeek["lines"] = {};
      for (const l of this.lines) {
        const committedHours = Math.round(l.units * between(rng, [0.88, 1.06])) * l.hoursPerUnit;
        lines[l.id] = { committedHours, doneHours: committedHours * between(rng, [0.84, 1.03]) };
      }
      return { weekStart, lines };
    });
  }
}
