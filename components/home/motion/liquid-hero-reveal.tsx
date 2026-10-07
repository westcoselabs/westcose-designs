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
      const artwork = scope?.querySelector<HTMLElement>("[data-hero-art]");
      const content = scope?.querySelector<HTMLElement>(
        ".wc-scene-liquid__content",
      );

      if (!scope || !scene || !content) return;

      if (!openingComplete) {
        gsap.set(targets, { autoAlpha: 0, yPercent: 18 });
        return;
      }

      if (prefersReducedMotion) {
        gsap.set(targets, { autoAlpha: 1, yPercent: 0 });
        scope.style.setProperty("--wc-hero-progress", "1");
        scope.style.setProperty("--wc-hero-exit", "0");
        return;
      }

      gsap.fromTo(
        targets,
        { autoAlpha: 0, yPercent: 18 },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.88,
          stagger: 0.075,
          ease: "power3.out",
        },
      );

      // Mobile is a normal-flow composition: keep its service links visible
      // throughout scrolling instead of applying the desktop scene exit.
      const media = gsap.matchMedia();
      media.add("(min-width: 48rem)", () => {
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

          if (artwork) {
            gsap.set(artwork, {
              xPercent: -build * 1.5,
              scale: 1 + build * 0.025,
              opacity: 0.94 * (1 - exit),
              force3D: true,
            });
          }

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
          gsap.set(artwork ? [content, artwork] : [content], {
            clearProps: "all",
          });
        };
      });

      return () => media.revert();
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
