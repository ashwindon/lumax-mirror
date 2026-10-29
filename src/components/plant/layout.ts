import { machinesByPlant } from "@/domain/catalog/machines";
import type { Machine, PlantCode } from "@/domain/types";
import { footprints } from "./three/Generic";

export type PlantLayout = {
  width: number;
  depth: number;
  /** True for plants with a hand-built layout rather than a generated one. */
  detailed: boolean;
  positions: Record<string, [number, number, number]>;
};

const GAP = 3;
const ROW_Z = [-6, 4];

/**
 * Plants without a hand-built layout get one generated from their machine list:
 * machines of the same kind sit together, split across two rows either side of a gap.
 */
export function plantLayout(code: PlantCode): PlantLayout {
  const list = machinesByPlant[code] ?? [];
  if (list.every((m) => m.position)) {
    return {
      width: 76,
      depth: 32,
      detailed: true,
      positions: Object.fromEntries(list.map((m) => [m.id, m.position!])),
    };
  }

  const placed = list.filter((m) => footprints[m.kind][0] > 0);
  const clusters = Object.values(
    placed.reduce<Record<string, Machine[]>>((acc, m) => {
      (acc[m.kind] ??= []).push(m);
      return acc;
    }, {}),
  );
  const clusterLength = (c: Machine[]) => c.reduce((n, m) => n + footprints[m.kind][0] + GAP, 0);
  clusters.sort((a, b) => clusterLength(b) - clusterLength(a));

  const rows: Machine[][] = [[], []];
  const lengths = [0, 0];
  for (const c of clusters) {
    const r = lengths[0] <= lengths[1] ? 0 : 1;
    rows[r].push(...c);
    lengths[r] += clusterLength(c);
  }

  const width = Math.max(34, Math.ceil((Math.max(...lengths) + 10) / 8) * 8);
  const positions: Record<string, [number, number, number]> = {};
  rows.forEach((row, r) => {
    let x = -width / 2 + 5;
    for (const m of row) {
      const w = footprints[m.kind][0];
      positions[m.id] = [x + w / 2, 0, ROW_Z[r]];
      x += w + GAP;
    }
  });
  return { width, depth: 28, detailed: false, positions };
}
