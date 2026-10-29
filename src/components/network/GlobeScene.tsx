"use client";

import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useShallow } from "zustand/react/shallow";
import { palette } from "@/components/three/palette";
import { LabelProjector, type LabelBoard } from "@/components/three/ScreenLabels";
import { orderById, orders, stockById } from "@/domain/catalog/orders";
import { plantByCode, plants } from "@/domain/catalog/plants";
import { importLegAt } from "@/domain/freight";
import { regionById, regions } from "@/domain/catalog/regions";
import type { PlantCode, RegionId } from "@/domain/types";
import { plantHealth } from "@/live/selectors";
import { useLive } from "@/live/store";
import { longHaulTrucks, tripProgress } from "@/live/supply";
import { useTwin } from "@/store/twin";
import { closeView, contextPins, GLOBE_R, homeDirection, inlandLane, latLon, lotPosition, regionAt, roadLanes, seaLane, truckPosition } from "./globe";
import { DOT_COUNT, LAND_BITS, MARK_BITS, fibonacciPoint } from "./globeDots";

// A light globe: one sphere, one point cloud for the land, the import lane, the
// long-haul roads and a few markers. No shadows or post-processing, so it costs far
// less than a plant scene.

// ---- Land ----

function decode(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const dotVertex = /* glsl */ `
  attribute float mark;
  uniform float uSize;
  uniform float uScale;
  uniform float uMaxPx;
  varying float vMark;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = dot(normalize(normalMatrix * position), normalize(-mv.xyz));
    vMark = mark;
    // Sized in world units, but capped so the dots stay fine when the camera dives in.
    gl_PointSize = min(uSize * (1.0 + mark * 0.3) * uScale / -mv.z, uMaxPx);
    gl_Position = projectionMatrix * mv;
  }
`;

const dotFragment = /* glsl */ `
  uniform vec3 uLand;
  uniform vec3 uMark;
  varying float vMark;
  varying float vFacing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(mix(uLand, uMark, vMark), smoothstep(0.0, 0.3, vFacing));
  }
`;

// One globe at a time, so the land is built once and kept.
let landGeometry: THREE.BufferGeometry | null = null;
function buildLand() {
  if (landGeometry) return landGeometry;
  const land = decode(LAND_BITS);
  const mark = decode(MARK_BITS);
  const positions: number[] = [];
  const marks: number[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    if (!(land[i >> 3] & (1 << (i & 7)))) continue;
    const [lon, lat] = fibonacciPoint(i);
    positions.push(...latLon(lat, lon, 0.02).toArray());
    marks.push(mark[i >> 3] & (1 << (i & 7)) ? 1 : 0);
  }
  landGeometry = new THREE.BufferGeometry();
  landGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  landGeometry.setAttribute("mark", new THREE.Float32BufferAttribute(marks, 1));
  return landGeometry;
}

const dotMaterial = new THREE.ShaderMaterial({
  vertexShader: dotVertex,
  fragmentShader: dotFragment,
  transparent: true,
  depthWrite: false,
  uniforms: {
    uSize: { value: 0.06 },
    uScale: { value: 1 },
    uMaxPx: { value: 9 },
    uLand: { value: new THREE.Color("#A3ACB5") },
    uMark: { value: new THREE.Color(palette.accent) },
  },
});

function Land() {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const fov = useThree((s) => (s.camera as THREE.PerspectiveCamera).fov);
  const geometry = useMemo(() => buildLand(), []);
  // Dot size is set in world units, so it shrinks with distance like the rest of the globe.
  useEffect(() => {
    dotMaterial.uniforms.uScale.value = (size.height * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    dotMaterial.uniforms.uMaxPx.value = 4.5 * dpr;
  }, [size.height, dpr, fov]);
  return <points geometry={geometry} material={dotMaterial} />;
}

const haloMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  uniforms: { uColor: { value: new THREE.Color("#FFFFFF") } },
  vertexShader: /* glsl */ `
    varying float vRim;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vRim = dot(normalize(normalMatrix * normal), normalize(mv.xyz));
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    varying float vRim;
    void main() { gl_FragColor = vec4(uColor, smoothstep(0.0, 0.5, vRim) * 0.8); }
  `,
});

