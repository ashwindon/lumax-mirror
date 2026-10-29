import { create } from "zustand";
import type { PlantCode, RegionId } from "@/domain/types";

/** "live" shows what is happening now; "sprint" shows the week against its commitment. */
export type Lens = "live" | "sprint";

export type NetworkSelection =
  | { kind: "plant"; code: PlantCode }
  | { kind: "order"; id: string }
  /** The sea lane to Conroe, optionally with one ship picked out by its sailing. */
  | { kind: "freight"; sailAt?: number }
  | null;

/** The network tab shows the globe, or the map of one region's plants. */
export type NetworkView = "globe" | RegionId;

type TwinState = {
  lens: Lens;
  /** Selected machine in a plant view. */
  machineId: string | null;
  hoveredId: string | null;
  /** Selected plant, order or the sea lane in the network view. */
  network: NetworkSelection;
  /** Bumped whenever something asks the camera to fly to the selected machine. */
  focusRequest: number;
  networkView: NetworkView;
  /** The region map the globe was opened from, so it can pull out from there. */
  globeFrom: RegionId | null;
  /** Latest ask for the globe to fly into a region; a new object each time. */
  globeRequest: { region: RegionId } | null;
  selectMachine: (id: string | null) => void;
  hover: (id: string | null) => void;
  focusMachine: (id: string) => void;
  selectNetwork: (selection: NetworkSelection) => void;
  setLens: (lens: Lens) => void;
  setNetworkView: (view: NetworkView) => void;
  flyToRegion: (region: RegionId) => void;
};

export const useTwin = create<TwinState>((set) => ({
  lens: "live",
  machineId: null,
  hoveredId: null,
  network: null,
  focusRequest: 0,
  networkView: "globe",
  globeFrom: null,
  globeRequest: null,
  selectMachine: (machineId) => set({ machineId }),
  hover: (hoveredId) => set({ hoveredId }),
  focusMachine: (id) => set((s) => ({ machineId: id, focusRequest: s.focusRequest + 1 })),
  selectNetwork: (network) => set({ network }),
  setLens: (lens) => set({ lens }),
  setNetworkView: (view) =>
    set((s) => ({ networkView: view, globeFrom: view === "globe" && s.networkView !== "globe" ? s.networkView : null, globeRequest: null })),
  flyToRegion: (region) => set({ globeRequest: { region } }),
}));
