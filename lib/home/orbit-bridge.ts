import { ORBIT_BRIDGE_SCALE } from "@/lib/home/orbit-worlds";

/** Viewport-space centre and still width that the Designs world occupies. */
export type OrbitBridgeTarget = {
  x: number;
  y: number;
  width: number;
};

/** Every width with motion gets the studio handover; static fallbacks on
 * stacked layouts opt out at runtime (see EcosystemOrbitRuntime). */
export const ORBIT_BRIDGE_QUERY =
  "(prefers-reduced-motion: no-preference) and (forced-colors: none)";

/** Arrival progress at which the still has landed on the Designs world. */
export const ORBIT_BRIDGE_LANDED = 0.6;
/** After landing, the still and the 3D world crossfade over this window. */
export const ORBIT_BRIDGE_FADE = [0.6, 0.84] as const;
/** The artwork inside the still spans this fraction of the image height. */
export const ORBIT_BRIDGE_CONTENT_HEIGHT = 0.88;

function smoothstep(value: number, start: number, end: number) {
  const progress = Math.min(1, Math.max(0, (value - start) / (end - start)));

  return progress * progress * (3 - 2 * progress);
}

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

/**
 * Moves the studio still from the studio's final frame onto the Designs world.
 * Layout offsets ignore transforms, so the resting frame is read every call.
 */
export function renderOrbitBridgeArt(
  art: HTMLElement,
  arrival: number,
  target: OrbitBridgeTarget | null,
) {
  const parent = art.offsetParent;

  if (!(parent instanceof HTMLElement)) {
    return;
  }

  const parentRect = parent.getBoundingClientRect();
  const width = art.offsetWidth;
  const baseX = parentRect.left + art.offsetLeft + width / 2;
  const baseY = parentRect.top + art.offsetTop + art.offsetHeight / 2;
  const travel = smoothstep(arrival, 0, ORBIT_BRIDGE_LANDED);
  const endScale = target ? target.width / width : ORBIT_BRIDGE_SCALE * 0.42;
  const x = target ? (target.x - baseX) * travel : 0;
  const y = target ? (target.y - baseY) * travel : 0;
  const scale = mix(ORBIT_BRIDGE_SCALE, endScale, travel);

  // 2D, like the studio's own transform, so both rasterize identically.
  art.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
  art.style.opacity = (
    1 - smoothstep(arrival, ORBIT_BRIDGE_FADE[0], ORBIT_BRIDGE_FADE[1])
  ).toFixed(3);
}
