import { StyleSheet, View } from 'react-native';

import type { Achievement } from '@/lib/gamification';
import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

/** Badge rows: violet icon when earned, grey with the hint on how to earn it when not. */
export function AchievementList({ items }: { items: Achievement[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.list}>
      {items.map((a) => (
        <View
          key={a.id}
          accessible
          accessibilityLabel={`${a.title}. ${a.unlocked ? 'Авсан' : a.hint}`}
          style={styles.row}
        >
          <View style={[styles.icon, { backgroundColor: a.unlocked ? colors.accentSoft : colors.surfaceAlt }]}>
            <Icon name={a.unlocked ? a.icon : 'lock'} size={20} color={a.unlocked ? colors.accent : colors.lockedIcon} />
          </View>
          <View style={styles.text}>
            <AppText variant="body" color={a.unlocked ? 'text' : 'textMuted'} style={{ fontFamily: 'Nunito_700Bold' }}>
              {a.title}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {a.unlocked ? 'Авсан' : a.hint}
            </AppText>
          </View>
          {a.unlocked && <Icon name="check" size={20} color={colors.success} strokeWidth={3} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
});
