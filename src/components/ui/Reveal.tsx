import { type ReactNode, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

/** Screens whose entrance already played in this app session. Lives in memory, so a restart plays it again. */
const played = new Set<string>();

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

/** Fades and slides its content up (a short, calm move with no bounce). Wrap sections in this for the staggered entrance. */
export function Reveal({ children, index = 0, once, style }: RevealProps) {
  // Decided during the first render, before any Reveal of the same screen marks it as played.
  const [animate] = useState(() => !once || !played.has(once));
  if (once && animate) queueMicrotask(() => played.add(once));
  return (
    <Animated.View entering={animate ? FadeInDown.duration(320).delay(index * 60) : undefined} style={style}>
      {children}
    </Animated.View>
  );
}
