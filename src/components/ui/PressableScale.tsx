import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  /** Accepts normal styles and animated styles (from useAnimatedStyle). */
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  /** How small it gets while pressed. 1 = no squish. */
  scaleTo?: number;
  /** Vibration style on press. Pass false for none. */
  feedback?: 'tap' | 'select' | false;
}

/**
 * A button base that squishes slightly while pressed. Buttons, path nodes, quiz options
 * and tab items all use it, so every tap in the app feels the same.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  feedback = 'tap',
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, motion.spring);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, motion.spring);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (feedback) haptic(feedback);
        onPress?.(e);
      }}
      style={[animated, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