function Earth({ onPick, onHover }: { onPick: (region: RegionId) => void; onHover: (region: RegionId | null) => void }) {
  const pick = (e: ThreeEvent<MouseEvent>) => {
    const region = regionAt(e.point);
    if (region) {
      e.stopPropagation();
      onPick(region);
    }
  };
  return (
    <group>
      <mesh onClick={pick} onPointerMove={(e) => onHover(regionAt(e.point))} onPointerOut={() => onHover(null)}>
        <sphereGeometry args={[GLOBE_R, 96, 64]} />
        <meshStandardMaterial color="#F5F7F8" roughness={1} />
      </mesh>
      <mesh material={haloMaterial} scale={1.14}>
        <sphereGeometry args={[GLOBE_R, 64, 48]} />
      </mesh>
      <Land />
    </group>
  );
}

const shipGeometry = new THREE.SphereGeometry(1, 16, 12);
const shipMaterial = new THREE.MeshStandardMaterial({ color: palette.materials.workpiece.color, roughness: 0.5 });
const shipHighlight = new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.5 });
const truckGeometry = new THREE.BoxGeometry(1, 0.7, 0.7);
const heldMaterial = new THREE.MeshStandardMaterial({ color: palette.status.setup, roughness: 0.5 });

const pointer = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  },
  onPointerOut: () => (document.body.style.cursor = ""),
};

/** The sea lane from East Asia to JNPT and the rail line to Bawal, with one ship per weekly lot. */
function ImportLane({ highlight, focus }: { highlight: boolean; focus?: string }) {
  const dashed = useRef<{ material: { dashOffset: number } } | null>(null);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  const imports = useLive((s) => s.snap?.imports);
  const now = useLive((s) => s.snap?.now ?? 0);
  // A ship moves a few pixels a day, so ships are placed when the feed changes, not every frame.
  const lots = useMemo(
    () =>
      (imports ?? []).map((l) => {
        const leg = importLegAt(l, now);
        return { ...l, leg, progress: Math.min(1, Math.max(0, (now - l.sailAt) / (l.berthAt - l.sailAt))) };
      }),
    [imports, now],
  );
  useFrame((_, delta) => {
    if (dashed.current) dashed.current.material.dashOffset -= delta * 0.5;
  });
  return (
    <group>
      <Line points={seaLane.points} color={palette.edges} lineWidth={1.5} transparent opacity={0.9} />
      <Line
        ref={dashed as never}
        points={seaLane.points}
        color={highlight ? palette.accent : palette.materials.workpiece.color}
        lineWidth={highlight ? 2.4 : 1.4}
        dashed
        dashSize={0.25}
        gapSize={0.3}
      />
      <Line points={inlandLane.points} color={highlight ? palette.accent : palette.edges} lineWidth={highlight ? 2.2 : 1.4} dashed dashSize={0.12} gapSize={0.1} />
      {lots.map((l) => {
        const lit = focus === l.id || (highlight && !focus);
        return (
          <mesh
            key={l.id}
            geometry={shipGeometry}
            material={lit ? shipHighlight : shipMaterial}
            position={lotPosition(l, now)}
            scale={(focus === l.id ? 1.5 : 1) * (l.leg === "origin" ? 0.045 : 0.07)}
            onClick={(e) => {
              e.stopPropagation();
              selectNetwork({ kind: "supply", focus: l.id });
            }}
            {...pointer}
          />
        );
      })}
    </group>
  );
}

/** Long-haul roads from Bawal to the other clusters, and the trucks on them now. */
function Roads({ lit, focus }: { lit: Set<PlantCode>; focus?: string }) {
  const selectNetwork = useTwin((s) => s.selectNetwork);
  const shipments = useLive((s) => s.snap?.shipments);
  const now = useLive((s) => s.snap?.now ?? 0);
  const trucks = useMemo(() => (shipments ? longHaulTrucks({ shipments }) : []), [shipments]);
  const busy = new Set(trucks.map((t) => t.to));
  return (
    <group>
      {Object.entries(roadLanes).map(([code, lane]) => (
        <Line
          key={code}
          points={lane!.points}
          color={lit.has(code as PlantCode) ? palette.accent : palette.materials.workpiece.color}
          lineWidth={lit.has(code as PlantCode) ? 2.2 : 1.2}
          transparent
          opacity={lit.has(code as PlantCode) || busy.has(code as PlantCode) ? 0.9 : 0.35}
        />
      ))}
      {trucks.map((t) => {
        const p = truckPosition(t.to, tripProgress(t, now));
        const picked = focus === t.key;
        return (
          <mesh
            key={t.key}
            geometry={truckGeometry}
            material={t.delay ? heldMaterial : picked || lit.has(t.to) ? shipHighlight : shipMaterial}
            position={p}
            quaternion={new THREE.Quaternion().setFromUnitVectors(yAxis, p.clone().normalize())}
            scale={picked ? 0.11 : 0.075}
            onClick={(e) => {
              e.stopPropagation();
              selectNetwork({ kind: "supply", focus: t.key });
            }}
            {...pointer}
          />
        );
      })}
    </group>
  );
}

