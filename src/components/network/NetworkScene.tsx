"use client";

import { Line, QuadraticBezierLine } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useShallow } from "zustand/react/shallow";
import { FloorFrame, Part, useMaterials } from "@/components/three/kit";
import { palette } from "@/components/three/palette";
import { LabelProjector, type LabelBoard } from "@/components/three/ScreenLabels";
import { Stage } from "@/components/three/Stage";
import { orderById } from "@/domain/catalog/orders";
import { plantByCode, plants, sameRegion } from "@/domain/catalog/plants";
import type { Plant, PlantCode, RegionId, Shipment } from "@/domain/types";
import { useLive } from "@/live/store";
import { plantHealth } from "@/live/selectors";
import { sprintTotals } from "@/live/sprint";
import { useTwin } from "@/store/twin";
import { kmToWorld, plantPosition, portPosition, regionMaps } from "./geo";

function Board({ region }: { region: RegionId }) {
  const { board, roads, water } = regionMaps[region];
  return (
    <group>
      <Part size={[board.w, 1.2, board.d]} mat="board" position={[0, -0.6, 0]} />
      {roads.map((r, i) => (
        <Line key={i} points={r.path.map((p) => kmToWorld(region, p, 0.03))} color={palette.materials.road.color} lineWidth={r.major ? 5 : 3} />
      ))}
      {water.map((w, i) => (
        <Line key={`w${i}`} points={w.map((p) => kmToWorld(region, p, 0.03))} color={palette.materials.water.color} lineWidth={8} />
      ))}
    </group>
  );
}

function SawtoothShed({ w, d }: { w: number; d: number }) {
  const mats = useMaterials();
  const teeth = Math.max(2, Math.round(w / 1.3));
  const tooth = w / teeth;
  const geometry = useMemo(() => {
    const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(tooth, 0), new THREE.Vector2(tooth, 0.5)]);
    return new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  }, [tooth, d]);
  return (
    <group>
      <Part size={[w, 1.1, d]} mat="machine" position={[0, 0.55, 0]} />
      {Array.from({ length: teeth }, (_, i) => (
        <mesh key={i} geometry={geometry} material={mats.machine} position={[-w / 2 + i * tooth, 1.1, -d / 2]} castShadow receiveShadow />
      ))}
    </group>
  );
}

/** Footprint of a plant's buildings on the map, in scene units. */
export function siteFootprint(plant: Plant) {
  const sheds = plant.sheds.map((s) => ({ w: s.w * 0.7, d: s.d * 0.7 }));
  const gap = 0.9;
  const depth = sheds.reduce((n, s) => n + s.d, 0) + gap * (sheds.length - 1);
  const width = Math.max(...sheds.map((s) => s.w));
  const centres = sheds.map((s, i) => -depth / 2 + sheds.slice(0, i).reduce((n, p) => n + p.d + gap, 0) + s.d / 2);
  return { sheds, width, depth, centres };
}

function PlantSite({ plant, onRoute }: { plant: Plant; onRoute: boolean }) {
  const select = useTwin((s) => s.selectNetwork);
  const selected = useTwin((s) => s.network?.kind === "plant" && s.network.code === plant.code);
  const lens = useTwin((s) => s.lens);
  const worst = useLive(useShallow((s) => (s.snap ? plantHealth(s.snap, plant.code).worst : "running")));
  const pace = useLive((s) => (s.snap ? sprintTotals(s.snap, s.snap.sprint.lines.filter((l) => l.plant === plant.code)).health : "on-track"));
  const { sheds, width, depth, centres } = siteFootprint(plant);
  // Right now the halo shows the worst machine; this week it shows the plant's pace against its commitment.
  const halo =
    lens === "sprint"
      ? pace === "behind"
        ? palette.status.down
        : pace === "at-risk"
          ? palette.status.setup
          : null
      : worst === "down"
        ? palette.status.down
        : worst === "setup"
          ? palette.status.setup
          : null;
  const pulse = lens === "sprint" ? pace === "behind" : worst === "down";

  return (
    <group
      position={plantPosition(plant.code)}
      onClick={(e) => {
        e.stopPropagation();
        select({ kind: "plant", code: plant.code });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <Part size={[width + 2, 0.12, depth + 2]} mat="outside" edges={false} position={[0, 0.06, 0]} />
      {sheds.map((s, i) => (
        <group key={i} position={[0, 0.12, centres[i]]}>
          <SawtoothShed w={s.w} d={s.d} />
        </group>
      ))}
      {/* Shown or hidden rather than mounted, so a status change never compiles a shader mid-frame. */}
      <FloorFrame size={[width + 3, depth + 3]} thickness={0.35} color={halo ?? palette.status.down} pulse={pulse} y={0.14} visible={!!halo} />
      <FloorFrame
        size={[width + 4.4, depth + 4.4]}
        thickness={selected ? 0.22 : 0.16}
        color={selected ? palette.selection : palette.accent}
        y={0.14}
        visible={selected || onRoute}
      />
    </group>
  );
}

function curve(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().lerp(b, 0.5);
  mid.y = 3 + a.distanceTo(b) * 0.25;
  return { a, b, mid };
}

const arc = (from: PlantCode, to: PlantCode) => curve(plantPosition(from, 1.2), plantPosition(to, 1.2));

const tmp = new THREE.Vector3();

/** Every plant-to-plant hand-off any order makes; these lanes stay mounted and are shown when in use. */
const allLanes = (() => {
  const keys = new Map<string, { from: PlantCode; to: PlantCode }>();
  for (const order of Object.values(orderById)) {
    for (let i = 1; i < order.route.length; i++) {
      const [from, to] = [order.route[i - 1].plant, order.route[i].plant];
      if (from !== to) keys.set(`${from}>${to}`, { from, to });
    }
  }
  return [...keys.entries()].map(([key, { from, to }]) => {
    // A hand-off to the other region runs to the port at the edge of each map instead.
    if (sameRegion(from, to)) return { key, from, to, region: plantByCode[from].region, ...arc(from, to) };
    const region = plantByCode[from].region;
    return { key, from, to, region, ...curve(plantPosition(from, 1.2), portPosition(region, 1.2)) };
  });
})();

/** The Conroe end of a sea lane: from the port to the plant. */
const arrivalLanes = allLanes
  .filter((l) => !sameRegion(l.from, l.to))
  .map((l) => {
    const region = plantByCode[l.to].region;
    return { ...l, region, ...curve(portPosition(region, 1.2), plantPosition(l.to, 1.2)) };
  });

// Shared by every unit in transit, so units coming and going never create materials.
const unitMaterial = new THREE.MeshStandardMaterial({ color: palette.materials.workpiece.color, roughness: 0.4 });
const unitHighlight = new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.4 });
const unitGeometry = new THREE.SphereGeometry(1, 16, 16);

