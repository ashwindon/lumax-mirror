"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { LabelProjector, type LabelBoard } from "@/components/three/ScreenLabels";
import { Static } from "@/components/three/kit";
import { Stage } from "@/components/three/Stage";
import { machinesByPlant } from "@/domain/catalog/machines";
import type { PlantCode } from "@/domain/types";
import { useTwin } from "@/store/twin";
import { plantLayout, type PlantLayout } from "../layout";
import { Agv, GenericMachine } from "./Generic";
import { Aisle, Shed } from "./Shed";

const FOCUS_DISTANCE = 42;

// Eases the orbit target (and the camera with it) onto a machine the HUD asked for.
function CameraRig({ layout }: { layout: PlantLayout }) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const focusRequest = useTwin((s) => s.focusRequest);
  const goal = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (!focusRequest) return;
    const id = useTwin.getState().machineId;
    const p = id ? layout.positions[id] : undefined;
    if (p) goal.current = new THREE.Vector3(p[0], 0, p[2]);
  }, [focusRequest, layout]);

  useFrame(({ camera }, dt) => {
    if (!goal.current || !controls) return;
    const k = 1 - Math.exp(-3.5 * dt);
    const step = goal.current.clone().sub(controls.target).multiplyScalar(k);
    controls.target.add(step);
    camera.position.add(step);
    const offset = camera.position.clone().sub(controls.target);
    const len = offset.length();
    offset.setLength(len + (FOCUS_DISTANCE - len) * k);
    camera.position.copy(controls.target).add(offset);
    controls.update();
    if (step.length() < 0.002 && Math.abs(len - FOCUS_DISTANCE) < 0.05) goal.current = null;
  });

  return null;
}

export default function PlantScene({ code, labels }: { code: PlantCode; labels: LabelBoard }) {
  const layout = useMemo(() => plantLayout(code), [code]);
  const list = machinesByPlant[code] ?? [];
  const selectMachine = useTwin((s) => s.selectMachine);
  const reach = layout.width * 0.55 + 22;

  return (
    <Stage
      camera={[reach * 0.42, reach * 0.62, reach * 0.85]}
      target={[0, 0, 0]}
      shadowExtent={Math.max(46, layout.width * 0.6)}
      minDistance={16}
      maxDistance={Math.max(110, reach * 2)}
      onPointerMissed={() => selectMachine(null)}
    >
      <Static key={code}>
        <Shed width={layout.width} depth={layout.depth} crane={false} />
        {layout.aisles.map((z) => (
          <Aisle key={z} length={layout.width - 4} z={z} />
        ))}
        {list
          .filter((m) => layout.positions[m.id])
          .map((m) => (
            <GenericMachine key={m.id} machine={m} position={layout.positions[m.id]} />
          ))}
        {list
          .filter((m) => m.kind === "agv")
          .map((m) => (
            <Agv key={m.id} machine={m} z={layout.aisles[layout.aisles.length - 1] ?? 0} span={layout.width - 12} />
          ))}
      </Static>
      <CameraRig layout={layout} />
      <LabelProjector board={labels} />
    </Stage>
  );
}
