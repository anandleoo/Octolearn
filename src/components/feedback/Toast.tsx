import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore, type ToastTone } from '@/store/toastStore';
import { radius, useTheme, type ColorName } from '@/theme';

import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';

const VISIBLE_MS = 2600;
/** Height of the floating tab bar plus its margin, so the toast sits just above it. */
const ABOVE_TAB_BAR = 96;

/** Every tone is a light tinted card: soft background, matching border and icon, normal dark text. */
const TONES: Record<ToastTone, { bg: ColorName; edge: ColorName; icon: IconName }> = {
  info: { bg: 'accentSoft', edge: 'accent', icon: 'info' },
  success: { bg: 'successSoft', edge: 'success', icon: 'check' },
  danger: { bg: 'dangerSoft', edge: 'danger', icon: 'close' },
};

/** Mounted once in the root layout. Anything in the app can call showToast("…") to use it. */
export function ToastHost() {
  const { id, message, tone, hide } = useToastStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [id, message, hide]);

  if (!message) return null;
  const look = TONES[tone];

  return (
    <Animated.View
      key={id}
      // A short fade and small slide: no spring, so nothing overshoots or wobbles.
      entering={FadeInUp.duration(220)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.toast, { bottom: Math.max(insets.bottom, 12) + ABOVE_TAB_BAR, backgroundColor: colors[look.bg], borderColor: colors[look.edge] }]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surface }]}>
        <Icon name={look.icon} size={16} color={colors[look.edge]} strokeWidth={3} />
      </View>
      <AppText variant="body" style={styles.text}>
        {message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  icon: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
