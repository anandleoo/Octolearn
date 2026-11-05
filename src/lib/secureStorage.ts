import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Small key/value store for the sign-in session ("Remember me").
 * On iOS and Android it uses the operating system's secure storage (Keychain / Keystore).
 * Browsers have no such thing, so on web it falls back to localStorage: fine for this demo, but not as safe.
 * Every call swallows errors, because a blocked or full store must never crash sign-in.
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      return Platform.OS === 'web' ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') await AsyncStorage.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore: the user just won't be remembered
    }
  },
  async remove(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') await AsyncStorage.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};
