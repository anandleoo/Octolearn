import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { fonts, useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DonutProgressProps {
  /** 0 to 1 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Text in the middle, e.g. "42%". */
  label?: string;
  /** Screen-reader name, e.g. "Курсийн ахиц". */
  accessibilityLabel: string;
}

/**
 * A ring that fills clockwise from the top as `value` grows. It has a fixed size, so unlike a bar it
 * can never stretch past its container; used on the Courses page.
 */
export function DonutProgress({ value, size = 96, strokeWidth = 10, label, accessibilityLabel }: DonutProgressProps) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(clamped);
  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [clamped, progress]);

  const ring = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - progress.value) }));
  const center = size / 2;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.accentSoft} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={ring}
          fill="none"
          rotation={-90}
          originX={center}
          originY={center}
        />
      </Svg>
      {label ? (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Animated.Text
            allowFontScaling={false}
            style={{ color: colors.text, fontFamily: fonts.heavy, fontSize: size * 0.24 }}
          >
            {label}
          </Animated.Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
