"use client";

import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

const DESKTOP_MOTION_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";

const SCENE_PHASES = {
  enterEnd: 0.15,
  buildEnd: 0.7,
  holdEnd: 0.85,
  exitEnd: 1,
} as const;

const PAGE_TURNS = [
  { start: 0.18, end: 0.31 },
  { start: 0.35, end: 0.48 },
  { start: 0.52, end: 0.65 },
] as const;

const PAGE_REVEALS = [
  { start: 0.055, end: 0.17 },
  { start: 0.275, end: 0.36 },
  { start: 0.445, end: 0.535 },
  { start: 0.615, end: 0.715 },
] as const;

const FINAL_PAGE_FLIP = { start: 0.85, end: 0.945 } as const;
const WHITE_BREATH = { start: 0.905, end: 0.968 } as const;
const PEN_ROLL = { start: 0.94, end: 1 } as const;

function normalize(progress: number, start: number, end: number) {
  return gsap.utils.clamp(0, 1, (progress - start) / (end - start));
}

export function SketchbookSceneMotion({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;

      if (!scope) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(DESKTOP_MOTION_QUERY, () => {
        const scene = scope.closest<HTMLElement>("[data-home-scene-id]");
        const intro = scope.querySelector<HTMLElement>("[data-sketchbook-intro]");
        const materialLine = scope.querySelector<HTMLElement>(
          "[data-sketchbook-material-line]",
        );
        const vectorLine = materialLine?.querySelector<HTMLElement>(
          '[data-line-material="vector"]',
        );
        const graphiteLine = materialLine?.querySelector<HTMLElement>(
          '[data-line-material="graphite"]',
        );
        const book = scope.querySelector<HTMLElement>("[data-sketchbook-book]");
        const pages = gsap.utils.toArray<HTMLElement>(
          "[data-sketchbook-page]",
          scope,
        );
        const artworks = gsap.utils.toArray<HTMLElement>(
          "[data-sketchbook-artwork]",
          scope,
        );
        const inkMasks = gsap.utils.toArray<HTMLElement>(
          "[data-sketchbook-ink-mask]",
          scope,
        );
        const annotations = gsap.utils.toArray<HTMLElement>(
          "[data-sketchbook-annotation]",
          scope,
        );
        const pageShadow = scope.querySelector<HTMLElement>(
          "[data-sketchbook-page-shadow]",
        );
        const whiteBreath = scope.querySelector<HTMLElement>(
          "[data-sketchbook-white-breath]",
        );
        const exitGrid = scope.querySelector<HTMLElement>(
          "[data-sketchbook-exit-grid]",
        );
        const pen = scope.querySelector<HTMLElement>("[data-sketchbook-pen]");

        if (!scene || !book || pages.length === 0) {
          return;
        }

        const easeOut = gsap.parseEase("power3.out");
        const easeSoft = gsap.parseEase("power2.inOut");
        let activePageIndex = -1;
        let scopeWidth = Math.max(scope.clientWidth, 1);
        let imageRefreshActive = true;

        const setActivePage = (index: number) => {
          if (activePageIndex === index) {
            return;
          }

          activePageIndex = index;
          scope.dataset.sketchbookActivePage = String(index + 1);
          pages.forEach((page, pageIndex) => {
            page.toggleAttribute("data-active", pageIndex === index);
          });
        };

        const render = (rawProgress: number) => {
          const progress = gsap.utils.clamp(0, 1, rawProgress);
          const enter = easeOut(normalize(progress, 0, SCENE_PHASES.enterEnd));
          const introIn = easeOut(normalize(progress, 0, 0.075));
          const introOut = easeSoft(normalize(progress, 0.115, 0.225));
          const hold = easeSoft(
            normalize(progress, SCENE_PHASES.buildEnd, SCENE_PHASES.holdEnd),
          );
          const exit = easeSoft(
            normalize(progress, SCENE_PHASES.holdEnd, SCENE_PHASES.exitEnd),
          );
          const breath = easeSoft(
            normalize(progress, WHITE_BREATH.start, WHITE_BREATH.end),
          );
          const penProgress = easeOut(
            normalize(progress, PEN_ROLL.start, PEN_ROLL.end),
          );
          const lineDraw = easeOut(normalize(progress, 0, 0.115));
          const lineMaterial = easeSoft(normalize(progress, 0.075, 0.17));
          const lineExit = easeSoft(normalize(progress, 0.205, 0.325));

          scope.style.setProperty(
            "--wc-sketchbook-progress",
            progress.toFixed(4),
          );

          if (intro) {
            gsap.set(intro, {
              autoAlpha: introIn * (1 - introOut),
              yPercent: (1 - introIn) * 18 - introOut * 16,
            });
          }

          if (materialLine) {
            gsap.set(materialLine, {
              autoAlpha: 1 - lineExit,
              yPercent: lineExit * 12,
            });
          }

          if (vectorLine) {
            gsap.set(vectorLine, {
              opacity: 1 - lineMaterial,
              scaleX: lineDraw,
              transformOrigin: "0% 50%",
            });
          }

          if (graphiteLine) {
            gsap.set(graphiteLine, {
              opacity: lineMaterial,
              scaleX: lineDraw,
              transformOrigin: "0% 50%",
            });
          }

          gsap.set(book, {
            autoAlpha: enter * (1 - breath),
            xPercent: -hold * 1.4 - exit * 3.5,
            yPercent: (1 - enter) * 9 - hold * 0.8 + exit * 3,
            rotationZ: -2.2 + enter * 1.15 - hold * 0.2,
            scale: 0.94 + enter * 0.06 + hold * 0.018 + exit * 0.055,
            force3D: true,
          });

          let activeIndex = 0;
          let strongestTurn = 0;

          PAGE_TURNS.forEach((turn, index) => {
            if (progress >= (turn.start + turn.end) / 2) {
              activeIndex = index + 1;
            }
          });

          if (progress >= (FINAL_PAGE_FLIP.start + FINAL_PAGE_FLIP.end) / 2) {
            activeIndex = pages.length - 1;
          }

          setActivePage(activeIndex);

          pages.forEach((page, index) => {
            const turnRange =
              index < PAGE_TURNS.length
                ? PAGE_TURNS[index]
                : FINAL_PAGE_FLIP;
            const rawTurn = normalize(
              progress,
              turnRange.start,
              turnRange.end,
            );
            const turn = easeSoft(rawTurn);
            const isTurning = rawTurn > 0 && rawTurn < 1;
            const hasTurned = rawTurn >= 1;
            const turnLift = Math.sin(rawTurn * Math.PI);
            const zIndex = isTurning
              ? 30 + index
              : hasTurned
                ? index + 1
                : pages.length - index + 8;

            strongestTurn = Math.max(strongestTurn, turnLift);

            gsap.set(page, {
              rotationY: turn * -179.8,
              rotationZ: turnLift * (index % 2 === 0 ? -0.55 : 0.42),
              z: turnLift * 22 - (hasTurned ? index * 0.35 : 0),
              zIndex,
              transformOrigin: "0% 50%",
              force3D: true,
            });

            const revealRange = PAGE_REVEALS[index] ?? PAGE_REVEALS.at(-1)!;
            const reveal = easeOut(
              normalize(progress, revealRange.start, revealRange.end),
            );
            const artwork = artworks[index];
            const inkMask = inkMasks[index];
            const annotation = annotations[index];

            if (artwork) {
              gsap.set(artwork, {
                opacity: 0.62 + reveal * 0.38,
                scale: 0.965 + reveal * 0.035,
                yPercent: (1 - reveal) * 2.5,
                force3D: true,
              });
            }

            if (inkMask) {
              gsap.set(inkMask, {
                scaleX: 1 - reveal,
                transformOrigin: index % 2 === 0 ? "0% 50%" : "100% 50%",
              });
            }

            if (annotation) {
              const annotationReveal = easeOut(
                normalize(
                  progress,
                  revealRange.start + 0.035,
                  revealRange.end + 0.045,
                ),
              );

              gsap.set(annotation, {
                autoAlpha: annotationReveal,
                scale: 0.94 + annotationReveal * 0.06,
              });
            }
          });

          if (pageShadow) {
            gsap.set(pageShadow, {
              opacity: strongestTurn * 0.42,
              scaleX: 0.18 + strongestTurn * 0.82,
            });
          }

          if (whiteBreath) {
            gsap.set(whiteBreath, {
              autoAlpha: breath,
            });
          }

          if (exitGrid) {
            gsap.set(exitGrid, {
              opacity: penProgress,
              scaleX: penProgress,
              transformOrigin: "0% 50%",
            });
          }

          if (pen) {
            gsap.set(pen, {
              autoAlpha: penProgress,
              x: gsap.utils.interpolate(
                -scopeWidth * 0.23,
                scopeWidth * 0.64,
                penProgress,
              ),
              rotationZ: -11 + penProgress * 372,
              force3D: true,
            });
          }

          document.documentElement.toggleAttribute(
            "data-sketchbook-white-breath",
            breath > 0.48 && progress < 0.999,
          );
        };

        const trigger = ScrollTrigger.create({
          trigger: scene,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            scopeWidth = Math.max(scope.clientWidth, 1);
            render(self.progress);
          },
          onUpdate: (self) => render(self.progress),
          onLeave: () => {
            document.documentElement.removeAttribute(
              "data-sketchbook-white-breath",
            );
          },
          onLeaveBack: () => {
            document.documentElement.removeAttribute(
              "data-sketchbook-white-breath",
            );
          },
        });

        render(trigger.progress);

        const imageReadiness = Array.from(scope.querySelectorAll("img")).map(
          (image) =>
            image.complete
              ? Promise.resolve()
              : image.decode().catch(() => undefined),
        );

        Promise.all(imageReadiness).then(() => {
          if (imageRefreshActive) {
            ScrollTrigger.refresh();
          }
        });

        return () => {
          imageRefreshActive = false;
          trigger.kill();
          document.documentElement.removeAttribute(
            "data-sketchbook-white-breath",
          );
          scope.style.removeProperty("--wc-sketchbook-progress");
          scope.removeAttribute("data-sketchbook-active-page");
          pages.forEach((page) => page.removeAttribute("data-active"));
          gsap.set(
            [
              intro,
              materialLine,
              vectorLine,
              graphiteLine,
              book,
              pageShadow,
              whiteBreath,
              exitGrid,
              pen,
              ...pages,
              ...artworks,
              ...inkMasks,
              ...annotations,
            ],
            {
              clearProps:
                "opacity,visibility,transform,transform-origin,z-index",
            },
          );
        };
      });

      return () => {
        media.revert();
        document.documentElement.removeAttribute(
          "data-sketchbook-white-breath",
        );
      };
    },
    { scope: scopeRef },
  );

  return (
    <div
      ref={scopeRef}
      className="wc-refined-sketchbook__motion"
      data-scene-motion-phases="0,.15,.70,.85,1"
    >
      {children}
    </div>
  );
}
