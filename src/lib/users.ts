import { isPlainObject, sanitizeBio, sanitizeName } from './security';
import { normalizeEmail, validateEmail } from './validation';

/** One row of the local "users" table. The password itself is never stored, only its salted hash. */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  /** Short "about me" line shown on the profile. Optional: older rows simply have none. */
  bio: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

const ID_PATTERN = /^[a-z0-9-]{8,40}$/i;
const SALT_PATTERN = /^[a-f0-9]{32}$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

/**
 * Same idea as sanitizeProgress: the users file is only text on the phone, so it is rebuilt row by row
 * and any row that does not look right is dropped (as are duplicate ids or emails).
 */
export function sanitizeUsers(raw: unknown): UserRecord[] {
  const rows = isPlainObject(raw) && Array.isArray(raw.users) ? raw.users : [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const users: UserRecord[] = [];

  for (const row of rows) {
    if (!isPlainObject(row)) continue;
    const { id, email, salt, passwordHash, createdAt } = row;
    const name = sanitizeName(row.name);
    if (typeof id !== 'string' || !ID_PATTERN.test(id) || seenIds.has(id)) continue;
    if (typeof email !== 'string' || validateEmail(email) !== null) continue;
    if (typeof salt !== 'string' || !SALT_PATTERN.test(salt)) continue;
    if (typeof passwordHash !== 'string' || !HASH_PATTERN.test(passwordHash)) continue;
    if (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt))) continue;
    const cleanEmail = normalizeEmail(email);
    if (!name || seenEmails.has(cleanEmail)) continue;

    seenIds.add(id);
    seenEmails.add(cleanEmail);
    users.push({ id, name, email: cleanEmail, bio: sanitizeBio(row.bio), salt, passwordHash, createdAt });
  }
  return users;
}

/** Same length check regardless of where the strings differ, so timing does not reveal how close a guess was. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
