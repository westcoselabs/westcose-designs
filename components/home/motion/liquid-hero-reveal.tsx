"use client";

import { useRef, type ReactNode } from "react";

import { useHomeExperience } from "@/lib/home/home-experience-context";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

export function LiquidHeroReveal({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const { openingComplete, setLiquidEnergy } = useHomeExperience();
  const prefersReducedMotion = useReducedMotionPreference();

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const scene = scope?.closest<HTMLElement>("[data-home-scene-id]");
      const targets = gsap.utils.toArray<HTMLElement>(
        "[data-hero-reveal]",
        scope ?? undefined,
      );
      const fieldRings = gsap.utils.toArray<HTMLElement>(
        ".wc-scene-liquid__field span",
        scope ?? undefined,
      );
      const content = scope?.querySelector<HTMLElement>(
        ".wc-scene-liquid__content",
      );

      if (!scope || !scene || !content) return;

      if (!openingComplete) {
        gsap.set(targets, { autoAlpha: 0, yPercent: 18 });
        return;
      }

      if (prefersReducedMotion) {
        gsap.set(targets, { autoAlpha: 1, yPercent: 0, filter: "none" });
        scope.style.setProperty("--wc-hero-progress", "1");
        scope.style.setProperty("--wc-hero-exit", "0");
        return;
      }

      gsap.fromTo(
        targets,
        { autoAlpha: 0, yPercent: 22, filter: "blur(0.45rem)" },
        {
          autoAlpha: 1,
          yPercent: 0,
          filter: "blur(0rem)",
          duration: 0.88,
          stagger: 0.075,
          ease: "power3.out",
        },
      );

      const render = (progress: number) => {
        const build = gsap.parseEase("power2.inOut")(
          gsap.utils.clamp(0, 1, (progress - 0.08) / 0.62),
        );
        const hold = gsap.utils.clamp(0, 1, (progress - 0.7) / 0.15);
        const exit = gsap.parseEase("power2.in")(
          gsap.utils.clamp(0, 1, (progress - 0.85) / 0.15),
        );

        scope.style.setProperty("--wc-hero-progress", progress.toFixed(4));
        scope.style.setProperty("--wc-hero-build", build.toFixed(4));
        scope.style.setProperty("--wc-hero-exit", exit.toFixed(4));

        fieldRings.forEach((ring, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          gsap.set(ring, {
            xPercent: direction * build * (18 + index * 5) - exit * 16,
            rotation: direction * build * (7 + index * 4),
            scaleX: 1 + build * (0.18 + index * 0.05),
            scaleY: 1 - build * 0.06,
            opacity: 0.5 + build * 0.34 - exit * 0.48,
            force3D: true,
          });
        });

        gsap.set(content, {
          y: -exit * window.innerHeight * 0.2,
          autoAlpha: 1 - exit,
          scale: 1 - exit * 0.025,
          force3D: true,
        });

        setLiquidEnergy(0.16 + build * 0.46 + hold * 0.08 - exit * 0.12);
      };

      render(0);
      const trigger = ScrollTrigger.create({
        trigger: scene,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onRefresh: (self) => render(self.progress),
        onUpdate: (self) => render(self.progress),
      });

      return () => {
        trigger.kill();
        scope.style.removeProperty("--wc-hero-progress");
        scope.style.removeProperty("--wc-hero-build");
        scope.style.removeProperty("--wc-hero-exit");
        gsap.set([content, ...fieldRings], { clearProps: "all" });
      };
    },
    {
      scope: scopeRef,
      dependencies: [openingComplete, prefersReducedMotion, setLiquidEnergy],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={scopeRef} className="wc-scene-liquid__reveal">
      {children}
    </div>
  );
}
