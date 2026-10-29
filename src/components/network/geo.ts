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
  /** OEM plants nearby, at cluster level: Lumax does not say which OEM plant each of its plants ships to. */
  oems: { name: string; at: Km }[];
  /** Where long-haul trucks to and from other clusters leave the map, by the plant or cluster they serve. */
  gateways: { at: Km; name: string; note: string; regions: RegionId[]; plants?: PlantCode[] }[];
  /** Sites under construction, drawn as outlines. */
  ghosts?: { name: string; note: string; at: Km; sheds: { w: number; d: number }[] }[];
  camera: [number, number, number];
  target: [number, number, number];
  shadowExtent: number;
  minDistance: number;
  maxDistance: number;
};

// Schematic maps of each cluster, north up, from town and estate geocodes (see
// reports/). Roads and rivers are drawn to show which way things lie, not to survey.
export const regionMaps: Record<RegionId, RegionMap> = {
  // Rewari district, Haryana: Bawal and Dharuhera on NH-48, Delhi to the north-east.
  ncr: {
    scale: [2.2, 2.2],
    board: { w: 66, d: 54 },
    roads: [
      // NH-48, Delhi to Jaipur
      { major: true, path: [[15.5, 11.5], [9.6, 5.6], [0, -1], [-9.4, -7.2], [-15, -11]] },
      // Rewari to Bawal
      { path: [[-8.1, 5.2], [-9.2, -1], [-9.8, -6.7]] },
      // Rewari to Dharuhera and Bhiwadi
      { path: [[-8.1, 5.2], [0, 5.8], [9.3, 6.1], [12, 6.4], [15, 6.6]] },
      // Growth Centre Bawal estate road
      { path: [[-9.4, -7.2], [-7, -6.4], [-5.4, -5.9]] },
    ],
    water: [[[-15, -3], [-6, 1.5], [3, 7.8], [10, 10.2], [15, 12]]],
    towns: [
      { name: "Rewari", at: [-8.1, 6.3] },
      { name: "Bawal", at: [-12, -9.4] },
      { name: "Dharuhera", at: [11.6, 4.3] },
      { name: "Bhiwadi", at: [13.6, 7.8] },
      { name: "Sahibi river", at: [4.2, 9.6] },
    ],
    oems: [{ name: "Maruti Suzuki, Manesar and Gurugram, to the north", at: [-1, 10.8] }],
    gateways: [
      { at: [15.5, 11.5], name: "To Delhi and Uttarakhand", note: "Haridwar and Pantnagar overnight", regions: ["uttarakhand"] },
      { at: [-15, -11], name: "NH-48 south", note: "Sanand 2 days, Pune 3, Bengaluru 4 to 5", regions: ["gujarat", "pune", "karnataka"] },
    ],
    camera: [0, 70, 58],
    target: [0, 0, 0],
    shadowExtent: 44,
    minDistance: 20,
    maxDistance: 170,
  },
  // Haridwar and Pantnagar are about 170 km apart, so this map is drawn at a small scale.
  uttarakhand: {
    scale: [0.42, 0.42],
    board: { w: 68, d: 56 },
    roads: [
      // Haridwar, Najibabad, Kashipur, Rudrapur, Pantnagar
      { major: true, path: [[-66.9, 52.2], [-50, 35], [-38.8, 16.6], [-30, -2.2], [0, -15], [21.3, -27.8], [45, -40], [64, -53.4], [66.9, -52.2]] },
      // Haridwar to Roorkee and Delhi
      { path: [[-66.9, 52.2], [-75, 47], [-80, 32]] },
      // Kashipur to Moradabad and Delhi
      { path: [[21.3, -27.8], [10, -45], [2.9, -66]] },
    ],
    water: [[[-60, 66], [-61, 52], [-57, 30], [-55, 0], [-52, -30], [-50, -66]]],
    towns: [
      { name: "Haridwar", at: [-71, 61] },
      { name: "Najibabad", at: [-38.8, 21] },
      { name: "Kashipur", at: [24, -22] },
      { name: "Rudrapur", at: [55, -62] },
      { name: "Roorkee", at: [-74, 40] },
      { name: "Ganga", at: [-50, 8] },
    ],
    oems: [
      { name: "Hero MotoCorp, Haridwar", at: [-50, 60] },
      { name: "Tata Motors, Pantnagar", at: [52, -42] },
    ],
    gateways: [
      { at: [-80, 30], name: "From Bawal via Delhi", note: "Boards overnight, about 300 km", regions: ["ncr"], plants: ["HDW"] },
      { at: [2.9, -66], name: "From Bawal via Moradabad", note: "Boards overnight, about 380 km", regions: ["ncr"], plants: ["PNT"] },
    ],
    camera: [0, 72, 58],
    target: [0, 0, 0],
    shadowExtent: 44,
    minDistance: 20,
    maxDistance: 170,
  },
  // Pune: Chakan II and III on the Chakan–Talegaon road, Chinchwad in the MIDC to the south.
  pune: {
    scale: [3.2, 3.0],
    board: { w: 70, d: 62 },
    roads: [
      // Pune–Nashik highway through Bhosari, Moshi and Chakan
      { major: true, path: [[5.3, -10.3], [5.3, -8.9], [5.3, -3.3], [6, 2], [6.3, 6.7], [6.9, 10.3]] },
      // Chakan–Talegaon road through Mahalunge Ingle and past Sawardari
      { path: [[6.3, 6.7], [0.95, 6], [-1.9, 6.3], [-6, 5.5], [-10.9, 4.2]] },
      // Old Mumbai–Pune highway through Chinchwad
      { major: true, path: [[3.5, -10.3], [0.3, -7.6], [-4, -4.6], [-8, -1.5], [-10.9, 1.5]] },
      // Dehu to Alandi
      { path: [[-3.6, 2], [2, 1], [10.2, -2.6]] },
    ],
    water: [
      [[-10.9, 3.2], [-3.6, 1.6], [2, -0.6], [5.3, -1.8], [10.9, -3]],
      [[-10.9, -3.5], [-5, -6.2], [0.3, -8.6], [5, -10.3]],
    ],
    towns: [
      { name: "Chakan", at: [8.2, 7.6] },
      { name: "Talegaon", at: [-9.6, 5.4] },
      { name: "Chinchwad", at: [-2.6, -8.6] },
      { name: "Bhosari", at: [7.4, -8.6] },
      { name: "Moshi", at: [7.4, -3.4] },
      { name: "Dehu", at: [-4.4, 2.9] },
      { name: "Alandi", at: [9.4, -1.4] },
      { name: "Indrayani river", at: [-6.4, 0.9] },
    ],
    oems: [
      { name: "Mahindra, Chakan", at: [2.8, 3.4] },
      { name: "Skoda Auto Volkswagen, Chakan", at: [7.2, 9.7] },
      { name: "Tata Motors, Pimpri", at: [-1.2, -10] },
    ],
    gateways: [{ at: [-10.9, 1.5], name: "NH-48 from Bawal", note: "Boards 3 days by road, via Ahmedabad and Mumbai", regions: ["ncr"] }],
    camera: [0, 80, 64],
    target: [0, 0, 1],
    shadowExtent: 50,
    minDistance: 24,
    maxDistance: 200,
  },
  // Sanand, west of Ahmedabad: the two plants sit in vendor parks beside the OEM plants.
  gujarat: {
    scale: [3.4, 3.4],
    board: { w: 68, d: 58 },
    roads: [
      // Sanand to Sarkhej and Ahmedabad
      { major: true, path: [[-10, 1.2], [-1.6, 0.6], [4.2, -2], [10, -2.6]] },
      // Sanand to Viramgam
      { path: [[4.2, -2], [-2, 4], [-10, 8]] },
      // Vendor park road
      { path: [[2.6, -1.6], [3.2, -4.5], [3, -8.5]] },
    ],
    water: [[[-10, 6.4], [0, 6.9], [10, 6.3]]],
    towns: [
      { name: "Sanand", at: [5.4, -3.4] },
      { name: "Ahmedabad, 25 km", at: [8.2, -4.4] },
      { name: "Viramgam", at: [-8.4, 8.4] },
      { name: "Narmada main canal", at: [-3.6, 7.6] },
    ],
    oems: [
      { name: "Tata Motors, Sanand", at: [6.6, 1.2] },
      { name: "Suzuki Motor Gujarat, Hansalpur (60 km north-west)", at: [-5.5, -6.4] },
    ],
    gateways: [{ at: [10, -2.6], name: "NH-48 from Bawal", note: "Boards 2 days by road, via Jaipur and Udaipur", regions: ["ncr"] }],
    camera: [0, 74, 60],
    target: [0, 0, 0],
    shadowExtent: 46,
    minDistance: 20,
    maxDistance: 180,
  },
  // Bidadi, south-west of Bengaluru on the Mysuru road, with the greenfield plant next door.
  karnataka: {
    scale: [3.4, 3.4],
    board: { w: 64, d: 52 },
    roads: [
      // Bengaluru–Mysuru expressway
      { major: true, path: [[9.4, 7.6], [3, 2.8], [-2.4, 1.2], [-9.4, -5]] },
      // Bidadi Industrial Area
      { path: [[-1.2, 1.4], [0.65, -0.6], [3.4, 0.6]] },
    ],
    water: [[[-9.4, -2.6], [-4, -4.4], [2, -5.2], [9.4, -6.8]]],
    towns: [
      { name: "Bidadi", at: [-3.6, 2.8] },
      { name: "Bengaluru, 35 km", at: [6.8, 7] },
      { name: "Ramanagara", at: [-7.6, -6.6] },
    ],
    oems: [
      { name: "Toyota Kirloskar, Bidadi", at: [-3.4, 5.2] },
      { name: "HMSI, Narsapura (100 km east)", at: [6, -3.8] },
    ],
    gateways: [{ at: [9.4, 7.6], name: "From Bawal by road", note: "Boards 4 to 5 days, via Nagpur and Hyderabad", regions: ["ncr"] }],
    ghosts: [
      {
        name: "Bengaluru greenfield",
        note: "₹140 crore plant for Maruti Suzuki and Toyota, commissioning Q4 FY27",
        at: [3.6, 1.9],
        sheds: [{ w: 8, d: 4 }],
      },
    ],
    camera: [0, 70, 56],
    target: [0, 0, 0],
    shadowExtent: 42,
    minDistance: 20,
    maxDistance: 160,
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

/** The map edge a long-haul truck uses on `region`'s map, coming from or going to `other` for `plant`. */
export function gatewayFor(region: RegionId, other: RegionId, plant: PlantCode) {
  const gates = regionMaps[region].gateways.filter((g) => g.regions.includes(other));
  return gates.find((g) => !g.plants || g.plants.includes(plant)) ?? gates[0];
}

export const gatewayPosition = (region: RegionId, other: RegionId, plant: PlantCode, height = 0) =>
  kmToWorld(region, gatewayFor(region, other, plant)?.at ?? [0, 0], height);
