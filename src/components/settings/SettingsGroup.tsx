import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { CollapsibleSection } from '../ui/CollapsibleSection';

interface SettingsGroupProps {
  title: string;
  /** Red heading and border: for actions that delete things. */
  danger?: boolean;
  /** Folded away until the heading is tapped (used for the danger zone so it can't be hit by accident). */
  collapsible?: boolean;
  children: ReactNode;
}

/** A titled card holding a list of rows, with a thin divider between them. */
export function SettingsGroup({ title, danger, collapsible, children }: SettingsGroupProps) {
  const { colors } = useTheme();
  const rows = Children.toArray(children);
  const card = (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: danger ? colors.danger : colors.border }]}>
      {rows.map((row, i) => (
        <View key={i}>
          {i > 0 && <View style={[styles.divider, { backgroundColor: danger ? colors.dangerSoft : colors.border }]} />}
          {row}
        </View>
      ))}
    </View>
  );

  if (collapsible) {
    return (
      <CollapsibleSection title={title} titleVariant="overline" titleColor={danger ? 'danger' : 'textMuted'} defaultOpen={false}>
        {card}
      </CollapsibleSection>
    );
  }
  return (
    <View style={styles.wrap}>
      <AppText variant="overline" color={danger ? 'danger' : 'textMuted'} accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {card}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  title: { paddingHorizontal: 4 },
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  divider: { height: 1, marginLeft: 64 },
});
