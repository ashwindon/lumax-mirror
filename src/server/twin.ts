import type { Snapshot } from "@/domain/types";
import { PlantSimulation, productionWeekStart } from "@/live/sim/engine";

// The simulator is deterministic per production week, so the server replays the
// same week the browser is watching and both see the same state. A warm instance
// keeps its replay and only steps forward. With real plant data this becomes a
// read from the MES / historian feed instead.
let sim: PlantSimulation | null = null;

export function liveSnapshot(now = Date.now()): Snapshot {
  if (!sim || productionWeekStart(now) !== sim.weekStart) sim = new PlantSimulation(now);
  sim.advanceTo(now);
  return sim.snapshot();
}
