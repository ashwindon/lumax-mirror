"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Cyl, Part, Selectable, StackLight, useMachineState } from "@/components/three/kit";
import { palette } from "@/components/three/palette";
import type { Machine, MachineKind } from "@/domain/types";
import { Workpiece } from "./Workpieces";

/** Floor footprint (x, z) in metres for each kind of machine. */
export const footprints: Record<MachineKind, [number, number]> = {
  "imm-xl": [13, 4.2],
  imm: [8.4, 3],
  "imm-2k": [10.5, 4.6],
  "bmc-press": [5, 4],
  "anneal-oven": [6, 3.4],
  "hardcoat-line": [16, 4],
  metallizer: [7.4, 5],
  "paint-booth": [9, 6],
  "assembly-line": [16, 3.6],
  "hot-plate-welder": [4, 3],
  "vibration-welder": [3.4, 3],
  "seal-robot": [4.4, 4.4],
  "leak-tester": [3, 2.4],
  "photometry-tunnel": [8.5, 3],
  "function-tester": [3.4, 2.6],
  "smt-line": [19, 2.4],
  "board-tester": [5, 2.8],
  "panel-line": [10, 3],
  agv: [0, 0],
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

/** Pallets or hangers that travel along a conveyor of length `length` while the machine runs. */
function Conveyor({ running, length, count, speed = 0.6, children, ...props }: {
  running: boolean;
  length: number;
  count: number;
  speed?: number;
  children: (i: number) => ReactNode;
  position?: [number, number, number];
}) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (running) t.current += dt * speed;
    refs.current.forEach((g, i) => {
      if (g) g.position.x = -length / 2 + ((t.current + (i * length) / count) % length);
    });
  });
  return (
    <group {...props} userData={{ dynamic: true }}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} ref={(g) => void (refs.current[i] = g)}>
          {children(i)}
        </group>
      ))}
    </group>
  );
}

/** A glowing panel that is lit only while the machine runs: a beam, a heater, a screen. */
function Glow({ on, color, size, ...props }: { on: boolean; color: string; size: [number, number, number]; position?: [number, number, number] }) {
  return (
    <mesh {...props} userData={{ dynamic: true }}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={on ? color : palette.materials.machineDark.color} toneMapped={false} transparent opacity={on ? 0.85 : 0.5} />
    </mesh>
  );
}

/** Horizontal injection moulding press: clamp and platens on the left, barrel and hopper on the right, take-out robot on top. */
function Press({ id, running, length, height, twoShot = false }: { id: string; running: boolean; length: number; height: number; twoShot?: boolean }) {
  const clamp = length * 0.45;
  return (
    <>
      <Part size={[length, 0.9, 2.2]} mat="machineDark" position={[0, 0.45, 0]} />
      {/* Fixed and moving platens with tie bars */}
      <Part size={[0.5, height, 2]} mat="machine" position={[-length / 2 + 0.4, 0.9 + height / 2, 0]} />
      <Part size={[0.6, height, 2]} mat="machine" position={[-length / 2 + clamp, 0.9 + height / 2, 0]} />
      <Mover running={running} axis="x" amp={0.35} speed={1.4} position={[-length / 2 + clamp * 0.55, 0, 0]}>
        <Part size={[0.5, height * 0.92, 1.8]} mat="machine" position={[0, 0.9 + height / 2, 0]} />
      </Mover>
      {[-0.7, 0.7].flatMap((z) =>
        [0.9 + height * 0.15, 0.9 + height * 0.85].map((y) => (
          <Cyl key={`${z}${y}`} radius={0.07} height={clamp} mat="machineDark" position={[-length / 2 + clamp / 2 + 0.2, y, z]} rotation-z={Math.PI / 2} segments={8} />
        )),
      )}
      {/* Guard windows over the mould area */}
      <Part size={[clamp - 0.8, height, 0.04]} mat="glass" edges={false} castShadow={false} position={[-length / 2 + clamp / 2 + 0.2, 0.9 + height / 2, 1.12]} />
      {/* Injection unit: barrel, hopper and drive */}
      <Part size={[Math.max(3, length * 0.42), 0.7, 0.9]} mat="machine" position={[length * 0.22, 1.25 + height * 0.3, 0]} />
      <Cyl radius={0.26} height={0.9} mat="machine" position={[length * 0.18, 2.0 + height * 0.3, 0]} edges />
      <Part size={[1.4, 1.2, 1.6]} mat="machine" position={[length / 2 - 0.8, 1.5, 0]} />
      {twoShot ? (
        // The second injection unit comes in at right angles for the second colour.
        <Part size={[0.8, 0.6, 2.6]} mat="machine" position={[-length / 2 + clamp + 0.9, 1.4 + height * 0.5, -1.9]} />
      ) : null}
      {/* Take-out robot on its beam */}
      <Part size={[0.3, 0.3, 3.4]} mat="structure" position={[-length / 2 + clamp * 0.55, 1.2 + height, -0.4]} />
      <Mover running={running} axis="z" amp={1.1} speed={1.4} position={[-length / 2 + clamp * 0.55, 0, -0.4]}>
        <Part size={[0.35, 1.4, 0.35]} mat="robot" position={[0, 0.6 + height, 0]} />
      </Mover>
      <Workpiece machineId={id} position={[length / 2 - 2.2, 0.95, 1.6]} scale={0.7} />
      {/* Control panel */}
      <Part size={[0.9, 1.6, 0.3]} mat="machine" position={[-length / 2 + clamp + 0.6, 1.7, 1.2]} />
    </>
  );
}

