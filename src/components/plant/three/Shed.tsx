"use client";

import { Part, SlabFloor, useMaterials } from "@/components/three/kit";

const COLUMN_PITCH = 8;

/**
 * Steel portal-frame shed cut away like an architectural model: back and left walls
 * stay, the camera-side row of columns is ghosted so it never hides the floor.
 */
export function Shed({ width, depth, crane = true }: { width: number; depth: number; crane?: boolean }) {
  const mats = useMaterials();
  const bays = Math.round(width / COLUMN_PITCH);
  const xs = Array.from({ length: bays + 1 }, (_, i) => -width / 2 + 2 + (i * (width - 4)) / bays);
  const zEdge = depth / 2 - 1;
  const height = crane ? 11 : 8;

  return (
    <group>
      <SlabFloor width={width} depth={depth} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow material={mats.outside}>
        <planeGeometry args={[700, 700]} />
      </mesh>

      {xs.flatMap((x) =>
        [-zEdge, zEdge].map((z) => {
          const front = z > 0;
          const mat = front ? "ghost" : "structure";
          return (
            <group key={`${x}:${z}`} position={[x, 0, z]}>
              <Part size={[0.5, height, 0.6]} mat={mat} edges={!front} position={[0, height / 2, 0]} castShadow={!front} />
              {crane ? (
                <Part size={[0.5, 0.5, 0.9]} mat={mat} edges={!front} position={[0, 8.1, front ? -0.6 : 0.6]} castShadow={!front} />
              ) : null}
            </group>
          );
        }),
      )}
      {crane ? (
        <>
          <Part size={[width - 3, 0.6, 0.5]} mat="ghost" edges={false} castShadow={false} position={[0, 8.6, zEdge - 0.6]} />
          <Part size={[width - 3, 0.6, 0.5]} mat="structure" position={[0, 8.6, -zEdge + 0.6]} />
        </>
      ) : null}
      <Part size={[width - 3, 0.4, 0.35]} mat="ghost" edges={false} castShadow={false} position={[0, height, zEdge]} />
      <Part size={[width - 3, 0.4, 0.35]} mat="structure" position={[0, height, -zEdge]} />
      <Part size={[width, 4, 0.3]} mat="wall" position={[0, 2, -depth / 2 + 0.4]} />
      <Part size={[0.3, 4, depth]} mat="wall" position={[-width / 2, 2, 0]} />
    </group>
  );
}

export function Aisle({ length, z, x = 0, width = 4.1 }: { length: number; z: number; x?: number; width?: number }) {
  const mats = useMaterials();
  return (
    <group position={[x, 0.01, z]}>
      {[-width / 2, width / 2].map((dz) => (
        <mesh key={dz} rotation-x={-Math.PI / 2} position={[0, 0, dz]} receiveShadow material={mats.lane}>
          <planeGeometry args={[length, 0.14]} />
        </mesh>
      ))}
    </group>
  );
}
