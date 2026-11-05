import { CHAIN_TAP_MS, DEFAULT_SKIP, DOUBLE_TAP_MS, NO_TAP, readTap, sanitizeSkip, skipTarget } from '@/lib/videoSkip';

describe('skipTarget', () => {
  it('moves by the chosen amount', () => {
    expect(skipTarget(20, 60, 10)).toBe(30);
    expect(skipTarget(20, 60, -5)).toBe(15);
  });

  it('stays inside the video', () => {
    expect(skipTarget(3, 60, -10)).toBe(0);
    expect(skipTarget(55, 60, 10)).toBe(60);
  });

  it('does not clamp to 0 while the duration is still unknown', () => {
    expect(skipTarget(5, 0, 10)).toBe(15);
  });
});

describe('sanitizeSkip', () => {
  it('keeps allowed values and replaces anything else', () => {
    expect(sanitizeSkip(5)).toBe(5);
    expect(sanitizeSkip(30)).toBe(30);
    for (const bad of [7, '10', null, undefined, -5, 9999]) expect(sanitizeSkip(bad)).toBe(DEFAULT_SKIP);
  });
});

describe('readTap', () => {
  it('a single tap is not a skip', () => {
    expect(readTap(NO_TAP, 'forward', 1000).skip).toBe(false);
  });

  it('a quick second tap on the same side skips', () => {
    const first = readTap(NO_TAP, 'forward', 1000);
    expect(readTap(first.state, 'forward', 1000 + DOUBLE_TAP_MS).skip).toBe(true);
  });

  it('a slow second tap, or a tap on the other side, does not skip', () => {
    const first = readTap(NO_TAP, 'forward', 1000);
    expect(readTap(first.state, 'forward', 1000 + DOUBLE_TAP_MS + 1).skip).toBe(false);
    expect(readTap(first.state, 'back', 1100).skip).toBe(false);
  });

  it('keeps skipping on later taps during a run, then stops after the pause', () => {
    const first = readTap(NO_TAP, 'back', 1000);
    const second = readTap(first.state, 'back', 1200);
    const third = readTap(second.state, 'back', 1200 + CHAIN_TAP_MS);
    expect(third.skip).toBe(true);
    expect(readTap(third.state, 'back', 1200 + CHAIN_TAP_MS * 2 + 1).skip).toBe(false);
  });
});
