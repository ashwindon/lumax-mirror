"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Cyl, Part, Selectable, StackLight, Static, useMachineState } from "@/components/three/kit";
import { palette } from "@/components/three/palette";
import type { Machine } from "@/domain/types";
import { BogieFrame, Workpiece } from "./Workpieces";

const at = (m: Machine) => m.position ?? ([0, 0, 0] as [number, number, number]);

export function LaserCutter({ machine }: { machine: Machine }) {
  const running = useMachineState(machine.id).status === "running";
  const gantry = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const spot = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!gantry.current || !head.current || !spot.current) return;
    spot.current.visible = running && Math.random() > 0.1;
    if (!running) return;
    gantry.current.position.x = -1.5 + 2.6 * Math.sin(t * 0.45);
    head.current.position.z = 1.05 * Math.sin(t * 1.6);
  });

  return (
    <Selectable machineId={machine.id} footprint={[15, 4.6]} position={at(machine)}>
      <Part size={[11, 0.8, 3]} mat="machine" position={[0, 0.4, 0]} />
      <Part size={[11, 0.18, 0.22]} mat="machineDark" position={[0, 0.89, 1.55]} />
      <Part size={[11, 0.18, 0.22]} mat="machineDark" position={[0, 0.89, -1.55]} />
      <Part size={[6.2, 0.04, 2.6]} mat="workpiece" position={[-1.5, 0.82, 0]} />
      <group ref={gantry} position={[-1.5, 0, 0]} userData={{ dynamic: true }}>
        <Part size={[0.55, 0.7, 3.5]} mat="machine" position={[0, 1.35, 0]} />
        <Part size={[0.4, 0.95, 0.35]} mat="machineDark" position={[0, 1.0, 1.75]} />
        <Part size={[0.4, 0.95, 0.35]} mat="machineDark" position={[0, 1.0, -1.75]} />
        <group ref={head}>
          <Part size={[0.32, 0.55, 0.32]} mat="machineDark" position={[0.4, 1.15, 0]} />
          <mesh ref={spot} position={[0.4, 0.86, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshBasicMaterial color="#FFE7C2" toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* Shuttle table for the next sheet, then controls and chiller. */}
      <Part size={[3.2, 0.6, 3]} mat="machineDark" position={[7.1, 0.3, 0]} />
      <Part size={[3, 0.03, 2.6]} mat="workpiece" position={[7.1, 0.62, 0]} />
      <Part size={[1.2, 1.9, 0.8]} mat="machine" position={[-6.6, 0.95, 1.6]} />
      <Part size={[1.4, 1.5, 1]} mat="machine" position={[-6.7, 0.75, -1.2]} />
      <StackLight machineId={machine.id} position={[-7.2, 0, 0.4]} />
    </Selectable>
  );
}

export function PressBrake({ machine }: { machine: Machine }) {
  const running = useMachineState(machine.id).status === "running";
  const ram = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ram.current) ram.current.position.y = running ? 0.25 * Math.max(0, Math.sin(clock.elapsedTime * 1.2)) : 0.3;
  });
  return (
    <Selectable machineId={machine.id} footprint={[6, 3.4]} position={at(machine)}>
      <Part size={[0.45, 3.2, 1.9]} mat="machine" position={[-2.2, 1.6, 0]} />
      <Part size={[0.45, 3.2, 1.9]} mat="machine" position={[2.2, 1.6, 0]} />
      <Part size={[4.9, 0.7, 0.6]} mat="machine" position={[0, 2.85, 0.1]} />
      <group ref={ram} userData={{ dynamic: true }}>
        <Part size={[4.3, 0.6, 0.28]} mat="machineDark" position={[0, 1.75, 0.35]} />
      </group>
      <Part size={[4.5, 0.95, 0.6]} mat="machine" position={[0, 0.475, 0.35]} />
      <Part size={[4.3, 0.12, 0.2]} mat="machineDark" position={[0, 1.0, 0.35]} />
      {/* Die rack */}
      <Part size={[1.6, 1.1, 0.7]} mat="machineDark" position={[-1.2, 0.55, 1.6]} />
      <Part size={[1.4, 0.12, 0.3]} mat="workpiece" position={[-1.2, 1.16, 1.6]} />
      <StackLight machineId={machine.id} position={[2.7, 0, 1.2]} />
    </Selectable>
  );
}