function MovingUnit({ shipment, highlight }: { shipment: Shipment; highlight: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => arc(shipment.from, shipment.to), [shipment.from, shipment.to]);
  useFrame(() => {
    if (!ref.current) return;
    const t = THREE.MathUtils.clamp((Date.now() - shipment.departAt) / (shipment.arriveAt - shipment.departAt), 0, 1);
    const u = 1 - t;
    tmp.copy(curve.a).multiplyScalar(u * u).addScaledVector(curve.mid, 2 * u * t).addScaledVector(curve.b, t * t);
    ref.current.position.copy(tmp);
  });
  return (
    <mesh ref={ref} castShadow geometry={unitGeometry} material={highlight ? unitHighlight : unitMaterial} scale={highlight ? 0.55 : 0.4} />
  );
}

function Flows({ orderId, region }: { orderId: string | null; region: RegionId }) {
  const shipments = useLive((s) => s.snap?.shipments);
  const workOrders = useLive((s) => s.snap?.workOrders);

  // Which lanes carry something now, and which belong to the selected order.
  const busy = useMemo(() => new Set((shipments ?? []).map((s) => `${s.from}>${s.to}`)), [shipments]);
  const onOrder = useMemo(() => {
    const keys = new Set<string>();
    const route = orderId ? orderById[orderId].route : [];
    for (let i = 1; i < route.length; i++) if (route[i - 1].plant !== route[i].plant) keys.add(`${route[i - 1].plant}>${route[i].plant}`);
    return keys;
  }, [orderId]);

  // Each lane keeps a dashed and a solid line mounted and shows one of them, instead of
  // mounting lines as trucks come and go: a new line would compile its shader mid-frame.
  const lanes = [...allLanes, ...arrivalLanes].filter((l) => l.region === region);
  return (
    <group>
      {lanes.map(({ key, a, b, mid }) => (
        <group key={`${key}@${a.x},${a.z}`}>
          <QuadraticBezierLine
            start={a}
            end={b}
            mid={mid}
            color={palette.materials.workpiece.color}
            lineWidth={1.2}
            dashed
            dashSize={1}
            gapSize={0.8}
            transparent
            opacity={orderId ? 0.25 : 0.7}
            visible={busy.has(key) && !onOrder.has(key)}
          />
          <QuadraticBezierLine start={a} end={b} mid={mid} color={palette.accent} lineWidth={2.4} transparent opacity={0.7} visible={onOrder.has(key)} />
        </group>
      ))}
      {/* Trucks only; ships between regions are drawn on the globe. */}
      {(shipments ?? [])
        .filter((s) => sameRegion(s.from, s.to) && plantByCode[s.from].region === region)
        .map((s) => (
          <MovingUnit key={s.id} shipment={s} highlight={!!orderId && workOrders?.[s.workOrderId]?.orderId === orderId} />
        ))}
    </group>
  );
}

export default function NetworkScene({ labels, region }: { labels: LabelBoard; region: RegionId }) {
  const selection = useTwin((s) => s.network);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  const orderId = selection?.kind === "order" ? selection.id : null;
  const routePlants = useMemo(() => new Set(orderId ? orderById[orderId].route.map((op) => op.plant) : []), [orderId]);
  const map = regionMaps[region];

  return (
    <Stage
      camera={map.camera}
      target={map.target}
      shadowExtent={map.shadowExtent}
      minDistance={map.minDistance}
      maxDistance={map.maxDistance}
      onPointerMissed={() => selectNetwork(null)}
    >
      <Board region={region} />
      {plants
        .filter((p) => p.region === region)
        .map((p) => (
          <PlantSite key={p.code} plant={p} onRoute={routePlants.has(p.code)} />
        ))}
      <Flows orderId={orderId} region={region} />
      <LabelProjector board={labels} />
    </Stage>
  );
}
