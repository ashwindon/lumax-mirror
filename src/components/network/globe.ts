import * as THREE from "three";
import { regionById, regions } from "@/domain/catalog/regions";
import type { PlantCode, RegionId } from "@/domain/types";
import type { ImportLoad } from "@/live/supply";

// Globe geometry shared by the globe scene and the labels laid over it.

export const GLOBE_R = 10;

/** Point on the globe for a latitude and longitude in degrees, `lift` above the surface. */
export function latLon(lat: number, lon: number, lift = 0) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lon);
  const r = GLOBE_R + lift;
  return new THREE.Vector3(r * Math.cos(phi) * Math.sin(lambda), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(lambda));
}

export function toLatLon(p: THREE.Vector3) {
  const r = p.length();
  return { lat: THREE.MathUtils.radToDeg(Math.asin(p.y / r)), lon: THREE.MathUtils.radToDeg(Math.atan2(p.x, p.z)) };
}

/** The cluster nearest a point in India, if the point is in India. */
export function regionAt(p: THREE.Vector3): RegionId | null {
  const { lat, lon } = toLatLon(p);
  if (lat < 6 || lat > 36 || lon < 68 || lon > 98) return null;
  const dir = p.clone().normalize();
  return regions.reduce((best, r) => (latLon(r.lat, r.lon).normalize().angleTo(dir) < latLon(best.lat, best.lon).normalize().angleTo(dir) ? r : best)).id;
}

/** Where the camera rests over India and the sea lane east, and where it stops over a cluster before the map takes over. */
export const homeDirection = latLon(19, 86).normalize();
export const closeView = (region: RegionId) => {
  const { lat, lon } = regionById[region];
  return latLon(lat - 3, lon).normalize().multiplyScalar(GLOBE_R * 1.22);
};

export type Path = { points: THREE.Vector3[]; lengths: number[]; total: number; at: number[] };

/** A path along the surface through the given waypoints, `lift` above it. */
function surfacePath(waypoints: [lat: number, lon: number][], lift: number): Path {
  const points: THREE.Vector3[] = [];
  const at = [0];
  for (let i = 1; i < waypoints.length; i++) {
    const a = latLon(...waypoints[i - 1]).normalize();
    const b = latLon(...waypoints[i]).normalize();
    const steps = Math.max(2, Math.ceil(THREE.MathUtils.radToDeg(a.angleTo(b)) * 2));
    const q = new THREE.Quaternion().setFromUnitVectors(a, b);
    const step = new THREE.Quaternion();
    for (let s = i === 1 ? 0 : 1; s <= steps; s++) {
      step.identity().slerp(q, s / steps);
      points.push(a.clone().applyQuaternion(step).multiplyScalar(GLOBE_R + lift));
    }
    at.push(points.length - 1);
  }
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + points[i].distanceTo(points[i - 1]));
  return { points, lengths, total: lengths[lengths.length - 1], at };
}

/** Position along a path, 0 at its start and 1 at its end. */
export function along(path: Path, t: number, out = new THREE.Vector3()) {
  const d = THREE.MathUtils.clamp(t, 0, 1) * path.total;
  const i = path.lengths.findIndex((l) => l >= d);
  if (i <= 0) return out.copy(path.points[0]);
  const k = (d - path.lengths[i - 1]) / (path.lengths[i] - path.lengths[i - 1]);
  return out.copy(path.points[i - 1]).lerp(path.points[i], k);
}

// Imported electronics: East Asia through the Singapore Strait and round Sri Lanka to JNPT.
// The origin port is a stand-in; Lumax does not publish where its LED parts ship from.
export const seaLane = surfacePath(
  [
    [22.3, 114.2],
    [12, 111],
    [4, 106],
    [1.25, 104.0],
    [3.0, 100.6],
    [6.0, 94.5],
    [5.6, 80.6],
    [8.2, 76.6],
    [14.5, 72.6],
    [18.95, 72.95],
  ],
  0.06,
);

