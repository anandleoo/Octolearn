import { useSyncExternalStore } from 'react';

import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

const settingsLoaded = () => useSettingsStore.persist.hasHydrated();

/** False until the saved settings and the saved sign-in have been read from the device (a few milliseconds). */
export function useHydrated(): boolean {
  const settings = useSyncExternalStore(
    (onChange) => useSettingsStore.persist.onFinishHydration(onChange),
    settingsLoaded,
    () => false,
  );
  const authStatus = useAuthStore((s) => s.status);
  return settings && authStatus !== 'loading';
}
