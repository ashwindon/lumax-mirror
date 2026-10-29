"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { LabelProjector, type LabelBoard } from "@/components/three/ScreenLabels";
import { Static } from "@/components/three/kit";
import { Stage } from "@/components/three/Stage";
import { machinesByPlant } from "@/domain/catalog/machines";
import type { Machine, PlantCode } from "@/domain/types";
import { useTwin } from "@/store/twin";
import { plantLayout, type PlantLayout } from "../layout";
import { L06Bay } from "./Bay";
import { GenericMachine } from "./Generic";
import { Agv, GantryCrane, InspectionBay, LaserCutter, PaintBooth, PressBrake } from "./Machines";
import { Aisle, Shed } from "./Shed";
import { WeldCell } from "./WeldCell";

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

function DetailedMachine({ machine }: { machine: Machine }) {
  switch (machine.kind) {
    case "weld-cell":
      return <WeldCell machine={machine} />;
    case "laser":
      return <LaserCutter machine={machine} />;
    case "press-brake":
      return <PressBrake machine={machine} />;
    case "paint-booth":
      return <PaintBooth machine={machine} />;
    case "cmm":
      return <InspectionBay machine={machine} />;
    case "crane":
      return <GantryCrane machine={machine} />;
    case "agv":
      return <Agv machine={machine} />;
    default:
      return null;
  }
}

export default function PlantScene({ code, labels }: { code: PlantCode; labels: LabelBoard }) {
  const layout = useMemo(() => plantLayout(code), [code]);
  const list = machinesByPlant[code] ?? [];
  const selectMachine = useTwin((s) => s.selectMachine);
  const reach = layout.width * 0.55 + 22;

  return (
    <Stage
      camera={layout.detailed ? [33, 50, 70] : [reach * 0.42, reach * 0.62, reach * 0.85]}
      target={layout.detailed ? [6, 0, -1] : [0, 0, 0]}
      shadowExtent={Math.max(46, layout.width * 0.6)}
      minDistance={16}
      maxDistance={Math.max(110, reach * 2)}
      onPointerMissed={() => selectMachine(null)}
    >
      <Static key={code}>
      {layout.detailed ? (
        <>
          <L06Bay />
          {list.map((m) => (
            <DetailedMachine key={m.id} machine={m} />
          ))}
        </>
      ) : (
        <>
          <Shed width={layout.width} depth={layout.depth} crane={false} />
          <Aisle length={layout.width - 4} z={9.5} />
          {list
            .filter((m) => layout.positions[m.id])
            .map((m) => (
              <GenericMachine key={m.id} machine={m} position={layout.positions[m.id]} />
            ))}
        </>
      )}
      </Static>
      <CameraRig layout={layout} />
      <LabelProjector board={labels} />
    </Stage>
  );
}
