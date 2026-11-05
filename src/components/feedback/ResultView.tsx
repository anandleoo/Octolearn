import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { Pill } from '../ui/Pill';
import { Confetti } from './Confetti';

interface ResultViewProps {
  tone: 'success' | 'reward' | 'fail';
  icon: IconName;
  title: string;
  subtitle: string;
  /** e.g. "+10 XP" */
  xpLabel?: string;
  /** e.g. "80%" under the subtitle for quiz results */
  detail?: string;
  confetti?: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** `cancel` for a plain dismiss (Close); `secondary` (violet) for another real choice such as Retry. */
  secondaryVariant?: 'secondary' | 'cancel';
}

/**
 * The celebration screen. Shown after finishing a lesson and after a quiz (wireframes 4 and 5),
 * so both share this one component and only change the words, icon and colour.
 */
export function ResultView({
  tone,
  icon,
  title,
  subtitle,
  xpLabel,
  detail,
  confetti,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryVariant = 'secondary',
}: ResultViewProps) {
  const { colors } = useTheme();
  const badge = useSharedValue(0);
  useEffect(() => {
    badge.value = withDelay(120, withSpring(1, { damping: 18, stiffness: 150 }));
  }, [badge]);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badge.value }, { rotate: `${(1 - badge.value) * -25}deg` }],
  }));

  const main = tone === 'success' ? colors.accent : tone === 'reward' ? colors.reward : colors.danger;
  const soft = tone === 'success' ? colors.accentSoft : tone === 'reward' ? colors.rewardSoft : colors.dangerSoft;

  return (
    <View style={styles.fill}>
      {confetti && <Confetti />}
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.badge,
            { backgroundColor: tone === 'reward' ? soft : main, borderColor: tone === 'reward' ? main : 'transparent' },
            badgeStyle,
          ]}
        >
          <Icon
            name={icon}
            size={56}
            color={tone === 'reward' ? main : '#FFFFFF'}
            strokeWidth={3}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(280).delay(250)} style={styles.texts}>
          <AppText variant="display" align="center">
            {title}
          </AppText>
          {detail && (
            <AppText variant="title" align="center" color={tone === 'fail' ? 'danger' : 'textMuted'}>
              {detail}
            </AppText>
          )}
          <AppText variant="body" color="textMuted" align="center">
            {subtitle}
          </AppText>
        </Animated.View>
        {xpLabel && (
          <Animated.View entering={FadeInDown.duration(280).delay(400)}>
            <Pill label={xpLabel} icon="xp" tone={tone === 'fail' ? 'muted' : 'accent'} />
          </Animated.View>
        )}
      </View>
      <Animated.View entering={FadeInDown.duration(280).delay(550)} style={styles.actions}>
        {secondaryLabel && onSecondary && (
          <Button label={secondaryLabel} onPress={onSecondary} variant={secondaryVariant} />
        )}
        <Button label={primaryLabel} onPress={onPrimary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 24 },
  badge: {
    width: 128,
    height: 128,
    borderRadius: radius.pill,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { gap: 8, alignItems: 'center' },
  actions: { gap: 12, paddingHorizontal: 20, paddingBottom: 20 },
});
