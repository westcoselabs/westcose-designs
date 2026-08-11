"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

import { useHomeExperience } from "@/lib/home/home-experience-context";
import {
  FALLING_STUDIO_ARTWORK,
  FALLING_STUDIO_CATEGORIES,
  FALLING_STUDIO_HANDOFF,
} from "@/lib/home/falling-studio-manifest";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

type FallingStill = {
  src: string;
  alt: string;
  label: string;
};

type FallingVideoScrubProps = {
  children: ReactNode;
  posterSrc: string;
  stills: readonly FallingStill[];
  videoSrc: string;
};

type MediaState =
  | "poster"
  | "loading"
  | "ready"
  | "stalled"
  | "fallback"
  | "reduced";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MIN_SEEK_DELTA = 1 / 60;
const FINAL_FRAME_OFFSET = 1 / 30;
const STALL_TIMEOUT_MS = 8000;
const HANDOFF_START = 0.84;
const ARTWORK_BY_ID = new Map<string, (typeof FALLING_STUDIO_ARTWORK)[number]>(
  FALLING_STUDIO_ARTWORK.map((artwork) => [artwork.id, artwork]),
);

function quadraticBezier(
  start: number,
  control: number,
  end: number,
  progress: number,
) {
  const inverse = 1 - progress;

  return (
    inverse * inverse * start +
    2 * inverse * progress * control +
    progress * progress * end
  );
}

function motionIsReduced(preference: boolean) {
  return (
    preference ||
    (typeof window !== "undefined" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches)
  );
}

