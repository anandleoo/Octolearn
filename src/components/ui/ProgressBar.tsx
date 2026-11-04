import { useEffect } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion, radius, useTheme, type ColorName } from '@/theme';

interface ProgressBarProps {
  /** 0 to 1 */
  value: number;
  height?: number;
  color?: ColorName;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/** A bar whose fill glides to the new value whenever `value` changes. Used by the pathway, quiz and profile. */
export function ProgressBar({ value, height = 12, color = 'accent', label, style }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, value));
  const progress = useSharedValue(clamped);

  useEffect(() => {
    progress.value = withSpring(clamped, motion.softSpring);
  }, [clamped, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, progress.value)) * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, backgroundColor: colors.accentSoft }, style]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors[color] }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radius.pill, overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: radius.pill },
});
