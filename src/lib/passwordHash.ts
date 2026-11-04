import * as Crypto from 'expo-crypto';

/**
 * Prototype-grade password hashing: a random salt plus repeated SHA-256.
 * It keeps plain passwords off the disk. A real backend would use argon2 or bcrypt on the server instead;
 * that swap only touches this file.
 */
const ROUNDS = 500;

export function newSalt(): string {
  return Array.from(Crypto.getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  let digest = `${salt}:${password}`;
  for (let i = 0; i < ROUNDS; i++) {
    digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, digest);
  }
  return digest;
}

export const newId = () => Crypto.randomUUID();
