"use client";

import { useFrame, type ThreeElements, type ThreeEvent } from "@react-three/fiber";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useShallow } from "zustand/react/shallow";
import type { AlertKind, MachineStatus } from "@/domain/types";
import { useLive } from "@/live/store";
import { useTwin } from "@/store/twin";
import { materialRoles, palette, type MaterialRole } from "./palette";

type Materials = Record<MaterialRole, THREE.MeshStandardMaterial> & { edges: THREE.LineBasicMaterial };

const MaterialsContext = createContext<Materials | null>(null);

export function useMaterials(): Materials {
  const mats = useContext(MaterialsContext);
  if (!mats) throw new Error("useMaterials must be used inside <MaterialsProvider>");
  return mats;
}

// Shared materials are tagged so <Static> knows which meshes it may merge.
const shared = <M extends THREE.Material>(m: M) => Object.assign(m, { userData: { shared: true } });

function buildMaterials(): Materials {
  const entries = materialRoles.map((role) => {
    const spec: { color: string; roughness?: number; metalness?: number; opacity?: number } = palette.materials[role];
    const transparent = spec.opacity !== undefined;
    return [
      role,
      shared(new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: spec.roughness ?? 0.7,
        metalness: spec.metalness ?? 0,
        transparent,
        opacity: spec.opacity ?? 1,
        depthWrite: !transparent,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
        envMapIntensity: palette.env,
      })),
    ];
  });
  return { ...Object.fromEntries(entries), edges: shared(new THREE.LineBasicMaterial({ color: palette.edges })) } as Materials;
}

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const mats = useMemo(() => buildMaterials(), []);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  return <MaterialsContext value={mats}>{children}</MaterialsContext>;
}

/** Floor slab with saw-cut joints every 6 m. */
export function SlabFloor({ width, depth, ...props }: { width: number; depth: number } & ThreeElements["mesh"]) {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(0,0,0,0.07)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, size - 2, size - 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.repeat.set(width / 6, depth / 6);
    return tex;
  }, [width, depth]);
  useEffect(() => () => texture.dispose(), [texture]);
  const spec = palette.materials.floor;
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow {...props}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={spec.color} roughness={spec.roughness} map={texture} envMapIntensity={palette.env} />
    </mesh>
  );
}

type MeshProps = ThreeElements["mesh"];

/** Outline of a part's hard edges, drawn as plain line segments sharing one material. */
function Outline({ geometry, threshold }: { geometry: THREE.BufferGeometry; threshold: number }) {
  const mats = useMaterials();
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, threshold), [geometry, threshold]);
  useEffect(() => () => edges.dispose(), [edges]);
  return <lineSegments geometry={edges} material={mats.edges} raycast={() => null} />;
}

export function Part({
  size,
  mat,
  edges = true,
  children,
  ...props
}: { size: [number, number, number]; mat: MaterialRole; edges?: boolean } & MeshProps) {
  const mats = useMaterials();
  const [w, h, d] = size;
  const geometry = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} material={mats[mat]} castShadow receiveShadow {...props}>
      {edges ? <Outline geometry={geometry} threshold={20} /> : null}
      {children}
    </mesh>
  );
}

export function Cyl({
  radius,
  height,
  mat,
  segments = 24,
  edges = false,
  ...props
}: { radius: number; height: number; mat: MaterialRole; segments?: number; edges?: boolean } & MeshProps) {
  const mats = useMaterials();
  const geometry = useMemo(() => new THREE.CylinderGeometry(radius, radius, height, segments), [radius, height, segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} material={mats[mat]} castShadow receiveShadow {...props}>
      {edges ? <Outline geometry={geometry} threshold={30} /> : null}
    </mesh>
  );
}

type Bucket = { material: THREE.Material; line: boolean; cast: boolean; receive: boolean; geometries: THREE.BufferGeometry[] };

/**
 * Draws everything below it that never moves as a handful of merged meshes, one
 * per material, instead of hundreds of separate draw calls. The original meshes
 * stay in the scene, hidden, so clicks and hovers still find them. Only meshes
 * using the shared kit materials are merged; anything under an object with
 * `userData.dynamic` (animated arms, workpieces that come and go) or with a
 * material of its own (stack lights, halos, sparks) keeps drawing on its own.
 * A dynamic part that is rigid in itself (a workpiece) can use its own <Static>,
 * which then moves with it.
 */
export function Static({ children, ...props }: { children: ReactNode } & ThreeElements["group"]) {
  const root = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    const toLocal = group.matrixWorld.clone().invert();
    const buckets = new Map<string, Bucket>();
    const hidden: THREE.Object3D[] = [];
    const visit = (o: THREE.Object3D) => {
      if (o.userData.dynamic || o.userData.merged) return;
      const drawable = o as THREE.Mesh | THREE.LineSegments;
      const material = drawable.material as THREE.Material | undefined;
      const mergeable = (drawable instanceof THREE.Mesh || drawable instanceof THREE.LineSegments) && o.visible && material?.userData.shared;
      if (mergeable) {
        const line = drawable instanceof THREE.LineSegments;
        const geometry = drawable.geometry.index ? drawable.geometry.toNonIndexed() : drawable.geometry.clone();
        geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toLocal, o.matrixWorld));
        const attrs = Object.keys(geometry.attributes).sort().join(",");
        const key = `${material.uuid}|${line}|${o.castShadow}|${o.receiveShadow}|${attrs}`;
        const bucket = buckets.get(key) ?? { material, line, cast: o.castShadow, receive: o.receiveShadow, geometries: [] };
        bucket.geometries.push(geometry);
        buckets.set(key, bucket);
        hidden.push(o);
      }
      o.children.forEach(visit);
    };
    group.children.forEach(visit);

    const merged = [...buckets.values()].flatMap((b) => {
      const geometry = mergeGeometries(b.geometries);
      b.geometries.forEach((g) => g.dispose());
      if (!geometry) return [];
      const object = b.line ? new THREE.LineSegments(geometry, b.material) : new THREE.Mesh(geometry, b.material);
      object.castShadow = b.cast;
      object.receiveShadow = b.receive;
      object.userData.merged = true;
      object.raycast = () => {};
      return [object];
    });
    hidden.forEach((o) => (o.visible = false));
    merged.forEach((m) => group.add(m));
    return () => {
      merged.forEach((m) => {
        group.remove(m);
        m.geometry.dispose();
      });
      hidden.forEach((o) => (o.visible = true));
    };
  }, []);
  return (
    <group ref={root} {...props}>
      {children}
    </group>
  );
}

