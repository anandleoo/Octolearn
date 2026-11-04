/**
 * Small input-hardening helpers. Everything that comes from outside the app's own code
 * (route params, saved storage, content URLs, text the user types) goes through one of these.
 */

/** Hosts we allow video from. Anything else is refused before it reaches the player. */
const ALLOWED_VIDEO_HOSTS = [
  'test-videos.co.uk',
  'download.samplelib.com',
  'samplelib.com',
  'interactive-examples.mdn.mozilla.net',
];

export function isAllowedVideoUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string' || raw.length > 2048) return false;
  try {
    const url = new URL(raw);
    // https only: no http, file:, javascript: or data: sources.
    return url.protocol === 'https:' && ALLOWED_VIDEO_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,40}$/i;

/** Route params can be anything (a deep link can put any text there). Accept only id-shaped text. */
export function parseRouteId(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' && ID_PATTERN.test(value) ? value : null;
}

export const NAME_MAX_LENGTH = 24;

/** Letters (any language), digits, spaces, dash, dot and apostrophe. Everything else is dropped. */
export function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw
    .normalize('NFC')
    .replace(/[^\p{L}\p{N} .'-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX_LENGTH);
  return cleaned.length > 0 ? cleaned : null;
}

export const BIO_MAX_LENGTH = 80;

/** Free text (the profile bio): no control characters, tidy spaces, capped length. Empty string if nothing usable. */
export function sanitizeBio(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BIO_MAX_LENGTH);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function clampInt(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, Math.round(value)));
}
