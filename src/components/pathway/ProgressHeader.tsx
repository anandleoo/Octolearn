import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { fonts, motion, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { Avatar } from '../ui/Avatar';
import { Pill } from '../ui/Pill';
import { ProgressBar } from '../ui/ProgressBar';

interface ProgressHeaderProps {
  name: string;
  courseTitle: string;
  xp: number;
  streak: number;
  completed: number;
  total: number;
  percent: number;
  /** Scroll position of the path. The header is big at the top and shrinks smoothly as you scroll down. */
  scrollY: SharedValue<number>;
}

const AVATAR_BIG = 44;
const AVATAR_SMALL = 34;
const SHRINK_OVER = 70; // pixels of scrolling over which the header finishes shrinking

/** Makes its children briefly grow whenever `value` changes, to draw the eye to the new number. */
function Bump({ value, children }: { value: number; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const first = useSharedValue(true);
  useEffect(() => {
    if (first.value) {
      first.value = false;
      return;
    }
    scale.value = withSequence(withSpring(1.12, motion.spring), withSpring(1, motion.spring));
  }, [value, scale, first]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/**
 * Header of Home (brief 3.2: progress and XP always visible).
 * At the top of the path it is roomy, with a big greeting; scrolling down folds it into a slim bar
 * (small name, small avatar, the same pills and progress bar), so the path gets the room.
 */
export function ProgressHeader({ name, courseTitle, xp, streak, completed, total, percent, scrollY }: ProgressHeaderProps) {
  const { colors } = useTheme();
  const t = (from: number, to: number) => {
    'worklet';
    return interpolate(scrollY.value, [0, SHRINK_OVER], [from, to], Extrapolation.CLAMP);
  };

  const avatarBox = useAnimatedStyle(() => ({ width: t(AVATAR_BIG, AVATAR_SMALL), height: t(AVATAR_BIG, AVATAR_SMALL) }));
  const avatarScale = useAnimatedStyle(() => ({ transform: [{ scale: t(1, AVATAR_SMALL / AVATAR_BIG) }] }));
  const hello = useAnimatedStyle(() => ({ height: t(18, 0), opacity: t(1, 0) }));
  const nameStyle = useAnimatedStyle(() => ({ fontSize: t(26, 17), lineHeight: t(32, 22) }));
  const details = useAnimatedStyle(() => ({ height: t(18, 0), opacity: t(1, 0) }));
  const line = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [20, SHRINK_OVER], [0, 1], Extrapolation.CLAMP) }));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <View style={styles.row}>
        <Animated.View style={avatarBox}>
          <Animated.View style={[styles.avatar, avatarScale]}>
            <Avatar name={name} size={AVATAR_BIG} />
          </Animated.View>
        </Animated.View>
        <View style={styles.greeting}>
          <Animated.View style={[styles.clip, hello]}>
            <AppText variant="caption" color="textMuted">
              Сайн уу,
            </AppText>
          </Animated.View>
          <Animated.Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
            style={[{ fontFamily: fonts.heavy, color: colors.text }, nameStyle]}
          >
            {name}
          </Animated.Text>
        </View>
        <Bump value={streak}>
          <Pill icon="flame" tone="reward" label={`${streak} өдөр`} />
        </Bump>
        <Bump value={xp}>
          <Pill icon="xp" tone="accent" label={`${xp} XP`} />
        </Bump>
      </View>
      <ProgressBar value={percent / 100} height={8} label="Курсийн ахиц" />
      <Animated.View style={[styles.clip, details]}>
        <View style={styles.caption}>
          <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.courseName}>
            {courseTitle}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {completed} / {total} алхам · {percent}%
          </AppText>
        </View>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.line, { backgroundColor: colors.border }, line]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: AVATAR_BIG, height: AVATAR_BIG, transformOrigin: 'top left' },
  greeting: { flex: 1, minWidth: 0 },
  clip: { overflow: 'hidden', justifyContent: 'center' },
  caption: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  courseName: { flex: 1 },
  line: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
});
