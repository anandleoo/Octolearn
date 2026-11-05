import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_SKIP, sanitizeSkip, type SkipSeconds } from '@/lib/videoSkip';

export type AppearanceMode = 'system' | 'light' | 'dark';
const MODES: AppearanceMode[] = ['system', 'light', 'dark'];

interface SettingsState {
  appearance: AppearanceMode;
  haptics: boolean;
  /** How far a double tap or a skip button moves in a video. */
  skipSeconds: SkipSeconds;
  setAppearance: (mode: AppearanceMode) => void;
  setHaptics: (on: boolean) => void;
  setSkipSeconds: (seconds: SkipSeconds) => void;
}

/** Tells the OS-level colour scheme to follow the choice, so every `useColorScheme()` in the app updates at once. */
function applyAppearance(mode: AppearanceMode) {
  // Browsers have no such override (react-native-web lacks it, so the web app follows the browser's own theme).
  // A throw here would stop the store from ever reporting "loaded", and the app would never leave the splash screen.
  try {
    if (typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
    }
  } catch {
    // ignore: the theme just stays on the system setting
  }
}

/** Device preferences (not tied to an account): theme and vibration feedback. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'system',
      haptics: true,
      skipSeconds: DEFAULT_SKIP,
      setAppearance: (appearance) => {
        applyAppearance(appearance);
        set({ appearance });
      },
      setHaptics: (haptics) => set({ haptics }),
      setSkipSeconds: (skipSeconds) => set({ skipSeconds: sanitizeSkip(skipSeconds) }),
    }),
    {
      name: 'octolearn.settings.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ appearance, haptics, skipSeconds }) => ({ appearance, haptics, skipSeconds }),
      // Saved values are re-checked: anything unexpected falls back to the default.
      merge: (saved, current) => {
        const s = (typeof saved === 'object' && saved !== null ? saved : {}) as Record<string, unknown>;
        return {
          ...current,
          appearance: MODES.includes(s.appearance as AppearanceMode) ? (s.appearance as AppearanceMode) : current.appearance,
          haptics: typeof s.haptics === 'boolean' ? s.haptics : current.haptics,
          skipSeconds: sanitizeSkip(s.skipSeconds),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) applyAppearance(state.appearance);
      },
    },
  ),
);
