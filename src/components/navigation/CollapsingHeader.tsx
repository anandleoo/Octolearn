import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { fonts, useTheme } from '@/theme';

const LARGE_HEIGHT = 76;
const SMALL_HEIGHT = 52;
/** Pixels of scrolling over which the header finishes shrinking. */
const SHRINK_OVER = 60;

interface CollapsingHeaderProps {
  title: string;
  /** Scroll position of the page below (from useScreenScroll). */
  scrollY: SharedValue<number>;
  /** Buttons on the right (e.g. the settings gear). They stay in place while the header shrinks. */
  right?: ReactNode;
}

/**
 * Page title bar that stays pinned at the top. At the top of the page it is tall with a big title;
 * scrolling down shrinks its height and font size into a slim bar, so the content below gets the room
 * and a thin line fades in to separate them. Used by Courses and Profile (Home has its own version).
 */
export function CollapsingHeader({ title, scrollY, right }: CollapsingHeaderProps) {
  const { colors } = useTheme();
  const t = (from: number, to: number) => {
    'worklet';
    return interpolate(scrollY.value, [0, SHRINK_OVER], [from, to], Extrapolation.CLAMP);
  };
  const box = useAnimatedStyle(() => ({ height: t(LARGE_HEIGHT, SMALL_HEIGHT) }));
  const text = useAnimatedStyle(() => ({ fontSize: t(32, 19), lineHeight: t(40, 26) }));
  const line = useAnimatedStyle(() => ({ opacity: t(0, 1) }));

  return (
    <Animated.View style={[styles.bar, { backgroundColor: colors.bg }, box]}>
      <Animated.Text
        accessibilityRole="header"
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
        style={[styles.title, { color: colors.text, fontFamily: fonts.heavy }, text]}
      >
        {title}
      </Animated.Text>
      {right ? <View style={styles.right}>{right}</View> : null}
      <Animated.View pointerEvents="none" style={[styles.line, { backgroundColor: colors.border }, line]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { justifyContent: 'center', paddingHorizontal: 20 },
  title: { paddingRight: 56 },
  right: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  line: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
});
