import * as THREE from "three";
import { plantByCode } from "@/domain/catalog/plants";
import type { PlantCode, RegionId } from "@/domain/types";

type Km = [x: number, y: number];

export type RegionMap = {
  /** Scene units per km, east and north. */
  scale: [x: number, y: number];
  board: { w: number; d: number };
  roads: { path: Km[]; major?: boolean }[];
  water: Km[][];
  towns: { name: string; at: Km }[];
  /** Board edge where sea freight to or from the other region leaves the map. */
  port: { at: Km; name: string; note: string };
  camera: [number, number, number];
  target: [number, number, number];
  shadowExtent: number;
  minDistance: number;
  maxDistance: number;
};

export const regionMaps: Record<RegionId, RegionMap> = {
  // Schematic map of the Pune industrial belt, north up. North-south is squeezed a
  // little so the Bhosari plants and the Chakan cluster both fit between the panels.
  pune: {
    scale: [5.5, 3.8],
    board: { w: 72, d: 86 },
    roads: [
      // Pune to Nashik highway through Bhosari, Moshi and Chakan
      { major: true, path: [[5.4, -10.8], [4.0, -8], [3.0, -3], [1.9, 2], [1.6, 5], [1.9, 9], [2.3, 10.8]] },
      // Chakan to Talegaon
      { path: [[1.7, 4], [-1, 4.6], [-4, 5.4], [-6.2, 6]] },
      // Nighoje to Kuruli and Chakan
      { path: [[1.8, 2.4], [-0.5, 1.0], [-2.5, 1.8], [-4.5, 3.2], [-6.2, 3.4]] },
      // Dehu to Alandi
      { path: [[3.2, -6], [0, -5.2], [-4, -4], [-6.2, -3.6]] },
      // Khalumbre and Ambethan link
      { path: [[1.8, 8.4], [-0.5, 8.2], [-2.6, 8.6], [-6.2, 9.4]] },
    ],
    water: [[[-6.2, -1.6], [-4.5, -2.2], [-1, -3.5], [2, -4.2], [5, -4.8], [6.2, -5.1]]],
    towns: [
      { name: "Bhosari", at: [5.4, -10.2] },
      { name: "Moshi", at: [4.6, -5.4] },
      { name: "Chakan", at: [3.4, 3.4] },
      { name: "Nighoje", at: [-2.6, -0.2] },
      { name: "Khalumbre", at: [-4.6, 10] },
      { name: "Ambethan", at: [4.2, 10] },
      { name: "Indrayani river", at: [-4.8, -3.1] },
    ],
    port: { at: [-6.2, -7.6], name: "JNPT, Mumbai", note: "Weekly sailing to Houston, 35 to 45 days" },
    camera: [0, 96, 74],
    target: [0, 0, 2],
    shadowExtent: 60,
    minDistance: 30,
    maxDistance: 240,
  },
  // Conroe, north of Houston, with the plant on Firetower Road at the origin.
  texas: {
    scale: [2.4, 2.4],
    board: { w: 72, d: 60 },
    roads: [
      // Interstate 45, Houston to Dallas
      { major: true, path: [[-9, -12.5], [-9.8, -4], [-10.4, 2], [-11.6, 12.5]] },
      // State Highway 105 through Conroe
      { path: [[-15, 1.8], [-8, 1.2], [0, 2.6], [15, 3.4]] },
      // Firetower Road
      { path: [[0.6, -7], [0.3, 0], [0, 2.6]] },
    ],
    water: [[[-15, -5], [-8, -6.5], [0, -7.8], [8, -9], [15, -9.6]]],
    towns: [
      { name: "Conroe", at: [-7.4, 3.4] },
      { name: "Interstate 45", at: [-12.4, 8] },
      { name: "San Jacinto River", at: [6.5, -10.6] },
    ],
    port: { at: [-6.4, -10.6], name: "Port of Houston", note: "From JNPT; customs and truck, 2 to 5 days" },
    camera: [0, 84, 66],
    target: [0, 0, -2],
    shadowExtent: 44,
    minDistance: 20,
    maxDistance: 170,
  },
};

export const kmToWorld = (region: RegionId, [x, y]: Km, height = 0) => {
  const [sx, sy] = regionMaps[region].scale;
  return new THREE.Vector3(x * sx, height, -y * sy);
};

export const plantPosition = (code: PlantCode, height = 0) => {
  const { region, site } = plantByCode[code];
  return kmToWorld(region, [site.x, site.y], height);
};

export const portPosition = (region: RegionId, height = 0) => kmToWorld(region, regionMaps[region].port.at, height);
