import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { mutateUsers, readUsers } from '@/db/userDb';
import { hashPassword, newId, newSalt } from '@/lib/passwordHash';
import { sanitizeBio, sanitizeName } from '@/lib/security';
import { safeEqual, type UserRecord } from '@/lib/users';
import { normalizeEmail, validateEmail, validateName, validatePassword } from '@/lib/validation';
import { deleteProgressFor, detachProgress, loadProgressFor } from '@/store/progressStore';

/** What the screens may see. The salt and password hash never leave the database layer. */
export interface Account {
  id: string;
  name: string;
  email: string;
  bio: string;
  createdAt: string;
}

export type AuthResult = { ok: true } | { ok: false; error: string };
const fail = (error: string): AuthResult => ({ ok: false, error });

/** Skeleton screens stay at least this long, so loading reads as intentional instead of a flicker. */
const MIN_SKELETON_MS = 500;
const SESSION_KEY = 'octolearn.session';
const REMEMBERED_EMAIL_KEY = 'octolearn.remembered-email';
const BAD_LOGIN = 'Имэйл эсвэл нууц үг буруу байна';

const toAccount = ({ id, name, email, bio, createdAt }: UserRecord): Account => ({ id, name, email, bio, createdAt });

/** The signed-in user's id lives in the OS secure store (Keychain / Keystore), not in plain storage. */
const session = {
  save: (id: string) => SecureStore.setItemAsync(SESSION_KEY, id).catch(() => {}),
  read: () => SecureStore.getItemAsync(SESSION_KEY).catch(() => null),
  clear: () => SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {}),
};

/** The email "Remember me" pre-fills on the sign-in form. Survives signing out; cleared if Remember me is off. */
const remembered = {
  save: (email: string) => SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, email).catch(() => {}),
  read: () => SecureStore.getItemAsync(REMEMBERED_EMAIL_KEY).catch(() => null),
  clear: () => SecureStore.deleteItemAsync(REMEMBERED_EMAIL_KEY).catch(() => {}),
};

/** Slow down password guessing: 5 wrong tries on one email locks it for a while, longer each time. */
const MAX_FAILS = 5;
const attempts = new Map<string, { fails: number; lockedUntil: number; locks: number }>();

function lockedSeconds(email: string): number {
  const entry = attempts.get(email);
  return entry && entry.lockedUntil > Date.now() ? Math.ceil((entry.lockedUntil - Date.now()) / 1000) : 0;
}

function recordFailure(email: string) {
  const entry = attempts.get(email) ?? { fails: 0, lockedUntil: 0, locks: 0 };
  entry.fails += 1;
  if (entry.fails >= MAX_FAILS) {
    entry.locks += 1;
    entry.fails = 0;
    entry.lockedUntil = Date.now() + Math.min(300, 15 * 2 ** entry.locks) * 1000;
  }
  attempts.set(email, entry);
}

