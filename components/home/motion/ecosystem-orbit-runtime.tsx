"use client";

import Image from "next/image";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import {
  INTERACTION_SCROLL_LOCK_ATTRIBUTE,
  INTERACTION_SCROLL_LOCK_EVENT,
  type InteractionScrollLockDetail,
} from "@/components/providers/smooth-scroll-runtime";
import { Button, ButtonLink } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  ORBIT_BRIDGE_QUERY,
  renderOrbitBridgeArt,
} from "@/lib/home/orbit-bridge";
import {
  ORBIT_REST_PROGRESS,
  getOrbitArrivalProgress,
  getOrbitEditorialProgress,
  getOrbitHandoffProgress,
  getOrbitMotionProgress,
  getOrbitWorld,
  isOrbitWorldId,
  type OrbitQualityTier,
  type OrbitWorldId,
} from "@/lib/home/orbit-worlds";
import { ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

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

const MOTION_ALLOWED_QUERY = "(prefers-reduced-motion: no-preference)";
const FORCED_COLORS_QUERY = "(forced-colors: active)";
const FULL_QUALITY_QUERY =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine)";
const SPLIT_LAYOUT_QUERY = "(min-width: 64rem)";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type OrbitRendererState = "checking" | "loading" | "webgl" | "fallback";

type DataSavingConnection = EventTarget & {
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: DataSavingConnection;
};

type InlinePropertySnapshot = {
  element: HTMLElement;
  property: string;
  priority: string;
  value: string;
};

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

function readWorldElement(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest<HTMLElement>("[data-orbit-world]")
    : null;
}

function readWorldId(target: EventTarget | null) {
  const worldId = readWorldElement(target)?.dataset.orbitWorld;

  return worldId && isOrbitWorldId(worldId) ? worldId : null;
}

function snapshotInlineProperty(element: HTMLElement, property: string) {
  return {
    element,
    property,
    priority: element.style.getPropertyPriority(property),
    value: element.style.getPropertyValue(property),
  } satisfies InlinePropertySnapshot;
}

function restoreInlineProperty(snapshot: InlinePropertySnapshot) {
  if (snapshot.value) {
    snapshot.element.style.setProperty(
      snapshot.property,
      snapshot.value,
      snapshot.priority,
    );
    return;
  }

  snapshot.element.style.removeProperty(snapshot.property);
}

function signalInteractionScrollLock(locked: boolean) {
  const root = document.documentElement;

  if (locked) {
    root.setAttribute(INTERACTION_SCROLL_LOCK_ATTRIBUTE, "");
  } else {
    root.removeAttribute(INTERACTION_SCROLL_LOCK_ATTRIBUTE);
  }

  window.dispatchEvent(
    new CustomEvent<InteractionScrollLockDetail>(
      INTERACTION_SCROLL_LOCK_EVENT,
      { detail: { locked } },
    ),
  );
}

function acquireNativeScrollLock() {
  const root = document.documentElement;
  const body = document.body;
  const scrollLeft = window.scrollX;
  const scrollTop = window.scrollY;
  const hadExistingInteractionLock = root.hasAttribute(
    INTERACTION_SCROLL_LOCK_ATTRIBUTE,
  );
  const properties = [
    snapshotInlineProperty(root, "overflow"),
    snapshotInlineProperty(root, "overscroll-behavior"),
    snapshotInlineProperty(body, "overflow"),
    snapshotInlineProperty(body, "overscroll-behavior"),
    snapshotInlineProperty(body, "position"),
    snapshotInlineProperty(body, "top"),
    snapshotInlineProperty(body, "left"),
    snapshotInlineProperty(body, "width"),
    snapshotInlineProperty(body, "padding-right"),
  ];
  const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
  const computedPaddingRight = Number.parseFloat(
    window.getComputedStyle(body).paddingRight,
  );
  let released = false;

  signalInteractionScrollLock(true);
  root.style.setProperty("overflow", "hidden");
  root.style.setProperty("overscroll-behavior", "none");
  body.style.setProperty("overflow", "hidden");
  body.style.setProperty("overscroll-behavior", "none");
  body.style.setProperty("position", "fixed");
  body.style.setProperty("top", `${-scrollTop}px`);
  body.style.setProperty("left", `${-scrollLeft}px`);
  body.style.setProperty("width", "100%");

  if (scrollbarWidth > 0) {
    body.style.setProperty(
      "padding-right",
      `${(Number.isFinite(computedPaddingRight) ? computedPaddingRight : 0) + scrollbarWidth}px`,
    );
  }

  return () => {
    if (released) {
      return;
    }

    released = true;
    properties.forEach(restoreInlineProperty);
    window.scrollTo(scrollLeft, scrollTop);
    signalInteractionScrollLock(hadExistingInteractionLock);
  };
}

