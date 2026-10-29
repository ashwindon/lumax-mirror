"use client";

import type { ThreeElements } from "@react-three/fiber";
import { FloorFrame, Part, useMaterials } from "@/components/three/kit";
import { orderById } from "@/domain/catalog/orders";
import type { Capability, PlantCode } from "@/domain/types";
import { useLive } from "@/live/store";
import { Aisle, Shed } from "./Shed";
import { FrameOnStands } from "./Workpieces";

const BAY = { x: 76, z: 32 };

function Office() {
  return (
    <group position={[-26, 0, 12.6]}>
      <Part size={[10, 2.8, 0.06]} mat="glass" edges={false} position={[0, 1.4, 2]} castShadow={false} />
      <Part size={[10, 2.8, 0.06]} mat="glass" edges={false} position={[0, 1.4, -2]} castShadow={false} />
      <Part size={[0.06, 2.8, 4]} mat="glass" edges={false} position={[5, 1.4, 0]} castShadow={false} />
      <Part size={[0.06, 2.8, 4]} mat="glass" edges={false} position={[-5, 1.4, 0]} castShadow={false} />
      {[-3, 0, 3].map((x) => (
        <Part key={x} size={[1.8, 0.75, 0.8]} mat="machine" position={[x, 0.375, 0.6]} />
      ))}
      <Part size={[2.4, 0.75, 1.2]} mat="machine" position={[0, 0.375, -1]} />
      <Part size={[10, 0.12, 0.06]} mat="fencePost" edges={false} position={[0, 2.86, 2]} />
      <Part size={[10, 0.12, 0.06]} mat="fencePost" edges={false} position={[0, 2.86, -2]} />
    </group>
  );
}

function PlateStack({ count, ...props }: { count: number } & ThreeElements["group"]) {
  return (
    <group {...props}>
      <Part size={[3.2, 0.2, 1.8]} mat="machineDark" position={[0, 0.1, 0]} />
      {Array.from({ length: count }, (_, i) => (
        <Part
          key={i}
          size={[3, 0.05, 1.6]}
          mat="workpiece"
          edges={false}
          position={[(i % 3) * 0.03, 0.23 + i * 0.055, (i % 2) * 0.03]}
        />
      ))}
    </group>
  );
}

/** Units waiting at this plant for an operation that uses `capability`. */
function useQueued(plant: PlantCode, capability: Capability) {
  return useLive((s) => {
    if (!s.snap) return 0;
    let n = 0;
    for (const wo of Object.values(s.snap.workOrders)) {
      orderById[wo.orderId].route.forEach((op, i) => {
        if (op.plant === plant && op.capability === capability) n += wo.queued[i];
      });
    }
    return n;
  });
}

/** Lay-down area that fills with frames as work queues up for the next operation. */
function QueueArea({ capability, slots, ...props }: { capability: Capability; slots: number } & ThreeElements["group"]) {
  const mats = useMaterials();
  const queued = useQueued("L06", capability);
  const width = slots * 5 + 0.5;
  return (
    <group {...props}>
      <FloorFrame size={[width, 3.6]} thickness={0.1} material={mats.zone} y={0.012} />
      <group userData={{ dynamic: true }}>
        {Array.from({ length: Math.min(queued, slots) }, (_, i) => (
          <FrameOnStands key={i} position={[-width / 2 + 2.75 + i * 5, 0, 0]} />
        ))}
      </group>
    </group>
  );
}

export function L06Bay() {
  return (
    <group>
      <Shed width={BAY.x} depth={BAY.z} />
      <Aisle length={BAY.x - 2} z={7.25} />
      {[-17.5, 16].map((x) => (
        <group key={x} position={[x, 0, -5]} rotation-y={Math.PI / 2}>
          <Aisle length={20} z={0} width={1.8} />
        </group>
      ))}
      <Office />
      <PlateStack count={14} position={[-33.5, 0, 1.6]} />
      <PlateStack count={8} position={[-21.5, 0, 1.8]} />
      <QueueArea capability="robotic-weld" slots={3} position={[-1, 0, 1.8]} />
      <QueueArea capability="paint" slots={3} position={[26, 0, 1.8]} />
    </group>
  );
}
