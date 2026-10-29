import { PlantSimulation, productionWeekStart } from "./engine";

// Runs the simulation off the main thread: replaying a week takes a couple of
// seconds, and the 3D views should stay smooth while it does.
let sim = new PlantSimulation(Date.now());
sim.advanceTo(Date.now());
self.postMessage(sim.snapshot());

setInterval(() => {
  const now = Date.now();
  // A new production week starts a fresh replay on Monday at 06:00 IST.
  if (productionWeekStart(now) !== sim.weekStart) sim = new PlantSimulation(now);
  if (sim.advanceTo(now)) self.postMessage(sim.snapshot());
}, 1000);
