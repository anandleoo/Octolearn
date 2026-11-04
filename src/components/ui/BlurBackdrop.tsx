import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

/**
 * The frosted backdrop behind every popup (dropdowns, sheets, confirm dialogs). Tapping it closes the popup.
 * iOS blurs what is behind it; on Android the blur is not available inside a popup window,
 * so the extra tint layer keeps the same "dimmed" look.
 */
export function BlurBackdrop({ onPress }: { onPress: () => void }) {
  const { isDark } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Хаах" onPress={onPress} style={StyleSheet.absoluteFill}>
      <BlurView intensity={28} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(23,20,43,0.28)' }]}
      />
    </Pressable>
  );
}
