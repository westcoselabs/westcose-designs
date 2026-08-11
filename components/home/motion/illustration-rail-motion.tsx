"use client";

import { useRef, type ReactNode } from "react";

import { useHomeExperience } from "@/lib/home/home-experience-context";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

const ENTER_END = 0.15;
const RAIL_TRAVEL_START = 0.1;
const RAIL_TRAVEL_END = 0.7;
const HANDOFF_START = 0.85;

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

export function IllustrationRailMotion({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(-1);
  const prefersReducedMotion = useReducedMotionPreference();
  const { setLiquidAccent, setLiquidEnergy } = useHomeExperience();

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const scene = scope?.closest<HTMLElement>("[data-home-scene-id]");
      const viewport = scope?.querySelector<HTMLElement>(
        "[data-illustration-viewport]",
      );
      const track = scope?.querySelector<HTMLElement>(
        "[data-illustration-track]",
      );
      const artworks = gsap.utils.toArray<HTMLElement>(
        "[data-illustration-item]",
        scope ?? undefined,
      );
      const artworkPlanes = gsap.utils.toArray<HTMLElement>(
        "[data-illustration-plane]",
        scope ?? undefined,
      );
      const finalArtwork = artworks.at(-1);
      const finalPlane = artworkPlanes.at(-1);
      const header = scope?.querySelector<HTMLElement>(
        ".wc-scene-illustrations__header",
      );
      const handoff = scope?.querySelector<HTMLElement>(
        "[data-illustration-handoff]",
      );

      if (!scope || !scene || !viewport || !track || artworks.length === 0) {
        return;
      }

      if (prefersReducedMotion) {
        gsap.set(track, { clearProps: "transform" });
        artworks.forEach((artwork) => {
          artwork.style.removeProperty("--wc-artwork-focus");
          artwork.removeAttribute("data-active");
        });
        return;
      }

      const setTrackX = gsap.quickSetter(track, "x", "px");
      let startX = 0;
      let endX = 0;
      let resizeFrameId: number | null = null;

      const measure = () => {
        const viewportCenter = viewport.clientWidth / 2;
        const firstArtwork = artworks[0];
        const lastArtwork = artworks.at(-1);

        if (!firstArtwork || !lastArtwork) {
          return;
        }

        startX =
          viewportCenter -
          (firstArtwork.offsetLeft + firstArtwork.offsetWidth / 2);
        endX =
          viewportCenter -
          (lastArtwork.offsetLeft + lastArtwork.offsetWidth / 2);
      };

      const setActiveArtwork = (index: number) => {
        if (index === activeIndexRef.current) {
          return;
        }

        activeIndexRef.current = index;

        artworks.forEach((artwork, artworkIndex) => {
          const isActive = artworkIndex === index;
          artwork.toggleAttribute("data-active", isActive);

          if (isActive) {
            const accent = artwork.dataset.accent;
            if (accent) setLiquidAccent(hexToRgb(accent));
          }
        });
      };

      const render = (sceneProgress: number) => {
        const enterProgress = gsap.parseEase("power2.out")(
          gsap.utils.clamp(0, 1, sceneProgress / ENTER_END),
        );
        const railProgress = gsap.utils.clamp(
          0,
          1,
          (sceneProgress - RAIL_TRAVEL_START) /
            (RAIL_TRAVEL_END - RAIL_TRAVEL_START),
        );
        const trackX = gsap.utils.interpolate(startX, endX, railProgress);
        const viewportCenter = viewport.clientWidth / 2;
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        setTrackX(trackX);

        artworks.forEach((artwork, index) => {
          const artworkCenter =
            artwork.offsetLeft + artwork.offsetWidth / 2 + trackX;
          const distance = Math.abs(artworkCenter - viewportCenter);
          const normalizedDistance =
            distance / Math.max(viewport.clientWidth, 1);
          const focus = gsap.utils.clamp(0, 1, 1 - normalizedDistance * 1.8);

          artwork.style.setProperty("--wc-artwork-focus", focus.toFixed(3));

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        setActiveArtwork(nearestIndex);
        const transitionProgress = gsap.utils.clamp(
          0,
          1,
          (sceneProgress - HANDOFF_START) / (1 - HANDOFF_START),
        );
        const holdProgress = gsap.utils.clamp(
          0,
          1,
          (sceneProgress - RAIL_TRAVEL_END) / (HANDOFF_START - RAIL_TRAVEL_END),
        );
        const tiltProgress = gsap.parseEase("power2.inOut")(
          gsap.utils.clamp(0, 1, transitionProgress / 0.52),
        );
        const dropProgress = gsap.parseEase("power2.in")(
          gsap.utils.clamp(0, 1, (transitionProgress - 0.26) / 0.74),
        );
        const supportsSpatialTransition =
          window.innerWidth >= 768 &&
          CSS.supports("transform-style", "preserve-3d");

        scope.toggleAttribute(
          "data-transition-active",
          transitionProgress > 0.001,
        );

        if (finalPlane) {
          gsap.set(finalPlane, {
            y: dropProgress * window.innerHeight * 1.06,
            rotationX: supportsSpatialTransition ? tiltProgress * 68 : 0,
            rotationZ: supportsSpatialTransition ? tiltProgress * -2.5 : 0,
            z: supportsSpatialTransition ? tiltProgress * -260 : 0,
            scale: 1 - tiltProgress * 0.09,
            transformOrigin: "50% 72%",
            force3D: supportsSpatialTransition,
          });
        }

        artworks.forEach((artwork) => {
          if (artwork === finalArtwork) {
            return;
          }

          gsap.set(artwork, {
            opacity: Math.max(0, 0.28 * (1 - tiltProgress)),
            scale: 1 - tiltProgress * 0.1,
            z: supportsSpatialTransition ? tiltProgress * -380 : 0,
            force3D: supportsSpatialTransition,
          });
        });

        if (header) {
          gsap.set(header, {
            opacity: enterProgress * (1 - tiltProgress),
            y: (1 - enterProgress) * 18 + tiltProgress * -24,
          });
        }

        gsap.set(viewport, {
          opacity: 0.72 + enterProgress * 0.28,
          perspectiveOrigin: `50% ${50 + tiltProgress * 34}%`,
        });

        if (handoff) {
          handoff.style.setProperty(
            "--wc-handoff-progress",
            dropProgress.toFixed(3),
          );
        }

        setLiquidEnergy(
          0.18 +
            Math.sin(railProgress * Math.PI) * 0.2 +
            holdProgress * 0.08 +
            tiltProgress * 0.12 +
            dropProgress * 0.08,
        );
      };

      measure();
      render(0);

      const trigger = ScrollTrigger.create({
        trigger: scene,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          render(self.progress);
        },
        onUpdate: (self) => render(self.progress),
      });

      const scheduleRefresh = () => {
        if (resizeFrameId !== null) {
          return;
        }

        resizeFrameId = window.requestAnimationFrame(() => {
          resizeFrameId = null;
          ScrollTrigger.refresh();
        });
      };

      const resizeObserver = new ResizeObserver(scheduleRefresh);
      resizeObserver.observe(viewport);
      resizeObserver.observe(track);

      let imagesActive = true;
      const imageReadiness = Array.from(track.querySelectorAll("img")).map(
        (image) =>
          image.complete
            ? Promise.resolve()
            : image.decode().catch(() => undefined),
      );

      Promise.all(imageReadiness).then(() => {
        if (imagesActive) scheduleRefresh();
      });

      return () => {
        imagesActive = false;
        resizeObserver.disconnect();
        trigger.kill();

        if (resizeFrameId !== null) {
          window.cancelAnimationFrame(resizeFrameId);
        }

        gsap.set(track, { clearProps: "transform" });
        gsap.set([viewport, header, ...artworks, ...artworkPlanes], {
          clearProps: "opacity,transform,perspective-origin",
        });
        artworks.forEach((artwork) => {
          artwork.style.removeProperty("--wc-artwork-focus");
          artwork.removeAttribute("data-active");
        });
        handoff?.style.removeProperty("--wc-handoff-progress");
        scope.removeAttribute("data-transition-active");
        activeIndexRef.current = -1;
      };
    },
    {
      scope: scopeRef,
      dependencies: [prefersReducedMotion, setLiquidAccent, setLiquidEnergy],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={scopeRef} className="wc-scene-illustrations__motion">
      {children}
    </div>
  );
}
