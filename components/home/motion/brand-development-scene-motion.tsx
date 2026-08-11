"use client";

import { useRef, type ReactNode } from "react";

import { BRAND_DEVELOPMENT_BEATS } from "@/lib/home/brand-development-manifest";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

type BrandDevelopmentSceneMotionProps = {
  children: ReactNode;
};

const DESKTOP_MOTION_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";
const BEAT_BY_ID = new Map<
  string,
  (typeof BRAND_DEVELOPMENT_BEATS)[number]
>(BRAND_DEVELOPMENT_BEATS.map((beat) => [beat.id, beat]));

function normalizedProgress(progress: number, start: number, end: number) {
  return gsap.utils.clamp(0, 1, (progress - start) / (end - start));
}

export function BrandDevelopmentSceneMotion({
  children,
}: BrandDevelopmentSceneMotionProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const scene = scope?.closest<HTMLElement>("[data-home-scene-id]");

      if (!scope || !scene) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(DESKTOP_MOTION_QUERY, () => {
        const intro = scope.querySelector<HTMLElement>(
          "[data-brand-development-intro]",
        );
        const beatElements = gsap.utils.toArray<HTMLElement>(
          "[data-brand-development-beat]",
          scope,
        );
        const navItems = gsap.utils.toArray<HTMLElement>(
          "[data-brand-development-nav]",
          scope,
        );
        const exitLine = scope.querySelector<HTMLElement>(
          "[data-brand-development-exit-line]",
        );
        const exitMaterials = gsap.utils.toArray<HTMLElement>(
          "[data-line-material]",
          scope,
        );
        const easeOut = gsap.parseEase("power2.out");
        const easeSoft = gsap.parseEase("power2.inOut");
        let activeIndex = -1;

        const setActiveBeat = (progress: number) => {
          let nextIndex = 0;

          BRAND_DEVELOPMENT_BEATS.forEach((beat, index) => {
            if (progress >= beat.progress[0]) {
              nextIndex = index;
            }
          });

          if (nextIndex === activeIndex) {
            return;
          }

          activeIndex = nextIndex;
          scope.dataset.brandDevelopmentBeat =
            BRAND_DEVELOPMENT_BEATS[nextIndex].id;
          navItems.forEach((item, index) => {
            item.toggleAttribute("data-active", index === nextIndex);
          });
        };

        const renderProgress = (rawProgress: number) => {
          const progress = gsap.utils.clamp(0, 1, rawProgress);
          scope.style.setProperty(
            "--wc-brand-development-progress",
            progress.toFixed(4),
          );
          setActiveBeat(progress);

          const introExit = easeSoft(normalizedProgress(progress, 0.04, 0.17));

          if (intro) {
            gsap.set(intro, {
              autoAlpha: 1 - introExit,
              y: introExit * -28,
            });
          }

          beatElements.forEach((element, index) => {
            const beatId = element.dataset.brandDevelopmentBeat;
            const beat = beatId ? BEAT_BY_ID.get(beatId) : undefined;

            if (!beat) {
              return;
            }

            const local = normalizedProgress(
              progress,
              beat.progress[0],
              beat.progress[1],
            );
            const enter =
              index === 0 ? 1 : easeOut(normalizedProgress(local, 0, 0.2));
            const exit =
              index === beatElements.length - 1
                ? 0
                : easeSoft(normalizedProgress(local, 0.72, 1));
            const opacity = enter * (1 - exit);
            const direction = index % 2 === 0 ? 1 : -1;

            gsap.set(element, {
              autoAlpha: opacity,
              xPercent:
                (1 - enter) * direction * 8 + exit * direction * -5,
              yPercent: (1 - enter) * 5 + exit * -3,
              rotationZ: (1 - enter) * direction * 1.4,
              scale: 0.965 + enter * 0.035 - exit * 0.018,
              zIndex: index === activeIndex ? 2 : 1,
              force3D: true,
            });
          });

          const exitProgress = easeSoft(
            normalizedProgress(progress, 0.84, 1),
          );

          if (exitLine) {
            gsap.set(exitLine, {
              autoAlpha: exitProgress,
              yPercent: (1 - exitProgress) * 80,
            });
          }

          exitMaterials.forEach((material, index) => {
            gsap.set(material, {
              scaleX: gsap.utils.clamp(
                0,
                1,
                exitProgress * (index === 0 ? 1.18 : 1.05) - index * 0.08,
              ),
              transformOrigin: index === 0 ? "0% 50%" : "100% 50%",
            });
          });
        };

        const trigger = ScrollTrigger.create({
          trigger: scene,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onRefresh: (self) => renderProgress(self.progress),
          onUpdate: (self) => renderProgress(self.progress),
        });

        renderProgress(trigger.progress);

        return () => {
          trigger.kill();
          gsap.set([intro, exitLine, ...beatElements, ...exitMaterials], {
            clearProps:
              "opacity,visibility,transform,zIndex,transformOrigin",
          });
          navItems.forEach((item) => item.removeAttribute("data-active"));
          scope.style.removeProperty("--wc-brand-development-progress");
          scope.removeAttribute("data-brand-development-beat");
        };
      });

      return () => media.revert();
    },
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef} className="wc-brand-development-motion">
      {children}
    </div>
  );
}
