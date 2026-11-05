import { type ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';

/** Screens whose entrance already played in this app session. Lives in memory, so a restart plays it again. */
const played = new Set<string>();

const DURATION_MS = 320;
const STAGGER_MS = 60;
/** Extra time after the animation should have ended before the safety net below takes over. */
const SAFETY_MS = 400;

interface RevealProps {
  children: ReactNode;
  /** Items with a higher index appear a little later, creating a cascade. */
  index?: number;
  /**
   * Name of the screen. With it, the entrance plays only the first time that screen is shown;
   * coming back later just shows the content, with no motion.
   */
  once?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Fades and slides its content up (a short, calm move with no bounce). Wrap sections in this for the staggered entrance.
 *
 * This uses React Native's own Animated, not Reanimated: on Android, Reanimated's animations were seen to stall
 * (after leaving fullscreen and on some launches), which left whole sections invisible. The content must never
 * be hidden by decoration, so a plain timer also forces it fully visible.
 */
export function Reveal({ children, index = 0, once, style }: RevealProps) {
  // Decided during the first render, before any Reveal of the same screen marks it as played.
  const [animate] = useState(() => !once || !played.has(once));
  if (once && animate) queueMicrotask(() => played.add(once));

  const [progress] = useState(() => new Animated.Value(animate ? 0 : 1));
  const delay = index * STAGGER_MS;

  useEffect(() => {
    if (!animate) return;
    const entrance = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    entrance.start();
    const safety = setTimeout(() => {
      entrance.stop();
      progress.setValue(1);
    }, delay + DURATION_MS + SAFETY_MS);
    return () => {
      clearTimeout(safety);
      entrance.stop();
    };
  }, [animate, delay, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
