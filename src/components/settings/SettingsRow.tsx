import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';

interface SettingsRowProps {
  icon: IconName;
  label: string;
  /** Small grey text under the label (what the action does). */
  description?: string;
  /** Current value shown on the right (e.g. the name). */
  value?: string;
  /** Anything custom on the right, such as a switch. */
  trailing?: ReactNode;
  tone?: 'default' | 'danger';
  /** Makes the row tappable and shows a chevron. */
  onPress?: () => void;
}

/** One line in Settings: icon, label, optional value/description, and a chevron or control on the right. */
export function SettingsRow({ icon, label, description, value, trailing, tone = 'default', onPress }: SettingsRowProps) {
  const { colors } = useTheme();
  const danger = tone === 'danger';
  const body = (
    <>
      <View style={[styles.icon, { backgroundColor: danger ? colors.dangerSoft : colors.accentSoft }]}>
        <Icon name={icon} size={20} color={danger ? colors.danger : colors.accent} />
      </View>
      <View style={styles.text}>
        <AppText variant="body" color={danger ? 'danger' : 'text'} style={{ fontFamily: 'Nunito_700Bold' }}>
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
      ) : null}
      {trailing}
      {onPress && <Icon name="next" size={20} color={colors.textMuted} />}
    </>
  );

  if (!onPress) {
    return (
      <View accessible={!trailing} accessibilityLabel={value ? `${label}: ${value}` : label} style={styles.row}>
        {body}
      </View>
    );
  }
  return (
    <PressableScale onPress={onPress} scaleTo={0.99} accessibilityLabel={label} style={styles.row}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 64 },
  icon: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
  value: { maxWidth: '40%' },
});
