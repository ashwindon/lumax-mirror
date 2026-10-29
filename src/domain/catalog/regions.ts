import type { Region, RegionId } from "../types";

// Lumax Industries' plants sit in five clusters, each beside the OEM plants it serves.
// Positions are each cluster's centre, for the globe; plant positions are in plants.ts.
export const regions: Region[] = [
  { id: "ncr", name: "NCR–Haryana", towns: "Bawal and Dharuhera", state: "Haryana", lat: 28.15, lon: 76.7 },
  { id: "uttarakhand", name: "Uttarakhand", towns: "Pantnagar and Haridwar", state: "Uttarakhand", lat: 29.46, lon: 78.74 },
  { id: "pune", name: "Pune", towns: "Chakan and Chinchwad", state: "Maharashtra", lat: 18.7, lon: 73.8 },
  { id: "gujarat", name: "Sanand", towns: "Sanand", state: "Gujarat", lat: 23.03, lon: 72.3 },
  { id: "karnataka", name: "Bengaluru", towns: "Bidadi", state: "Karnataka", lat: 12.78, lon: 77.41 },
];

export const regionById = Object.fromEntries(regions.map((r) => [r.id, r])) as Record<RegionId, Region>;