function Body({ machine, running }: { machine: Machine; running: boolean }) {
  const id = machine.id;
  switch (machine.kind) {
    case "imm-xl":
      return <Press id={id} running={running} length={12.4} height={2.6} />;
    case "imm":
      return <Press id={id} running={running} length={7.8} height={1.8} />;
    case "imm-2k":
      return <Press id={id} running={running} length={9.8} height={2.2} twoShot />;
    case "bmc-press":
      return (
        <>
          {[-1.4, 1.4].flatMap((x) => [-1.1, 1.1].map((z) => <Cyl key={`${x}${z}`} radius={0.12} height={3.6} mat="machineDark" position={[x, 1.8, z]} segments={10} />))}
          <Part size={[3.4, 0.6, 2.8]} mat="machine" position={[0, 0.3, 0]} />
          <Part size={[3.4, 0.6, 2.8]} mat="machine" position={[0, 3.7, 0]} />
          <Cyl radius={0.6} height={1.2} mat="machine" position={[0, 4.6, 0]} edges />
          <Mover running={running} axis="y" amp={0.35} speed={0.9} position={[0, 2.4, 0]}>
            <Part size={[3, 0.5, 2.4]} mat="machineDark" />
          </Mover>
          <Workpiece machineId={id} position={[0, 1.0, 0]} scale={0.6} />
        </>
      );
    case "anneal-oven":
      return (
        <>
          <Part size={[5.4, 2.6, 2.8]} mat="machine" position={[0, 1.3, 0]} />
          <Part size={[0.2, 2.2, 2.4]} mat="machineDark" position={[2.8, 1.3, 0]} />
          <Glow on={running} color="#FFB36B" size={[0.04, 1.2, 1.6]} position={[2.92, 1.3, 0]} />
        </>
      );
    case "hardcoat-line":
      return (
        <>
          {/* Flow-coat booth, flash-off tunnel and cure oven, lenses travelling on hangers above. */}
          <Part size={[3.6, 2.8, 3]} mat="booth" position={[-6, 1.4, 0]} />
          <Part size={[4.4, 2.2, 2.4]} mat="machine" position={[-1.6, 1.1, 0]} />
          <Part size={[6.4, 2.8, 3]} mat="machine" position={[4.4, 1.4, 0]} />
          <Glow on={running} color="#FFB36B" size={[6, 0.06, 0.06]} position={[4.4, 2.86, 1.52]} />
          <Part size={[15.6, 0.15, 0.15]} mat="structure" position={[0, 3.3, 0]} />
          <Conveyor running={running} length={15} count={7} speed={0.5} position={[0, 0, 0]}>
            {() => (
              <>
                <Cyl radius={0.02} height={0.5} mat="machineDark" position={[0, 3.05, 0]} segments={6} />
                <Workpiece machineId={id} position={[0, 2.6, 0]} scale={0.45} />
              </>
            )}
          </Conveyor>
        </>
      );
    case "metallizer":
      return (
        <>
          {/* Horizontal vacuum chamber: shut while the batch is coated, open between batches. */}
          <Cyl radius={1.5} height={4} mat="machine" position={[-0.6, 1.7, 0]} rotation-z={Math.PI / 2} edges />
          <group position={[1.5, 1.7, 0]} rotation-y={running ? 0 : -1.2} userData={{ dynamic: true }}>
            <Cyl radius={1.52} height={0.25} mat="machineDark" position={[0, 0, running ? 0 : 1.3]} rotation-z={Math.PI / 2} edges />
          </group>
          <Part size={[4.6, 0.3, 2.4]} mat="machineDark" position={[-0.6, 0.15, 0]} />
          {/* Jig rack on its trolley, waiting to go in */}
          <Part size={[1.2, 1.9, 1.2]} mat="structure" position={[3.2, 1.05, -1.6]} />
          <Workpiece machineId={id} position={[3.2, 1.3, -1.6]} scale={0.5} metallic />
          {/* Diffusion and roots pumps, and the cabinet */}
          <Cyl radius={0.45} height={2.2} mat="machine" position={[-2.8, 1.1, -1.8]} edges />
          <Cyl radius={0.35} height={1.6} mat="machine" position={[-1.6, 0.8, -1.9]} edges />
          <Part size={[1, 2, 0.8]} mat="machine" position={[-3.2, 1, 1.8]} />
        </>
      );
    case "paint-booth":
      return (
        <>
          <Part size={[8, 3.6, 0.2]} mat="booth" position={[0, 1.8, -2.6]} />
          <Part size={[0.2, 3.6, 5.2]} mat="booth" position={[-4, 1.8, 0]} />
          <Part size={[0.2, 3.6, 5.2]} mat="booth" position={[4, 1.8, 0]} />
          <Part size={[8.2, 0.2, 5.4]} mat="booth" position={[0, 3.7, 0]} />
          <Part size={[2.4, 0.9, 1.4]} mat="machineDark" position={[-2, 4.2, -1]} />
          <Workpiece machineId={id} position={[0, 1.2, 0]} scale={0.6} />
          <pointLight position={[0, 3, 0.6]} intensity={running ? 8 : 0} distance={7} color="#FFF1DA" />
        </>
      );
    case "assembly-line":
      return (
        <>
          {/* Pallet conveyor with stations: housing load, module fit, screwing, bead laying, inspection. */}
          <Part size={[15.4, 0.8, 1.2]} mat="machineDark" position={[0, 0.4, 0]} />
          {[-6, -3, 0, 3].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <Part size={[1.6, 0.9, 0.9]} mat="machine" position={[0, 0.45, -1.15]} />
              <Part size={[0.12, 1.4, 0.12]} mat="structure" position={[-0.7, 1.5, -1.3]} />
              <Part size={[0.12, 1.4, 0.12]} mat="structure" position={[0.7, 1.5, -1.3]} />
              <Part size={[1.6, 0.1, 0.5]} mat="structure" position={[0, 2.2, -1.1]} />
            </group>
          ))}
          {/* Hot-melt bead-laying robot near the end of the line */}
          <group position={[6, 0, -1]}>
            <Cyl radius={0.35} height={0.6} mat="robot" position={[0, 0.3, 0]} edges />
            <Mover running={running} axis="x" amp={0.25} speed={2.2} position={[0, 0, 0]}>
              <Part size={[0.25, 1.3, 0.25]} mat="robot" position={[0, 1.2, 0]} />
              <Part size={[0.9, 0.22, 0.22]} mat="robot" position={[0.3, 1.85, 0.4]} rotation-y={-0.8} />
            </Mover>
          </group>
          <Part size={[15.4, 0.04, 0.05]} mat="fencePost" edges={false} position={[0, 0.82, 0.62]} />
          <Conveyor running={running} length={15} count={6} speed={0.7} position={[0, 0.85, 0]}>
            {() => (
              <>
                <Part size={[0.9, 0.08, 0.8]} mat="machine" />
                <Workpiece machineId={id} position={[0, 0.22, 0]} scale={0.42} />
              </>
            )}
          </Conveyor>
        </>
      );
    case "hot-plate-welder":
      return (
        <>
          <Part size={[3.2, 2.4, 2.2]} mat="machine" position={[0, 1.2, -0.2]} />
          <Part size={[2.2, 1.4, 0.04]} mat="glass" edges={false} castShadow={false} position={[0, 1.4, 0.92]} />
          <Mover running={running} axis="y" amp={0.2} speed={1.6} position={[0, 1.6, 0.2]}>
            <Part size={[1.6, 0.12, 1]} mat="machineDark" />
          </Mover>
          <Glow on={running} color="#FFB36B" size={[1.4, 0.05, 0.8]} position={[0, 1.2, 0.2]} />
          <Workpiece machineId={id} position={[0, 0.98, 0.2]} scale={0.45} />
        </>
      );
    case "vibration-welder":
      return (
        <>
          <Part size={[2.6, 1, 2]} mat="machine" position={[0, 0.5, 0]} />
          <Part size={[0.6, 2.6, 0.8]} mat="machine" position={[0, 2.3, -0.6]} />
          <Mover running={running} axis="x" amp={0.03} speed={40} position={[0, 0, 0]}>
            <Part size={[1.4, 0.5, 1.1]} mat="machineDark" position={[0, 2.4, 0.1]} />
          </Mover>
          <Workpiece machineId={id} position={[0, 1.15, 0.1]} scale={0.45} />
        </>
      );
    case "seal-robot":
      return (
        <>
          <Part size={[4, 2, 0.05]} mat="fence" edges={false} castShadow={false} position={[0, 1, -1.9]} />
          <Part size={[0.05, 2, 3.8]} mat="fence" edges={false} castShadow={false} position={[-1.95, 1, 0]} />
          <Cyl radius={0.4} height={0.7} mat="robot" position={[0, 0.35, 0]} edges />
          <Mover running={running} axis="z" amp={0.4} speed={1.6} position={[0, 0, 0]}>
            <Part size={[0.3, 1.5, 0.3]} mat="robot" position={[0, 1.4, 0]} />
          </Mover>
          <Workpiece machineId={id} position={[1.2, 0.8, 0]} scale={0.45} />
        </>
      );
    case "leak-tester":
      return (
        <>
          <Part size={[2.4, 0.9, 1.6]} mat="machine" position={[0, 0.45, 0]} />
          <Mover running={running} axis="y" amp={0.15} speed={1.2} position={[0, 1.7, 0]}>
            <Part size={[1.4, 0.5, 1.1]} mat="machineDark" />
          </Mover>
          <Part size={[0.12, 1.6, 0.12]} mat="structure" position={[-0.9, 1.4, -0.6]} />
          <Part size={[0.12, 1.6, 0.12]} mat="structure" position={[0.9, 1.4, -0.6]} />
          <Workpiece machineId={id} position={[0, 1.05, 0]} scale={0.42} />
        </>
      );
    case "photometry-tunnel":
      return (
        <>
          {/* Dark tunnel with the lamp on its fixture at one end and the aim screen at the other. */}
          <Part size={[6.6, 2.6, 2.6]} mat="machineDark" position={[0.8, 1.3, 0]} />
          <Part size={[1.6, 1.1, 1.6]} mat="machine" position={[-3.4, 0.55, 0]} />
          <Workpiece machineId={id} position={[-3.4, 1.35, 0]} scale={0.45} />
          <Glow on={running} color="#FFF6D8" size={[0.04, 1.6, 2]} position={[-2.48, 1.4, 0]} />
          <Part size={[0.9, 1.6, 0.3]} mat="machine" position={[-3.4, 1.8, -1.1]} />
        </>
      );
    case "function-tester":
      return (
        <>
          <Part size={[2.8, 0.9, 1.6]} mat="machine" position={[0, 0.45, 0]} />
          <Part size={[1, 0.7, 0.06]} mat="machineDark" position={[0.6, 1.5, -0.6]} />
          <Glow on={running} color="#BDE6D2" size={[0.9, 0.6, 0.02]} position={[0.6, 1.5, -0.56]} />
          <Workpiece machineId={id} position={[-0.5, 1.05, 0.1]} scale={0.42} />
        </>
      );
    case "smt-line":
      return (
        <>
          {/* Loader, stencil printer, SPI, two placers, reflow oven, AOI, unloader. */}
          <Part size={[1.4, 1.2, 1.6]} mat="machine" position={[-8.6, 0.6, 0]} />
          <Part size={[2, 1.5, 1.8]} mat="machine" position={[-6.6, 0.75, 0]} />
          <Part size={[1.2, 1.4, 1.6]} mat="machine" position={[-4.9, 0.7, 0]} />
          {[-3, -0.6].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <Part size={[2.2, 1.4, 2]} mat="machine" position={[0, 0.7, 0]} />
              <Part size={[2.2, 0.6, 0.04]} mat="glass" edges={false} castShadow={false} position={[0, 1.2, 1.02]} />
              <Mover running={running} axis="x" amp={0.7} speed={3} position={[0, 0, 0]}>
                <Part size={[0.3, 0.3, 1.6]} mat="machineDark" position={[0, 1.55, 0]} />
              </Mover>
            </group>
          ))}
          <Part size={[6, 1.3, 1.6]} mat="machine" position={[3.6, 0.65, 0]} />
          <Glow on={running} color="#FFB36B" size={[5.6, 0.05, 0.05]} position={[3.6, 1.32, 0.82]} />
          <Part size={[1.4, 1.5, 1.6]} mat="machine" position={[7.5, 0.75, 0]} />
          <Part size={[1.2, 1.1, 1.6]} mat="machine" position={[8.9, 0.55, 0]} />
          <Conveyor running={running} length={18} count={9} speed={1.2} position={[0, 1.02, 1.0]}>
            {() => <Workpiece machineId={id} scale={0.3} />}
          </Conveyor>
        </>
      );
    case "board-tester":
      return (
        <>
          {/* AOI, the shielded X-ray cabinet and the bed-of-nails ICT press. */}
          <Part size={[1.4, 1.5, 1.6]} mat="machine" position={[-1.6, 0.75, 0]} />
          <Part size={[1.6, 1.9, 1.8]} mat="machineDark" position={[0.1, 0.95, 0]} />
          <Part size={[1.4, 1.6, 1.6]} mat="machine" position={[1.8, 0.8, 0]} />
          <Mover running={running} axis="y" amp={0.1} speed={1.5} position={[1.8, 1.7, 0]}>
            <Part size={[1, 0.2, 1]} mat="machineDark" />
          </Mover>
          <Workpiece machineId={id} position={[-1.6, 1.6, 0]} scale={0.32} />
        </>
      );
    case "panel-line":
      return (
        <>
          <Part size={[9.4, 0.85, 1.4]} mat="machine" position={[0, 0.42, 0]} />
          {[-3.5, -1, 1.5, 4].map((x) => (
            <Part key={x} size={[1.4, 1, 0.3]} mat="machineDark" position={[x, 1.35, -0.55]} />
          ))}
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

/** An automated guided vehicle feeding the lines, running up and down the main aisle. */
export function Agv({ machine, z, span }: { machine: Machine; z: number; span: number }) {
  const running = useMachineState(machine.id).status === "running";
  const body = useRef<THREE.Group>(null);
  const travel = useRef(0);
  useFrame((_, dt) => {
    if (!body.current) return;
    if (running) travel.current += dt * 0.08;
    body.current.position.x = (span / 2) * Math.sin(travel.current);
    body.current.rotation.y = Math.cos(travel.current) >= 0 ? 0 : Math.PI;
  });
  return (
    <Selectable machineId={machine.id} position={[0, 0, z]}>
      <group ref={body} userData={{ dynamic: true }}>
        <Part size={[2.2, 0.38, 1.3]} mat="machineDark" position={[0, 0.24, 0]} />
        <Part size={[1.8, 0.6, 1.1]} mat="structure" position={[0, 0.74, 0]} />
        <mesh position={[1.12, 0.26, 0]}>
          <boxGeometry args={[0.04, 0.08, 1]} />
          <meshBasicMaterial color={running ? palette.status.running : palette.status.down} toneMapped={false} />
        </mesh>
      </group>
    </Selectable>
  );
}
