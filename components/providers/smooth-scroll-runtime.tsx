"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState } from "react";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export const INTERACTION_SCROLL_LOCK_EVENT =
  "westcose:interaction-scroll-lock";
export const INTERACTION_SCROLL_LOCK_ATTRIBUTE =
  "data-wc-interaction-scroll-lock";

export type InteractionScrollLockDetail = {
  locked: boolean;
};

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
    let interactionLocked = false;
    let wasStoppedBeforeLock = false;

    const setInteractionLock = (locked: boolean) => {
      if (locked === interactionLocked) {
        return;
      }

      interactionLocked = locked;

      if (locked) {
        wasStoppedBeforeLock = lenis.isStopped;
        lenis.stop();
        return;
      }

      if (!wasStoppedBeforeLock) {
        lenis.start();
      }

      wasStoppedBeforeLock = false;
      ScrollTrigger.refresh();
    };

    const handleInteractionLock = (event: Event) => {
      const lockEvent = event as CustomEvent<InteractionScrollLockDetail>;

      setInteractionLock(Boolean(lockEvent.detail?.locked));
    };

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(advanceLenis);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener(
      INTERACTION_SCROLL_LOCK_EVENT,
      handleInteractionLock,
    );
    setInteractionLock(
      document.documentElement.hasAttribute(
        INTERACTION_SCROLL_LOCK_ATTRIBUTE,
      ),
    );
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(advanceLenis);
      window.removeEventListener(
        INTERACTION_SCROLL_LOCK_EVENT,
        handleInteractionLock,
      );

      if (interactionLocked && !wasStoppedBeforeLock) {
        lenis.start();
      }

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