// ---- Regions ----

const ringGeometry = new THREE.RingGeometry(0.11, 0.15, 40);
const zAxis = new THREE.Vector3(0, 0, 1);
const yAxis = new THREE.Vector3(0, 1, 0);

function Hub({ region, active, onPick }: { region: RegionId; active: boolean; onPick: (region: RegionId) => void }) {
  const ring = useRef<THREE.Mesh>(null);
  const { lat, lon } = regionById[region];
  const down = useLive(
    useShallow((s) => (s.snap ? plants.filter((p) => p.region === region).some((p) => plantHealth(s.snap!, p.code).worst === "down") : false)),
  );
  const { position, quaternion } = useMemo(() => {
    const position = latLon(lat, lon, 0.02);
    return { position, quaternion: new THREE.Quaternion().setFromUnitVectors(zAxis, position.clone().normalize()) };
  }, [lat, lon]);
  const ringMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const phase = regions.findIndex((r) => r.id === region) * 0.2;
  useFrame(({ clock }) => {
    if (!ring.current || !ringMaterial.current) return;
    const k = (clock.elapsedTime * 0.6 + phase) % 1;
    ring.current.scale.setScalar((active ? 1.4 : 1) + k * 1.6);
    ringMaterial.current.opacity = (1 - k) * 0.9;
  });
  const color = down ? palette.status.down : palette.accent;
  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={ring} geometry={ringGeometry}>
        <meshBasicMaterial ref={ringMaterial} color={color} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[0, 0, 0.09]}
        rotation-x={Math.PI / 2}
        onClick={(e) => {
          e.stopPropagation();
          onPick(region);
        }}
        {...pointer}
      >
        <cylinderGeometry args={[0.035, 0.035, 0.18, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

const pinColors = { design: "#3E6FB0", partner: "#7A8591", associate: "#A3ACB5", port: "#454B53" } as const;

/** Design centres, the Stanley partner, the SL Lumax associate and JNPT: context, not plants. */
function ContextPins() {
  return (
    <>
      {contextPins.map((p) => {
        const position = latLon(p.lat, p.lon, 0.03);
        return (
          <mesh key={p.id} position={position} quaternion={new THREE.Quaternion().setFromUnitVectors(yAxis, position.clone().normalize())}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
            <meshStandardMaterial color={pinColors[p.kind]} roughness={0.5} />
          </mesh>
        );
      })}
    </>
  );
}

// ---- Camera ----

type Flight = { from: THREE.Vector3; to: THREE.Vector3; start: number; duration: number; done?: () => void };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const identity = new THREE.Quaternion();

/** Flies the camera along the globe's surface between two views, then hands control back. */
function Pilot({ flightRef }: { flightRef: RefObject<Flight | null> }) {
  const get = useThree((s) => s.get);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const full = useMemo(() => new THREE.Quaternion(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const f = flightRef.current;
    if (!f) return;
    const { camera, controls } = get();
    const orbit = controls as unknown as { enabled: boolean; update: () => void } | null;
    const t = Math.min(1, (clock.elapsedTime - f.start) / f.duration);
    const e = ease(t);
    full.setFromUnitVectors(dir.copy(f.from).normalize(), f.to.clone().normalize());
    q.copy(identity).slerp(full, e);
    camera.position.copy(dir.copy(f.from).normalize().applyQuaternion(q)).multiplyScalar(THREE.MathUtils.lerp(f.from.length(), f.to.length(), e));
    camera.lookAt(0, 0, 0);
    if (orbit) orbit.enabled = t >= 1;
    if (t >= 1) {
      orbit?.update();
      flightRef.current = null;
      f.done?.();
    }
  });
  return null;
}

/** How far back the resting view sits: narrow screens need a little more room for India and the lane east. */
function homeDistance(aspect: number) {
  return GLOBE_R * 3.9 * Math.min(1.6, Math.max(1, (1.4 / aspect) ** 0.35));
}

function Scene({
  labels,
  onApproach,
  onEnter,
}: {
  labels: LabelBoard;
  onApproach: (region: RegionId) => void;
  onEnter: (region: RegionId) => void;
}) {
  const get = useThree((s) => s.get);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const clock = useThree((s) => s.clock);
  const flight = useRef<Flight | null>(null);
  const globeFrom = useTwin((s) => s.globeFrom);
  const request = useTwin((s) => s.globeRequest);
  const selection = useTwin((s) => s.network);
  const hovered = useRef<RegionId | null>(null);

  // A board order lights the road to the plant that fits its boards; a lamp schedule lights the road its boards come by.
  const { selectedRegions, litRoads } = useMemo(() => {
    const roads = new Set<PlantCode>();
    const regionsOn = new Set<RegionId>();
    if (selection?.kind === "supply") regions.forEach((r) => regionsOn.add(r.id));
    if (selection?.kind === "plant") regionsOn.add(plantByCode[selection.code].region);
    if (selection?.kind === "order") {
      const order = orderById[selection.id];
      order.route.forEach((op) => regionsOn.add(plantByCode[op.plant].region));
      const stock = order.fills ?? (order.consumes && !order.fills ? order.consumes.stockId : undefined);
      const to = stock ? stockById[stock].plant : undefined;
      if (to && orders.some((o) => o.fills === stock) && to !== "BWE") {
        roads.add(to);
        regionsOn.add("ncr");
        regionsOn.add(plantByCode[to].region);
      }
    }
    return { selectedRegions: regionsOn, litRoads: roads };
  }, [selection]);

  const fly = (region: RegionId) => {
    if (flight.current) return;
    onApproach(region);
    flight.current = { from: get().camera.position.clone(), to: closeView(region), start: clock.elapsedTime, duration: 1.5, done: () => onEnter(region) };
  };

  // Coming back from a region map starts over that region and pulls out to the whole lane.
  useEffect(() => {
    const home = homeDirection.clone().multiplyScalar(homeDistance(aspect));
    const { camera } = get();
    if (globeFrom) {
      camera.position.copy(closeView(globeFrom));
      flight.current = { from: camera.position.clone(), to: home, start: clock.elapsedTime, duration: 1.4 };
    } else camera.position.copy(home);
    camera.lookAt(0, 0, 0);
    // Only on opening: later resizes keep wherever the user turned the globe to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The region buttons outside the canvas ask for a flight through the store.
  useEffect(() => {
    if (request) fly(request.region);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <>
      <Earth
        onPick={fly}
        onHover={(r) => {
          if (r === hovered.current) return;
          hovered.current = r;
          document.body.style.cursor = r ? "pointer" : "";
        }}
      />
      <ImportLane highlight={selection?.kind === "supply"} focus={selection?.kind === "supply" ? selection.focus : undefined} />
      <Roads lit={litRoads} focus={selection?.kind === "supply" ? selection.focus : undefined} />
      <ContextPins />
      {regions.map((r) => (
        <Hub key={r.id} region={r.id} active={selectedRegions.has(r.id)} onPick={fly} />
      ))}
      <Pilot flightRef={flight} />
      <LabelProjector board={labels} />
    </>
  );
}

export default function GlobeScene(props: {
  labels: LabelBoard;
  onApproach: (region: RegionId) => void;
  onEnter: (region: RegionId) => void;
}) {
  useEffect(() => () => void (document.body.style.cursor = ""), []);
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, GLOBE_R * 3.4], fov: 30, near: 0.2, far: 600 }}
      onPointerMissed={() => useTwin.getState().selectNetwork(null)}
    >
      <color attach="background" args={[palette.background]} />
      <hemisphereLight args={[palette.hemi.sky, palette.hemi.ground, 1.6]} />
      <directionalLight position={[8, 10, 14]} intensity={1.1} />
      <Scene {...props} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.45}
        zoomSpeed={0.6}
        minDistance={GLOBE_R * 1.25}
        maxDistance={GLOBE_R * 9}
      />
    </Canvas>
  );
}
