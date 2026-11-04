import { sanitizeName } from './security';

/** Form rules, kept pure (no React, no storage) so they are easy to test and reuse on every form. Each returns an error message or null. */

export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
export const NAME_MIN = 2;

export const normalizeEmail = (raw: string) => raw.trim().toLowerCase();

export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) return 'Имэйл хаягаа оруулна уу';
  if (email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Имэйл хаяг буруу байна';
  return null;
}

export function validatePassword(raw: string): string | null {
  if (raw.length < PASSWORD_MIN) return `Нууц үг дор хаяж ${PASSWORD_MIN} тэмдэгт байна`;
  if (raw.length > PASSWORD_MAX) return `Нууц үг ${PASSWORD_MAX} тэмдэгтээс хэтрэхгүй`;
  if (!/\p{L}/u.test(raw) || !/\d/.test(raw)) return 'Нууц үг үсэг болон тоо агуулсан байх ёстой';
  return null;
}

export function validateName(raw: string): string | null {
  const clean = sanitizeName(raw);
  if (!clean || Array.from(clean).length < NAME_MIN) return `Нэр дор хаяж ${NAME_MIN} тэмдэгт байна`;
  return null;
}
