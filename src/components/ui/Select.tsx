import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HIT, radius, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { type Option, OptionSheet } from './OptionSheet';
import { PressableScale } from './PressableScale';

interface SelectProps<T extends string> {
  /** Small caption above the field. */
  label: string;
  /** Title of the popup list. */
  title: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A dropdown field. It shows the current choice (with its icon and explanation) and opens a blurred popup list. */
export function Select<T extends string>({ label, title, options, value, onChange }: SelectProps<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.99}
        accessibilityLabel={`${label}: ${current?.label ?? ''}`}
        accessibilityHint="Жагсаалтыг нээнэ"
        accessibilityState={{ expanded: open }}
        style={[styles.field, { backgroundColor: colors.surface, borderColor: open ? colors.accent : colors.border }]}
      >
        {current?.icon && (
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <Icon name={current.icon} size={20} color={colors.accent} />
          </View>
        )}
        <View style={styles.text}>
          <AppText variant="body" numberOfLines={1} style={{ fontFamily: 'Nunito_700Bold' }}>
            {current?.label ?? ''}
          </AppText>
          {current?.description ? (
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {current.description}
            </AppText>
          ) : null}
        </View>
        <Icon name="down" size={20} color={colors.textMuted} />
      </PressableScale>
      <OptionSheet visible={open} title={title} options={options} value={value} onSelect={onChange} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: 'Nunito_700Bold' },
  field: {
    minHeight: HIT + 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  icon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
});
