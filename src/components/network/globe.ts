import * as THREE from "three";
import { regionById } from "@/domain/catalog/regions";
import type { RegionId } from "@/domain/types";
import type { SeaLoad } from "@/live/freight";

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

/** Which highlighted country a point on the globe falls in, if any. */
export function regionAt(p: THREE.Vector3): RegionId | null {
  const { lat, lon } = toLatLon(p);
  if (lat > 6 && lat < 36 && lon > 68 && lon < 98) return "pune";
  if ((lat > 24 && lat < 50 && lon > -125 && lon < -66) || (lat > 51 && lat < 72 && lon > -170 && lon < -130)) return "texas";
  return null;
}

/** Where the camera rests over the whole lane, and where it stops over a region before the map takes over. */
export const homeDirection = latLon(42, -10).normalize();
export const closeView = (region: RegionId) => {
  const { lat, lon } = regionById[region];
  return latLon(lat - 7, lon).normalize().multiplyScalar(GLOBE_R * 1.55);
};

// Pune to Conroe the way the freight travels: JNPT, Suez, Gibraltar, Houston.
const waypoints: [lat: number, lon: number][] = [
  [18.75, 73.86],
  [18.95, 72.95],
  [15, 62],
  [12.4, 45],
  [12.6, 43.4],
  [20, 38.5],
  [29.9, 32.6],
  [31.6, 32.3],
  [34.5, 18],
  [35.95, -5.6],
  [31, -30],
  [27, -60],
  [24.2, -81],
  [26.5, -90],
  [29.6, -94.9],
  [30.3, -95.37],
];

export const lane = (() => {
  const points: THREE.Vector3[] = [];
  /** Index into `points` of each waypoint. */
  const at = [0];
  for (let i = 1; i < waypoints.length; i++) {
    const a = latLon(...waypoints[i - 1]).normalize();
    const b = latLon(...waypoints[i]).normalize();
    const steps = Math.max(2, Math.ceil(THREE.MathUtils.radToDeg(a.angleTo(b))));
    const q = new THREE.Quaternion().setFromUnitVectors(a, b);
    const step = new THREE.Quaternion();
    for (let s = i === 1 ? 0 : 1; s <= steps; s++) {
      step.identity().slerp(q, s / steps);
      points.push(a.clone().applyQuaternion(step).multiplyScalar(GLOBE_R + 0.06));
    }
    at.push(points.length - 1);
  }
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + points[i].distanceTo(points[i - 1]));
  const total = lengths[lengths.length - 1];
  // Where the voyage itself starts and ends along the lane: JNPT and Houston.
  return { points, lengths, total, jnpt: lengths[at[1]] / total, houston: lengths[at[at.length - 2]] / total };
})();

/** Position along the lane, 0 at Pune and 1 at Conroe. */
export function alongLane(t: number, out = new THREE.Vector3()) {
  const d = THREE.MathUtils.clamp(t, 0, 1) * lane.total;
  const i = lane.lengths.findIndex((l) => l >= d);
  if (i <= 0) return out.copy(lane.points[0]);
  const k = (d - lane.lengths[i - 1]) / (lane.lengths[i] - lane.lengths[i - 1]);
  return out.copy(lane.points[i - 1]).lerp(lane.points[i], k);
}

/** Where a ship sits: alongside at JNPT before it sails, on the lane at sea, at Houston once in. */
export function loadPosition(load: Pick<SeaLoad, "leg" | "progress">, out = new THREE.Vector3()) {
  const t = load.leg === "port" ? lane.jnpt : load.leg === "import" ? lane.houston : THREE.MathUtils.lerp(lane.jnpt, lane.houston, load.progress);
  return alongLane(t, out).setLength(GLOBE_R + 0.1);
}
