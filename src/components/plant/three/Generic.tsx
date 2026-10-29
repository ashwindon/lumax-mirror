"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Cyl, Part, Selectable, StackLight, useMachineState } from "@/components/three/kit";
import type { Machine, MachineKind } from "@/domain/types";
import { Workpiece } from "./Workpieces";

/** Floor footprint (x, z) in metres for each kind of machine. */
export const footprints: Record<MachineKind, [number, number]> = {
  "weld-cell": [9, 8],
  "weld-bay": [7, 6],
  laser: [15, 4.6],
  plasma: [10, 4.2],
  "press-brake": [6, 3.4],
  "paint-booth": [11, 7.6],
  crane: [0, 0],
  agv: [0, 0],
  lathe: [5, 2.6],
  "long-lathe": [10.5, 2.6],
  "deep-hole-drill": [11, 2.4],
  vmc: [3.4, 3.2],
  hmc: [4.6, 4.4],
  vtl: [5, 5],
  "pit-furnace": [4.2, 4.2],
  "box-furnace": [4.2, 3.8],
  "quench-tank": [4, 3],
  "galv-kettle": [12.5, 4.4],
  "process-line": [12.5, 3.4],
  "shot-blast": [5.4, 4.4],
  cmm: [5.4, 3.6],
  "test-bench": [5, 3.2],
};

/** A spindle, carriage or head that only moves while the machine runs. */
function Mover({ running, axis, amp, speed, children, ...props }: {
  running: boolean;
  axis: "x" | "y" | "z";
  amp: number;
  speed: number;
  children: ReactNode;
  position?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (running) t.current += dt;
    ref.current.position[axis] = (props.position?.[axis === "x" ? 0 : axis === "y" ? 1 : 2] ?? 0) + amp * Math.sin(t.current * speed);
  });
  return (
    <group ref={ref} position={props.position} userData={{ dynamic: true }}>
      {children}
    </group>
  );
}

function Spinner({ running, children, ...props }: { running: boolean; children: ReactNode; position?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && running) ref.current.rotation.y += dt * 0.8;
  });
  return (
    <group ref={ref} {...props} userData={{ dynamic: true }}>
      {children}
    </group>
  );
}

function Tanks({ count, width }: { count: number; width: number }) {
  const pitch = width / count;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = -width / 2 + pitch / 2 + i * pitch;
        return (
          <group key={i} position={[x, 0, 0]}>
            <Part size={[pitch - 0.3, 1.2, 2.4]} mat="machine" position={[0, 0.6, 0]} />
            <Part size={[pitch - 0.6, 0.04, 2.1]} mat="liquid" edges={false} position={[0, 1.18, 0]} />
          </group>
        );
      })}
    </>
  );
}

