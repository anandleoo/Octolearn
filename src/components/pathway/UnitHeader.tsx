import { StyleSheet, View } from 'react-native';

import { HEADER_HEIGHT } from '@/lib/pathLayout';
import { radius, useTheme } from '@/theme';
import type { Unit } from '@/types';

import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

interface UnitHeaderProps {
  unit: Unit;
  /** 0-based position of the unit (shown as БҮЛЭГ 1, 2, 3). */
  unitIndex: number;
  locked: boolean;
  /** lessons done in this unit, shown as "2 / 5" */
  done: number;
}

/** Banner above each unit: "БҮЛЭГ 2" + title + progress. Goes neutral grey while the unit is locked. */
export function UnitHeader({ unit, unitIndex, locked, done }: UnitHeaderProps) {
  const { colors } = useTheme();
  const bg = locked ? colors.surfaceAlt : colors.accentSoft;
  const fg = locked ? colors.lockedIcon : colors.accent;
  return (
    <View
      accessibilityRole="header"
      accessibilityLabel={`${unit.title}. ${unit.subtitle}${locked ? '. Түгжээтэй' : ''}`}
      style={[styles.card, { backgroundColor: bg }]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surface }]}>
        <Icon name={locked ? 'lock' : 'book'} size={22} color={fg} />
      </View>
      <View style={styles.texts}>
        <AppText variant="overline" style={{ color: fg, opacity: 0.8 }}>
          БҮЛЭГ {unitIndex + 1}
        </AppText>
        <AppText variant="heading" numberOfLines={1} style={{ color: fg }}>
          {unit.title.replace(/^Бүлэг \d+:\s*/, '')}
        </AppText>
        <AppText variant="caption" numberOfLines={1} style={{ color: fg, opacity: 0.85 }}>
          {unit.subtitle}
        </AppText>
      </View>
      {!locked && (
        <View style={[styles.badge, { backgroundColor: colors.surface }]}>
          <AppText variant="caption" style={{ color: fg, fontFamily: 'Nunito_800ExtraBold' }}>
            {done}/{unit.lessons.length}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: HEADER_HEIGHT,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 1 },
  badge: {
    minWidth: 44,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
