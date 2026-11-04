import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppearanceMode = 'system' | 'light' | 'dark';
const MODES: AppearanceMode[] = ['system', 'light', 'dark'];

interface SettingsState {
  appearance: AppearanceMode;
  haptics: boolean;
  setAppearance: (mode: AppearanceMode) => void;
  setHaptics: (on: boolean) => void;
}

/** Tells the OS-level colour scheme to follow the choice, so every `useColorScheme()` in the app updates at once. */
function applyAppearance(mode: AppearanceMode) {
  Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
}

/** Device preferences (not tied to an account): theme and vibration feedback. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'system',
      haptics: true,
      setAppearance: (appearance) => {
        applyAppearance(appearance);
        set({ appearance });
      },
      setHaptics: (haptics) => set({ haptics }),
    }),
    {
      name: 'octolearn.settings.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ appearance, haptics }) => ({ appearance, haptics }),
      // Saved values are re-checked: anything unexpected falls back to the default.
      merge: (saved, current) => {
        const s = (typeof saved === 'object' && saved !== null ? saved : {}) as Record<string, unknown>;
        return {
          ...current,
          appearance: MODES.includes(s.appearance as AppearanceMode) ? (s.appearance as AppearanceMode) : current.appearance,
          haptics: typeof s.haptics === 'boolean' ? s.haptics : current.haptics,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) applyAppearance(state.appearance);
      },
    },
  ),
);