/** Rail from JNPT to an inland depot near Bawal, the way NCR imports move. */
export const inlandLane = surfacePath(
  [
    [18.95, 72.95],
    [22.3, 73.2],
    [24.17, 72.43],
    [25.7, 73.6],
    [28.19, 76.62],
    [28.09, 76.6],
  ],
  0.03,
);

/** Where a ship sits: at the origin port before it sails, on the lane at sea, then along the rail line inland. */
export function lotPosition(lot: Pick<ImportLoad, "leg" | "progress" | "berthAt" | "arriveAt">, now: number, out = new THREE.Vector3()) {
  if (lot.leg === "inland") return along(inlandLane, (now - lot.berthAt) / Math.max(1, lot.arriveAt - lot.berthAt), out).setLength(GLOBE_R + 0.06);
  return along(seaLane, lot.leg === "origin" ? 0 : lot.progress, out).setLength(GLOBE_R + 0.1);
}

const BAWAL: [number, number] = [28.09, 76.6];

/** The long-haul roads from Bawal Electronics to each lamp plant in another cluster. */
const roadWaypoints: Partial<Record<PlantCode, [number, number][]>> = {
  HDW: [BAWAL, [28.6, 77.2], [28.98, 77.7], [29.93, 78.05]],
  PNT: [BAWAL, [28.6, 77.2], [28.84, 78.77], [28.99, 79.43]],
  SND: [BAWAL, [26.9, 75.8], [24.6, 73.7], [23.03, 72.58], [23.02, 72.32]],
  SN2: [BAWAL, [26.9, 75.8], [24.6, 73.7], [23.03, 72.58], [23.0, 72.36]],
  CK2: [BAWAL, [26.9, 75.8], [23.03, 72.58], [21.17, 72.83], [19.2, 72.97], [18.76, 73.81]],
  CK3: [BAWAL, [26.9, 75.8], [23.03, 72.58], [21.17, 72.83], [19.2, 72.97], [18.76, 73.78]],
  CCW: [BAWAL, [26.9, 75.8], [23.03, 72.58], [21.17, 72.83], [19.2, 72.97], [18.63, 73.8]],
  BLR: [BAWAL, [27.18, 78.0], [26.2, 78.2], [21.15, 79.09], [17.38, 78.48], [12.97, 77.59], [12.78, 77.41]],
};

export const roadLanes = Object.fromEntries(Object.entries(roadWaypoints).map(([code, w]) => [code, surfacePath(w, 0.035)])) as Partial<Record<PlantCode, Path>>;

/** Where a long-haul truck from Bawal is on its road, for the share of the trip done. */
export function truckPosition(to: PlantCode, t: number, out = new THREE.Vector3()) {
  const lane = roadLanes[to];
  return lane ? along(lane, t, out).setLength(GLOBE_R + 0.05) : out.copy(latLon(...BAWAL, 0.05));
}

/** Lumax sites and partners outside the five clusters, shown on the globe only. */
export const contextPins: { id: string; lat: number; lon: number; name: string; note: string; kind: "design" | "partner" | "associate" | "port" }[] = [
  { id: "ostrava", lat: 49.77, lon: 18.27, name: "LETC, Ostrava", note: "Design centre: optics, electronics, software", kind: "design" },
  { id: "taiwan", lat: 23.7, lon: 121.0, name: "Taiwan design centre", note: "Tooling liaison; city not published", kind: "design" },
  { id: "stanley", lat: 35.68, lon: 139.69, name: "Stanley Electric, Japan", note: "Joint venture partner, not a Lumax site", kind: "partner" },
  { id: "sl-lumax", lat: 12.97, lon: 79.95, name: "SL Lumax, Sriperumbudur", note: "Associate serving Hyundai; not modelled", kind: "associate" },
  { id: "jnpt", lat: 18.95, lon: 72.95, name: "JNPT, Nhava Sheva", note: "Where imported LED parts land", kind: "port" },
];
