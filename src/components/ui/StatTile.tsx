import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface StatTileProps {
  value: string;
  label: string;
  icon?: IconName;
}

/** Bordered number + caption tile: the profile grid and the lesson's info row both use it. */
export function StatTile({ value, label, icon }: StatTileProps) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.tile, { borderColor: colors.border, backgroundColor: colors.surface }]}
    >
      {icon && <Icon name={icon} size={20} color={colors.accent} />}
      <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText variant="caption" numberOfLines={1} color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: 14, gap: 4, minHeight: 96 },
});
