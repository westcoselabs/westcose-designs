export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function phase(value: number, start: number, end: number) {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}
export const PAPER_HANDOFF_START = 0.88;
// Liquid field offset at the hero → illustration rail handoff; the hero
// drifts the liquid up to it and the rail continues from it.
export const LIQUID_HANDOFF_DRIFT = 0.9;
export type PaperFrame = {
  progress: number;
  handoff: number;
  entry: number;
  entryRect: { x: number; y: number; width: number };
  active: boolean;
  mobile: boolean;
  receiver: { x: number; y: number; width: number };
  invalidate?: () => void;
};
// Phones with motion allowed get pinned, scroll-driven scenes too. Keep in
// step with styles/mobile-scenes.css.
export const MOBILE_MOTION_QUERY =
  "(max-width: 47.999rem) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";
