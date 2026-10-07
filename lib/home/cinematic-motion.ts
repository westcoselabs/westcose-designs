export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function phase(value: number, start: number, end: number) {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}
export const PAPER_HANDOFF_START = 0.88;
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
