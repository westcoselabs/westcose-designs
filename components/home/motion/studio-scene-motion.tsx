"use client";

import { useRef, type ReactNode } from "react";

import { MOBILE_MOTION_QUERY } from "@/lib/home/cinematic-motion";
import { ORBIT_BRIDGE_SCALE } from "@/lib/home/orbit-worlds";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

/** One reversible pullback: close-up artwork recedes until it reaches the
 * bridge frame, where Scene 06 pins and carries the same still into orbit. */
export function StudioSceneMotion({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const scope = scopeRef.current;
    const section = scope?.closest<HTMLElement>("[data-home-scene-id]");
    if (!scope || !section) return;

    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 48rem) and (prefers-reduced-motion: no-preference)",
      phone: MOBILE_MOTION_QUERY,
    }, (context) => {
      // Phones centre the close-up above the copy; desktop offsets it right.
      const phone = Boolean(context.conditions?.phone);
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      // The art tween ends exactly at progress 1: that frame is the bridge.
      timeline
        .fromTo(".wc-studio__art", { scale: 1.6, xPercent: phone ? 0 : 9, yPercent: phone ? 14 : 10 },
          { scale: ORBIT_BRIDGE_SCALE, xPercent: 0, yPercent: 0, duration: 0.9, ease: "power1.inOut" }, 0.1)
        .to(".wc-studio__caption", { autoAlpha: 0, duration: 0.12 }, 0.12)
        .to("[data-studio-copy]", { autoAlpha: 0, y: -24, duration: 0.18 }, 0.22)
        .fromTo("[data-studio-transition]", { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.2 }, 0.5);
      ScrollTrigger.refresh();
    });
    return () => media.revert();
  }, { scope: scopeRef });

  return <div ref={scopeRef} className="wc-studio">{children}</div>;
}