// Painted floor rectangle, used for zone markings, status halos and selection.
export function FloorFrame({
  size,
  thickness = 0.12,
  color,
  material,
  y = 0.015,
  pulse = false,
  opacity = 1,
  visible = true,
}: {
  size: [number, number];
  thickness?: number;
  color?: string;
  material?: THREE.Material;
  y?: number;
  pulse?: boolean;
  opacity?: number;
  /** Hide instead of unmounting, so its shader stays compiled for the next time it shows. */
  visible?: boolean;
}) {
  const [w, d] = size;
  const shape = useMemo(() => {
    const ow = w / 2 + thickness / 2;
    const od = d / 2 + thickness / 2;
    const iw = w / 2 - thickness / 2;
    const id = d / 2 - thickness / 2;
    const outer = new THREE.Shape([
      new THREE.Vector2(-ow, -od),
      new THREE.Vector2(ow, -od),
      new THREE.Vector2(ow, od),
      new THREE.Vector2(-ow, od),
    ]);
    outer.holes.push(
      new THREE.Path([new THREE.Vector2(-iw, -id), new THREE.Vector2(-iw, id), new THREE.Vector2(iw, id), new THREE.Vector2(iw, -id)]),
    );
    return outer;
  }, [w, d, thickness]);
  const own = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (pulse && own.current) own.current.opacity = opacity * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 4)));
  });
  return (
    <mesh position={[0, y, 0]} rotation-x={-Math.PI / 2} material={material} receiveShadow={!!material} visible={visible}>
      <shapeGeometry args={[shape]} />
      {material ? null : (
        <meshBasicMaterial ref={own} color={color} opacity={opacity} transparent toneMapped={false} depthWrite={false} />
      )}
    </mesh>
  );
}

/** Live status of one machine, re-rendering only when it changes. */
export function useMachineState(id: string): { status: MachineStatus; alertKind?: AlertKind } {
  return useLive(
    useShallow((s) => {
      const live = s.snap?.machines[id];
      if (!live) return { status: "waiting" as MachineStatus, alertKind: undefined };
      const alertKind = live.alertId ? s.snap!.alerts.find((a) => a.id === live.alertId)?.kind : undefined;
      return { status: live.status, alertKind };
    }),
  );
}

// Three-segment andon tower, the way operators read machine state on a real floor.
// A starved machine shows no light at all.
export function StackLight({ machineId, ...props }: { machineId: string } & ThreeElements["group"]) {
  const state = useMachineState(machineId);
  // A minor stop lights amber, not red, the way andon boards separate it from a breakdown.
  const status = state.status === "down" && state.alertKind === "minor" ? "setup" : state.status;
  return (
    <group {...props}>
      <Cyl radius={0.035} height={2.4} mat="machineDark" position={[0, 1.2, 0]} segments={8} />
      {(["down", "setup", "running"] as const).map((s, i) => {
        const on = s === status;
        const c = palette.status[s];
        return (
          <mesh key={s} position={[0, 2.5 + i * 0.16, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.15, 16]} />
            <meshStandardMaterial
              color={on ? c : new THREE.Color(c).multiplyScalar(0.3)}
              emissive={c}
              emissiveIntensity={on ? 0.9 : 0}
              roughness={0.3}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Wraps a machine so it can be hovered and clicked, and paints its status and
// selection on the floor around it.
export function Selectable({
  machineId: id,
  footprint,
  children,
  ...props
}: {
  machineId: string;
  footprint?: [number, number];
  children: ReactNode;
} & ThreeElements["group"]) {
  const { status, alertKind } = useMachineState(id);
  const selected = useTwin((s) => s.machineId === id);
  const hovered = useTwin((s) => s.hoveredId === id);
  const select = useTwin((s) => s.selectMachine);
  const hover = useTwin((s) => s.hover);

  const halo =
    status === "down"
      ? alertKind === "minor"
        ? palette.status.setup
        : palette.status.down
      : status === "setup" || alertKind === "material" || alertKind === "manpower"
        ? palette.status.setup
        : null;

  return (
    <group
      {...props}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        hover(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        select(id);
      }}
    >
      {children}
      {/* Always mounted and shown or hidden, so a stop or a hover never compiles a shader mid-frame. */}
      {footprint ? (
        <>
          <FloorFrame
            size={[footprint[0] + 0.9, footprint[1] + 0.9]}
            thickness={0.28}
            color={halo ?? palette.status.down}
            pulse={status === "down" && alertKind !== "minor"}
            visible={!!halo}
          />
          <FloorFrame
            size={[footprint[0] + 1.8, footprint[1] + 1.8]}
            thickness={selected ? 0.14 : 0.08}
            color={palette.selection}
            opacity={selected ? 0.95 : 0.5}
            visible={selected || hovered}
          />
        </>
      ) : null}
    </group>
  );
}
