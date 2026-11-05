import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

interface StateViewProps {
  kind: 'loading' | 'empty' | 'error';
  title?: string;
  message?: string;
  icon?: IconName;
  /** A drawn scene shown above the title (used instead of the small icon badge). */
  illustration?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** `cancel` for a plain dismiss (Back / Close); `secondary` (violet) for another real choice. */
  secondaryVariant?: 'secondary' | 'cancel';
  /** Smaller layout for inside a card or the video area. */
  compact?: boolean;
}

/** The one place that draws "loading", "nothing here" and "something went wrong". */
export function StateView({
  kind,
  title,
  message,
  icon,
  illustration,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  secondaryVariant = 'secondary',
  compact,
}: StateViewProps) {
  const { colors } = useTheme();
  const tint = kind === 'error' ? colors.danger : colors.accent;
  const tintSoft = kind === 'error' ? colors.dangerSoft : colors.accentSoft;

  return (
    <Animated.View entering={FadeIn.duration(250)} style={[styles.wrap, compact && styles.compact]}>
      {illustration ? (
        illustration
      ) : kind === 'loading' ? (
        <ActivityIndicator size="large" color={colors.accent} />
      ) : (
        <View style={[styles.badge, { backgroundColor: tintSoft }]}>
          <Icon name={icon ?? (kind === 'error' ? 'alert' : 'book')} size={30} color={tint} />
        </View>
      )}
      {title && (
        <AppText variant="heading" align="center">
          {title}
        </AppText>
      )}
      {message && (
        <AppText variant="body" color="textMuted" align="center">
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={illustration ? 'primary' : 'secondary'}
          icon={kind === 'error' ? 'refresh' : undefined}
          style={styles.action}
        />
      )}
      {secondaryLabel && onSecondary && (
        <Button label={secondaryLabel} onPress={onSecondary} variant={secondaryVariant} style={styles.secondary} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  compact: { padding: 16 },
  badge: { width: 64, height: 64, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  action: { alignSelf: 'stretch', marginTop: 8 },
  secondary: { alignSelf: 'stretch' },
});
