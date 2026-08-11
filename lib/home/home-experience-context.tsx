"use client";

import { createContext, useContext } from "react";

import type { HomeSceneId } from "@/lib/home/scene-registry";

export type LiquidRuntimeState = {
  accent: [number, number, number];
  energy: number;
};

export type HomeExperienceContextValue = {
  sceneId: HomeSceneId;
  openingComplete: boolean;
  heroVisualReady: boolean;
  completeOpening: () => void;
  readLiquidRuntime: () => LiquidRuntimeState;
  reportHeroVisualReady: () => void;
  setLiquidAccent: (accent: [number, number, number]) => void;
  setLiquidEnergy: (energy: number) => void;
};

export const HomeExperienceContext =
  createContext<HomeExperienceContextValue | null>(null);

export function useHomeExperience() {
  const context = useContext(HomeExperienceContext);

  if (!context) {
    throw new Error(
      "useHomeExperience must be used within HomeSceneController.",
    );
  }

  return context;
}
