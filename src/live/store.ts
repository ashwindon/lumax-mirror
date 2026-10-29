"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Snapshot } from "@/domain/types";
import { simulatedSource, type LiveSource } from "./source";

export const useLive = create<{ snap: Snapshot | null }>(() => ({ snap: null }));

const source: LiveSource = simulatedSource();

/** Connects the live source to the store for as long as it is mounted. */
export function LiveFeed() {
  useEffect(() => source.subscribe((snap) => useLive.setState({ snap })), []);
  return null;
}