export function EcosystemOrbitRuntime({
  children,
}: EcosystemOrbitRuntimeProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const activatingControlRef = useRef<HTMLElement | null>(null);
  const releaseScrollLockRef = useRef<(() => void) | null>(null);
  const returnFocusFrameRef = useRef<number | null>(null);
  const shouldReturnFocusRef = useRef(true);
  const progressRef = useRef(0);
  const handoffProgressRef = useRef(0);
  const arrivalProgressRef = useRef(1);
  const bridgeArtRef = useRef<HTMLElement | null>(null);
  const rendererRef = useRef<OrbitRendererState>("checking");
  const syncLayoutRef = useRef<(() => void) | null>(null);
  const [hoveredWorldId, setHoveredWorldId] =
    useState<OrbitWorldId | null>(null);
  const [activeWorldId, setActiveWorldId] =
    useState<OrbitWorldId | null>(null);
  const [quality, setQuality] = useState<OrbitQualityTier>("compact");
  const [splitLayout, setSplitLayout] = useState(false);
  const [resetViewToken, setResetViewToken] = useState(0);
  const [enhancementAllowed, setEnhancementAllowed] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const isInspecting = activeWorldId !== null;

  useEffect(() => {
    const scope = scopeRef.current;

    if (!scope) {
      return;
    }

    const motionAllowedQuery = window.matchMedia(MOTION_ALLOWED_QUERY);
    const forcedColorsQuery = window.matchMedia(FORCED_COLORS_QUERY);
    const fullQualityQuery = window.matchMedia(FULL_QUALITY_QUERY);
    const splitLayoutQuery = window.matchMedia(SPLIT_LAYOUT_QUERY);
    const connection = (navigator as NavigatorWithConnection).connection;
    const updateEnvironment = () => {
      const canEnhance =
        motionAllowedQuery.matches &&
        !forcedColorsQuery.matches &&
        !connection?.saveData;

      setEnhancementAllowed(canEnhance);
      setQuality(fullQualityQuery.matches ? "full" : "compact");
      setSplitLayout(splitLayoutQuery.matches);
      setDocumentVisible(!document.hidden);

      if (!canEnhance) {
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
    motionAllowedQuery.addEventListener("change", updateEnvironment);
    forcedColorsQuery.addEventListener("change", updateEnvironment);
    fullQualityQuery.addEventListener("change", updateEnvironment);
    splitLayoutQuery.addEventListener("change", updateEnvironment);
    connection?.addEventListener("change", updateEnvironment);
    document.addEventListener("visibilitychange", updateEnvironment);

    return () => {
      nearObserver.disconnect();
      visibilityObserver.disconnect();
      motionAllowedQuery.removeEventListener("change", updateEnvironment);
      forcedColorsQuery.removeEventListener("change", updateEnvironment);
      fullQualityQuery.removeEventListener("change", updateEnvironment);
      splitLayoutQuery.removeEventListener("change", updateEnvironment);
      connection?.removeEventListener("change", updateEnvironment);
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

  useEffect(() => {
    rendererRef.current = renderer;
    // Static artwork on a stacked layout drops to normal flow.
    syncLayoutRef.current?.();
  }, [renderer]);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const section = scope?.closest<HTMLElement>(
        '[data-home-scene-id="scene-06"]',
      );

      if (!section) {
        return;
      }

      const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const stackedQuery = window.matchMedia("(max-width: 63.999rem)");
      const bridgeQuery = window.matchMedia(ORBIT_BRIDGE_QUERY);
      const editorial = section.querySelector<HTMLElement>(".wc-scene-orbit__editorial");
      // Flow layouts show all destinations without scroll choreography: reduced
      // motion everywhere, and stacked screens that fall back to static art.
      const isFlowLayout = () =>
        reducedMotionQuery.matches ||
        (stackedQuery.matches && rendererRef.current === "fallback");
      const bridgeArt = section.querySelector<HTMLElement>("[data-orbit-bridge-art]");
      const fallbackDesigns = section.querySelector<HTMLElement>(
        '.wc-scene-orbit__fallback-world[data-world="designs"]',
      );

      bridgeArtRef.current = bridgeArt;

      // The canvas steers the still while WebGL renders; otherwise it lands on
      // the static Designs artwork.
      const renderFallbackBridge = (arrival: number) => {
        if (!bridgeArt || rendererRef.current === "webgl") {
          return;
        }

        const rect = fallbackDesigns?.getBoundingClientRect();

        renderOrbitBridgeArt(
          bridgeArt,
          arrival,
          rect && rect.width > 0
            ? {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                width: rect.width,
              }
            : null,
        );
      };
      const updateProgress = (rawProgress: number, entered: boolean) => {
        // The inspector's scroll lock pins the body at scroll 0; keep the
        // last real state rather than reading that as leaving the scene.
        if (document.documentElement.hasAttribute(INTERACTION_SCROLL_LOCK_ATTRIBUTE)) {
          return;
        }

        const flow = isFlowLayout();
        const progress = flow ? ORBIT_REST_PROGRESS : rawProgress;
        const bridgeActive = bridgeQuery.matches && !flow;
        const arrival = bridgeActive ? getOrbitArrivalProgress(progress) : 1;
        const editorialProgress = getOrbitEditorialProgress(progress);
        const handoffProgress = getOrbitHandoffProgress(progress);

        progressRef.current = progress;
        handoffProgressRef.current = handoffProgress;
        arrivalProgressRef.current = arrival;
        section.style.setProperty("--wc-orbit-progress", progress.toFixed(4));
        section.style.setProperty(
          "--wc-orbit-motion-progress",
          getOrbitMotionProgress(progress).toFixed(4),
        );
        section.style.setProperty("--wc-orbit-arrival", arrival.toFixed(4));
        section.style.setProperty(
          "--wc-orbit-editorial-progress",
          editorialProgress.toFixed(4),
        );
        section.style.setProperty(
          "--wc-orbit-handoff-progress",
          handoffProgress.toFixed(4),
        );
        // While the stage slides over the studio it stays hidden; it appears
        // only once pinned, on the studio's identical final frame.
        section.dataset.orbitFlow = String(flow);
        section.dataset.orbitBridge = bridgeActive ? "on" : "off";
        section.dataset.orbitEntered = String(!bridgeActive || entered);
        section.dataset.orbitArrival = arrival >= 1 ? "complete" : "active";
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

        if (bridgeActive) {
          renderFallbackBridge(arrival);
        }
      };
      // Read from the trigger, which stays correct while ScrollTrigger.refresh()
      // momentarily moves the page; scroll locks are skipped above.
      const hasEntered = (self: ScrollTrigger) => self.isActive || self.progress > 0;

      // Apply the overlap before measuring, so the trigger starts where it pins.
      section.dataset.orbitBridge =
        bridgeQuery.matches && !isFlowLayout() ? "on" : "off";

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => updateProgress(self.progress, hasEntered(self)),
        onToggle: (self) => updateProgress(self.progress, hasEntered(self)),
        onRefresh: (self) => updateProgress(self.progress, hasEntered(self)),
      });
      // Stacked layouts frame the planets above the card block.
      const measureEditorial = () => {
        if (!editorial || !stackedQuery.matches || isFlowLayout()) {
          section.style.removeProperty("--wc-orbit-editorial-space");
          return;
        }

        const stageHeight = editorial.offsetParent?.clientHeight ?? window.innerHeight;

        section.style.setProperty(
          "--wc-orbit-editorial-space",
          `${Math.round(stageHeight - editorial.offsetTop + 12)}px`,
        );
      };
      const editorialObserver = new ResizeObserver(measureEditorial);
      let lastBridge: string | undefined = section.dataset.orbitBridge;
      const updateLayout = () => {
        updateProgress(trigger.progress, hasEntered(trigger));
        measureEditorial();

        // The bridge overlap moves every later scene; re-measure them.
        if (lastBridge !== undefined && lastBridge !== section.dataset.orbitBridge) {
          ScrollTrigger.refresh();
        }

        lastBridge = section.dataset.orbitBridge;
      };

      updateLayout();
      syncLayoutRef.current = updateLayout;
      if (editorial) editorialObserver.observe(editorial);
      reducedMotionQuery.addEventListener("change", updateLayout);
      stackedQuery.addEventListener("change", updateLayout);
      bridgeQuery.addEventListener("change", updateLayout);

      return () => {
        syncLayoutRef.current = null;
        editorialObserver.disconnect();
        reducedMotionQuery.removeEventListener("change", updateLayout);
        stackedQuery.removeEventListener("change", updateLayout);
        bridgeQuery.removeEventListener("change", updateLayout);
        trigger.kill();
        bridgeArtRef.current = null;
        bridgeArt?.style.removeProperty("transform");
        bridgeArt?.style.removeProperty("opacity");
        section.removeAttribute("data-orbit-handoff");
        section.removeAttribute("data-orbit-phase");
        section.removeAttribute("data-orbit-bridge");
        section.removeAttribute("data-orbit-flow");
        section.style.removeProperty("--wc-orbit-editorial-space");
        section.removeAttribute("data-orbit-entered");
        section.removeAttribute("data-orbit-arrival");
        section.style.removeProperty("--wc-orbit-progress");
        section.style.removeProperty("--wc-orbit-motion-progress");
        section.style.removeProperty("--wc-orbit-arrival");
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

  const openInspector = useCallback(
    (worldId: OrbitWorldId, activatingControl?: HTMLElement | null) => {
      if (activeWorldId) {
        return;
      }

      activatingControlRef.current =
        activatingControl ??
        scopeRef.current?.querySelector<HTMLElement>(
          `.wc-destination-card__preview[data-orbit-world="${worldId}"]`,
        ) ??
        null;
      shouldReturnFocusRef.current = true;
      setHoveredWorldId(worldId);
      setResetViewToken((token) => token + 1);
      setActiveWorldId(worldId);
    },
    [activeWorldId],
  );

  const closeInspector = useCallback(() => {
    shouldReturnFocusRef.current = true;
    releaseScrollLockRef.current?.();
    setActiveWorldId(null);
    setHoveredWorldId(null);
  }, []);

  useEffect(() => {
    if (!isInspecting) {
      return;
    }

    const release = acquireNativeScrollLock();

    releaseScrollLockRef.current = release;

    return () => {
      if (releaseScrollLockRef.current === release) {
        releaseScrollLockRef.current = null;
      }

      release();
    };
  }, [isInspecting]);

  useEffect(() => {
    if (!isInspecting) {
      return;
    }

    const activatingControl = activatingControlRef.current;

    if (returnFocusFrameRef.current !== null) {
      window.cancelAnimationFrame(returnFocusFrameRef.current);
      returnFocusFrameRef.current = null;
    }

    const focusCloseButton = () => {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>(
          ".wc-scene-orbit__inspector-close",
        )
        ?.focus({ preventScroll: true });
    };
    const focusFrame = window.requestAnimationFrame(() => {
      focusCloseButton();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeInspector();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstElement || !dialog.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus({ preventScroll: true });
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !dialog.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };
    const handleFocusIn = (event: globalThis.FocusEvent) => {
      const dialog = dialogRef.current;

      if (dialog && !dialog.contains(event.target as Node)) {
        focusCloseButton();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);

      if (shouldReturnFocusRef.current && activatingControl?.isConnected) {
        returnFocusFrameRef.current = window.requestAnimationFrame(() => {
          activatingControl.focus({ preventScroll: true });
        });
      }
    };
  }, [closeInspector, isInspecting]);

  const handlePointerOver = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const worldId = readWorldId(event.target);

      if (worldId) {
        setHoveredWorldId(activeWorldId ?? worldId);
      }
    },
    [activeWorldId],
  );

  const handleWorldLeave = useCallback(() => {
    setHoveredWorldId(activeWorldId ?? readFocusedWorld());
  }, [activeWorldId, readFocusedWorld]);

  const handlePointerOut = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const currentWorldId = readWorldId(event.target);

      if (!currentWorldId) {
        return;
      }

      const nextWorldId = readWorldId(event.relatedTarget);

      if (nextWorldId !== currentWorldId) {
        setHoveredWorldId(
          activeWorldId ?? nextWorldId ?? readFocusedWorld(),
        );
      }
    },
    [activeWorldId, readFocusedWorld],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      setHoveredWorldId(activeWorldId ?? readWorldId(event.target));
    },
    [activeWorldId],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      setHoveredWorldId(
        activeWorldId ?? readWorldId(event.relatedTarget),
      );
    },
    [activeWorldId],
  );

  const handleSemanticActivation = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const trigger = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-orbit-trigger]")
        : null;
      if (!trigger) return;
      const worldId = readWorldId(event.target);

      if (!worldId) {
        return;
      }

      event.preventDefault();
      openInspector(worldId, trigger);
    },
    [openInspector],
  );

  const handleCanvasFailure = useCallback(() => {
    shouldReturnFocusRef.current = true;
    releaseScrollLockRef.current?.();
    setActiveWorldId(null);
    setHoveredWorldId(null);
    setCanvasFailed(true);
    setCanvasReady(false);
  }, []);

  const handleCanvasReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleCanvasWorldEnter = useCallback(
    (worldId: OrbitWorldId) => {
      setHoveredWorldId(activeWorldId ?? worldId);
    },
    [activeWorldId],
  );

  const handleCanvasWorldActivate = useCallback(
    (worldId: OrbitWorldId) => {
      const semanticControl = scopeRef.current?.querySelector<HTMLElement>(
        `.wc-destination-card__preview[data-orbit-world="${worldId}"]`,
      );

      openInspector(worldId, semanticControl);
    },
    [openInspector],
  );

  const handleResetView = useCallback(() => {
    setResetViewToken((token) => token + 1);
  }, []);

  const handleInspectorCta = useCallback(() => {
    shouldReturnFocusRef.current = false;
    releaseScrollLockRef.current?.();
    setActiveWorldId(null);
    setHoveredWorldId(null);
  }, []);

  const activeWorld = activeWorldId ? getOrbitWorld(activeWorldId) : null;
  const selectedWorldId = activeWorldId ?? hoveredWorldId;

  return (
    <div
      ref={scopeRef}
      className="wc-scene-orbit__system"
      data-orbit-renderer={renderer}
      data-orbit-selected={selectedWorldId ?? "none"}
      data-orbit-hovered={hoveredWorldId ?? "none"}
      data-orbit-active={activeWorldId ?? "none"}
      data-orbit-inspecting={isInspecting ? "true" : "false"}
      data-orbit-quality={quality}
      data-orbit-visible={isVisible && documentVisible}
      onClickCapture={handleSemanticActivation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerLeave={handleWorldLeave}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      <div className="wc-scene-orbit__canvas-layer" aria-hidden="true">
        {shouldMountCanvas ? (
          <OrbitRuntimeBoundary onFailure={handleCanvasFailure}>
            <OrbitCanvas
              hoveredWorldId={hoveredWorldId}
              activeWorldId={activeWorldId}
              quality={quality}
              resetViewToken={resetViewToken}
              layout={splitLayout ? "split" : "stacked"}
              progressRef={progressRef}
              handoffProgressRef={handoffProgressRef}
              arrivalProgressRef={arrivalProgressRef}
              bridgeArtRef={bridgeArtRef}
              motionActive={(isVisible || isInspecting) && documentVisible}
              onWorldEnter={handleCanvasWorldEnter}
              onWorldLeave={handleWorldLeave}
              onWorldActivate={handleCanvasWorldActivate}
              onDismiss={closeInspector}
              onReady={handleCanvasReady}
              onFailure={handleCanvasFailure}
            />
          </OrbitRuntimeBoundary>
        ) : null}
      </div>

      {children}

      {activeWorld ? (
        <div
          className="wc-scene-orbit__inspector"
          data-preview-mode={renderer === "webgl" ? "interactive" : "static"}
          data-world={activeWorld.id}
          style={
            {
              "--wc-orbit-inspector-accent": activeWorld.accent.primary,
              "--wc-orbit-inspector-accent-soft": activeWorld.accent.soft,
            } as CSSProperties
          }
        >
          <div
            ref={dialogRef}
            id="orbit-world-inspector"
            className="wc-scene-orbit__inspector-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`orbit-inspector-title-${activeWorld.id}`}
            aria-describedby={`orbit-inspector-disciplines-${activeWorld.id} orbit-inspector-summary-${activeWorld.id} orbit-inspector-controls-${activeWorld.id}`}
            tabIndex={-1}
          >
            {renderer !== "webgl" ? (
              <>
                <button
                  type="button"
                  className="wc-scene-orbit__inspector-backdrop"
                  aria-label="Close planet details"
                  tabIndex={-1}
                  onClick={closeInspector}
                />
                <Image
                  className="wc-scene-orbit__inspector-preview"
                  src={activeWorld.previewSrc}
                  alt={`${activeWorld.label} planet`}
                  width={640}
                  height={640}
                  sizes="(max-width: 1023px) 70vw, 48vw"
                />
              </>
            ) : null}
            <GlassPanel
              as="aside"
              className="wc-scene-orbit__inspector-panel"
            >
              <div className="wc-scene-orbit__inspector-header">
                <span
                  className="wc-scene-orbit__inspector-accent"
                  aria-hidden="true"
                />
                <Button
                  className="wc-scene-orbit__inspector-close"
                  variant="quiet"
                  size="sm"
                  aria-label={`Close ${activeWorld.label} inspector`}
                  onClick={closeInspector}
                >
                  Close
                </Button>
              </div>

              <p
                id={`orbit-inspector-disciplines-${activeWorld.id}`}
                className="wc-scene-orbit__inspector-disciplines"
              >
                {activeWorld.disciplines}
              </p>
              <h3
                id={`orbit-inspector-title-${activeWorld.id}`}
                className="wc-scene-orbit__inspector-title"
              >
                {activeWorld.label}
              </h3>
              <p
                id={`orbit-inspector-summary-${activeWorld.id}`}
                className="wc-scene-orbit__inspector-summary"
              >
                {activeWorld.summary}
              </p>
              <p
                id={`orbit-inspector-controls-${activeWorld.id}`}
                className="wc-scene-orbit__inspector-hint"
              >
                {renderer === "webgl"
                  ? "Drag to rotate. Scroll or pinch to zoom."
                  : "A static preview is shown on this device."}
              </p>

              <div className="wc-scene-orbit__inspector-actions">
                <Button
                  className="wc-scene-orbit__inspector-reset"
                  variant="glass"
                  size="md"
                  disabled={renderer !== "webgl"}
                  onClick={handleResetView}
                >
                  Reset view
                </Button>
                <ButtonLink
                  className="wc-scene-orbit__inspector-cta"
                  href={activeWorld.href}
                  variant="solid"
                  size="md"
                  onClick={handleInspectorCta}
                >
                  {activeWorld.ctaLabel}
                </ButtonLink>
              </div>
            </GlassPanel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