export function PaintBooth({ machine }: { machine: Machine }) {
  const running = useMachineState(machine.id).status === "running";
  return (
    <Selectable machineId={machine.id} footprint={[11, 7.6]} position={at(machine)}>
      <Part size={[10, 4.6, 0.25]} mat="booth" position={[0, 2.3, -3.4]} />
      <Part size={[0.25, 4.6, 7]} mat="booth" position={[-5, 2.3, 0]} />
      <Part size={[0.25, 4.6, 7]} mat="booth" position={[5, 2.3, 0]} />
      {/* Front: roller door raised over most of the opening. */}
      <Part size={[10, 1.4, 0.25]} mat="booth" position={[0, 3.9, 3.4]} />
      <Part size={[10.2, 0.25, 7.2]} mat="booth" position={[0, 4.72, 0]} />
      <Part size={[3, 1.1, 1.8]} mat="machineDark" position={[-2.8, 5.4, -1.6]} />
      <Cyl radius={0.4} height={1.6} mat="machine" position={[-2.8, 6.6, -1.6]} edges />
      <Cyl radius={0.4} height={1.6} mat="machine" position={[2.6, 5.6, -1.6]} edges />
      <Part size={[1.5, 1.4, 6]} mat="machine" position={[6.0, 0.7, 0]} />
      <Part size={[3.6, 0.3, 2.4]} mat="machineDark" position={[0, 0.15, 0.4]} />
      <Workpiece machineId={machine.id} position={[0, 0.9, 0.4]} />
      <pointLight position={[0, 3.6, 0.8]} intensity={running ? 12 : 0} distance={9} color="#FFF1DA" />
      <StackLight machineId={machine.id} position={[5.4, 0, 3.6]} />
    </Selectable>
  );
}

export function InspectionBay({ machine }: { machine: Machine }) {
  return (
    <Selectable machineId={machine.id} footprint={[8, 4]} position={at(machine)}>
      {/* Granite table, bridge and the unit being checked. */}
      <Part size={[5, 0.8, 2.6]} mat="machineDark" position={[0, 0.4, 0]} />
      <Part size={[0.3, 1.8, 0.3]} mat="machine" position={[-1.2, 1.7, -1.1]} />
      <Part size={[0.3, 1.8, 0.3]} mat="machine" position={[-1.2, 1.7, 1.1]} />
      <Part size={[0.3, 0.3, 2.6]} mat="machine" position={[-1.2, 2.6, 0]} />
      <Workpiece machineId={machine.id} position={[0.6, 1.25, 0]} scale={0.8} />
      <Part size={[1.4, 0.75, 0.7]} mat="machine" position={[3.2, 0.375, 1.1]} />
      <StackLight machineId={machine.id} position={[3.6, 0, -1.4]} />
    </Selectable>
  );
}

export function GantryCrane({ machine }: { machine: Machine }) {
  const running = useMachineState(machine.id).status === "running";
  const bridge = useRef<THREE.Group>(null);
  const trolley = useRef<THREE.Group>(null);
  const hook = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!running) return;
    const t = clock.elapsedTime;
    if (bridge.current) bridge.current.position.x = 20 + 9 * Math.sin(t * 0.045);
    if (trolley.current) trolley.current.position.z = 5 * Math.sin(t * 0.08);
    if (hook.current) hook.current.position.y = -3.4 - 0.8 * Math.sin(t * 0.13);
  });
  return (
    <Selectable machineId={machine.id}>
      <group ref={bridge} position={[20, 9.4, 0]} userData={{ dynamic: true }}>
        <Part size={[0.9, 1.1, 29.4]} mat="crane" position={[-0.6, 0, 0]} />
        <Part size={[0.9, 1.1, 29.4]} mat="crane" position={[0.6, 0, 0]} />
        <Part size={[3, 0.7, 1]} mat="crane" position={[0, -0.2, 14.8]} />
        <Part size={[3, 0.7, 1]} mat="crane" position={[0, -0.2, -14.8]} />
        <group ref={trolley}>
          <Part size={[2.2, 0.8, 2.2]} mat="machineDark" position={[0, 0.9, 0]} />
          <group ref={hook} position={[0, -3.4, 0]}>
            <Cyl radius={0.025} height={6.2} mat="machineDark" position={[-0.2, 3.1, 0]} segments={6} />
            <Cyl radius={0.025} height={6.2} mat="machineDark" position={[0.2, 3.1, 0]} segments={6} />
            <Part size={[0.7, 0.55, 0.35]} mat="crane" />
            <Part size={[0.14, 0.35, 0.14]} mat="machineDark" position={[0, -0.42, 0]} />
          </group>
        </group>
      </group>
    </Selectable>
  );
}

export function Agv({ machine }: { machine: Machine }) {
  const running = useMachineState(machine.id).status === "running";
  const body = useRef<THREE.Group>(null);
  const travel = useRef(0);
  useFrame((_, dt) => {
    if (!body.current) return;
    if (running) travel.current += dt * 0.06;
    const x = 27 * Math.sin(travel.current);
    body.current.position.x = x;
    body.current.rotation.y = Math.cos(travel.current) >= 0 ? 0 : Math.PI;
  });
  return (
    <Selectable machineId={machine.id} position={[0, 0, at(machine)[2]]}>
      <group ref={body} userData={{ dynamic: true }}>
        <Part size={[3.4, 0.38, 1.7]} mat="machineDark" position={[0, 0.24, 0]} />
        <mesh position={[1.72, 0.26, 0]}>
          <boxGeometry args={[0.04, 0.08, 1.4]} />
          <meshBasicMaterial color={running ? palette.status.running : palette.status.down} toneMapped={false} />
        </mesh>
        <Static>
          <BogieFrame position={[0, 0.88, 0]} />
        </Static>
      </group>
    </Selectable>
  );
}
