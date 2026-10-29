"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Cyl, Part, Selectable, StackLight, useMachineState } from "@/components/three/kit";
import type { Machine } from "@/domain/types";
import { Workpiece } from "./Workpieces";

function RobotArm({ active, phase, ...props }: { active: boolean; phase: number } & ThreeElements["group"]) {
  const turret = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const arc = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, dt) => {
    if (!turret.current || !shoulder.current || !elbow.current || !arc.current) return;
    const t = clock.elapsedTime + phase;
    const k = 1 - Math.exp(-3 * dt);
    const goal = active
      ? { yaw: 0.42 * Math.sin(t * 0.35), sh: -0.55 + 0.12 * Math.sin(t * 0.6), el: -0.38 + 0.14 * Math.sin(t * 0.8 + 1.2) }
      : { yaw: -0.6, sh: -0.15, el: -0.9 };
    turret.current.rotation.y += (goal.yaw - turret.current.rotation.y) * k;
    shoulder.current.rotation.z += (goal.sh - shoulder.current.rotation.z) * k;
    elbow.current.rotation.z += (goal.el - elbow.current.rotation.z) * k;
    arc.current.visible = active && Math.random() > 0.25;
    arc.current.scale.setScalar(0.6 + Math.random() * 0.8);
  });

  return (
    <group {...props} userData={{ dynamic: true }}>
      <Part size={[0.85, 0.32, 0.85]} mat="machineDark" position={[0, 0.16, 0]} />
      <group ref={turret} position={[0, 0.32, 0]}>
        <Cyl radius={0.36} height={0.5} mat="robot" position={[0, 0.25, 0]} />
        <group ref={shoulder} position={[0, 0.55, 0]}>
          <Part size={[0.3, 1.5, 0.34]} mat="robot" position={[0, 0.75, 0]} />
          <group ref={elbow} position={[0, 1.5, 0]}>
            <Cyl radius={0.2} height={0.42} mat="robot" rotation-x={Math.PI / 2} />
            <Part size={[1.3, 0.24, 0.26]} mat="robot" position={[0.65, 0, 0]} />
            <group position={[1.32, 0, 0]}>
              <Cyl radius={0.11} height={0.3} mat="machineDark" rotation-x={Math.PI / 2} />
              <Cyl radius={0.035} height={0.55} mat="machineDark" position={[0.1, -0.26, 0]} rotation-z={0.35} />
              <mesh ref={arc} position={[0.19, -0.53, 0]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshBasicMaterial color="#D8EEFF" toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function Fence({ width, depth, gap }: { width: number; depth: number; gap: number }) {
  const h = 2.1;
  const sides: { from: [number, number]; to: [number, number] }[] = [
    { from: [-width / 2, -depth / 2], to: [width / 2, -depth / 2] },
    { from: [-width / 2, -depth / 2], to: [-width / 2, depth / 2] },
    { from: [width / 2, -depth / 2], to: [width / 2, depth / 2] },
    // Front side leaves an opening for the operator and the crane.
    { from: [-width / 2, depth / 2], to: [-gap / 2, depth / 2] },
    { from: [gap / 2, depth / 2], to: [width / 2, depth / 2] },
  ];
  return (
    <group>
      {sides.map(({ from, to }, i) => {
        const dx = to[0] - from[0];
        const dz = to[1] - from[1];
        const len = Math.hypot(dx, dz);
        const cx = (from[0] + to[0]) / 2;
        const cz = (from[1] + to[1]) / 2;
        const rot = Math.atan2(-dz, dx);
        const posts = Math.max(2, Math.round(len / 1.5) + 1);
        return (
          <group key={i}>
            <Part size={[len, h - 0.15, 0.02]} mat="fence" edges={false} position={[cx, h / 2 + 0.05, cz]} rotation-y={rot} castShadow={false} />
            {Array.from({ length: posts }, (_, p) => {
              const f = p / (posts - 1);
              return (
                <Part
                  key={p}
                  size={[0.07, h, 0.07]}
                  mat="fencePost"
                  edges={false}
                  position={[from[0] + dx * f, h / 2, from[1] + dz * f]}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

export function WeldCell({ machine }: { machine: Machine }) {
  const { status } = useMachineState(machine.id);
  const running = status === "running";
  const positioner = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const position = machine.position ?? ([0, 0, 0] as [number, number, number]);
  const phase = position[0] * 0.37;

  useFrame(({ clock }) => {
    if (positioner.current) {
      const target = running ? 0.22 * Math.sin(clock.elapsedTime * 0.25 + phase) : 0;
      positioner.current.rotation.x += (target - positioner.current.rotation.x) * 0.05;
    }
    if (glow.current) glow.current.intensity = running ? 3 * (0.6 + Math.random() * 0.4) : 0;
  });

  useEffect(() => {
    if (glow.current) glow.current.color.set("#BFE0FF");
  }, []);

  return (
    <Selectable machineId={machine.id} footprint={[9, 8]} position={position}>
      <Fence width={9} depth={8} gap={3} />
      {/* Positioner: head and tail stocks turning the frame for the robots. */}
      <Part size={[0.6, 1.5, 0.9]} mat="machine" position={[-2.25, 0.75, 0]} />
      <Part size={[0.6, 1.5, 0.9]} mat="machine" position={[2.25, 0.75, 0]} />
      <Part size={[4.8, 0.25, 0.9]} mat="machineDark" position={[0, 0.125, 0]} />
      <group ref={positioner} position={[0, 1.15, 0]} userData={{ dynamic: true }}>
        <Cyl radius={0.12} height={4.2} mat="machineDark" rotation-z={Math.PI / 2} />
        <Workpiece machineId={machine.id} />
      </group>
      <RobotArm active={running} phase={phase} position={[-0.5, 0, -2.5]} rotation-y={-Math.PI / 2} />
      <RobotArm active={running} phase={phase + 2} position={[0.5, 0, 2.5]} rotation-y={Math.PI / 2} />
      <pointLight ref={glow} position={[0, 1.6, 0]} distance={7} decay={2} intensity={0} />
      {/* Controller cabinet and wire drums behind the fence. */}
      <Part size={[1.6, 1.9, 0.6]} mat="machineDark" position={[-3, 0.95, -4.6]} />
      <Cyl radius={0.35} height={0.8} mat="machine" position={[-1.4, 0.4, -4.6]} edges />
      <Cyl radius={0.35} height={0.8} mat="machine" position={[-0.5, 0.4, -4.6]} edges />
      <StackLight machineId={machine.id} position={[4.5, 0, 4]} />
    </Selectable>
  );
}
