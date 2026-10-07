"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

import { useHomeExperience } from "@/lib/home/home-experience-context";
import {
  FALLING_STUDIO_ARTWORK,
  FALLING_STUDIO_CATEGORIES,
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

type ArtworkMotion = {
  artwork: (typeof FALLING_STUDIO_ARTWORK)[number];
  centerRawX: number;
};

const STATIC_STORY_QUERY =
  "(max-width: 47.999rem), (prefers-reduced-motion: reduce)";
const MIN_SEEK_DELTA = 1 / 60;
const FINAL_FRAME_OFFSET = 1 / 30;
const STALL_TIMEOUT_MS = 8000;
const CENTER_X = 0.5;
const CENTER_Y = 0.5;
const ENTRY_FADE_START_Y = 0.06;
const POST_CENTER_DIM_END_Y = 0.94;
const POST_CENTER_OPACITY = 0.28;
const EXIT_FADE_START_Y = 1;
const EXIT_FADE_END_Y = 1.16;
const CENTER_CORRECTION_RADIUS_Y = 0.24;
const CENTER_FOCUS_RADIUS_Y = 0.2;
const TRANSITION_CLEAR_START = 0.86;
const TRANSITION_CLEAR_END = 0.9;

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

function smootherstep(start: number, end: number, value: number) {
  const progress = gsap.utils.clamp(0, 1, (value - start) / (end - start));

  return progress ** 3 * (progress * (progress * 6 - 15) + 10);
}

function findBezierProgressAtValue(
  start: number,
  control: number,
  end: number,
  value: number,
) {
  let lower = 0;
  let upper = 1;

  for (let iteration = 0; iteration < 16; iteration += 1) {
    const middle = (lower + upper) / 2;
    const current = quadraticBezier(start, control, end, middle);

    if (current < value) {
      lower = middle;
    } else {
      upper = middle;
    }
  }

  return (lower + upper) / 2;
}

const ARTWORK_MOTION_BY_ID = new Map<string, ArtworkMotion>(
  FALLING_STUDIO_ARTWORK.map((artwork) => {
    const centerPathProgress = findBezierProgressAtValue(
      artwork.path[0][1],
      artwork.path[1][1],
      artwork.path[2][1],
      CENTER_Y,
    );
    const centerRawX = quadraticBezier(
      artwork.path[0][0],
      artwork.path[1][0],
      artwork.path[2][0],
      centerPathProgress,
    );

    return [artwork.id, { artwork, centerRawX }] as const;
  }),
);

function shouldUseStaticStory(preference: boolean) {
  return (
    preference ||
    (typeof window !== "undefined" &&
      window.matchMedia(STATIC_STORY_QUERY).matches)
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
      shouldUseStaticStory(prefersReducedMotion)
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

      if (!scope || !video || !scene) {
        return;
      }

      const artworkStates = artworkElements.flatMap((element) => {
        const artworkId = element.dataset.fallingArtwork;
        const motion = artworkId
          ? ARTWORK_MOTION_BY_ID.get(artworkId)
          : undefined;
        const media = element.querySelector<HTMLElement>(
          ".wc-refined-falling__artwork-media",
        );

        if (!motion || !media) {
          return [];
        }

        return [
          {
            element,
            media,
            motion,
            mediaAnchorX: 0,
            mediaAnchorY: 0,
          },
        ];
      });

      const setMediaState = (state: MediaState) => {
        scope.dataset.videoState = state;
      };

      if (shouldUseStaticStory(prefersReducedMotion)) {
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
      const pathEase = gsap.parseEase("power1.inOut");
      const introEase = gsap.parseEase("power2.inOut");
      const receiverEase = gsap.parseEase("power2.out");

      const measureScope = () => {
        scopeWidth = Math.max(scope.clientWidth, 1);
        scopeHeight = Math.max(scope.clientHeight, 1);
        artworkStates.forEach((state) => {
          state.mediaAnchorX = state.media.offsetLeft + state.media.offsetWidth / 2;
          state.mediaAnchorY = state.media.offsetTop + state.media.offsetHeight / 2;
          gsap.set(state.element, {
            transformOrigin: `${state.mediaAnchorX}px ${state.mediaAnchorY}px`,
          });
        });
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

        const introProgress = introEase(
          gsap.utils.clamp(0, 1, targetProgress / 0.2),
        );
        const receiverProgress = receiverEase(
          gsap.utils.clamp(0, 1, targetProgress / 0.1),
        );
        const transitionClear = smootherstep(
          TRANSITION_CLEAR_START,
          TRANSITION_CLEAR_END,
          targetProgress,
        );

        if (copy) {
          gsap.set(copy, {
            opacity: 1 - introProgress,
            y: introProgress * -28,
          });
        }

        if (legend) {
          gsap.set(legend, {
            opacity: 1 - transitionClear,
            y: transitionClear * 18,
          });
        }

        if (entryReceiver) {
          gsap.set(entryReceiver, {
            autoAlpha: Math.max(0, 0.74 * (1 - receiverProgress)),
            yPercent: receiverProgress * 55,
          });
        }

        artworkStates.forEach((state) => {
          const { artwork, centerRawX } = state.motion;

          const localProgress = gsap.utils.clamp(
            0,
            1,
            (targetProgress - artwork.progress[0]) /
              (artwork.progress[1] - artwork.progress[0]),
          );
          const pathProgress = pathEase(localProgress);
          const rawX = quadraticBezier(
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
          const centerInfluence =
            1 -
            smootherstep(
              0,
              CENTER_CORRECTION_RADIUS_Y,
              Math.abs(y - CENTER_Y),
            );
          const centerFocus =
            1 -
            smootherstep(
              0,
              CENTER_FOCUS_RADIUS_Y,
              Math.abs(y - CENTER_Y),
            );
          const x = rawX + (CENTER_X - centerRawX) * centerInfluence;
          const arrivalOpacity = smootherstep(
            ENTRY_FADE_START_Y,
            CENTER_Y,
            y,
          );
          const departureOpacity = gsap.utils.interpolate(
            1,
            POST_CENTER_OPACITY,
            smootherstep(CENTER_Y, POST_CENTER_DIM_END_Y, y),
          );
          const terminalOpacity =
            1 - smootherstep(EXIT_FADE_START_Y, EXIT_FADE_END_Y, y);
          const opacity =
            arrivalOpacity *
            departureOpacity *
            terminalOpacity *
            (1 - transitionClear);
          const beforeCenterPose = smootherstep(
            artwork.path[0][1],
            CENTER_Y,
            y,
          );
          const afterCenterPose = smootherstep(
            CENTER_Y,
            artwork.path[2][1],
            y,
          );
          const rotation =
            y <= CENTER_Y
              ? gsap.utils.interpolate(
                  artwork.rotation[0],
                  0,
                  beforeCenterPose,
                )
              : gsap.utils.interpolate(
                  0,
                  artwork.rotation[1],
                  afterCenterPose,
                );
          const tiltPhase =
            y <= CENTER_Y ? 1 - beforeCenterPose : afterCenterPose * -0.46;
          const baseScale = gsap.utils.interpolate(
            artwork.scale[0],
            artwork.scale[1],
            pathProgress,
          );
          const scale =
            baseScale *
            (1 + centerFocus * (artwork.depth === "foreground" ? 0.06 : 0.1));
          const depthProgress =
            artwork.depth === "foreground" ? pathProgress : pathProgress * 0.58;
          const baseDepth =
            artwork.depth === "foreground"
              ? -110 + depthProgress * 260
              : -260 + depthProgress * 150;

          gsap.set(state.element, {
            autoAlpha: opacity,
            x: scopeWidth * x - state.mediaAnchorX,
            y: scopeHeight * y - state.mediaAnchorY,
            z:
              baseDepth +
              centerFocus * (artwork.depth === "foreground" ? 52 : 128),
            rotationZ: rotation,
            rotationX: artwork.tilt[0] * tiltPhase,
            rotationY: artwork.tilt[1] * tiltPhase,
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

      measureScope();
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
          [copy, legend, entryReceiver, ...artworkElements],
          {
            clearProps: "opacity,transform,transformOrigin,visibility",
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
          width={1280}
          height={720}
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

      <div className="wc-scene-falling__reduced-stills">
        {stills.map((still, index) => (
          <figure key={still.src} className="wc-scene-falling__still">
            <div className="wc-scene-falling__still-media">
              <Image
                src={still.src}
                alt={still.alt}
                width={1280}
                height={720}
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
