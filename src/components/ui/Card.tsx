import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { radius, useTheme } from '@/theme';

interface CardProps {
  children: ReactNode;
  /** outlined: white with a thin border. soft: flat grey block. accent: solid violet. */
  tone?: 'outlined' | 'soft' | 'accent';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, tone = 'outlined', style }: CardProps) {
  const { colors } = useTheme();
  const toneStyle: ViewStyle =
    tone === 'outlined'
      ? { backgroundColor: colors.surface, borderColor: colors.border }
      : tone === 'soft'
        ? { backgroundColor: colors.surfaceAlt, borderColor: 'transparent' }
        : { backgroundColor: colors.accent, borderColor: 'transparent' };
  return <View style={[styles.card, toneStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
});
