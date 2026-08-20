"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

const CorporatePenModel = dynamic(
  () =>
    import("@/components/home/motion/corporate-pen-model").then(
      (module) => module.CorporatePenModel,
    ),
  { ssr: false, loading: () => null },
);

const PEN_RENDER_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";

type PenBoundaryProps = {
  children: ReactNode;
  onFailure: () => void;
};

class PenBoundary extends Component<
  PenBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
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

    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function CorporatePenRuntime() {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [canRender, setCanRender] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const media = window.matchMedia(PEN_RENDER_QUERY);
    const syncCapability = () => {
      const allowed = media.matches && supportsWebGL();

      setCanRender(allowed);
      if (!allowed) setReady(false);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
        if (!entry.isIntersecting) setReady(false);
      },
      { rootMargin: "100% 0px", threshold: 0 },
    );

    syncCapability();
    observer.observe(root);
    media.addEventListener("change", syncCapability);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncCapability);
    };
  }, []);

  const shouldMount = canRender && isNearViewport && !failed;

  return (
    <span
      ref={rootRef}
      className="wc-refined-corporate__pen"
      data-corporate-pen
      data-model-state={
        failed
          ? "fallback"
          : ready && shouldMount
            ? "model"
            : shouldMount
              ? "loading"
              : "idle"
      }
      aria-hidden="true"
    >
      <span className="wc-refined-corporate__pen-fallback" />
      {shouldMount ? (
        <PenBoundary onFailure={() => setFailed(true)}>
          <CorporatePenModel onReady={() => setReady(true)} />
        </PenBoundary>
      ) : null}
    </span>
  );
}
