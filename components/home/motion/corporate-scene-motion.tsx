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

const PIECE_REVEALS = {
  letterhead: { start: 0.12, end: 0.3 },
  card: { start: 0.27, end: 0.43 },
  presentation: { start: 0.41, end: 0.58 },
  memo: { start: 0.55, end: 0.7 },
} as const;

type CorporatePieceName = keyof typeof PIECE_REVEALS;

type PieceMotion = {
  xPercent: number;
  yPercent: number;
  rotation: number;
};

const PIECE_MOTION: Record<CorporatePieceName, PieceMotion> = {
  letterhead: { xPercent: 13, yPercent: -13, rotation: -3.2 },
  card: { xPercent: -18, yPercent: 18, rotation: 4.4 },
  presentation: { xPercent: 12, yPercent: 20, rotation: 3.6 },
  memo: { xPercent: -10, yPercent: 17, rotation: -2.8 },
};

function normalize(progress: number, start: number, end: number) {
  return gsap.utils.clamp(0, 1, (progress - start) / (end - start));
}

export function CorporateSceneMotion({ children }: { children: ReactNode }) {
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
        const copy = scope.querySelector<HTMLElement>("[data-corporate-copy]");
        const system = scope.querySelector<HTMLElement>(
          "[data-corporate-system]",
        );
        const grid = scope.querySelector<HTMLElement>("[data-corporate-grid]");
        const gridX = scope.querySelector<HTMLElement>(
          '[data-corporate-grid-axis="x"]',
        );
        const gridY = scope.querySelector<HTMLElement>(
          '[data-corporate-grid-axis="y"]',
        );
        const settleMark = scope.querySelector<HTMLElement>(
          "[data-corporate-settle-mark]",
        );
        const pen = scope.querySelector<HTMLElement>("[data-corporate-pen]");
        const dusk = scope.querySelector<HTMLElement>("[data-corporate-dusk]");
        const orbitBridge = scope.querySelector<HTMLElement>(
          "[data-corporate-orbit-bridge]",
        );
        const arcs = gsap.utils.toArray<HTMLElement>(
          "[data-corporate-arc]",
          scope,
        );
        const orbitMark = scope.querySelector<HTMLElement>(
          "[data-corporate-orbit-mark]",
        );
        const pieces = Object.fromEntries(
          (Object.keys(PIECE_REVEALS) as CorporatePieceName[]).map((name) => [
            name,
            scope.querySelector<HTMLElement>(
              `[data-corporate-piece="${name}"]`,
            ),
          ]),
        ) as Record<CorporatePieceName, HTMLElement | null>;

        if (!scene || !system) {
          return;
        }

        const easeOut = gsap.parseEase("power3.out");
        const easeSoft = gsap.parseEase("power2.inOut");
        let systemWidth = Math.max(system.clientWidth, 1);
        let systemHeight = Math.max(system.clientHeight, 1);

        const render = (rawProgress: number) => {
          const progress = gsap.utils.clamp(0, 1, rawProgress);
          const enter = easeOut(
            normalize(progress, 0, SCENE_PHASES.enterEnd),
          );
          const copyIn = easeOut(normalize(progress, 0, 0.095));
          const copyOut = easeSoft(normalize(progress, 0.18, 0.35));
          const gridIn = easeOut(normalize(progress, 0.015, 0.2));
          const build = easeSoft(
            normalize(progress, SCENE_PHASES.enterEnd, SCENE_PHASES.buildEnd),
          );
          const settle = easeSoft(
            normalize(progress, SCENE_PHASES.buildEnd, SCENE_PHASES.holdEnd),
          );
          const exit = easeSoft(
            normalize(progress, SCENE_PHASES.holdEnd, SCENE_PHASES.exitEnd),
          );
          const systemExit = easeSoft(normalize(progress, 0.875, 0.975));
          const arcReveal = easeOut(normalize(progress, 0.875, 0.975));
          const markReveal = easeOut(normalize(progress, 0.925, 0.995));
          const penTravel = easeSoft(normalize(progress, 0.01, 0.71));
          const penExit = easeSoft(normalize(progress, 0.71, 0.84));
          const phase =
            progress < SCENE_PHASES.enterEnd
              ? "enter"
              : progress < SCENE_PHASES.buildEnd
                ? "build"
                : progress < SCENE_PHASES.holdEnd
                  ? "hold"
                  : "exit";

          scope.dataset.corporatePhase = phase;
          scope.style.setProperty("--wc-corporate-progress", progress.toFixed(4));

          if (copy) {
            gsap.set(copy, {
              autoAlpha: copyIn * (1 - copyOut),
              xPercent: (1 - copyIn) * -7 - copyOut * 5,
              yPercent: (1 - copyIn) * 8 - copyOut * 3,
            });
          }

          gsap.set(system, {
            autoAlpha: enter * (1 - systemExit),
            scale: 0.975 + enter * 0.025 - settle * 0.012 + exit * 0.04,
            xPercent: (1 - enter) * 3 - settle * 0.6,
            yPercent: (1 - enter) * 4 - settle * 0.8 + exit * 2.5,
            force3D: true,
          });

          if (grid) {
            gsap.set(grid, {
              opacity: 0.12 + gridIn * 0.88 - settle * 0.2,
              scale: 0.975 + gridIn * 0.025 - settle * 0.012 + exit * 0.1,
              rotationZ: exit * 10,
              borderRadius: `${exit * 50}%`,
              force3D: true,
            });
          }

          if (gridX) {
            gsap.set(gridX, {
              scaleX: gridIn,
              transformOrigin: "0% 50%",
            });
          }

          if (gridY) {
            gsap.set(gridY, {
              scaleY: gridIn,
              transformOrigin: "50% 0%",
            });
          }

          (Object.keys(PIECE_REVEALS) as CorporatePieceName[]).forEach(
            (name, index) => {
              const piece = pieces[name];

              if (!piece) {
                return;
              }

              const range = PIECE_REVEALS[name];
              const reveal = easeOut(
                normalize(progress, range.start, range.end),
              );
              const motion = PIECE_MOTION[name];
              const assembledRotation = motion.rotation * 0.72;
              const exitAngle = (index - 1.5) * 2.4;

              gsap.set(piece, {
                autoAlpha: reveal * (1 - systemExit),
                xPercent:
                  (1 - reveal) * motion.xPercent -
                  settle * motion.xPercent * 0.07 +
                  exit * (index - 1.5) * 3.2,
                yPercent:
                  (1 - reveal) * motion.yPercent - settle * (index + 1) * 0.32,
                rotationZ:
                  (1 - reveal) * motion.rotation +
                  reveal * assembledRotation * (1 - settle) +
                  settle * assembledRotation * 0.12 +
                  exit * exitAngle,
                scale: 0.93 + reveal * 0.07 - settle * 0.004,
                force3D: true,
              });
            },
          );

          if (settleMark) {
            gsap.set(settleMark, {
              autoAlpha: build * (1 - systemExit),
              rotationZ: -45 + settle * 45,
              scale: 0.7 + build * 0.3 + settle * 0.08,
            });
          }

          if (pen) {
            gsap.set(pen, {
              autoAlpha: 1 - penExit,
              x: gsap.utils.interpolate(
                systemWidth * 0.82,
                systemWidth * 0.14,
                penTravel,
              ),
              y: gsap.utils.interpolate(
                -systemHeight * 0.03,
                systemHeight * 0.67,
                penTravel,
              ),
              rotationZ: -10 + penTravel * 15 + penExit * 4,
              force3D: true,
            });
          }

          if (dusk) {
            gsap.set(dusk, {
              autoAlpha: exit,
            });
          }

          if (orbitBridge) {
            gsap.set(orbitBridge, {
              autoAlpha: arcReveal,
              scale: 0.93 + arcReveal * 0.07,
              rotationZ: (1 - arcReveal) * -4,
              force3D: true,
            });
          }

          arcs.forEach((arc, index) => {
            gsap.set(arc, {
              opacity: arcReveal * (0.34 + index * 0.2),
              scaleX: 1.24 - arcReveal * 0.24 - index * 0.025,
              scaleY: 0.76 + arcReveal * 0.24 + index * 0.025,
              rotationZ: (1 - arcReveal) * (index % 2 === 0 ? -14 : 11),
              force3D: true,
            });
          });

          if (orbitMark) {
            gsap.set(orbitMark, {
              autoAlpha: markReveal,
              scale: 0.78 + markReveal * 0.22,
              rotationZ: (1 - markReveal) * -7,
              force3D: true,
            });
          }

          document.documentElement.toggleAttribute(
            "data-corporate-orbit-bridge",
            exit > 0.46 && progress < 0.999,
          );
        };

        const trigger = ScrollTrigger.create({
          trigger: scene,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            systemWidth = Math.max(system.clientWidth, 1);
            systemHeight = Math.max(system.clientHeight, 1);
            render(self.progress);
          },
          onUpdate: (self) => render(self.progress),
          onLeave: () => {
            document.documentElement.removeAttribute(
              "data-corporate-orbit-bridge",
            );
          },
          onLeaveBack: () => {
            document.documentElement.removeAttribute(
              "data-corporate-orbit-bridge",
            );
          },
        });

        render(trigger.progress);

        return () => {
          trigger.kill();
          document.documentElement.removeAttribute(
            "data-corporate-orbit-bridge",
          );
          scope.style.removeProperty("--wc-corporate-progress");
          scope.removeAttribute("data-corporate-phase");
          gsap.set(
            [
              copy,
              system,
              grid,
              gridX,
              gridY,
              settleMark,
              pen,
              dusk,
              orbitBridge,
              orbitMark,
              ...arcs,
              ...Object.values(pieces),
            ],
            {
              clearProps:
                "opacity,visibility,transform,transform-origin,border-radius",
            },
          );
        };
      });

      return () => {
        media.revert();
        document.documentElement.removeAttribute(
          "data-corporate-orbit-bridge",
        );
      };
    },
    { scope: scopeRef },
  );

  return (
    <div
      ref={scopeRef}
      className="wc-refined-corporate__motion"
      data-scene-motion-phases="0,.15,.70,.85,1"
    >
      {children}
    </div>
  );
}
