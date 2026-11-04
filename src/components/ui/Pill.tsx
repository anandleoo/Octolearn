import { StyleSheet, View } from 'react-native';

import { radius, useTheme, type ColorName } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Tone = 'accent' | 'reward' | 'success' | 'muted';

const TONES: Record<Tone, { bg: ColorName; fg: ColorName }> = {
  accent: { bg: 'accentSoft', fg: 'accent' },
  reward: { bg: 'rewardSoft', fg: 'reward' },
  success: { bg: 'successSoft', fg: 'success' },
  muted: { bg: 'surfaceAlt', fg: 'textMuted' },
};

interface PillProps {
  label: string;
  icon?: IconName;
  tone?: Tone;
}

/** Small rounded label with an optional icon: "90 XP", "3 өдөр", "+10 XP", "Түвшин 3". */
export function Pill({ label, icon, tone = 'accent' }: PillProps) {
  const { colors } = useTheme();
  const { bg, fg } = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: colors[bg] }]}>
      {icon && <Icon name={icon} size={16} color={colors[fg]} strokeWidth={2.2} />}
      <AppText variant="caption" style={{ color: colors[fg], fontFamily: 'Nunito_800ExtraBold' }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
