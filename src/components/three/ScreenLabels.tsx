"use client";

import { useFrame, type RootState } from "@react-three/fiber";
import type { ReactNode } from "react";
import * as THREE from "three";

/**
 * DOM labels pinned to points in a 3D scene. The labels are ordinary React DOM
 * (outside the canvas); a projector inside the canvas moves them every frame.
 * Cheaper than one React root per label, and keeps them below the HUD panels.
 */
export type LabelBoard = {
  /**
   * `facing`: the outward normal of a label on a globe; it hides once the point turns away.
   * `inward`: the label hangs off its point toward the middle of the screen, so it never runs off an edge.
   */
  attach: (id: string, el: HTMLElement, at: THREE.Vector3, facing?: THREE.Vector3, inward?: boolean) => void;
  detach: (id: string) => void;
  project: (camera: THREE.Camera, size: RootState["size"]) => void;
};

export function createLabelBoard(): LabelBoard {
  const labels = new Map<string, { el: HTMLElement; at: THREE.Vector3; facing?: THREE.Vector3; inward?: boolean }>();
  const v = new THREE.Vector3();
  const toCamera = new THREE.Vector3();
  return {
    attach: (id, el, at, facing, inward) => labels.set(id, { el, at, facing, inward }),
    detach: (id) => labels.delete(id),
    project(camera, size) {
      for (const { el, at, facing, inward } of labels.values()) {
        v.copy(at).project(camera);
        const x = (v.x * 0.5 + 0.5) * size.width;
        const y = (-v.y * 0.5 + 0.5) * size.height;
        const dx = !inward ? "-50%" : x > size.width / 2 ? "calc(-100% - 12px)" : "12px";
        el.style.transform = `translate(${x}px, ${y}px) translate(${dx}, -50%)`;
        const behind = !!facing && facing.dot(toCamera.copy(camera.position).sub(at)) < 0;
        el.style.visibility = v.z > 1 || behind ? "hidden" : "visible";
      }
    },
  };
}

export function LabelProjector({ board }: { board: LabelBoard }) {
  useFrame(({ camera, size }) => board.project(camera, size));
  return null;
}

export function ScreenLabel({
  board,
  id,
  at,
  facing,
  inward,
  children,
  className = "",
}: {
  board: LabelBoard;
  id: string;
  at: THREE.Vector3;
  facing?: THREE.Vector3;
  inward?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      ref={(el) => {
        if (el) board.attach(id, el, at, facing, inward);
        else board.detach(id);
      }}
      className={`absolute top-0 left-0 will-change-transform ${className}`}
      style={{ visibility: "hidden" }}
    >
      {children}
    </div>
  );
}
