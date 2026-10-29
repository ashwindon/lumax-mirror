import { machinesByPlant } from "@/domain/catalog/machines";
import type { Machine, MachineKind, PlantCode } from "@/domain/types";
import { footprints } from "./three/Generic";

export type PlantLayout = {
  width: number;
  depth: number;
  positions: Record<string, [number, number, number]>;
  /** Centre line of each aisle between rows, in z. */
  aisles: number[];
};

const GAP = 3;

/**
 * Lamp plants run in process order: the moulding shop at the back, surface treatment
 * (hard coat, metallizing, paint) in the middle, assembly lines and test at the front.
 * The SMT plant puts its lines at the back and test cells at the front.
 */
const zoneOf: Record<MachineKind, number> = {
  "imm-xl": 0,
  imm: 0,
  "imm-2k": 0,
  "bmc-press": 0,
  "smt-line": 0,
  "anneal-oven": 1,
  "hardcoat-line": 1,
  metallizer: 1,
  "paint-booth": 1,
  "assembly-line": 2,
  "hot-plate-welder": 2,
  "vibration-welder": 2,
  "seal-robot": 2,
  "leak-tester": 2,
  "photometry-tunnel": 2,
  "function-tester": 2,
  "board-tester": 2,
  "panel-line": 2,
  agv: -1,
};

/** Machines of a kind sit together, and a zone lays them out left to right in process order. */
const kindOrder: MachineKind[] = [
  "imm-xl",
  "imm-2k",
  "imm",
  "bmc-press",
  "smt-line",
  "hardcoat-line",
  "anneal-oven",
  "metallizer",
  "paint-booth",
  "assembly-line",
  "seal-robot",
  "hot-plate-welder",
  "vibration-welder",
  "leak-tester",
  "function-tester",
  "photometry-tunnel",
  "board-tester",
  "panel-line",
];

export function plantLayout(code: PlantCode): PlantLayout {
  const list = machinesByPlant[code] ?? [];
  const rows: Machine[][] = [[], [], []];
  for (const kind of kindOrder) for (const m of list) if (m.kind === kind) rows[zoneOf[kind]].push(m);
  const used = rows.filter((r) => r.length);
  const rowLength = (r: Machine[]) => r.reduce((n, m) => n + footprints[m.kind][0], 0) + GAP * Math.max(0, r.length - 1);
  const rowDepth = (r: Machine[]) => Math.max(...r.map((m) => footprints[m.kind][1]));
  const width = Math.max(40, Math.ceil((Math.max(...used.map(rowLength)) + 12) / 8) * 8);

  // Rows sit back to front with a 4 m aisle between them.
  const aisle = 4;
  const total = used.reduce((n, r) => n + rowDepth(r), 0) + aisle * (used.length + 1);
  const positions: Record<string, [number, number, number]> = {};
  const aisles: number[] = [];
  let z = -total / 2 + aisle;
  used.forEach((row, i) => {
    const d = rowDepth(row);
    let x = -rowLength(row) / 2;
    for (const m of row) {
      const w = footprints[m.kind][0];
      positions[m.id] = [x + w / 2, 0, z + d / 2];
      x += w + GAP;
    }
    z += d;
    if (i < used.length - 1 || used.length === 1) aisles.push(z + aisle / 2);
    z += aisle;
  });
  return { width, depth: Math.max(26, Math.ceil(total + 4)), positions, aisles };
}