interface AuthState {
  /** loading = still reading the saved session at app start. */
  status: 'loading' | 'signedOut' | 'signedIn';
  user: Account | null;
  /** Email saved by "Remember me" (null when off), used to pre-fill the sign-in form. */
  rememberedEmail: string | null;
  /** False while this account's saved progress is still loading; screens show skeletons until it is true. */
  progressReady: boolean;
  restore: () => Promise<void>;
  signUp: (input: { name: string; email: string; password: string; remember: boolean }) => Promise<AuthResult>;
  signIn: (input: { email: string; password: string; remember: boolean }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Changing the email needs the current password; name and bio do not. */
  updateProfile: (input: { name: string; email: string; bio: string; password?: string }) => Promise<AuthResult>;
  changePassword: (current: string, next: string) => Promise<AuthResult>;
  deleteAccount: (password: string) => Promise<AuthResult>;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  /**
   * Load this account's progress and show the signed-in screens.
   * With "Remember me" the session and email are saved on the device; without it the sign-in lasts only until the app closes.
   */
  const enter = async (record: UserRecord, remember: boolean) => {
    // Show the app right away with skeleton placeholders, and fill it in once the saved progress has loaded.
    // The short minimum keeps the placeholders from flashing for a split second.
    set({ status: 'signedIn', user: toAccount(record), progressReady: false, rememberedEmail: remember ? record.email : null });
    await Promise.all([loadProgressFor(record.id), new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_MS))]);
    if (remember) {
      await session.save(record.id);
      await remembered.save(record.email);
    } else {
      await session.clear();
      await remembered.clear();
    }
    set({ progressReady: true });
  };

  /** Re-checks a password against the stored hash. Used before anything sensitive. */
  const passwordMatches = async (userId: string, password: string) => {
    const record = (await readUsers()).find((u) => u.id === userId);
    if (!record) return false;
    return safeEqual(await hashPassword(password, record.salt), record.passwordHash);
  };

  return {
    status: 'loading',
    user: null,
    rememberedEmail: null,
    progressReady: false,

    restore: async () => {
      const [id, email] = await Promise.all([session.read(), remembered.read()]);
      const record = id ? (await readUsers()).find((u) => u.id === id) : undefined;
      if (record) await enter(record, true);
      else set({ status: 'signedOut', user: null, rememberedEmail: email });
    },

    signUp: async ({ name, email, password, remember }) => {
      const nameError = validateName(name);
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);
      if (nameError || emailError || passwordError) return fail(nameError ?? emailError ?? passwordError ?? '');

      const clean = sanitizeName(name) ?? '';
      const address = normalizeEmail(email);
      const salt = newSalt();
      const record: UserRecord = {
        id: newId(),
        name: clean,
        email: address,
        bio: '',
        salt,
        passwordHash: await hashPassword(password, salt),
        createdAt: new Date().toISOString(),
      };
      const created = await mutateUsers((users) =>
        users.some((u) => u.email === address)
          ? { users, result: false }
          : { users: [...users, record], result: true },
      );
      if (!created) return fail('Энэ имэйл хаяг бүртгэлтэй байна');
      await enter(record, remember);
      return { ok: true };
    },

    signIn: async ({ email, password, remember }) => {
      const address = normalizeEmail(email);
      if (!address || !password) return fail(BAD_LOGIN);
      const wait = lockedSeconds(address);
      if (wait > 0) return fail(`Олон удаа буруу оруулсан. ${wait} секундын дараа дахин оролдоно уу`);

      const record = (await readUsers()).find((u) => u.email === address);
      // Hash even when the email is unknown, so the reply takes the same time and reveals nothing.
      const hash = await hashPassword(password, record?.salt ?? '0'.repeat(32));
      if (!record || !safeEqual(hash, record.passwordHash)) {
        recordFailure(address);
        return fail(BAD_LOGIN);
      }
      attempts.delete(address);
      await enter(record, remember);
      return { ok: true };
    },

    signOut: async () => {
      await session.clear();
      detachProgress();
      set({ status: 'signedOut', user: null, progressReady: false });
    },

    updateProfile: async ({ name, email, bio, password }) => {
      const user = get().user;
      if (!user) return fail('Нэвтэрсэн байх шаардлагатай');
      const problem = validateName(name) ?? validateEmail(email);
      if (problem) return fail(problem);

      const cleanName = sanitizeName(name) ?? '';
      const cleanBio = sanitizeBio(bio);
      const address = normalizeEmail(email);
      if (address !== user.email) {
        if (!password) return fail('Имэйл солихын тулд нууц үгээ оруулна уу');
        if (!(await passwordMatches(user.id, password))) return fail('Нууц үг буруу байна');
      }

      const saved = await mutateUsers((users) => {
        if (users.some((u) => u.id !== user.id && u.email === address)) return { users, result: false };
        return {
          users: users.map((u) => (u.id === user.id ? { ...u, name: cleanName, email: address, bio: cleanBio } : u)),
          result: true,
        };
      });
      if (!saved) return fail('Энэ имэйл хаяг бүртгэлтэй байна');
      // Keep the remembered email in step with the new address.
      if (get().rememberedEmail === user.email) {
        await remembered.save(address);
        set({ rememberedEmail: address });
      }
      set({ user: { ...user, name: cleanName, email: address, bio: cleanBio } });
      return { ok: true };
    },

    changePassword: async (current, next) => {
      const user = get().user;
      if (!user) return fail('Нэвтэрсэн байх шаардлагатай');
      const error = validatePassword(next);
      if (error) return fail(error);
      if (!(await passwordMatches(user.id, current))) return fail('Одоогийн нууц үг буруу байна');
      const salt = newSalt();
      const passwordHash = await hashPassword(next, salt);
      await mutateUsers((users) => ({
        users: users.map((u) => (u.id === user.id ? { ...u, salt, passwordHash } : u)),
        result: null,
      }));
      return { ok: true };
    },

    deleteAccount: async (password) => {
      const user = get().user;
      if (!user) return fail('Нэвтэрсэн байх шаардлагатай');
      if (!(await passwordMatches(user.id, password))) return fail('Нууц үг буруу байна');
      await mutateUsers((users) => ({ users: users.filter((u) => u.id !== user.id), result: null }));
      await session.clear();
      await remembered.clear();
      detachProgress(); // first stop saving into the file, then delete it
      await deleteProgressFor(user.id);
      set({ status: 'signedOut', user: null, rememberedEmail: null, progressReady: false });
      return { ok: true };
    },
  };
});
