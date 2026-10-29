// Reference data (what exists) is kept apart from live state (what is happening),
// so an ERP feed can replace the catalog and an MES feed can replace the simulator.

/**
 * Lumax Industries' eleven plants. The three-letter codes are this demo's own;
 * Lumax's internal plant codes are not public.
 */
export type PlantCode = "BWL" | "BWE" | "DHR" | "PNT" | "HDW" | "CK2" | "CK3" | "CCW" | "SND" | "SN2" | "BLR";

/** A cluster of plants close enough to share trucks, sitting next to the OEMs it serves. */
export type RegionId = "ncr" | "uttarakhand" | "pune" | "gujarat" | "karnataka";

export type Region = {
  id: RegionId;
  /** The cluster as people at Lumax would name it, e.g. "NCR–Haryana". */
  name: string;
  /** The towns its plants are in. */
  towns: string;
  state: string;
  /** Where the cluster sits on the globe, in degrees. */
  lat: number;
  lon: number;
};

export type Plant = {
  code: PlantCode;
  region: RegionId;
  name: string;
  address: string;
  /** Year production started, where published. */
  established?: number;
  headcount?: number;
  specialties: string[];
  /** Which OEMs the plant serves, as published. Empty when Lumax does not say. */
  customers: string;
  /** Set when the customer mix shown is an assumption to confirm with Lumax. */
  mixToConfirm?: boolean;
  /** Approximate site position in km from its region's map origin (x east, y north). */
  site: { x: number; y: number };
  /** Rough relative size of the buildings on the network map. */
  sheds: { w: number; d: number }[];
  managerId: string;
};

export type Capability =
  | "mould-xl"
  | "mould"
  | "mould-2k"
  | "mould-bmc"
  | "hard-coat"
  | "metallize"
  | "paint"
  | "assemble"
  | "hot-plate-weld"
  | "vibration-weld"
  | "seal"
  | "leak-test"
  | "photometry"
  | "function-test"
  | "smt"
  | "board-test"
  | "xray-test";

export type MachineKind =
  | "imm-xl"
  | "imm"
  | "imm-2k"
  | "bmc-press"
  | "anneal-oven"
  | "hardcoat-line"
  | "metallizer"
  | "paint-booth"
  | "assembly-line"
  | "hot-plate-welder"
  | "vibration-welder"
  | "seal-robot"
  | "leak-tester"
  | "photometry-tunnel"
  | "function-tester"
  | "smt-line"
  | "board-tester"
  | "panel-line"
  | "agv";

export type Machine = {
  id: string;
  plant: PlantCode;
  name: string;
  kind: MachineKind;
  capabilities: Capability[];
  ownerId: string;
  /** Work this machine fills idle time with, when it is not the default for its kind. */
  otherWork?: { label: string; minutes: [number, number] };
  /** A line dedicated to these schedules only, the way assembly lines are set up per programme. */
  dedicatedTo?: string[];
};

export type CustomerGroup = "Passenger vehicles" | "Two-wheelers" | "Commercial vehicles" | "Internal";

export type Customer = { id: string; name: string; group: CustomerGroup };

export type RouteOp = {
  name: string;
  capability: Capability;
  plant: PlantCode;
  /** Minutes of machine time per unit. */
  cycleMin: number;
};

/**
 * A customer schedule, the "epic": one OEM programme's call-offs for the month, or
 * an internal order for LED boards. Its work orders are batches moving through the route.
 */
export type Order = {
  id: string;
  title: string;
  /** What one unit is called on the floor, e.g. "Headlamp set". */
  unitName: string;
  customerId: string;
  quantity: number;
  /** Units finished before the current work orders were released. */
  shippedBefore: number;
  /** Days from the start of the current week (Monday 06:00 IST). */
  dueInDays: number;
  /** Planned float between projected finish and due date, before today's losses. */
  slackHours: number;
  leadEngineerId: string;
  /** Units per work order released to the floor. */
  batchSize: number;
  route: RouteOp[];
  /** Ex-works price per unit in rupees, for the value of what is ahead or behind. Fictional, inside published price bands. */
  unitPriceInr?: number;
  /** A step that fits a part made elsewhere, and only starts when one is in stock. */
  consumes?: { opIndex: number; stockId: string };
  /** For LED board orders: the stock their finished boards are trucked to. */
  fills?: string;
};

/** Parts held at a plant for a step that consumes them: LED boards from Bawal, or imported electronics. */
export type PartStock = {
  id: string;
  name: string;
  unitName: string;
  plant: PlantCode;
  /** On hand at the start of the week. */
  startUnits: number;
  /** Refilled by sea from overseas suppliers, rather than by an order's trucks. */
  imported?: boolean;
};

/** A batch of units for one order, the "story". `startDone[i]` is units past op i at the start of the week. */
export type WorkOrder = {
  id: string;
  orderId: string;
  units: number;
  startDone: number[];
};

export type Role = "executive" | "plant-manager" | "lead-engineer";

export type Person = {
  id: string;
  name: string;
  title: string;
  role: Role;
  extension: string;
  initials: string;
  /** Plants a plant manager runs. */
  plants?: PlantCode[];
};

