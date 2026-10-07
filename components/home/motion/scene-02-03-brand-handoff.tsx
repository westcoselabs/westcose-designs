"use client";

import Image from "next/image";
import { useRef } from "react";

import { FALLING_STUDIO_HANDOFF } from "@/lib/home/falling-studio-manifest";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

const HANDOFF_MOTION_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";
const TRANSITION_START_SCENE_PROGRESS = 0.885;

function normalizedProgress(progress: number, start: number, end: number) {
  return gsap.utils.clamp(0, 1, (progress - start) / (end - start));
}

function getLayoutOffset(element: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  if (current === ancestor) {
    return { x, y };
  }

  const elementRect = element.getBoundingClientRect();
  const ancestorRect = ancestor.getBoundingClientRect();

  return {
    x: elementRect.left - ancestorRect.left,
    y: elementRect.top - ancestorRect.top,
  };
}

export function Scene0203BrandHandoff() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const overlay = overlayRef.current;

      if (!overlay) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(HANDOFF_MOTION_QUERY, () => {
        const scene02 = document.querySelector<HTMLElement>(
          '[data-home-scene-id="scene-02"]',
        );
        const scene03 = document.querySelector<HTMLElement>(
          '[data-home-scene-id="scene-03"]',
        );
        const scene03Stage = scene03?.querySelector<HTMLElement>(
          ".wc-home-scene__stage",
        );
        const receiver = scene03?.querySelector<HTMLElement>(
          "[data-brand-development-handoff-receiver]",
        );
        const sheet = overlay.querySelector<HTMLElement>(
          "[data-brand-handoff-sheet]",
        );
        const foldTop = overlay.querySelector<HTMLElement>(
          '[data-brand-handoff-fold="top"]',
        );
        const foldBottom = overlay.querySelector<HTMLElement>(
          '[data-brand-handoff-fold="bottom"]',
        );
        const crease = overlay.querySelector<HTMLElement>(
          "[data-brand-handoff-crease]",
        );
        const shadow = overlay.querySelector<HTMLElement>(
          "[data-brand-handoff-shadow]",
        );

        if (
          !scene02 ||
          !scene03 ||
          !scene03Stage ||
          !receiver ||
          !sheet ||
          !foldTop ||
          !foldBottom ||
          !crease ||
          !shadow
        ) {
          return;
        }

        const easeReveal = gsap.parseEase("power2.out");
        const easeFold = gsap.parseEase("power2.inOut");
        const easeGravity = gsap.parseEase("power3.in");
        const easeAttach = gsap.parseEase("power2.inOut");
        let transitionDistance = 1;
        let baseWidth = 1;
        let baseHeight = 1;
        let startX = 0;
        let startY = 0;
        let receiverX = 0;
        let receiverY = 0;
        let receiverScaleX = 1;
        let receiverScaleY = 1;

        const measure = () => {
          const scene02Rect = scene02.getBoundingClientRect();
          const scene03Rect = scene03.getBoundingClientRect();
          const scene02Top = scene02Rect.top + window.scrollY;
          const scene03Top = scene03Rect.top + window.scrollY;
          const scene02Travel = Math.max(
            scene02.offsetHeight - window.innerHeight,
            0,
          );
          const transitionStart =
            scene02Top + scene02Travel * TRANSITION_START_SCENE_PROGRESS;
          const receiverOffset = getLayoutOffset(receiver, scene03Stage);

          transitionDistance = Math.max(scene03Top - transitionStart, 1);
          baseWidth = Math.max(sheet.offsetWidth, 1);
          baseHeight = Math.max(sheet.offsetHeight, 1);
          startX = (window.innerWidth - baseWidth) / 2;
          startY = (window.innerHeight - baseHeight) / 2;
          receiverX = receiverOffset.x;
          receiverY = receiverOffset.y;
          receiverScaleX = receiver.offsetWidth / baseWidth;
          receiverScaleY = receiver.offsetHeight / baseHeight;
        };

        const renderProgress = (rawProgress: number) => {
          const progress = gsap.utils.clamp(0, 1, rawProgress);
          const reveal = easeReveal(normalizedProgress(progress, 0, 0.1));
          const fold = easeFold(normalizedProgress(progress, 0.14, 0.3));
          const gravity = easeGravity(
            normalizedProgress(progress, 0.22, 0.43),
          );
          const attach = easeAttach(
            normalizedProgress(progress, 0.38, 0.53),
          );
          const unfold = easeFold(
            normalizedProgress(progress, 0.5, 0.84),
          );
          const crossfade = easeFold(
            normalizedProgress(progress, 0.86, 1),
          );
          const foldAmount = fold * (1 - unfold);
          const scene03ViewportTop = transitionDistance * (1 - progress);
          const attachedX = receiverX;
          const attachedY = scene03ViewportTop + receiverY;
          const fallDistance =
            window.innerHeight + baseHeight * 0.14 - startY;
          const freeX = startX + window.innerWidth * 0.026 * gravity;
          const freeY =
            startY + (1 - reveal) * window.innerHeight * 0.06 + gravity * fallDistance;
          const freeScale =
            (0.78 + reveal * 0.22) *
            (1 - fold * 0.045) *
            (1 - gravity * 0.08);
          const x = gsap.utils.interpolate(freeX, attachedX, attach);
          const y = gsap.utils.interpolate(freeY, attachedY, attach);
          const scaleX = gsap.utils.interpolate(
            freeScale,
            receiverScaleX,
            attach,
          );
          const scaleY = gsap.utils.interpolate(
            freeScale,
            receiverScaleY,
            attach,
          );
          const freeRotation = (1 - reveal) * -3 + gravity * 3.6;
          const rotationZ = gsap.utils.interpolate(
            freeRotation,
            0,
            attach,
          );
          const overlayOpacity = reveal * (1 - crossfade);

          overlay.dataset.handoffPhase =
            progress < 0.14
              ? "present"
              : progress < 0.38
                ? "fold"
                : progress < 0.86
                  ? "land"
                  : "resolve";

          gsap.set(overlay, {
            autoAlpha: overlayOpacity,
          });
          gsap.set(sheet, {
            x,
            y,
            scaleX,
            scaleY,
            rotationZ,
            transformOrigin: "0% 0%",
            force3D: true,
          });
          gsap.set(foldTop, {
            rotationX: foldAmount * 70,
            transformOrigin: "50% 100%",
            force3D: true,
          });
          gsap.set(foldBottom, {
            rotationX: foldAmount * -70,
            transformOrigin: "50% 0%",
            force3D: true,
          });
          gsap.set(crease, {
            opacity: reveal * foldAmount * (1 - crossfade),
            scaleX: 0.72 + foldAmount * 0.28,
          });
          gsap.set(shadow, {
            opacity: reveal * (1 - foldAmount * 0.68) * (1 - crossfade),
            scale: 0.82 + reveal * 0.18 - gravity * 0.08,
            y: 18 + gravity * 24,
          });
          gsap.set(receiver, {
            opacity: crossfade,
          });
        };

        measure();

        const trigger = ScrollTrigger.create({
          trigger: scene02,
          start: () =>
            `top+=${
              Math.max(scene02.offsetHeight - window.innerHeight, 0) *
              TRANSITION_START_SCENE_PROGRESS
            } top`,
          endTrigger: scene03,
          end: "top top",
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measure();
            renderProgress(self.progress);
          },
          onUpdate: (self) => renderProgress(self.progress),
        });

        renderProgress(trigger.progress);

        return () => {
          trigger.kill();
          overlay.removeAttribute("data-handoff-phase");
          gsap.set(
            [overlay, sheet, foldTop, foldBottom, crease, shadow, receiver],
            {
              clearProps:
                "opacity,transform,transformOrigin,visibility,zIndex",
            },
          );
        };
      });

      return () => media.revert();
    },
    { scope: overlayRef },
  );

  return (
    <div
      ref={overlayRef}
      className="wc-scene-02-03-handoff"
      aria-hidden="true"
    >
      <div
        className="wc-scene-02-03-handoff__sheet"
        data-brand-handoff-sheet
      >
        <span
          className="wc-scene-02-03-handoff__shadow"
          data-brand-handoff-shadow
        />
        <span
          className="wc-scene-02-03-handoff__fold wc-scene-02-03-handoff__fold--top"
          data-brand-handoff-fold="top"
        >
          <Image
            src={FALLING_STUDIO_HANDOFF.src}
            width={FALLING_STUDIO_HANDOFF.width}
            height={FALLING_STUDIO_HANDOFF.height}
            sizes="(min-width: 64rem) 44rem, 56vw"
            alt=""
            loading="eager"
          />
        </span>
        <span
          className="wc-scene-02-03-handoff__fold wc-scene-02-03-handoff__fold--bottom"
          data-brand-handoff-fold="bottom"
        >
          <Image
            src={FALLING_STUDIO_HANDOFF.src}
            width={FALLING_STUDIO_HANDOFF.width}
            height={FALLING_STUDIO_HANDOFF.height}
            sizes="(min-width: 64rem) 44rem, 56vw"
            alt=""
            loading="eager"
          />
        </span>
        <span
          className="wc-scene-02-03-handoff__crease"
          data-brand-handoff-crease
        />
      </div>
    </div>
  );
}
