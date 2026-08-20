"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import {
  getOrbitEditorialProgress,
  getOrbitHandoffProgress,
  getOrbitMotionProgress,
  isOrbitWorldId,
  type OrbitWorldId,
} from "@/lib/home/orbit-worlds";

const OrbitCanvas = dynamic(
  () =>
    import("@/components/home/motion/ecosystem-orbit-canvas").then(
      (module) => module.EcosystemOrbitCanvas,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

const DESKTOP_ORBIT_QUERY =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";

type OrbitRendererState = "checking" | "loading" | "webgl" | "fallback";

type EcosystemOrbitRuntimeProps = {
  children: ReactNode;
};

type OrbitRuntimeBoundaryProps = {
  children: ReactNode;
  onFailure: () => void;
};

type OrbitRuntimeBoundaryState = {
  failed: boolean;
};

class OrbitRuntimeBoundary extends Component<
  OrbitRuntimeBoundaryProps,
  OrbitRuntimeBoundaryState
> {
  state: OrbitRuntimeBoundaryState = { failed: false };

  static getDerivedStateFromError(): OrbitRuntimeBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const contextOptions = { failIfMajorPerformanceCaveat: true };

    return Boolean(
      canvas.getContext("webgl2", contextOptions) ??
      canvas.getContext("webgl", contextOptions),
    );
  } catch {
    return false;
  }
}

function readWorldId(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  const worldElement = target.closest<HTMLElement>("[data-orbit-world]");
  const worldId = worldElement?.dataset.orbitWorld;

  return worldId && isOrbitWorldId(worldId) ? worldId : null;
}

export function EcosystemOrbitRuntime({
  children,
}: EcosystemOrbitRuntimeProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const handoffProgressRef = useRef(0);
  const [selectedWorldId, setSelectedWorldId] = useState<OrbitWorldId | null>(
    null,
  );
  const [enhancementAllowed, setEnhancementAllowed] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const scope = scopeRef.current;

    if (!scope) {
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_ORBIT_QUERY);
    const updateEnvironment = () => {
      setEnhancementAllowed(desktopQuery.matches);
      setDocumentVisible(!document.hidden);

      if (!desktopQuery.matches) {
        setCanvasReady(false);
      }
    };
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);

        if (!entry.isIntersecting) {
          setCanvasReady(false);
        }
      },
      { rootMargin: "200% 0px", threshold: 0 },
    );
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "8% 0px", threshold: 0.01 },
    );

    updateEnvironment();
    setWebglSupported(supportsWebGL());
    nearObserver.observe(scope);
    visibilityObserver.observe(scope);
    desktopQuery.addEventListener("change", updateEnvironment);
    document.addEventListener("visibilitychange", updateEnvironment);

    return () => {
      nearObserver.disconnect();
      visibilityObserver.disconnect();
      desktopQuery.removeEventListener("change", updateEnvironment);
      document.removeEventListener("visibilitychange", updateEnvironment);
    };
  }, []);

  const shouldMountCanvas =
    enhancementAllowed &&
    webglSupported === true &&
    isNearViewport &&
    !canvasFailed;
  const renderer: OrbitRendererState =
    canvasFailed || webglSupported === false || !enhancementAllowed
      ? "fallback"
      : shouldMountCanvas
        ? canvasReady
          ? "webgl"
          : "loading"
        : "checking";

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const section = scope?.closest<HTMLElement>(
        '[data-home-scene-id="scene-06"]',
      );

      if (!section) {
        return;
      }

      const updateProgress = (progress: number) => {
        const editorialProgress = getOrbitEditorialProgress(progress);
        const handoffProgress = getOrbitHandoffProgress(progress);

        progressRef.current = progress;
        handoffProgressRef.current = handoffProgress;
        section.style.setProperty("--wc-orbit-progress", progress.toFixed(4));
        section.style.setProperty(
          "--wc-orbit-motion-progress",
          getOrbitMotionProgress(progress).toFixed(4),
        );
        section.style.setProperty(
          "--wc-orbit-editorial-progress",
          editorialProgress.toFixed(4),
        );
        section.style.setProperty(
          "--wc-orbit-handoff-progress",
          handoffProgress.toFixed(4),
        );
        section.dataset.orbitPhase =
          handoffProgress > 0.001
            ? "handoff"
            : editorialProgress > 0.08
              ? "editorial"
              : "orbit";
        section.dataset.orbitHandoff =
          handoffProgress > 0.72
            ? "interactive"
            : handoffProgress > 0.001
              ? "active"
              : "idle";
      };

      updateProgress(0);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => updateProgress(self.progress),
      });

      return () => {
        trigger.kill();
        section.removeAttribute("data-orbit-handoff");
        section.removeAttribute("data-orbit-phase");
        section.style.removeProperty("--wc-orbit-progress");
        section.style.removeProperty("--wc-orbit-motion-progress");
        section.style.removeProperty("--wc-orbit-editorial-progress");
        section.style.removeProperty("--wc-orbit-handoff-progress");
      };
    },
    { scope: scopeRef },
  );

  const readFocusedWorld = useCallback(() => {
    const scope = scopeRef.current;
    const activeElement = document.activeElement;

    return scope?.contains(activeElement) ? readWorldId(activeElement) : null;
  }, []);

  const handlePointerOver = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const worldId = readWorldId(event.target);

      if (worldId) {
        setSelectedWorldId(worldId);
      }
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    setSelectedWorldId(readFocusedWorld());
  }, [readFocusedWorld]);

  const handlePointerOut = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const currentWorldId = readWorldId(event.target);

      if (!currentWorldId) {
        return;
      }

      const nextWorldId = readWorldId(event.relatedTarget);

      if (nextWorldId !== currentWorldId) {
        setSelectedWorldId(nextWorldId ?? readFocusedWorld());
      }
    },
    [readFocusedWorld],
  );

  const handleFocus = useCallback((event: FocusEvent<HTMLDivElement>) => {
    setSelectedWorldId(readWorldId(event.target));
  }, []);

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const nextWorldId = readWorldId(event.relatedTarget);
    setSelectedWorldId(nextWorldId);
  }, []);

  const handleCanvasFailure = useCallback(() => {
    setCanvasFailed(true);
    setCanvasReady(false);
  }, []);

  const handleCanvasReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleWorldActivate = useCallback((worldId: OrbitWorldId) => {
    const destination = scopeRef.current?.querySelector<HTMLAnchorElement>(
      `[data-orbit-world="${worldId}"]`,
    );

    destination?.click();
  }, []);

  return (
    <div
      ref={scopeRef}
      className="wc-scene-orbit__system"
      data-orbit-renderer={renderer}
      data-orbit-selected={selectedWorldId ?? "none"}
      data-orbit-visible={isVisible && documentVisible}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      <div className="wc-scene-orbit__canvas-layer" aria-hidden="true">
        {shouldMountCanvas ? (
          <OrbitRuntimeBoundary onFailure={handleCanvasFailure}>
            <OrbitCanvas
              selectedWorldId={selectedWorldId}
              progressRef={progressRef}
              handoffProgressRef={handoffProgressRef}
              motionActive={isVisible && documentVisible}
              onWorldEnter={setSelectedWorldId}
              onWorldLeave={handlePointerLeave}
              onWorldActivate={handleWorldActivate}
              onReady={handleCanvasReady}
              onFailure={handleCanvasFailure}
            />
          </OrbitRuntimeBoundary>
        ) : null}
      </div>

      {children}
    </div>
  );
}
