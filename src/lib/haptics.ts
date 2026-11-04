import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';

type Kind = 'tap' | 'select' | 'success' | 'error' | 'warning';

/** Tiny vibration feedback. Never throws: unsupported devices (web, some emulators) just do nothing. */
export function haptic(kind: Kind = 'tap') {
  if (Platform.OS === 'web' || !useSettingsStore.getState().haptics) return;
  const run = async () => {
    switch (kind) {
      case 'tap':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'select':
        return Haptics.selectionAsync();
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };
  run().catch(() => {});
}
