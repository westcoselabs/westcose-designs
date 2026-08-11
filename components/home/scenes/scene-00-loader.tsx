"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useHomeExperience } from "@/lib/home/home-experience-context";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

const FONT_READINESS_TIMEOUT_MS = 5_000;
const WESTCOSE_MONOGRAM_PATH =
  "M311.84 426.84l23.14 13.36v187.2l-23.14 13.36c28.39 16.39 17.9 10.34 46.31 26.74l60.12-34.72 5.03-2.9 69.45-40.1v53.48l-23.14 13.36c56.86 32.83 96.19 55.54 138.93 80.22 46.09-26.61 101.85-58.81 138.93-80.22-31.64-18.27-38.85-22.43-69.46-40.11v26.73c-39.63 22.88-8.76 5.06-69.47 40.11-38.17-22.04-12.76-7.37-69.47-40.11v-80.21c28.4-16.4 17.93-10.35 46.32-26.74v80.22l23.16 13.37 23.16-13.37v-80.22c7.68 4.44 141.99 81.99 162.09 93.59 28.41-16.4 17.94-10.36 46.31-26.74l-23.14-13.36v-187.2l23.14-13.36c-28.38-16.39-17.91-10.34-46.31-26.74l-23.14 13.36v187.2c-28.72-16.59-112.49-64.95-138.94-80.23v-106.96l-23.16-13.37-23.16 13.37v106.96c-16.2 9.35-30.12 17.39-46.32 26.74v-160.44c67.03-38.7 8.34-4.81 69.47-40.11 61.25 35.37 3.03 1.75 69.47 40.11v106.96c28.4 16.4 17.92 10.35 46.31 26.74v-133.71l23.15-13.36c-43.14-24.91-96.78-55.88-138.93-80.22-22.73 13.12-122.24 70.59-138.93 80.22l23.14 13.36v187.19c-28.44 16.42-17.9 10.33-46.31 26.74v-187.2l-23.14-13.36c-28.4 16.4-17.94 10.36-46.31 26.74Z";
const WESTCOSE_MONOGRAM_TO_LOADER_VIEWBOX =
  "matrix(.15625 0 0 .15625 -34.375 -34.375)";

export function Scene00Loader() {
  const rootRef = useRef<HTMLElement>(null);
  const dismissalStartedRef = useRef(false);
  const dismissalTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(
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
      gsap.set("[data-loader-stroke]", {
        strokeDasharray: 1,
        strokeDashoffset: prefersReducedMotion ? 0 : 1,
      });

      if (prefersReducedMotion) {
        gsap.set("[data-loader-guide], [data-loader-mark]", { opacity: 1 });
        return;
      }

      gsap
        .timeline()
        .to("[data-loader-guide]", {
          opacity: 1,
          duration: 0.22,
          stagger: 0.045,
          ease: "power1.out",
        })
        .to(
          "[data-loader-stroke]",
          {
            strokeDashoffset: 0,
            duration: 0.72,
            stagger: 0.08,
            ease: "power2.inOut",
          },
          0.08,
        )
        .to(
          "[data-loader-mark]",
          { opacity: 1, duration: 0.3, ease: "power1.out" },
          0.34,
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

    if (prefersReducedMotion) {
      gsap.set(root, { autoAlpha: 0 });
      finishOpening();
      return;
    }

    const select = gsap.utils.selector(root);
    dismissalTimelineRef.current = gsap
      .timeline({ onComplete: () => finishOpening() })
      .to(
        select("[data-loader-meta], [data-loader-construction]"),
        {
          opacity: 0,
          duration: 0.24,
          ease: "power1.out",
          stagger: 0.02,
        },
        0,
      )
      .to(
        select("[data-loader-mask]"),
        {
          scale: 19,
          duration: 1.14,
          transformOrigin: "50% 50%",
          ease: "power3.inOut",
        },
        0.04,
      )
      .to(
        root,
        { autoAlpha: 0, duration: 0.12, ease: "none" },
        1.02,
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
          className="wc-scene-loader__mask"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          data-loader-mask
        >
          <defs>
            <mask id="wc-opening-mask" maskUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="white" />
              <path
                d={WESTCOSE_MONOGRAM_PATH}
                fill="black"
                transform={WESTCOSE_MONOGRAM_TO_LOADER_VIEWBOX}
              />
            </mask>
          </defs>
          <rect
            width="100"
            height="100"
            fill="#0c0c0b"
            mask="url(#wc-opening-mask)"
          />
        </svg>

      <div className="wc-scene-loader__grid" aria-hidden="true" />
      <div className="wc-scene-loader__frame">
        <p className="wc-scene-loader__studio" data-loader-meta>
          WestCose Design Studio
        </p>

        <div
          className="wc-scene-loader__construction"
          aria-hidden="true"
          data-loader-construction
        >
          <span className="wc-scene-loader__guide" data-loader-guide />
          <span className="wc-scene-loader__guide" data-loader-guide />
          <svg viewBox="0 0 100 100">
            <rect
              x="9"
              y="9"
              width="82"
              height="82"
              pathLength="1"
              data-loader-stroke
            />
            <path
              d={WESTCOSE_MONOGRAM_PATH}
              pathLength="1"
              transform={WESTCOSE_MONOGRAM_TO_LOADER_VIEWBOX}
              data-loader-stroke
            />
          </svg>
          <span
            className="wc-scene-loader__final-mark"
            aria-hidden="true"
            data-loader-mark
          />
        </div>

        <p className="wc-scene-loader__location" data-loader-meta>
          Bakersfield, California
        </p>
        <a
          className="wc-scene-loader__skip"
          href="#scene-01"
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
