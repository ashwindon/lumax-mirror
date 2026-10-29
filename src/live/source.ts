import type { Snapshot } from "@/domain/types";

/**
 * Where live plant state comes from. Today it is the simulator; a production
 * deployment swaps this for a feed built on the plant's MES / OPC UA / MQTT data.
 */
export interface LiveSource {
  subscribe(onSnapshot: (snapshot: Snapshot) => void): () => void;
}

/** The simulator, running in a Web Worker and posting a snapshot every 5 simulated seconds. */
export function simulatedSource(): LiveSource {
  return {
    subscribe(onSnapshot) {
      const worker = new Worker(new URL("./sim/worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<Snapshot>) => onSnapshot(e.data);
      return () => worker.terminate();
    },
  };
}
