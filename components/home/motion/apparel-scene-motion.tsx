"use client";

import { useRef, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/motion/gsap";

const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

/** One-time entrance as the section arrives; the scene itself is not pinned. */
export function ApparelSceneMotion({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;

      const media = gsap.matchMedia();

      media.add(MOTION_QUERY, () => {
        const reveals = gsap.utils.toArray<HTMLElement>(
          "[data-apparel-reveal]",
          scope,
        );
        const kitItems = gsap.utils.toArray<HTMLElement>(
          "[data-apparel-kit-item]",
          scope,
        );

        const reveal = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: scope,
            start: "top 72%",
            once: true,
          },
        });

        reveal
          .from(reveals, { autoAlpha: 0, y: 40, duration: 0.9, stagger: 0.1 })
          .from(
            kitItems,
            { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.05 },
            "-=0.45",
          );

        return () => {
          reveal.scrollTrigger?.kill();
          reveal.kill();
          gsap.set([...reveals, ...kitItems], {
            clearProps: "opacity,visibility,transform",
          });
        };
      });

      return () => media.revert();
    },
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef} className="wc-apparel__motion">
      {children}
    </div>
  );
}
