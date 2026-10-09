"use client";

import { useRef, type ReactNode } from "react";

import {
  LIQUID_HANDOFF_DRIFT,
  MOBILE_MOTION_QUERY,
} from "@/lib/home/cinematic-motion";
import { useHomeExperience } from "@/lib/home/home-experience-context";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

// Desktop pin is 180svh. The first ~80svh builds and holds the hero; the
// last 100svh overlaps the illustration rail (see coastal-hero.css), which
// rises over the hero while it departs. Progress values below are fractions
// of that full pin.
const BUILD_START = 0.035;
const BUILD_END = 0.31;
const HOLD_END = 0.37;

function span(progress: number, start: number, end: number, ease = "none") {
  return gsap.parseEase(ease)(
    gsap.utils.clamp(0, 1, (progress - start) / (end - start)),
  );
}

export function LiquidHeroReveal({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const { openingComplete, setLiquidDrift, setLiquidEnergy } =
    useHomeExperience();
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
      const atmosphere = scope?.querySelector<HTMLElement>(".wc-coastal-hero__atmosphere");
      const scrim = scope?.querySelector<HTMLElement>(".wc-coastal-hero__scrim");
      const copy = scope?.querySelector<HTMLElement>(".wc-coastal-hero__copy");
      const services = scope?.querySelector<HTMLElement>(".wc-coastal-hero__services");
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

      // Phones share the pinned exit when motion is allowed.
      const media = gsap.matchMedia();
      media.add(`(min-width: 48rem), ${MOBILE_MOTION_QUERY}`, () => {
        const render = (progress: number) => {
          const build = span(progress, BUILD_START, BUILD_END, "power2.inOut");
          const hold = span(progress, BUILD_END, HOLD_END);
          // Layered departure: services clear first so the rising rail never
          // collides with them, the copy lifts away, the artwork drifts left
          // with the current, and the dark veil lifts last to hand the screen
          // to the shader the rail sits on.
          const servicesExit = span(progress, 0.345, 0.56, "power2.in");
          const lift = span(progress, 0.345, 0.76, "sine.in");
          const copyExit = span(progress, 0.38, 0.64, "power1.in");
          const artExit = span(progress, 0.38, 0.78, "power1.inOut");
          const veil = span(progress, 0.5, 0.95, "sine.inOut");
          const exit = Math.max(copyExit, artExit);

          scope.style.setProperty("--wc-hero-progress", progress.toFixed(4));
          scope.style.setProperty("--wc-hero-build", build.toFixed(4));
          scope.style.setProperty("--wc-hero-exit", exit.toFixed(4));

          if (artwork) {
            gsap.set(artwork, {
              xPercent: -build * 1.5 - artExit * 9,
              yPercent: -artExit * 4,
              scale: 1 + build * 0.025 - artExit * 0.05,
              opacity: 0.94 * (1 - artExit),
              force3D: true,
            });
          }

          gsap.set(content, {
            y: -lift * window.innerHeight * 0.24,
            scale: 1 - lift * 0.02,
            force3D: true,
          });
          if (copy) gsap.set(copy, { autoAlpha: 1 - copyExit });
          if (services) {
            gsap.set(services, {
              y: -build * 10 - servicesExit * 60,
              autoAlpha: 1 - servicesExit,
            });
          }
          if (atmosphere) {
            gsap.set(atmosphere, {
              yPercent: build * 4,
              scale: 1 + build * 0.04,
              opacity: 1 - veil,
            });
          }
          if (scrim) gsap.set(scrim, { opacity: 1 - veil });

          setLiquidDrift(
            LIQUID_HANDOFF_DRIFT * span(progress, 0.38, 1, "sine.inOut"),
          );
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
          gsap.set(
            [content, artwork, atmosphere, scrim, copy, services].filter(
              Boolean,
            ),
            { clearProps: "all" },
          );
          setLiquidDrift(0);
        };
      });

      return () => media.revert();
    },
    {
      scope: scopeRef,
      dependencies: [
        openingComplete,
        prefersReducedMotion,
        setLiquidDrift,
        setLiquidEnergy,
      ],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={scopeRef} className="wc-scene-liquid__reveal">
      {children}
    </div>
  );
}
