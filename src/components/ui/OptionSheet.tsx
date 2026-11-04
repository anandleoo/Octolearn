import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';

export interface Option<T extends string> {
  value: T;
  label: string;
  /** One line explaining the choice. */
  description?: string;
  icon?: IconName;
  /** Small text on the right, e.g. "40%". */
  trailing?: string;
}

interface OptionSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: Option<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** The popup list of a dropdown: each choice has an icon, a name and a short explanation. Picking one closes it. */
export function OptionSheet<T extends string>({ visible, title, options, value, onSelect, onClose }: OptionSheetProps<T>) {
  const { colors } = useTheme();
  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <View accessibilityRole="radiogroup" accessibilityLabel={title} style={styles.list}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <PressableScale
              key={o.value}
              feedback="select"
              scaleTo={0.98}
              accessibilityRole="radio"
              accessibilityLabel={o.description ? `${o.label}. ${o.description}` : o.label}
              accessibilityState={{ selected }}
              onPress={() => {
                onSelect(o.value);
                onClose();
              }}
              style={[
                styles.row,
                { backgroundColor: selected ? colors.accentSoft : colors.surface, borderColor: selected ? colors.accent : colors.border },
              ]}
            >
              {o.icon && (
                <View style={[styles.icon, { backgroundColor: selected ? colors.surface : colors.surfaceAlt }]}>
                  <Icon name={o.icon} size={20} color={selected ? colors.accent : colors.textMuted} />
                </View>
              )}
              <View style={styles.text}>
                <AppText variant="body" style={{ fontFamily: 'Nunito_700Bold' }}>
                  {o.label}
                </AppText>
                {o.description ? (
                  <AppText variant="caption" color="textMuted">
                    {o.description}
                  </AppText>
                ) : null}
              </View>
              {o.trailing ? (
                <AppText variant="caption" color="textMuted">
                  {o.trailing}
                </AppText>
              ) : null}
              {selected && <Icon name="check" size={20} color={colors.accent} strokeWidth={3} />}
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, borderWidth: 1.5, minHeight: 64 },
  icon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
});