// ---- Live state ----

export type MachineStatus = "running" | "waiting" | "setup" | "down";

/**
 * Why a machine stopped. Lumax's own TPM records show breakdowns are rare; most lost
 * time is mould changes, minor stops, quality holds and waits for material or people.
 */
export type AlertKind = "breakdown" | "minor" | "setup" | "quality" | "material" | "manpower";

export type Alert = {
  id: string;
  machineId: string;
  plant: PlantCode;
  kind: AlertKind;
  title: string;
  code: string;
  cause: string;
  raisedAt: number;
  ownerId: string;
  acknowledgedAt?: number;
  resolvedAt?: number;
  workOrderId?: string;
  unit?: number;
};

export type MachineLive = {
  status: MachineStatus;
  since: number;
  workOrderId?: string;
  /** Set when the machine is busy with work outside the tracked orders. */
  otherWork?: string;
  opIndex?: number;
  /** 1-based unit number within the order. */
  unit?: number;
  /** Progress through the current unit, 0..1. */
  progress?: number;
  alertId?: string;
  runMs: number;
  downMs: number;
  setupMs: number;
};

export type WorkOrderLive = {
  orderId: string;
  units: number;
  /** 1-based number of this batch's first unit within the order. */
  firstUnit: number;
  releasedAt: number;
  /** Units completed at each op. */
  done: number[];
  /** Units sitting at each op, waiting for a machine. */
  queued: number[];
  /** Units currently on a machine at each op. */
  active: number[];
};

/** A truckload between two plants. A load for another cluster runs on the overnight long-haul truck. */
export type Shipment = {
  id: string;
  orderId: string;
  workOrderId: string;
  from: PlantCode;
  to: PlantCode;
  departAt: number;
  arriveAt: number;
  units: number;
  /** The op the units are going to, or -1 when they fill a stock instead. */
  opIndex: number;
  /** Set when the load fills a parts stock (LED boards for a lamp plant). */
  stockId?: string;
  /** Set when the truck was held on the road, already counted in `arriveAt`. */
  delay?: { hours: number; reason: string };
};

/** Units finished at one plant that wait at its dock for the next truck to another plant. */
export type DockLoad = {
  orderId: string;
  workOrderId: string;
  from: PlantCode;
  to: PlantCode;
  opIndex: number;
  stockId?: string;
  units: number;
  departAt: number;
};

/** One week's sailing of imported LED packages, driver ICs and connectors, from East Asia to Bawal. */
export type ImportLot = {
  id: string;
  /** Board sets' worth of parts. */
  kits: number;
  sailAt: number;
  /** Berths at JNPT. */
  berthAt: number;
  /** Cleared at the inland depot and trucked to Bawal Electronics. */
  arriveAt: number;
  /** Set when the lot missed its planned sailing at transhipment and rides the next ship. */
  rolledDays?: number;
};

export type Snapshot = {
  now: number;
  dayStart: number;
  machines: Record<string, MachineLive>;
  workOrders: Record<string, WorkOrderLive>;
  shipments: Shipment[];
  docks: DockLoad[];
  /** Units on hand in each parts stock. */
  stocks: Record<string, number>;
  /** Imported lots not yet at Bawal: at the supplier's port, at sea, or clearing. */
  imports: ImportLot[];
  alerts: Alert[];
  /** Units that finished their final op today, per order. */
  finishedToday: Record<string, number>;
  /** Unit-operations completed today, per plant. */
  opsToday: Record<string, number>;
  /** Machine downtime today attributed to each order, in ms. */
  lostMs: Record<string, number>;
  sprint: SprintState;
};

// ---- Weekly sprint ----

/** One committed slice of the week: units of one order through one operation. */
export type CommitLine = {
  id: string;
  orderId: string;
  opIndex: number;
  plant: PlantCode;
  capability: Capability;
  units: number;
  /** Standard machine-hours per unit (the "story points"). */
  hoursPerUnit: number;
};

export type StopCause = { plant: PlantCode; orderId?: string; title: string; kind: AlertKind; lostMs: number; count: number };

export type ResponseTime = { ownerId: string; plant: PlantCode; ackMs: number; count: number };

/** A stop long enough to be worth pinning on a burndown. */
export type StopMarker = { at: number; lostMs: number; machineId: string; plant: PlantCode; orderId?: string; title: string };

export type PastWeek = { weekStart: number; lines: Record<string, { committedHours: number; doneHours: number }> };

export type SprintState = {
  weekStart: number;
  weekEnd: number;
  lines: CommitLine[];
  /** Units each order needs this week to stay on course for its due date. */
  needed: Record<string, number>;
  /** Units done this week, per commitment line. */
  done: Record<string, number>;
  /** Units done by each hour mark since the week started, per line. Index 0 is the start of the week. */
  doneByHour: Record<string, number[]>;
  /** Standard hours of committed work each machine has finished this week. */
  machineHours: Record<string, number>;
  causes: StopCause[];
  responses: ResponseTime[];
  markers: StopMarker[];
  history: PastWeek[];
  /** Machine downtime this week attributed to each order, in ms. */
  lostMs: Record<string, number>;
};
