"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState } from "react";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const LENIS_OPTIONS = {
  anchors: true,
  autoRaf: false,
  smoothWheel: true,
  syncTouch: false,
} as const;

function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    const updateScrollTrigger = () => ScrollTrigger.update();
    const advanceLenis = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(advanceLenis);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(advanceLenis);

      // Restore GSAP's defaults when smooth scrolling is disabled or unmounted.
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.refresh();
    };
  }, [lenis]);

  return null;
}

export function SmoothScrollRuntime() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const finePointer = window.matchMedia(FINE_POINTER_QUERY);

    const updateCapability = () => {
      setIsEnabled(!reducedMotion.matches && finePointer.matches);
    };

    updateCapability();
    reducedMotion.addEventListener("change", updateCapability);
    finePointer.addEventListener("change", updateCapability);

    return () => {
      reducedMotion.removeEventListener("change", updateCapability);
      finePointer.removeEventListener("change", updateCapability);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <LenisGsapBridge />
    </ReactLenis>
  );
}
