/** Rules for skipping inside a video. Pure, so they are tested without a player. */

export const SKIP_OPTIONS = [5, 10, 15, 30] as const;
export type SkipSeconds = (typeof SKIP_OPTIONS)[number];
export const DEFAULT_SKIP: SkipSeconds = 10;

/** Saved settings are not trusted: anything unexpected becomes the default. */
export function sanitizeSkip(raw: unknown): SkipSeconds {
  return SKIP_OPTIONS.includes(raw as SkipSeconds) ? (raw as SkipSeconds) : DEFAULT_SKIP;
}

/** Where a skip lands: never before the start or past the end. */
export function skipTarget(position: number, duration: number, delta: number): number {
  const target = position + delta;
  return Math.max(0, duration > 0 ? Math.min(target, duration) : target);
}

export type TapSide = 'back' | 'forward';

export interface TapState {
  side: TapSide | null;
  at: number;
  /** Already skipping: further taps on the same side keep skipping, as on YouTube. */
  chain: boolean;
}

export const NO_TAP: TapState = { side: null, at: 0, chain: false };
export const DOUBLE_TAP_MS = 280;
export const CHAIN_TAP_MS = 650;

/** Decides whether this tap is a skip (the second tap on a side, or any tap during a run of skips). */
export function readTap(prev: TapState, side: TapSide, now: number): { state: TapState; skip: boolean } {
  const within = now - prev.at <= (prev.chain ? CHAIN_TAP_MS : DOUBLE_TAP_MS);
  const skip = prev.side === side && within;
  return { skip, state: { side, at: now, chain: skip } };
}
