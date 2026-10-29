"use client";

import type { ThreeElements } from "@react-three/fiber";
import { Cyl, Part, Static } from "@/components/three/kit";
import { orderById } from "@/domain/catalog/orders";
import { useLive } from "@/live/store";

type G = ThreeElements["group"];

// 4W headlamp: a deep housing, the reflector or projector inside, a clear outer lens.
export function Headlamp(props: G) {
  return (
    <group {...props}>
      <Part size={[1.6, 0.7, 0.9]} mat="workpiece" />
      <Cyl radius={0.26} height={0.12} mat="chrome" position={[-0.35, 0.36, 0]} />
      <Cyl radius={0.2} height={0.12} mat="chrome" position={[0.3, 0.36, 0]} />
      <Part size={[1.62, 0.08, 0.92]} mat="lens" edges={false} position={[0, 0.4, 0]} />
    </group>
  );
}

// 2W headlamp: a round-fronted lamp, smaller and lighter.
export function ScooterHeadlamp(props: G) {
  return (
    <group {...props}>
      <Cyl radius={0.45} height={0.5} mat="workpiece" />
      <Cyl radius={0.3} height={0.1} mat="chrome" position={[0, 0.28, 0]} />
      <Cyl radius={0.46} height={0.06} mat="lens" position={[0, 0.3, 0]} />
    </group>
  );
}

// Rear combination lamp: long and shallow, with a red 2K lens.
export function RearLamp(props: G) {
  return (
    <group {...props}>
      <Part size={[1.8, 0.35, 0.6]} mat="workpiece" />
      <Part size={[1.82, 0.08, 0.62]} mat="lensRed" edges={false} position={[0, 0.2, 0]} />
    </group>
  );
}

export function FogLamp(props: G) {
  return (
    <group {...props}>
      <Cyl radius={0.32} height={0.35} mat="workpiece" />
      <Cyl radius={0.33} height={0.05} mat="lens" position={[0, 0.2, 0]} />
    </group>
  );
}

// LED board panel: green FR-4 with a row of LEDs and the driver IC.
export function BoardPanel(props: G) {
  return (
    <group {...props}>
      <Part size={[1.4, 0.06, 0.9]} mat="pcb" edges={false} />
      {[-0.45, -0.15, 0.15, 0.45].map((x) => (
        <Part key={x} size={[0.12, 0.06, 0.12]} mat="lens" edges={false} position={[x, 0.06, 0.2]} />
      ))}
      <Part size={[0.3, 0.06, 0.3]} mat="workpiece" edges={false} position={[0.1, 0.06, -0.2]} />
    </group>
  );
}

// Metallized reflector, as it comes off the jig rack.
export function Reflector(props: G) {
  return (
    <group {...props}>
      <Cyl radius={0.4} height={0.35} mat="chrome" segments={18} />
    </group>
  );
}

const byUnit: Record<string, (props: G) => React.ReactElement> = {
  "Headlamp set": Headlamp,
  Headlamp: ScooterHeadlamp,
  "Rear lamp set": RearLamp,
  "Lamp set": FogLamp,
  "Board set": BoardPanel,
  Board: BoardPanel,
};

/** What is on the machine right now, chosen from the schedule it is working on. */
export function Workpiece({ machineId, metallic = false, ...props }: { machineId: string; metallic?: boolean } & G) {
  const orderId = useLive((s) => {
    const wo = s.snap?.machines[machineId]?.workOrderId;
    return wo ? s.snap!.workOrders[wo]?.orderId : undefined;
  });
  const order = orderId ? orderById[orderId] : undefined;
  const Shape = order ? (metallic && !order.fills ? Reflector : byUnit[order.unitName]) : undefined;
  // Changes with the schedule on the machine, so it is never merged into the static scene.
  return Shape ? (
    <Static key={`${orderId}${metallic}`} userData={{ dynamic: true }}>
      <Shape {...props} />
    </Static>
  ) : null;
}