function Body({ machine, running }: { machine: Machine; running: boolean }) {
  const id = machine.id;
  switch (machine.kind) {
    case "lathe":
      return (
        <>
          <Part size={[4.2, 0.9, 1.7]} mat="machineDark" position={[0, 0.45, 0]} />
          <Part size={[3.8, 1.6, 1.7]} mat="machine" position={[0, 1.7, 0]} />
          <Part size={[1.6, 1.1, 0.04]} mat="glass" edges={false} position={[0.4, 1.7, 0.87]} castShadow={false} />
          <Part size={[0.5, 0.9, 0.3]} mat="machine" position={[2.3, 1.6, 0.9]} />
        </>
      );
    case "long-lathe":
    case "deep-hole-drill": {
      const long = machine.kind === "deep-hole-drill";
      return (
        <>
          <Part size={[9.4, 0.9, 1.5]} mat="machineDark" position={[0, 0.45, 0]} />
          <Part size={[1.5, 1.9, 1.7]} mat="machine" position={[-4.2, 1.4, 0]} />
          <Part size={[0.9, 1.3, 1.3]} mat="machine" position={[4.3, 1.2, 0]} />
          <Workpiece machineId={id} position={[0, 1.35, 0]} scale={[1.4, 1, 1]} />
          <Mover running={running} axis="x" amp={2.8} speed={0.25} position={[0, 0, 0]}>
            <Part size={[0.9, 0.9, 1.4]} mat="machine" position={[0, 1.35, 0]} />
          </Mover>
          {long ? <Part size={[1.4, 1.2, 1.2]} mat="machine" position={[0, 0.6, -1.6]} /> : null}
        </>
      );
    }
    case "vmc":
      return (
        <>
          <Part size={[2.6, 2.6, 2.3]} mat="machine" position={[0, 1.3, 0]} />
          <Part size={[1.2, 1.2, 0.04]} mat="glass" edges={false} position={[0, 1.5, 1.17]} castShadow={false} />
          <Part size={[0.45, 0.7, 2.2]} mat="machineDark" position={[1.55, 0.35, 0]} />
          <Part size={[0.5, 0.9, 0.3]} mat="machine" position={[-1.6, 1.6, 0.9]} />
        </>
      );
    case "hmc":
      return (
        <>
          <Part size={[3.4, 3, 3]} mat="machine" position={[0, 1.5, -0.4]} />
          <Part size={[2.2, 0.9, 1.2]} mat="machineDark" position={[0, 0.45, 1.7]} />
          <Workpiece machineId={id} position={[0, 1.4, 1.7]} scale={0.45} />
          <Cyl radius={0.7} height={2.6} mat="machine" position={[2.2, 1.3, -0.4]} edges />
        </>
      );
    case "vtl":
      return (
        <>
          <Part size={[3.8, 0.6, 3.8]} mat="machineDark" position={[0, 0.3, 0]} />
          <Spinner running={running} position={[0, 0.9, 0]}>
            <Cyl radius={1.6} height={0.5} mat="machine" edges />
            <Cyl radius={1.1} height={0.6} mat="workpiece" position={[0, 0.55, 0]} edges />
          </Spinner>
          <Part size={[0.7, 4.2, 0.8]} mat="machine" position={[-1.9, 2.1, -1.7]} />
          <Part size={[0.7, 4.2, 0.8]} mat="machine" position={[1.9, 2.1, -1.7]} />
          <Part size={[4.6, 0.6, 0.7]} mat="machine" position={[0, 3.6, -1.2]} />
          <Part size={[0.4, 1.8, 0.4]} mat="machineDark" position={[0.4, 2.5, -0.6]} />
        </>
      );
    case "pit-furnace":
      return (
        <>
          <Cyl radius={1.6} height={0.3} mat="machineDark" position={[0, 0.15, 0]} edges />
          {/* Lid sits down while a load is soaking, lifted otherwise. */}
          <Cyl radius={1.7} height={0.45} mat="machine" edges position={[0, running ? 0.55 : 1.4, 0]} userData={{ dynamic: true }} />
          <Part size={[1, 1.9, 0.6]} mat="machine" position={[1.9, 0.95, -1.6]} />
        </>
      );
    case "box-furnace":
      return (
        <>
          <Part size={[3, 2.8, 2.8]} mat="machine" position={[0, 1.4, -0.2]} />
          <Part size={[2.2, 2.2, 0.2]} mat="machineDark" position={[0, 1.3, 1.3]} />
          <Part size={[0.9, 1.9, 0.6]} mat="machine" position={[1.9, 0.95, -1.4]} />
        </>
      );
    case "quench-tank":
      return <Tanks count={1} width={3.6} />;
    case "galv-kettle":
      return (
        <>
          <Part size={[11.4, 0.7, 2.8]} mat="machineDark" position={[0, 0.35, 0]} />
          <Part size={[11, 0.05, 2.3]} mat="liquid" edges={false} position={[0, 0.72, 0]} />
          {[-5.4, 5.4].flatMap((x) =>
            [-1.8, 1.8].map((z) => <Part key={`${x}${z}`} size={[0.25, 4.8, 0.25]} mat="structure" position={[x, 2.4, z]} />),
          )}
          <Part size={[11.4, 0.25, 3.9]} mat="structure" position={[0, 4.9, 0]} />
          <Mover running={running} axis="x" amp={4} speed={0.18} position={[0, 0, 0]}>
            <Part size={[1.2, 0.5, 1.4]} mat="machineDark" position={[0, 4.5, 0]} />
            <Workpiece machineId={id} position={[0, 2.2, 0]} />
          </Mover>
        </>
      );
    case "process-line":
      return (
        <>
          <Tanks count={5} width={12} />
          <Part size={[12, 0.25, 0.3]} mat="structure" position={[0, 3.6, -1.4]} />
          <Part size={[12, 0.25, 0.3]} mat="structure" position={[0, 3.6, 1.4]} />
        </>
      );
    case "shot-blast":
      return (
        <>
          <Part size={[3.6, 3.4, 3.2]} mat="machine" position={[-0.6, 1.7, 0]} />
          <Cyl radius={0.8} height={4} mat="machine" position={[1.9, 2, -0.6]} edges />
        </>
      );
    case "cmm":
      return (
        <>
          <Part size={[3.6, 0.8, 2.4]} mat="machineDark" position={[0, 0.4, 0]} />
          <Part size={[0.3, 1.7, 0.3]} mat="machine" position={[-0.9, 1.65, -1]} />
          <Part size={[0.3, 1.7, 0.3]} mat="machine" position={[-0.9, 1.65, 1]} />
          <Part size={[0.3, 0.3, 2.4]} mat="machine" position={[-0.9, 2.5, 0]} />
          <Workpiece machineId={id} position={[0.5, 1.2, 0]} scale={0.6} />
        </>
      );
    case "test-bench":
      return (
        <>
          <Part size={[3.2, 0.9, 1.6]} mat="machine" position={[0, 0.45, 0]} />
          <Part size={[1, 1.2, 0.8]} mat="machineDark" position={[2.1, 0.6, -0.4]} />
          <Part size={[1.4, 1.6, 0.2]} mat="machine" position={[0, 1.7, -0.75]} />
          <Workpiece machineId={id} position={[0, 1.25, 0.1]} scale={0.8} />
        </>
      );
    case "weld-bay":
      return (
        <>
          <Part size={[6, 2, 0.05]} mat="fence" edges={false} position={[0, 1, -2.6]} castShadow={false} />
          <Part size={[0.05, 2, 5.2]} mat="fence" edges={false} position={[-3, 1, 0]} castShadow={false} />
          <Part size={[0.05, 2, 5.2]} mat="fence" edges={false} position={[3, 1, 0]} castShadow={false} />
          <Part size={[3.4, 0.8, 1.8]} mat="machineDark" position={[0, 0.4, 0]} />
          <Workpiece machineId={id} position={[0, 1.4, 0]} />
          <Part size={[0.7, 0.9, 0.5]} mat="machine" position={[2.2, 0.45, -1.8]} />
          <Cyl radius={0.06} height={2.4} mat="machineDark" position={[-2.4, 1.2, -2.2]} segments={8} />
        </>
      );
    case "plasma":
      return (
        <>
          <Part size={[8, 0.8, 3]} mat="machineDark" position={[0, 0.4, 0]} />
          <Part size={[7.6, 0.04, 2.6]} mat="liquid" edges={false} position={[0, 0.82, 0]} />
          <Mover running={running} axis="x" amp={3} speed={0.35} position={[0, 0, 0]}>
            <Part size={[0.5, 0.6, 3.4]} mat="machine" position={[0, 1.3, 0]} />
          </Mover>
          <Part size={[1.1, 1.8, 0.7]} mat="machine" position={[-4.6, 0.9, 1.2]} />
        </>
      );
    default:
      return <Part size={[2, 2, 2]} mat="machine" position={[0, 1, 0]} />;
  }
}

export function GenericMachine({ machine, position }: { machine: Machine; position: [number, number, number] }) {
  const running = useMachineState(machine.id).status === "running";
  const [w, d] = footprints[machine.kind];
  return (
    <Selectable machineId={machine.id} footprint={[w, d]} position={position}>
      <Body machine={machine} running={running} />
      <StackLight machineId={machine.id} position={[w / 2 - 0.3, 0, d / 2 - 0.3]} />
    </Selectable>
  );
}
