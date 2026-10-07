"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useHomeExperience } from "@/lib/home/home-experience-context";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

const FONT_READINESS_TIMEOUT_MS = 5_000;
const WESTCOSE_MONOGRAM_MASK_SRC = "/brand/westcose-monogram.svg";
const WESTCOSE_MONOGRAM_SRC = "/brand/westcose-monogram-reversed.svg";

export function Scene00Loader() {
  const rootRef = useRef<HTMLElement>(null);
  const dismissalStartedRef = useRef(false);
  const dismissalTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(
    null,
  );
  const openingTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(
    null,
  );
  const [fontsReady, setFontsReady] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();
  const {
    completeOpening,
    heroVisualReady,
    openingComplete,
  } = useHomeExperience();

  useGSAP(
    () => {
      gsap.set("[data-loader-meta]", { opacity: 0 });
      gsap.set("[data-loader-mark]", {
        opacity: prefersReducedMotion ? 1 : 0,
        scale: prefersReducedMotion ? 1 : 0.9,
        y: prefersReducedMotion ? 0 : 14,
      });
      gsap.set("[data-loader-signal]", {
        opacity: prefersReducedMotion ? 1 : 0.56,
        scaleX: prefersReducedMotion ? 1 : 0,
        transformOrigin: "50% 50%",
      });

      if (prefersReducedMotion) {
        gsap.set("[data-loader-meta]", { opacity: 1 });
        return;
      }

      openingTimelineRef.current?.kill();
      openingTimelineRef.current = gsap
        .timeline()
        .to(
          "[data-loader-mark]",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.48,
            ease: "power3.out",
          },
          0,
        )
        .to(
          "[data-loader-signal]",
          { scaleX: 1, duration: 0.78, ease: "power2.inOut" },
          0.14,
        )
        .to(
          "[data-loader-meta]",
          {
            opacity: 1,
            duration: 0.42,
            stagger: 0.05,
            ease: "power1.out",
          },
          0.26,
        )
        .to(
          "[data-loader-mark]",
          {
            opacity: 0.14,
            x: -4,
            skewX: -1.4,
            duration: 0.045,
            ease: "none",
          },
          0.54,
        )
        .to(
          "[data-loader-mark]",
          { opacity: 1, x: 3, skewX: 0.8, duration: 0.04, ease: "none" },
          0.595,
        )
        .to(
          "[data-loader-mark]",
          {
            opacity: 0.28,
            x: -1,
            skewX: -0.35,
            duration: 0.035,
            ease: "none",
          },
          0.645,
        )
        .to(
          "[data-loader-mark]",
          { opacity: 1, x: 0, skewX: 0, duration: 0.08, ease: "none" },
          0.69,
        );
    },
    {
      scope: rootRef,
      dependencies: [prefersReducedMotion],
      revertOnUpdate: true,
    },
  );

  const finishOpening = useCallback(
    (focusHero = false) => {
      completeOpening();

      if (focusHero) {
        window.requestAnimationFrame(() => {
          const heroTitle = document.querySelector<HTMLElement>(
            "#scene-01-title",
          );
          heroTitle?.focus({ preventScroll: true });
          document.querySelector("#scene-01")?.scrollIntoView({ block: "start" });
        });
      }
    },
    [completeOpening],
  );

  const bypassOpening = useCallback(
    (focusHero = false) => {
      if (dismissalStartedRef.current) {
        return;
      }

      dismissalStartedRef.current = true;
      finishOpening(focusHero);
    },
    [finishOpening],
  );

  const dismissOpening = useCallback(() => {
    const root = rootRef.current;

    if (!root || dismissalStartedRef.current) {
      return;
    }

    dismissalStartedRef.current = true;
    openingTimelineRef.current?.kill();

    if (prefersReducedMotion) {
      gsap.set(root, { autoAlpha: 0 });
      finishOpening();
      return;
    }

    const select = gsap.utils.selector(root);
    dismissalTimelineRef.current = gsap
      .timeline({ onComplete: () => finishOpening() })
      .to(
        select("[data-loader-meta], [data-loader-signal]"),
        {
          opacity: 0,
          duration: 0.26,
          ease: "power1.out",
          stagger: 0.02,
        },
        0,
      )
      .to(
        select("[data-loader-mark]"),
        {
          opacity: 0.12,
          x: -5,
          skewX: -1.8,
          scale: 1.025,
          duration: 0.055,
          ease: "none",
        },
        0,
      )
      .to(
        select("[data-loader-mark]"),
        {
          opacity: 1,
          x: 4,
          skewX: 1.1,
          duration: 0.045,
          ease: "none",
        },
        0.065,
      )
      .to(
        select("[data-loader-mark]"),
        {
          opacity: 0.08,
          x: -2,
          skewX: -0.5,
          duration: 0.045,
          ease: "none",
        },
        0.12,
      )
      .to(
        select("[data-loader-mark]"),
        {
          opacity: 0,
          x: 0,
          skewX: 0,
          scale: 1.065,
          duration: 0.09,
          ease: "none",
        },
        0.175,
      )
      .to(
        select("[data-loader-aperture]"),
        {
          scale: 13.5,
          duration: 1.06,
          transformOrigin: "50% 50%",
          ease: "power4.inOut",
        },
        0.15,
      )
      .to(
        root,
        { autoAlpha: 0, duration: 0.16, ease: "none" },
        1.08,
      );
  }, [finishOpening, prefersReducedMotion]);

  useEffect(() => {
    let active = true;
    let timeoutId: number | null = null;

    const fontReadiness = document.fonts?.ready ?? Promise.resolve();
    const safetyRelease = new Promise<void>((resolve) => {
      timeoutId = window.setTimeout(resolve, FONT_READINESS_TIMEOUT_MS);
    });

    Promise.race([fontReadiness, safetyRelease]).then(() => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (active) {
        setFontsReady(true);
      }
    });

    return () => {
      active = false;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(
    () => () => {
      openingTimelineRef.current?.kill();
      dismissalTimelineRef.current?.kill();
    },
    [],
  );

  useEffect(() => {
    if (fontsReady && heroVisualReady) {
      dismissOpening();
    }
  }, [dismissOpening, fontsReady, heroVisualReady]);

  useEffect(() => {
    if (openingComplete) {
      return;
    }

    if (window.location.hash || window.scrollY > 4) {
      bypassOpening();
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const globalSkipLink = document.querySelector<HTMLAnchorElement>(
      ".wc-skip-link",
    );
    const handleGlobalSkip = () => bypassOpening();
    globalSkipLink?.addEventListener("click", handleGlobalSkip);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      globalSkipLink?.removeEventListener("click", handleGlobalSkip);
    };
  }, [bypassOpening, openingComplete]);

  if (openingComplete) {
    return null;
  }

  return (
    <>
      <section
        ref={rootRef}
        id="scene-00"
        className="wc-scene-loader"
        aria-label="WestCose Designs opening"
        aria-busy={!fontsReady || !heroVisualReady}
        data-ready={fontsReady && heroVisualReady}
      >
        <svg
          className="wc-scene-loader__surface"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          data-loader-surface
          data-loader-aperture
        >
          <defs>
            <radialGradient id="wc-loader-radial" cx="50%" cy="48%" r="38%">
              <stop offset="0%" stopColor="#ece8dc" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#ece8dc" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="wc-loader-tone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374f56" stopOpacity="0.05" />
              <stop offset="48%" stopColor="#0c0c0b" stopOpacity="0" />
              <stop offset="100%" stopColor="#784e35" stopOpacity="0.04" />
            </linearGradient>
            <mask
              id="wc-opening-aperture"
              className="wc-scene-loader__aperture-mask"
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill="white" />
              <image
                href={WESTCOSE_MONOGRAM_MASK_SRC}
                x="41.5"
                y="41.16"
                width="17"
                height="17.68"
                preserveAspectRatio="xMidYMid meet"
              />
            </mask>
          </defs>
          <g mask="url(#wc-opening-aperture)">
            <rect width="100" height="100" fill="#0c0c0b" />
            <rect width="100" height="100" fill="url(#wc-loader-radial)" />
            <rect width="100" height="100" fill="url(#wc-loader-tone)" />
          </g>
        </svg>
        <div className="wc-scene-loader__frame">
          <p className="wc-scene-loader__studio" data-loader-meta>
            WestCose Design Studio
          </p>

          <div className="wc-scene-loader__center" aria-hidden="true">
            <div
              className="wc-scene-loader__construction"
              data-loader-construction
            >
              <Image
                className="wc-scene-loader__mark"
                src={WESTCOSE_MONOGRAM_SRC}
                alt=""
                width={481}
                height={500}
                priority
                data-loader-mark
              />
              <span className="wc-scene-loader__signal" data-loader-signal />
            </div>
          </div>

          <p className="wc-scene-loader__location" data-loader-meta>
            Bakersfield, California
          </p>
          <a
            className="wc-scene-loader__skip"
            href="#scene-01"
            data-loader-meta
            onClick={(event) => {
              event.preventDefault();
              bypassOpening(true);
            }}
          >
            Skip intro
          </a>

          <p className="wc-sr-only">
            Preparing the opening artwork. Use Skip intro to continue immediately.
          </p>
        </div>
      </section>
      <noscript>
        <style>{`
          .wc-scene-loader { display: none !important; }
          .wc-site-header { visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; transform: none !important; }
          .wc-home-progress { display: none !important; }
        `}</style>
      </noscript>
    </>
  );
}
