import { useEffect } from 'react';
import { ActivityIndicator, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { HIT, motion, radius, typography, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  /** Shows a spinner and ignores taps (while a request is running). */
  loading?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

/** Primary / secondary / danger button. Colours fade smoothly when it becomes enabled or disabled. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled: disabledProp = false,
  loading = false,
  icon,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const disabled = disabledProp || loading;
  const enabled = useSharedValue(disabled ? 0 : 1);

  useEffect(() => {
    enabled.value = withTiming(disabled ? 0 : 1, { duration: motion.base });
  }, [disabled, enabled]);

  const solid = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : colors.surface;
  const solidText = variant === 'secondary' ? colors.accent : colors.onAccent;
  const border = variant === 'secondary' ? colors.accent : 'transparent';
  const disabledBg = variant === 'secondary' ? colors.surface : colors.locked;
  const disabledText = colors.lockedIcon;

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(enabled.value, [0, 1], [disabledBg, solid]),
    borderColor: interpolateColor(enabled.value, [0, 1], [variant === 'secondary' ? colors.border : 'transparent', border]),
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(enabled.value, [0, 1], [disabledText, solidText]),
  }));
  const iconColor = disabled ? disabledText : solidText;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[styles.base, containerStyle, style]}
    >
      {loading ? <ActivityIndicator color={disabledText} /> : icon && <Icon name={icon} size={20} color={iconColor} />}
      <Animated.Text
        maxFontSizeMultiplier={1.3}
        style={[typography.heading, styles.label, textStyle]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: HIT + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { textAlign: 'center' },
});
