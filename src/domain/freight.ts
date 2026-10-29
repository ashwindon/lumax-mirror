import { plantByCode, sameRegion, truckMinutes } from "./catalog/plants";
import { regionById } from "./catalog/regions";
import type { ImportLot, PlantCode, RegionId } from "./types";

// How parts move between Lumax plants, and how imported electronics reach Bawal.
//
// Inside a cluster a shuttle truck runs every two hours. Between clusters, LED boards
// from Bawal Electronics go on an overnight long-haul truck, 1 to 5 days on the road
// (Lumax does not publish its logistics partners or lanes; these are road distances).
//
// LED packages, driver ICs and connectors are largely imported and arrive through
// JNPT (Nhava Sheva), the port Lumax's customs filings and shipment records name.
// The origin ports, sailing day and inland leg are assumptions to confirm.

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const IST = 5.5 * HOUR;

/** Shuttle trucks inside a cluster leave every two hours. */
const SHUTTLE_MS = 2 * HOUR;
/** The long-haul truck to other clusters leaves every evening at 20:00 IST, after loading. */
const LONG_HAUL_HOUR = 20;
const LOADING_MS = 30 * MIN;

/** Road distance from Bawal and hours on the road to each cluster. */
export const longHaul: Record<Exclude<RegionId, "ncr">, { km: number; hours: number; via: string }> = {
  uttarakhand: { km: 340, hours: 14, via: "Delhi" },
  gujarat: { km: 850, hours: 44, via: "NH-48 through Jaipur and Udaipur" },
  pune: { km: 1450, hours: 76, via: "NH-48 through Ahmedabad and Mumbai" },
  karnataka: { km: 2150, hours: 108, via: "NH-44 through Nagpur and Hyderabad" },
};

function longHaulFor(a: PlantCode, b: PlantCode) {
  const [ra, rb] = [plantByCode[a].region, plantByCode[b].region];
  const other = (ra === "ncr" ? rb : ra) as Exclude<RegionId, "ncr">;
  return longHaul[other];
}

/** When the next truck from one plant to another leaves, for a load ready at `t`. */
export function nextDeparture(from: PlantCode, to: PlantCode, t: number) {
  if (sameRegion(from, to)) return Math.ceil((t + IST) / SHUTTLE_MS) * SHUTTLE_MS - IST;
  const local = t + LOADING_MS + IST;
  const evening = Math.floor(local / DAY) * DAY + LONG_HAUL_HOUR * HOUR;
  return (local <= evening ? evening : evening + DAY) - IST;
}

/** Things that hold a long-haul truck on Indian highways. */
const roadHolds = [
  "Held at a state border check post because the e-way bill did not match the invoice",
  "Tractor unit broke down; the transporter is sending a replacement",
  "Diverted around a closed stretch of NH-48",
  "Stopped for a GST inspection; papers being verified",
];

/**
 * Whether the long-haul truck leaving at `departAt` is held on the road, and why.
 * Deterministic, so everyone watching sees the same truck held: about one in twenty,
 * and always the Tuesday-evening truck from Bawal to Sanand.
 */
export function roadDelay(from: PlantCode, to: PlantCode, departAt: number): { hours: number; reason: string } | undefined {
  if (sameRegion(from, to)) return undefined;
  const local = new Date(departAt + IST);
  if (from === "BWE" && to === "SN2" && local.getUTCDay() === 2) return { hours: 20, reason: roadHolds[0] };
  const h = Math.abs(Math.sin(Math.floor(departAt / DAY) * 12.9898 + to.charCodeAt(1) * 78.233)) % 1;
  if (h > 0.05) return undefined;
  return { hours: 6 + Math.round(h * 200), reason: roadHolds[1 + (Math.floor(h * 60) % 3)] };
}

export function transitMs(from: PlantCode, to: PlantCode) {
  return sameRegion(from, to) ? truckMinutes(from, to) * MIN : longHaulFor(from, to).hours * HOUR;
}

/** How long the road takes, as people say it: "40 min", "overnight", "3 days". */
export function roadTime(from: PlantCode, to: PlantCode) {
  if (sameRegion(from, to)) return `${truckMinutes(from, to)} min`;
  const h = longHaulFor(from, to).hours;
  return h < 24 ? "overnight" : `${Math.round(h / 24)} days`;
}

export const roadVia = (from: PlantCode, to: PlantCode) => (sameRegion(from, to) ? regionById[plantByCode[from].region].name : longHaulFor(from, to).via);

// ---- Imported electronics ----

/** One sailing a week, Fridays at 12:00 IST, counted from Friday 2 January 2026. */
const FIRST_SAILING = Date.UTC(2026, 0, 2, 6, 30);

/** Cover Lumax aims to hold, at sea and at Bawal, in weeks of what the SMT lines use: about two months. */
export const IMPORT_COVER_WEEKS: [number, number] = [6, 9];
/** Board sets' worth of imported parts on hand at Bawal at the start of the week, in weeks of use. */
export const IMPORT_ON_HAND_WEEKS = 4.4;

export const importLegs = [
  { id: "origin", name: "Booked at the supplier's port in East Asia", days: "Weekly sailing, Fridays" },
  { id: "sea", name: "At sea to JNPT, Nhava Sheva", days: "14 to 18 days" },
  { id: "inland", name: "Rail to an NCR inland depot, customs, truck to Bawal", days: "3 to 6 days" },
] as const;

export type ImportLeg = (typeof importLegs)[number]["id"];

/** Some weeks the lot misses its booking and rides the next ship. */
const rolled = (n: number) => n % 7 === 3;

/** Sailing number `n`: when it sails, berths and reaches Bawal, and how many board sets' worth of parts it carries. */
export function importLot(n: number, weeklyUse: number): ImportLot {
  const roll = rolled(n) ? 7 : 0;
  const sailAt = FIRST_SAILING + n * WEEK + roll * DAY;
  const seaDays = Math.round(16 + 2 * Math.sin(n * 0.9));
  const inlandDays = 3.5 + 1.5 * Math.sin(n * 1.3 + 1);
  const berthAt = sailAt + seaDays * DAY;
  const size = 0.94 + 0.12 * ((Math.sin(n * 2.1) + 1) / 2);
  return {
    id: `IMP-${2600 + n}`,
    kits: Math.round(weeklyUse * size),
    sailAt,
    berthAt,
    arriveAt: berthAt + Math.round(inlandDays * 4) * 6 * HOUR,
    rolledDays: roll || undefined,
  };
}

/** The sailing numbers that can still be on their way during the week starting at `weekStart`, oldest first. */
export function importSailings(weekStart: number) {
  const last = Math.floor((weekStart + WEEK - FIRST_SAILING) / WEEK);
  return Array.from({ length: 6 }, (_, i) => last - 5 + i);
}

export function importLegAt(lot: ImportLot, now: number): ImportLeg {
  if (now < lot.sailAt) return "origin";
  if (now < lot.berthAt) return "sea";
  return "inland";
}
