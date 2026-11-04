import AsyncStorage from '@react-native-async-storage/async-storage';

import seed from '@/data/users.json';
import { sanitizeUsers, type UserRecord } from '@/lib/users';

/**
 * A tiny JSON "database" of accounts, saved as one JSON document on the device.
 * The first run starts from data/users.json (a demo account). Swapping this for a real API later
 * means re-implementing these three functions; no screen talks to storage directly.
 */
const KEY = 'octolearn.db.users.v1';

export async function readUsers(): Promise<UserRecord[]> {
  try {
    const text = await AsyncStorage.getItem(KEY);
    if (text === null) return sanitizeUsers(seed);
    return sanitizeUsers(JSON.parse(text));
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify({ users }));
}

/** Writes are queued one after another, so two quick actions can never overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();

/** Read, change and save the users in one safe step. Whatever `change` returns is passed back to the caller. */
export function mutateUsers<T>(change: (users: UserRecord[]) => { users: UserRecord[]; result: T }): Promise<T> {
  const run = queue.then(async () => {
    const { users, result } = change(await readUsers());
    await writeUsers(users);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
