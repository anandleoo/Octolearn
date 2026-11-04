import { Text, type TextProps } from 'react-native';

import { type ColorName, type TextVariant, typography, useTheme } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  /** A theme colour name, so text follows light/dark mode automatically. */
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only text component the app uses. Font, size and colour come from the theme,
 * so changing the look of every heading is a one-line edit in theme/index.ts.
 */
export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      // Let people enlarge text a bit for readability, but cap it so layouts don't break.
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
    />
  );
}
