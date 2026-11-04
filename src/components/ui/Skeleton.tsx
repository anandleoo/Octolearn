import { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  /** Corner radius. Defaults to the normal card radius; use a big number for circles. */
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}

/** A grey block that gently pulses: a placeholder while real content loads. */
export function Skeleton({ width = '100%', height, rounded = radius.md, style }: SkeletonProps) {
  const { colors } = useTheme();
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);
  const animated = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius: rounded, backgroundColor: colors.locked }, animated, style]}
    />
  );
}
