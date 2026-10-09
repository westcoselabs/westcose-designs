"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { clamp01, phase, PAPER_HANDOFF_START, type PaperFrame } from "@/lib/home/cinematic-motion";
import { FALLING_STUDIO_MEDIA } from "@/lib/home/falling-studio-manifest";

const PaperCanvas = dynamic(() => import("./falling-paper-canvas"), { ssr: false });
class PaperBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type Props = { videoSrc: string; posterSrc: string; children: ReactNode };
export function FallingVideoScrub({ videoSrc, posterSrc, children }: Props) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const frame = useRef<PaperFrame>({ progress: 0, handoff: 0, entry: 0, entryRect: { x: .5, y: .5, width: .38 }, active: false, mobile: false, receiver: { x: .65, y: .5, width: .52 } });
  const [near, setNear] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [paperReady, setPaperReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const ready = useCallback(() => {
    setPaperReady(true);
    if (layerRef.current) layerRef.current.style.visibility = frame.current.active ? "visible" : "hidden";
  }, []);
  const fail = useCallback(() => setFailed(true), []);
  const invalidate = useCallback((draw?: () => void) => { frame.current.invalidate = draw; }, []);

  useEffect(() => {
    const scope = scopeRef.current;
    const scene = scope?.closest<HTMLElement>("[data-home-scene-id]");
    if (!scope || !scene) return;
    const mq = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    let webglAvailable = false;
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2");
      webglAvailable = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { /* A designed static layout also covers denied GPU contexts. */ }
    const update = () => {
      const constrained = navigator.hardwareConcurrency <= 2 || (memory !== undefined && memory <= 2);
      const enabled = webglAvailable && !mq.matches && !connection?.saveData && !constrained && !failed;
      setEnhanced(enabled);
      scene.dataset.paperMode = enabled ? "cinematic" : "static";
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    update(); mq.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "200% 0px" });
    observer.observe(scene);
    return () => { observer.disconnect(); mq.removeEventListener("change", update); delete scene.dataset.paperMode; };
  }, [failed]);

  useEffect(() => {
    const scope = scopeRef.current;
    const video = videoRef.current;
    const scene = scope?.closest<HTMLElement>("[data-home-scene-id]");
    const next = document.querySelector<HTMLElement>("#scene-03");
    const receiver = next?.querySelector<HTMLElement>("[data-brand-development-handoff-receiver]");
    const gallery = document.querySelector<HTMLElement>("#scene-01-5");
    const print = gallery?.querySelector<HTMLElement>("[data-illustration-item]:last-child [data-illustration-plane]");
    const printImage = print?.querySelector<HTMLElement>(".wc-scene-illustrations__image");
    if (!scope || !video || !scene || !next || !enhanced) return;
    const copy = scope.querySelector<HTMLElement>(".wc-scene-falling__copy");
    const legend = scope.querySelector<HTMLElement>(".wc-scene-falling__legend");
    let animation = 0;
    let target = 0;
    let smoothed = 0;
    let last = 0;
    let timer = 0;
    let decoded = false;
    let active = true;
    const readFrame = () => {
      if (!active || video.readyState < 2 || video.seeking) return;
      // loadeddata/seeked plus HAVE_CURRENT_DATA proves a decoded frame exists.
      // Paused Safari need not deliver another video-frame callback after seeked.
      requestAnimationFrame(() => { if (active) { decoded = true; scope.dataset.videoState = "ready"; } });
    };
    const seek = (time: number) => {
      animation = 0;
      if (!active || document.hidden || !frame.current.active) return;
      const dt = Math.min(64, time - (last || time - 16)); last = time;
      smoothed += (target - smoothed) * (1 - Math.exp(-dt / 75));
      if (video.readyState >= 2 && !video.seeking && Number.isFinite(video.duration)) {
        const nextTime = smoothed * Math.max(0, video.duration - 1 / 30);
        if (Math.abs(video.currentTime - nextTime) > 1 / 24) {
          video.currentTime = nextTime;
          readFrame();
        } else if (!decoded) readFrame();
      }
      if (Math.abs(target - smoothed) > .001 || video.seeking) animation = requestAnimationFrame(seek);
    };
    const schedule = () => { if (!animation) animation = requestAnimationFrame(seek); };
    const render = () => {
      const mobile = window.innerWidth < 768;
      // Canvas fills the layout viewport, which excludes the vertical scrollbar.
      const viewportWidth = layerRef.current?.getBoundingClientRect().width || document.documentElement.clientWidth;
      const top = scene.getBoundingClientRect().top + window.scrollY;
      const nextTop = next.getBoundingClientRect().top + window.scrollY;
      const pinEnd = top + scene.offsetHeight - window.innerHeight;
      const p = clamp01((window.scrollY - top) / Math.max(1, pinEnd - top));
      const galleryTop = gallery ? gallery.getBoundingClientRect().top + scrollY : top;
      const entryStart = gallery ? galleryTop + (gallery.offsetHeight - innerHeight) * .85 : top;
      // Phones pin the rail too, so its last card peels into the fall on every width.
      frame.current.entry = clamp01((scrollY - entryStart) / Math.max(1, top - entryStart));
      if (printImage && gallery) {
        let offset = 0;
        let element: HTMLElement | null = printImage;
        const stage = gallery.querySelector(".wc-home-scene__stage");
        while (element && element !== stage) { offset += element.offsetTop; element = element.offsetParent as HTMLElement | null; }
        frame.current.entryRect = { x: .5, y: (offset + printImage.offsetHeight / 2) / innerHeight, width: printImage.offsetWidth / viewportWidth };
        if (print) print.style.opacity = String(paperReady ? 1 - phase(frame.current.entry, .04, .1) : 1);
      }
      const hStart = top + (pinEnd - top) * PAPER_HANDOFF_START;
      const h = clamp01((window.scrollY - hStart) / Math.max(1, nextTop - hStart));
      frame.current.progress = p;
      frame.current.handoff = h;
      frame.current.mobile = mobile;
      frame.current.active = window.scrollY >= entryStart && window.scrollY < nextTop;
      if (receiver) {
        const rect = (receiver.querySelector("img") ?? receiver).getBoundingClientRect();
        frame.current.receiver = { x: (rect.left + rect.width / 2) / viewportWidth, y: (rect.top + rect.height / 2) / innerHeight, width: rect.width / viewportWidth };
        // Reveal the aligned receiver underneath the opaque sheet, then fade only
        // the sheet. Fading both surfaces would briefly darken the artwork.
        receiver.style.opacity = frame.current.active && h > 0 && h < .97 ? "0" : "1";
      }
      layerRef.current?.style.setProperty("visibility", frame.current.active && paperReady ? "visible" : "hidden");
      frame.current.invalidate?.();
      scope.style.setProperty("--wc-falling-progress", p.toFixed(4));
      const copyOut = phase(p, .03, .18);
      scope.style.setProperty("--wc-paper-copy-opacity", String(1 - copyOut));
      gsap.set(copy, { opacity: 1 - copyOut, y: -copyOut * 28 });
      gsap.set(legend, { opacity: 1 - phase(p, .78, .89) });
      // Seek across the complete visible interval, including entry and exit.
      target = clamp01((window.scrollY - top + innerHeight) / Math.max(1, scene.offsetHeight + innerHeight));
      scope.dataset.paperProgress = p.toFixed(3);
      schedule();
    };
    const loaded = () => { clearTimeout(timer); readFrame(); schedule(); };
    const mediaError = () => { scope.dataset.videoState = "fallback"; fail(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && video.preload === "none") {
        video.preload = "auto"; video.load();
        timer = window.setTimeout(() => { if (!decoded) mediaError(); }, 12000);
      }
    }, { rootMargin: "120% 0px" });
    observer.observe(scene);
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("seeked", loaded);
    video.addEventListener("error", mediaError);
    document.addEventListener("visibilitychange", render);
    const trigger = ScrollTrigger.create({
      trigger: gallery ?? scene,
      start: () => gallery ? `top+=${(gallery.offsetHeight - innerHeight) * .85} top` : "top bottom",
      endTrigger: scene, end: "bottom top", onUpdate: render, onRefresh: render,
    });
    render();
    return () => {
      active = false; cancelAnimationFrame(animation); clearTimeout(timer); observer.disconnect(); trigger.kill(); video.pause();
      video.removeEventListener("loadeddata", loaded); video.removeEventListener("seeked", loaded); video.removeEventListener("error", mediaError);
      document.removeEventListener("visibilitychange", render);
      if (receiver) receiver.style.removeProperty("opacity");
      print?.style.removeProperty("opacity");
      gsap.set([copy, legend], { clearProps: "opacity,transform" });
    };
  }, [enhanced, paperReady, fail]);

  return <div ref={scopeRef} className="wc-scene-falling__motion wc-cinematic-falling" data-video-state="poster" data-paper-ready={paperReady}>
    <div className="wc-scene-falling__media" aria-hidden="true">
      <picture><source srcSet={FALLING_STUDIO_MEDIA.mobilePoster} media="(max-width: 767px)" /><Image className="wc-scene-falling__poster" src={posterSrc} alt="" width={1280} height={720} sizes="100vw" unoptimized /></picture>
      <video ref={videoRef} className="wc-scene-falling__video" muted playsInline preload="none" poster={posterSrc} tabIndex={-1} disablePictureInPicture>
        <source src={FALLING_STUDIO_MEDIA.mobileVideo} media="(max-width: 767px)" type="video/mp4" onError={() => { if (matchMedia("(max-width: 767px)").matches) fail(); }} />
        <source src={videoSrc} type="video/mp4" onError={fail} />
      </video>
    </div>
    {children}
    {enhanced && near && createPortal(<div ref={layerRef} className="wc-paper-stage" aria-hidden="true" style={{ visibility: "hidden" }}>
      <PaperBoundary onFailure={fail}><PaperCanvas frame={frame} onReady={ready} onFailure={fail} onInvalidate={invalidate} /></PaperBoundary>
    </div>, document.body)}
  </div>;
}
