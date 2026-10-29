"use client";

import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef, type ReactNode } from "react";
import { MaterialsProvider } from "./kit";
import { palette } from "./palette";

type StageProps = {
  children: ReactNode;
  camera: [number, number, number];
  target: [number, number, number];
  /** Half-size of the area that receives shadows. */
  shadowExtent: number;
  minDistance: number;
  maxDistance: number;
  onPointerMissed?: () => void;
};

/**
 * Sharpest pixel ratio the scenes render at. It is fixed on purpose: changing it at
 * runtime rebuilds the post-processing passes and recompiles their shaders, which
 * stalls the page for longer than the lower resolution saves.
 */
const MAX_DPR = 1.5;
/** Shadows follow moving parts (crane, AGV, rams) at this rate instead of every frame. */
const SHADOW_HZ = 12;

/** Re-renders the shadow map a few times a second; nothing in the plants moves fast enough to need more. */
function ThrottledShadows() {
  const get = useThree((s) => s.get);
  const last = useRef(0);
  useEffect(() => {
    const { shadowMap } = get().gl;
    shadowMap.autoUpdate = false;
    shadowMap.needsUpdate = true;
    return () => {
      shadowMap.autoUpdate = true;
    };
  }, [get]);
  useFrame(({ gl, clock }) => {
    if (clock.elapsedTime - last.current < 1 / SHADOW_HZ) return;
    last.current = clock.elapsedTime;
    gl.shadowMap.needsUpdate = true;
  });
  return null;
}

/** Widest-looking screen the starting views were framed for; taller screens pull the camera back. */
const FRAMED_ASPECT = 1.4;

/**
 * Pulls the camera back on tall screens (a phone held upright), where a fixed
 * vertical field of view would crop the sides of the floor. Runs once when the
 * view opens, so resizing a window never throws away where the user orbited to.
 */
function FitToScreen({ from, target, maxDistance }: { from: [number, number, number]; target: [number, number, number]; maxDistance: number }) {
  const get = useThree((s) => s.get);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  // OrbitControls clamps the distance on every update, so wait for them to exist.
  const ready = useThree((s) => !!s.controls);
  const fitted = useRef(false);
  const [fx, fy, fz] = from;
  const [tx, ty, tz] = target;
  useEffect(() => {
    if (!ready || fitted.current) return;
    fitted.current = true;
    const k = Math.min(2.4, Math.max(1, (FRAMED_ASPECT / aspect) ** 0.9));
    const { camera, controls } = get();
    camera.position.set(tx + (fx - tx) * k, ty + (fy - ty) * k, tz + (fz - tz) * k);
    const orbit = controls as unknown as { maxDistance: number; update: () => void };
    orbit.maxDistance = maxDistance * k;
    orbit.update();
  }, [get, ready, aspect, fx, fy, fz, tx, ty, tz, maxDistance]);
  return null;
}

/** Canvas, light, ambient occlusion and orbit controls shared by every 3D view. */
export function Stage({ children, camera, target, shadowExtent: s, minDistance, maxDistance, onPointerMissed }: StageProps) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, MAX_DPR]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: camera, fov: 30, near: 1, far: 1200 }}
      onPointerMissed={onPointerMissed}
    >
      <ThrottledShadows />
      <FitToScreen from={camera} target={target} maxDistance={maxDistance} />
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.background, ...palette.fog]} />
      <hemisphereLight args={[palette.hemi.sky, palette.hemi.ground, palette.hemi.intensity]} />
      <directionalLight
        castShadow
        position={[-0.6 * s, s, 0.5 * s]}
        intensity={palette.key.intensity}
        color={palette.key.color}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
        shadow-camera-left={-s}
        shadow-camera-right={s}
        shadow-camera-top={s}
        shadow-camera-bottom={-s}
        shadow-camera-near={1}
        shadow-camera-far={s * 4}
      />
      {/* Soft strip lights, only used for reflections on metal. */}
      <Environment resolution={256} frames={1}>
        {[-24, -8, 8, 24].map((x) => (
          <Lightformer key={x} form="rect" intensity={2.2} position={[x, 12, 0]} rotation-x={Math.PI / 2} scale={[2, 28, 1]} />
        ))}
        <Lightformer form="rect" intensity={1} position={[0, 6, 30]} scale={[60, 8, 1]} />
      </Environment>
      <MaterialsProvider>{children}</MaterialsProvider>
      <OrbitControls
        makeDefault
        target={target}
        enableDamping
        dampingFactor={0.08}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={0.25}
        maxPolarAngle={1.25}
        screenSpacePanning={false}
      />
      <EffectComposer multisampling={2}>
        <N8AO halfRes depthAwareUpsampling aoRadius={1.8} distanceFalloff={0.9} intensity={palette.ao} quality="medium" />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  );
}
