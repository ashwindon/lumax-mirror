"use client";

import type { ThreeElements } from "@react-three/fiber";
import { Cyl, Part, Static } from "@/components/three/kit";
import { useLive } from "@/live/store";

type G = ThreeElements["group"];

// Metro bogie frame: two fish-bellied side beams tied by two tubular cross beams.
export function BogieFrame(props: G) {
  return (
    <group {...props}>
      {[-0.95, 0.95].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Part size={[1.5, 0.44, 0.3]} mat="workpiece" position={[0, -0.04, 0]} />
          <Part size={[0.95, 0.34, 0.28]} mat="workpiece" position={[-1.15, 0.12, 0]} rotation-z={0.16} />
          <Part size={[0.95, 0.34, 0.28]} mat="workpiece" position={[1.15, 0.12, 0]} rotation-z={-0.16} />
          <Cyl radius={0.15} height={0.12} mat="workpiece" position={[-1.45, 0.34, 0]} />
          <Cyl radius={0.15} height={0.12} mat="workpiece" position={[1.45, 0.34, 0]} />
        </group>
      ))}
      {[-0.38, 0.38].map((x) => (
        <group key={x}>
          <Cyl radius={0.13} height={1.9} mat="workpiece" position={[x, 0, 0]} rotation-x={Math.PI / 2} />
          <Part size={[0.28, 0.3, 0.26]} mat="workpiece" position={[x, -0.24, 0.42]} />
          <Part size={[0.28, 0.3, 0.26]} mat="workpiece" position={[x, -0.24, -0.42]} />
        </group>
      ))}
    </group>
  );
}

// Excavator chassis: two long rails, cross members and a slew-ring plate.
export function ChassisFrame(props: G) {
  return (
    <group {...props}>
      <Part size={[3.6, 0.4, 0.28]} mat="workpiece" position={[0, 0, 0.8]} />
      <Part size={[3.6, 0.4, 0.28]} mat="workpiece" position={[0, 0, -0.8]} />
      {[-1.5, -0.4, 0.7, 1.6].map((x) => (
        <Part key={x} size={[0.24, 0.32, 1.4]} mat="workpiece" position={[x, 0, 0]} />
      ))}
      <Cyl radius={0.62} height={0.12} mat="workpiece" position={[0.15, 0.24, 0]} edges />
    </group>
  );
}

// Frac pump fluid end: a forged block with three plunger bores.
export function FluidEnd(props: G) {
  return (
    <group {...props}>
      <Part size={[1.1, 0.7, 0.75]} mat="workpiece" />
      {[-0.3, 0, 0.3].map((x) => (
        <Cyl key={x} radius={0.09} height={0.2} mat="machineDark" position={[x, 0.36, 0]} />
      ))}
    </group>
  );
}

export function DrillCollar(props: G) {
  return (
    <group {...props}>
      <Cyl radius={0.17} height={5.5} mat="workpiece" rotation-z={Math.PI / 2} edges />
    </group>
  );
}

// Wind turbine main frame (bedplate): a deep fabricated box with a bearing seat.
export function MainFrame(props: G) {
  return (
    <group {...props}>
      <Part size={[2.6, 1.1, 1.8]} mat="workpiece" />
      <Cyl radius={0.55} height={0.3} mat="machineDark" position={[0.5, 0.6, 0]} />
    </group>
  );
}

export function TorqueTubes(props: G) {
  return (
    <group {...props}>
      {[-0.3, 0, 0.3].map((z) => (
        <Part key={z} size={[5.6, 0.16, 0.16]} mat="workpiece" position={[0, 0, z]} />
      ))}
    </group>
  );
}

const shapes: Record<string, (props: G) => React.ReactElement> = {
  "SO-24117": BogieFrame,
  "SO-24130": ChassisFrame,
  "SO-24102": FluidEnd,
  "SO-24095": DrillCollar,
  "SO-24121": MainFrame,
  "SO-24088": TorqueTubes,
};

/** What is on the machine right now, chosen from the order it is working on. */
export function Workpiece({ machineId, ...props }: { machineId: string } & G) {
  const orderId = useLive((s) => {
    const wo = s.snap?.machines[machineId]?.workOrderId;
    return wo ? s.snap!.workOrders[wo]?.orderId : undefined;
  });
  const Shape = orderId ? shapes[orderId] : undefined;
  // Changes with the order on the machine, so it is never merged into the static scene.
  return Shape ? (
    <Static key={orderId} userData={{ dynamic: true }}>
      <Shape {...props} />
    </Static>
  ) : null;
}

export function FrameOnStands(props: G) {
  return (
    <Static {...props}>
      <Part size={[0.35, 0.55, 2.3]} mat="machineDark" position={[-1.05, 0.275, 0]} />
      <Part size={[0.35, 0.55, 2.3]} mat="machineDark" position={[1.05, 0.275, 0]} />
      <BogieFrame position={[0, 0.85, 0]} />
    </Static>
  );
}
