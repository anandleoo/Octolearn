import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

const PIECES = 26;

/** Same input always gives the same "random" numbers, so the pattern is stable between renders. */
function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function Piece({ index, height, width, color }: { index: number; height: number; width: number; color: string }) {
  const t = useSharedValue(0);
  const x0 = seeded(index + 1) * width;
  const drift = (seeded(index + 40) - 0.5) * 120;
  const spin = (seeded(index + 80) - 0.5) * 720;
  const delay = seeded(index + 120) * 450;
  const size = 7 + seeded(index + 160) * 7;

  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 1800 + seeded(index + 200) * 900, easing: Easing.out(Easing.quad) }));
  }, [t, delay, index]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, t.value - 0.75) * 4,
    transform: [
      { translateX: x0 + drift * t.value },
      { translateY: -20 + (height * 0.9) * t.value },
      { rotate: `${spin * t.value}deg` },
    ],
  }));

  return <Animated.View style={[styles.piece, { width: size, height: size * 1.5, backgroundColor: color }, style]} />;
}

/** One-shot celebration burst. Purely decorative, so it ignores touches and is hidden from screen readers. */
export function Confetti() {
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const palette = useMemo(
    () => [colors.accent, colors.success, colors.reward, colors.danger, '#3B9AE1'],
    [colors],
  );
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {Array.from({ length: PIECES }, (_, i) => (
        <Piece key={i} index={i} width={width} height={height} color={palette[i % palette.length] ?? colors.accent} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({ piece: { position: 'absolute', top: 0, left: 0, borderRadius: 2 } });
