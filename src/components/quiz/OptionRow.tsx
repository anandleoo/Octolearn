import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';

export type OptionStatus = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

const ORDER: OptionStatus[] = ['idle', 'selected', 'correct', 'wrong', 'dimmed'];

interface OptionRowProps {
  letter: string;
  text: string;
  status: OptionStatus;
  disabled: boolean;
  onPress: () => void;
}

/** One answer choice. Colours glide between states; the right answer bounces, a wrong one shakes. */
export function OptionRow({ letter, text, status, disabled, onPress }: OptionRowProps) {
  const { colors } = useTheme();
  const index = useSharedValue(ORDER.indexOf(status));
  const bounce = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    index.value = withTiming(ORDER.indexOf(status), { duration: 200 });
    if (status === 'correct') bounce.value = withSequence(withSpring(1.02, { damping: 16 }), withSpring(1, { damping: 20 }));
    if (status === 'wrong') {
      shake.value = withSequence(
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 80 }),
        withTiming(-5, { duration: 70 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [status, index, bounce, shake]);

  const steps = [0, 1, 2, 3, 4];
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(index.value, steps, [colors.surface, colors.accentSoft, colors.successSoft, colors.dangerSoft, colors.surface]),
    borderColor: interpolateColor(index.value, steps, [colors.border, colors.accent, colors.success, colors.danger, colors.border]),
    opacity: status === 'dimmed' ? 0.55 : 1,
    transform: [{ scale: bounce.value }, { translateX: shake.value }],
  }));

  const accent = status === 'correct' ? colors.success : status === 'wrong' ? colors.danger : colors.accent;
  const marked = status === 'selected' || status === 'correct' || status === 'wrong';

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      feedback="select"
      scaleTo={0.98}
      accessibilityLabel={`${letter}. ${text}`}
      accessibilityState={{ selected: status === 'selected', disabled }}
      style={[styles.row, style]}
    >
      <View style={[styles.letter, { borderColor: marked ? accent : colors.border, backgroundColor: marked ? accent : 'transparent' }]}>
        {status === 'correct' ? (
          <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.4} />
        ) : status === 'wrong' ? (
          <Icon name="close" size={16} color="#FFFFFF" strokeWidth={2.6} />
        ) : (
          <AppText variant="caption" style={{ color: marked ? '#FFFFFF' : colors.textMuted, fontFamily: 'Nunito_800ExtraBold' }}>
            {letter}
          </AppText>
        )}
      </View>
      <AppText variant="heading" style={styles.text}>
        {text}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  letter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
});
