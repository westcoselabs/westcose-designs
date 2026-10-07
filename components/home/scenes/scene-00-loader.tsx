"use client";

import { useCallback, useEffect, useRef } from "react";
import { useHomeExperience } from "@/lib/home/home-experience-context";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";
import { WESTCOSE_MARK_PATH } from "@/lib/home/westcose-mark";

export function Scene00Loader() {
  const rootRef = useRef<HTMLElement>(null);
  const readyRef = useRef(false);
  const imageReadyRef = useRef(false);
  const { completeOpening, heroVisualReady, openingComplete } = useHomeExperience();
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    let active = true;
    const image = document.querySelector<HTMLImageElement>(".wc-coastal-hero__art img");
    Promise.all([document.fonts.ready, image?.decode().catch(() => undefined)]).then(() => {
      if (active) { imageReadyRef.current = true; readyRef.current = heroVisualReady; }
    });
    readyRef.current = heroVisualReady && imageReadyRef.current;
    return () => { active = false; };
  }, [heroVisualReady]);
  const finish = useCallback((focus = false) => {
    completeOpening();
    if (focus) requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("#scene-01-title")?.focus({ preventScroll: true });
    });
  }, [completeOpening]);

  useGSAP(() => {
    const root = rootRef.current;
    if (!root || openingComplete) return;
    if (location.hash || window.scrollY > 4) { finish(); return; }
    const select = gsap.utils.selector(root);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let waiting = 0;
    let deadline = 0;
    let revealLimit = 0;
    let exiting = false;
    const dismissal = gsap.timeline({ paused: true, onComplete: () => finish() })
      .to(select("[data-loader-meta], [data-loader-grid]"), { opacity: 0, duration: 0.25 }, 0)
      .to(select("[data-loader-fill], [data-loader-trace], [data-loader-ghost]"), { opacity: 0, duration: 0.12 }, 0)
      .to(select("[data-loader-aperture]"), { attr: { transform: "matrix(28 0 0 28 -1350 -1350)" }, duration: 0.75, ease: "power3.inOut" }, 0)
      .to(root, { autoAlpha: 0, duration: 0.18 }, 0.57);
    const exit = () => {
      if (exiting) return;
      exiting = true;
      clearInterval(waiting); clearTimeout(deadline);
      root.dataset.phase = "aperture";
      dismissal.play();
    };
    const timeline = gsap.timeline();
    if (reduced) {
      timeline.to(root, { opacity: 0, duration: 0.18, onComplete: () => finish() });
    } else {
      timeline.set(select("[data-loader-fill]"), { opacity: 0 })
        .set(select("[data-loader-trace]"), { strokeDashoffset: 1 })
        .to(select("[data-loader-grid]"), { opacity: 1, duration: 0.35 }, 0)
        .call(() => { root.dataset.phase = "outline"; }, [], 0.35)
        .to(select("[data-loader-trace]"), { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, 0.35)
        .call(() => { root.dataset.phase = "solid"; }, [], 1.05)
        .to(select("[data-loader-fill]"), { opacity: 1, duration: 0.45, ease: "power2.out" }, 1.05)
        .to(select("[data-loader-trace]"), { opacity: 0, duration: 0.2 }, 1.3)
        .call(() => {
          if (readyRef.current) exit();
          else waiting = window.setInterval(() => { if (readyRef.current) exit(); }, 50);
        }, [], 1.85);
      // The 750ms aperture is included in the four-second upper bound.
      deadline = window.setTimeout(exit, 3250);
      // A throttled animation ticker must not extend the wall-clock limit.
      revealLimit = window.setTimeout(() => finish(), 4000);
    }
    const skip = () => finish();
    document.querySelector(".wc-skip-link")?.addEventListener("click", skip);
    return () => {
      timeline.kill(); dismissal.kill(); clearInterval(waiting); clearTimeout(deadline); clearTimeout(revealLimit);
      document.body.style.overflow = previousOverflow;
      document.querySelector(".wc-skip-link")?.removeEventListener("click", skip);
    };
  }, { scope: rootRef, dependencies: [reduced, openingComplete, finish], revertOnUpdate: true });

  if (openingComplete) return null;
  return <>
    <section ref={rootRef} id="scene-00" className="wc-scene-loader wc-cinema-opening" aria-label="WestCose Designs opening" data-phase="construction">
      <svg className="wc-scene-loader__surface" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><mask id="wc-cinema-aperture" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }}>
          <rect width="100" height="100" fill="white" />
          <g transform="matrix(1 0 0 1 0 0)" data-loader-aperture><g transform="translate(41.5 41.166) scale(.035337)"><path d={WESTCOSE_MARK_PATH} fill="black" /></g></g>
        </mask></defs>
        <rect width="100" height="100" fill="#0c0c0b" mask="url(#wc-cinema-aperture)" />
        <g transform="translate(41.5 41.166) scale(.035337)">
          <path d={WESTCOSE_MARK_PATH} fill="#131412" data-loader-ghost />
          <path d={WESTCOSE_MARK_PATH} fill="none" stroke="#ece8dc" strokeWidth="1.6" pathLength="1" strokeDasharray="1" strokeDashoffset="1" data-loader-trace />
          <path d={WESTCOSE_MARK_PATH} fill="#ece8dc" style={{ opacity: 0 }} data-loader-fill />
        </g>
      </svg>
      <div className="wc-cinema-opening__grid" data-loader-grid aria-hidden="true"><i /><i /></div>
      <div className="wc-scene-loader__frame">
        <p className="wc-scene-loader__studio" data-loader-meta>WestCose Design Studio</p>
        <p className="wc-cinema-opening__edition" data-loader-meta>Independent by design</p>
        <p className="wc-scene-loader__location" data-loader-meta>Bakersfield, California</p>
        <a className="wc-scene-loader__skip" href="#scene-01" onClick={(event) => { event.preventDefault(); finish(true); }}>Skip intro</a>
      </div>
    </section>
    <noscript><style>{`.wc-scene-loader{display:none!important}.wc-site-header{visibility:visible!important;opacity:1!important;pointer-events:auto!important}`}</style></noscript>
  </>;
}
