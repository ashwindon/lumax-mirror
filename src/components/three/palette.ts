import type { MachineStatus } from "@/domain/types";

export const materialRoles = [
  "floor",
  "outside",
  "lane",
  "zone",
  "structure",
  "wall",
  "machine",
  "machineDark",
  "robot",
  "workpiece",
  "fence",
  "fencePost",
  "crane",
  "booth",
  "glass",
  "ghost",
  "liquid",
  "board",
  "road",
  "water",
] as const;

export type MaterialRole = (typeof materialRoles)[number];

type MaterialSpec = { color: string; roughness?: number; metalness?: number; opacity?: number };

// "Scale model": everything is matte white like an architect's model, so colour is
// spent only on the work being made and on anything that needs a person's attention.
export const palette = {
  background: "#E2E6E9",
  fog: [130, 320] as [number, number],
  edges: "#B3BAC2",
  hemi: { sky: "#FFFFFF", ground: "#C9CED3", intensity: 1.5 },
  key: { color: "#FFFFFF", intensity: 2.4 },
  env: 0.55,
  ao: 2.4,
  selection: "#1F2328",
  accent: "#00A86B",
  status: { running: "#00A86B", waiting: "#9AA3AD", setup: "#E3A21A", down: "#E5484D" } satisfies Record<MachineStatus, string>,
  materials: {
    floor: { color: "#EDEFF0", roughness: 0.95 },
    outside: { color: "#D9DDE1", roughness: 1 },
    lane: { color: "#C6CCD2", roughness: 0.9 },
    zone: { color: "#CDD3D8", roughness: 0.9 },
    structure: { color: "#E3E6E9", roughness: 0.8 },
    wall: { color: "#E8EBED", roughness: 0.9 },
    machine: { color: "#F6F7F8", roughness: 0.7 },
    machineDark: { color: "#BCC3CA", roughness: 0.6 },
    robot: { color: "#FBFBFB", roughness: 0.5 },
    workpiece: { color: "#454B53", roughness: 0.5, metalness: 0.25 },
    fence: { color: "#8E98A3", roughness: 0.6, opacity: 0.16 },
    fencePost: { color: "#C3C9CF", roughness: 0.7 },
    crane: { color: "#D8DCE0", roughness: 0.7 },
    booth: { color: "#F0F2F3", roughness: 0.8 },
    glass: { color: "#CFE0E8", roughness: 0.1, opacity: 0.28 },
    ghost: { color: "#E3E6E9", roughness: 0.8, opacity: 0.14 },
    liquid: { color: "#7E8A96", roughness: 0.15, metalness: 0.6 },
    board: { color: "#F3F4F5", roughness: 0.95 },
    road: { color: "#D5DADE", roughness: 0.95 },
    water: { color: "#C9D6DF", roughness: 0.4 },
  } satisfies Record<MaterialRole, MaterialSpec>,
};
