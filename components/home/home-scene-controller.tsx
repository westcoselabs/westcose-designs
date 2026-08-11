"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { HomeSceneProgress } from "@/components/home/home-scene-progress";
import {
  HomeExperienceContext,
  type LiquidRuntimeState,
} from "@/lib/home/home-experience-context";
import {
  HOME_SCENES,
  INITIAL_HOME_SCENE,
  getHomeSceneState,
  type HomeScene,
  type HomeSceneId,
} from "@/lib/home/scene-registry";
import { ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

type HomeSceneControllerProps = {
  children: ReactNode;
};

const HOME_DOCUMENT_ATTRIBUTES = [
  "data-home-scene",
  "data-home-cursor-mode",
  "data-home-reduced-motion",
  "data-home-opening",
] as const;

const HEADER_STATE_ATTRIBUTES = ["data-nav-theme", "data-nav-visible"] as const;

function getMotionPhase(progress: number) {
  if (progress < 0.15) return "ENTER";
  if (progress < 0.7) return "BUILD";
  if (progress < 0.85) return "HOLD";
  return "EXIT";
}

export function HomeSceneController({ children }: HomeSceneControllerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeSceneIdRef = useRef<HomeSceneId>(INITIAL_HOME_SCENE.id);
  const liquidRuntimeRef = useRef<LiquidRuntimeState>({
    accent: [0.72, 0.34, 0.18],
    energy: 0.16,
  });
  const prefersReducedMotion = useReducedMotionPreference();
  const [openingComplete, setOpeningComplete] = useState(false);
  const [heroVisualReady, setHeroVisualReady] = useState(false);
  const [sceneState, setSceneState] = useState(() =>
    getHomeSceneState(INITIAL_HOME_SCENE),
  );

  const completeOpening = useCallback(() => {
    setOpeningComplete(true);
    activeSceneIdRef.current = HOME_SCENES[1].id;
    setSceneState((currentState) =>
      currentState.sceneId === "scene-00"
        ? getHomeSceneState(HOME_SCENES[1])
        : currentState,
    );
  }, []);

  const reportHeroVisualReady = useCallback(() => {
    setHeroVisualReady(true);
  }, []);

  const readLiquidRuntime = useCallback(() => liquidRuntimeRef.current, []);
  const setLiquidAccent = useCallback((accent: [number, number, number]) => {
    liquidRuntimeRef.current.accent = accent;
  }, []);
  const setLiquidEnergy = useCallback((energy: number) => {
    liquidRuntimeRef.current.energy = energy;
  }, []);

  const activateScene = useCallback((scene: HomeScene, progress = 0) => {
    activeSceneIdRef.current = scene.id;
    const nextProgress =
      Math.round(Math.min(1, Math.max(0, progress)) * 1000) / 1000;

    setSceneState((currentState) => {
      if (currentState.sceneId === scene.id) {
        return currentState;
      }

      return {
        ...getHomeSceneState(scene),
        progress: nextProgress,
      };
    });
  }, []);

  const experienceContext = useMemo(
    () => ({
      sceneId: sceneState.sceneId,
      openingComplete,
      heroVisualReady,
      completeOpening,
      readLiquidRuntime,
      reportHeroVisualReady,
      setLiquidAccent,
      setLiquidEnergy,
    }),
    [
      completeOpening,
      heroVisualReady,
      openingComplete,
      readLiquidRuntime,
      reportHeroVisualReady,
      sceneState.sceneId,
      setLiquidAccent,
      setLiquidEnergy,
    ],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const enabled =
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).get("motionDebug") === "1";
    root.dataset.motionDebug = String(enabled);

    return () => root.removeAttribute("data-motion-debug");
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;

      if (!root || !openingComplete) {
        return;
      }

      const progressBar = root.querySelector<HTMLElement>(
        '.wc-home-progress__bar[role="progressbar"]',
      );
      const debugPhase = root.querySelector<HTMLElement>(
        "[data-motion-debug-phase]",
      );
      const debugProgress = root.querySelector<HTMLElement>(
        "[data-motion-debug-progress]",
      );

      const renderProgress = (scene: HomeScene, progress: number) => {
        if (activeSceneIdRef.current !== scene.id) return;

        const normalized = Math.min(1, Math.max(0, progress));
        const percentage = Math.round(normalized * 100);
        const phase = getMotionPhase(normalized);

        root.style.setProperty("--wc-scene-progress", normalized.toFixed(4));
        root.dataset.sceneProgress = normalized.toFixed(3);
        root.dataset.motionPhase = phase;
        progressBar?.setAttribute("aria-valuenow", String(percentage));
        if (debugPhase) debugPhase.textContent = phase;
        if (debugProgress) debugProgress.textContent = `${percentage}%`;
      };

      const triggers = HOME_SCENES.filter((scene) => scene.id !== "scene-00")
        .map((scene) => {
          const element = root.querySelector<HTMLElement>(
            `[data-home-scene-id="${scene.id}"]`,
          );

          if (!element) return null;

          return ScrollTrigger.create({
            trigger: element,
            start: "top top",
            end:
              scene.layout === "pinned" && !prefersReducedMotion
                ? "bottom bottom"
                : "bottom top",
            invalidateOnRefresh: true,
            onEnter: (self) => {
              activateScene(scene, self.progress);
              renderProgress(scene, self.progress);
            },
            onEnterBack: (self) => {
              activateScene(scene, self.progress);
              renderProgress(scene, self.progress);
            },
            onUpdate: (self) => {
              if (activeSceneIdRef.current !== scene.id) return;
              renderProgress(scene, self.progress);
            },
          });
        })
        .filter((trigger): trigger is ScrollTrigger => Boolean(trigger));

      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      const currentScroll = window.scrollY;
      let currentTrigger = triggers[0];

      for (const trigger of triggers) {
        if (currentScroll >= trigger.start) currentTrigger = trigger;
      }

      if (currentTrigger) {
        const sceneId = (currentTrigger.trigger as HTMLElement | undefined)
          ?.dataset.homeSceneId;
        const scene = HOME_SCENES.find((item) => item.id === sceneId);
        if (scene) {
          activateScene(scene, currentTrigger.progress);
          renderProgress(scene, currentTrigger.progress);
        }
      }

      return () => {
        triggers.forEach((trigger) => trigger.kill());
        root.style.removeProperty("--wc-scene-progress");
      };
    },
    {
      scope: rootRef,
      dependencies: [activateScene, openingComplete, prefersReducedMotion],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    const documentRoot = document.documentElement;
    const siteHeader =
      document.querySelector<HTMLElement>("[data-site-header]");
    const previousAttributes = new Map(
      HOME_DOCUMENT_ATTRIBUTES.map((attribute) => [
        attribute,
        documentRoot.getAttribute(attribute),
      ]),
    );
    const previousHeaderAttributes = siteHeader
      ? new Map(
          HEADER_STATE_ATTRIBUTES.map((attribute) => [
            attribute,
            siteHeader.getAttribute(attribute),
          ]),
        )
      : null;

    return () => {
      for (const attribute of HOME_DOCUMENT_ATTRIBUTES) {
        const previousValue = previousAttributes.get(attribute);

        if (previousValue === null || previousValue === undefined) {
          documentRoot.removeAttribute(attribute);
        } else {
          documentRoot.setAttribute(attribute, previousValue);
        }
      }

      if (siteHeader && previousHeaderAttributes) {
        siteHeader
          .querySelector<HTMLDetailsElement>(".wc-site-header__disclosure")
          ?.removeAttribute("open");

        for (const attribute of HEADER_STATE_ATTRIBUTES) {
          const previousValue = previousHeaderAttributes.get(attribute);

          if (previousValue === null || previousValue === undefined) {
            siteHeader.removeAttribute(attribute);
          } else {
            siteHeader.setAttribute(attribute, previousValue);
          }
        }
      }
    };
  }, []);

  useEffect(() => {
    const documentRoot = document.documentElement;
    const siteHeader =
      document.querySelector<HTMLElement>("[data-site-header]");

    documentRoot.setAttribute("data-home-scene", sceneState.sceneId);
    documentRoot.setAttribute("data-home-cursor-mode", sceneState.cursorMode);
    documentRoot.setAttribute(
      "data-home-reduced-motion",
      String(prefersReducedMotion),
    );
    documentRoot.setAttribute(
      "data-home-opening",
      openingComplete ? "complete" : "pending",
    );

    if (siteHeader) {
      siteHeader.setAttribute("data-nav-theme", sceneState.navTheme);
      siteHeader.setAttribute(
        "data-nav-visible",
        String(openingComplete && sceneState.navTheme !== "hidden"),
      );
    }
  }, [openingComplete, prefersReducedMotion, sceneState]);

  return (
    <HomeExperienceContext.Provider value={experienceContext}>
      <div
        ref={rootRef}
        className="wc-home-experience"
        data-active-scene={sceneState.sceneId}
        data-scene-progress={sceneState.progress}
        data-reduced-motion={prefersReducedMotion}
        data-opening-complete={openingComplete}
        data-motion-phase={getMotionPhase(sceneState.progress)}
      >
        {children}
        <HomeSceneProgress state={sceneState} />
        <div
          className="wc-home-cursor-state"
          data-cursor-mode={sceneState.cursorMode}
          aria-hidden="true"
        >
          <span>{sceneState.cursorMode}</span>
        </div>
        {process.env.NODE_ENV !== "production" ? (
          <output className="wc-motion-debug" aria-live="off">
            <span>{sceneState.sceneId}</span>
            <strong data-motion-debug-phase>
              {getMotionPhase(sceneState.progress)}
            </strong>
            <span data-motion-debug-progress>
              {Math.round(sceneState.progress * 100)}%
            </span>
          </output>
        ) : null}
      </div>
    </HomeExperienceContext.Provider>
  );
}