export function FallingVideoScrub({
  children,
  posterSrc,
  stills,
  videoSrc,
}: FallingVideoScrubProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();
  const { heroVisualReady, sceneId } = useHomeExperience();
  const shouldLoadMetadata =
    heroVisualReady || !["scene-00", "scene-01"].includes(sceneId);

  useEffect(() => {
    const video = videoRef.current;

    if (
      !video ||
      !shouldLoadMetadata ||
      motionIsReduced(prefersReducedMotion)
    ) {
      return;
    }

    const shouldStartLoad =
      video.preload !== "metadata" ||
      video.networkState === HTMLMediaElement.NETWORK_EMPTY;

    video.preload = "metadata";

    if (shouldStartLoad) {
      video.load();
    }
  }, [prefersReducedMotion, shouldLoadMetadata]);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      const video = videoRef.current;
      const scene = scope?.closest<HTMLElement>("[data-home-scene-id]");
      const copy = scope?.querySelector<HTMLElement>(
        ".wc-scene-falling__copy",
      );
      const legend = scope?.querySelector<HTMLElement>(
        ".wc-scene-falling__legend",
      );
      const legendItems = gsap.utils.toArray<HTMLElement>(
        ".wc-scene-falling__legend li",
        scope ?? undefined,
      );
      const entryReceiver = scope?.querySelector<HTMLElement>(
        "[data-falling-entry-receiver]",
      );
      const artworkElements = gsap.utils.toArray<HTMLElement>(
        "[data-falling-artwork]",
        scope ?? undefined,
      );
      const endHandoff = scope?.querySelector<HTMLElement>(
        "[data-falling-end-handoff]",
      );

      if (!scope || !video || !scene) {
        return;
      }

      const setMediaState = (state: MediaState) => {
        scope.dataset.videoState = state;
      };

      if (motionIsReduced(prefersReducedMotion)) {
        video.pause();
        video.preload = "none";
        setMediaState("reduced");
        return;
      }

      let targetProgress = 0;
      let duration = 0;
      let metadataReady = false;
      let presentedFrame = false;
      let permanentlyFailed = false;
      let seekFrameId: number | null = null;
      let stallTimerId: number | null = null;
      let forceNextSeek = false;
      let activeLegendIndex = -1;
      let scopeWidth = Math.max(scope.clientWidth, 1);
      let scopeHeight = Math.max(scope.clientHeight, 1);

      const measureScope = () => {
        scopeWidth = Math.max(scope.clientWidth, 1);
        scopeHeight = Math.max(scope.clientHeight, 1);
      };

      const clearStallTimer = () => {
        if (stallTimerId !== null) {
          window.clearTimeout(stallTimerId);
          stallTimerId = null;
        }
      };

      const failToPoster = () => {
        permanentlyFailed = true;
        clearStallTimer();
        video.pause();
        setMediaState("fallback");
      };

      const startStallTimer = () => {
        clearStallTimer();
        stallTimerId = window.setTimeout(failToPoster, STALL_TIMEOUT_MS);
      };

      const getTargetTime = () =>
        targetProgress * Math.max(0, duration - FINAL_FRAME_OFFSET);

      const markReady = () => {
        if (
          permanentlyFailed ||
          !metadataReady ||
          video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
          video.seeking ||
          (!presentedFrame &&
            Math.abs(video.currentTime - getTargetTime()) > MIN_SEEK_DELTA)
        ) {
          return;
        }

        clearStallTimer();
        presentedFrame = true;
        scope.dataset.videoPresented = "true";
        setMediaState("ready");
      };

      const scheduleSeek = (force = false) => {
        forceNextSeek ||= force;

        if (seekFrameId !== null || document.hidden) {
          return;
        }

        seekFrameId = window.requestAnimationFrame(() => {
          seekFrameId = null;

          if (permanentlyFailed || !metadataReady || video.seeking) {
            return;
          }

          const targetTime = getTargetTime();
          const shouldSeek =
            forceNextSeek ||
            Math.abs(video.currentTime - targetTime) > MIN_SEEK_DELTA;

          forceNextSeek = false;
          video.pause();

          if (!shouldSeek) {
            markReady();
            return;
          }

          try {
            video.currentTime = targetTime;
          } catch {
            startStallTimer();
            setMediaState(presentedFrame ? "stalled" : "loading");
          }
        });
      };

      const setActiveLegend = (progress: number) => {
        if (legendItems.length === 0) {
          return;
        }

        const index = Math.min(
          legendItems.length - 1,
          Math.floor(progress * legendItems.length),
        );

        if (index === activeLegendIndex) {
          return;
        }

        activeLegendIndex = index;
        scope.dataset.fallingCategory =
          FALLING_STUDIO_CATEGORIES[index]?.id ?? "identity";
        legendItems.forEach((item, itemIndex) => {
          item.toggleAttribute("data-active", itemIndex === index);
        });
      };

      const renderProgress = (progress: number) => {
        targetProgress = gsap.utils.clamp(0, 1, progress);
        scope.style.setProperty(
          "--wc-falling-progress",
          targetProgress.toFixed(4),
        );
        setActiveLegend(targetProgress);

        const introProgress = gsap.parseEase("power2.inOut")(
          gsap.utils.clamp(0, 1, targetProgress / 0.2),
        );
        const receiverProgress = gsap.parseEase("power2.out")(
          gsap.utils.clamp(0, 1, targetProgress / 0.1),
        );
        const handoffProgress = gsap.parseEase("power2.inOut")(
          gsap.utils.clamp(
            0,
            1,
            (targetProgress - HANDOFF_START) / (1 - HANDOFF_START),
          ),
        );

        if (copy) {
          gsap.set(copy, {
            opacity: 1 - introProgress,
            y: introProgress * -28,
          });
        }

        if (legend) {
          gsap.set(legend, {
            opacity: 1 - handoffProgress,
            y: handoffProgress * 18,
          });
        }

        if (entryReceiver) {
          gsap.set(entryReceiver, {
            autoAlpha: Math.max(0, 0.74 * (1 - receiverProgress)),
            yPercent: receiverProgress * 55,
          });
        }

        if (endHandoff) {
          gsap.set(endHandoff, {
            autoAlpha: handoffProgress,
            xPercent: -50,
            yPercent: -50 + (1 - handoffProgress) * 58,
            scale: 0.62 + handoffProgress * 0.38,
            rotationZ: (1 - handoffProgress) * -5,
            force3D: true,
          });
        }

        artworkElements.forEach((element) => {
          const artworkId = element.dataset.fallingArtwork;
          const artwork = artworkId ? ARTWORK_BY_ID.get(artworkId) : undefined;

          if (!artwork) {
            return;
          }

          const localProgress = gsap.utils.clamp(
            0,
            1,
            (targetProgress - artwork.progress[0]) /
              (artwork.progress[1] - artwork.progress[0]),
          );
          const pathProgress = gsap.parseEase("power1.inOut")(localProgress);
          const fadeIn = gsap.utils.clamp(0, 1, localProgress / 0.13);
          const fadeOut =
            1 - gsap.utils.clamp(0, 1, (localProgress - 0.82) / 0.18);
          const opacity = fadeIn * fadeOut;
          const x = quadraticBezier(
            artwork.path[0][0],
            artwork.path[1][0],
            artwork.path[2][0],
            pathProgress,
          );
          const y = quadraticBezier(
            artwork.path[0][1],
            artwork.path[1][1],
            artwork.path[2][1],
            pathProgress,
          );
          const rotation = gsap.utils.interpolate(
            artwork.rotation[0],
            artwork.rotation[1],
            pathProgress,
          );
          const scale = gsap.utils.interpolate(
            artwork.scale[0],
            artwork.scale[1],
            pathProgress,
          );
          const depthProgress =
            artwork.depth === "foreground" ? pathProgress : pathProgress * 0.58;

          gsap.set(element, {
            autoAlpha: opacity,
            x: scopeWidth * x - element.offsetWidth / 2,
            y: scopeHeight * y - element.offsetHeight / 2,
            z:
              artwork.depth === "foreground"
                ? -110 + depthProgress * 260
                : -260 + depthProgress * 150,
            rotationZ: rotation,
            rotationX: artwork.tilt[0] * (1 - pathProgress * 1.65),
            rotationY: artwork.tilt[1] * (1 - pathProgress * 1.8),
            scale,
            force3D: true,
          });
        });

        scheduleSeek();
      };

      const onLoadStart = () => {
        if (!permanentlyFailed) {
          setMediaState("loading");
          startStallTimer();
        }
      };

      const acceptDuration = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) {
          return false;
        }

        duration = video.duration;
        metadataReady = true;
        clearStallTimer();
        scheduleSeek(true);
        startStallTimer();
        return true;
      };

      const onLoadedMetadata = () => {
        if (!acceptDuration()) {
          failToPoster();
        }
      };

      const onDurationChange = () => {
        // `load()` resets duration through NaN before the next resource is ready.
        // Ignore that transitional event; loadedmetadata/error owns final validity.
        acceptDuration();
      };

      const onLoadedData = () => {
        if (metadataReady && !video.seeking) {
          markReady();
        }

        scheduleSeek(true);
      };

      const onSeeked = () => {
        markReady();

        if (
          Math.abs(video.currentTime - getTargetTime()) > MIN_SEEK_DELTA
        ) {
          scheduleSeek();
        }
      };

      const onWaiting = () => {
        if (permanentlyFailed) {
          return;
        }

        setMediaState(presentedFrame ? "stalled" : "loading");
        startStallTimer();
      };

      const onRecovered = () => {
        if (
          metadataReady &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
        ) {
          markReady();
          scheduleSeek();
        }
      };

      const keepPaused = () => video.pause();
      const onVisibilityChange = () => {
        video.pause();

        if (!document.hidden) {
          scheduleSeek(true);
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: scene,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measureScope();
          renderProgress(self.progress);
        },
        onUpdate: (self) => renderProgress(self.progress),
        onLeave: keepPaused,
        onLeaveBack: keepPaused,
      });

      video.addEventListener("loadstart", onLoadStart);
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("durationchange", onDurationChange);
      video.addEventListener("loadeddata", onLoadedData);
      video.addEventListener("canplay", onRecovered);
      video.addEventListener("progress", onRecovered);
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("waiting", onWaiting);
      video.addEventListener("stalled", onWaiting);
      video.addEventListener("error", failToPoster);
      video.addEventListener("play", keepPaused);
      document.addEventListener("visibilitychange", onVisibilityChange);

      renderProgress(trigger.progress);

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        onLoadedMetadata();
      }

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        onLoadedData();
      }

      return () => {
        trigger.kill();
        clearStallTimer();
        video.pause();
        video.removeEventListener("loadstart", onLoadStart);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("durationchange", onDurationChange);
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("canplay", onRecovered);
        video.removeEventListener("progress", onRecovered);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("stalled", onWaiting);
        video.removeEventListener("error", failToPoster);
        video.removeEventListener("play", keepPaused);
        document.removeEventListener("visibilitychange", onVisibilityChange);

        if (seekFrameId !== null) {
          window.cancelAnimationFrame(seekFrameId);
        }

        gsap.set(
          [copy, legend, entryReceiver, endHandoff, ...artworkElements],
          {
          clearProps: "opacity,transform,visibility",
          },
        );
        legendItems.forEach((item) => item.removeAttribute("data-active"));
        scope.style.removeProperty("--wc-falling-progress");
        scope.removeAttribute("data-video-presented");
        scope.removeAttribute("data-falling-category");
        scope.dataset.videoState = "poster";
      };
    },
    {
      scope: scopeRef,
      dependencies: [prefersReducedMotion],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={scopeRef}
      className="wc-scene-falling__motion"
      data-video-state="poster"
    >
      <div className="wc-scene-falling__media" aria-hidden="true">
        <Image
          className="wc-scene-falling__poster"
          src={posterSrc}
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          unoptimized
        />
        <video
          ref={videoRef}
          className="wc-scene-falling__video"
          muted
          playsInline
          preload="none"
          poster={posterSrc}
          tabIndex={-1}
          disablePictureInPicture
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      <div className="wc-scene-falling__media-status" aria-hidden="true">
        <span data-media-label="loading">Preparing sequence</span>
        <span data-media-label="stalled">Holding frame</span>
        <span data-media-label="fallback">Still frame</span>
      </div>

      {children}

      <div
        className="wc-scene-falling__end-handoff"
        data-falling-end-handoff
        aria-hidden="true"
      >
        <figure className="wc-scene-falling__handoff-board">
          <div className="wc-refined-falling__handoff-media">
            <Image
              src={FALLING_STUDIO_HANDOFF.src}
              width={FALLING_STUDIO_HANDOFF.width}
              height={FALLING_STUDIO_HANDOFF.height}
              sizes="(min-width: 64rem) 54vw, 72vw"
              alt=""
            />
          </div>
        </figure>
      </div>

      <div className="wc-scene-falling__reduced-stills">
        {stills.map((still, index) => (
          <figure key={still.src} className="wc-scene-falling__still">
            <div className="wc-scene-falling__still-media">
              <Image
                src={still.src}
                alt={still.alt}
                fill
                sizes="(min-width: 48rem) 33vw, 92vw"
                loading="lazy"
                unoptimized
              />
            </div>
            <figcaption>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {still.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
