import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { fonts, HIT, radius, typography, useTheme } from '@/theme';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

/** Rounded search box with a magnifier and a clear (x) button that appears once something is typed. */
export function SearchField({ value, onChangeText, placeholder }: SearchFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[styles.box, { backgroundColor: colors.surface, borderColor: focused ? colors.accent : colors.border }]}
    >
      <Icon name="search" size={20} color={focused ? colors.accent : colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        maxLength={60}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[typography.body, styles.input, { color: colors.text, fontFamily: fonts.semibold }]}
      />
      {value.length > 0 && (
        <PressableScale
          onPress={() => onChangeText('')}
          feedback={false}
          hitSlop={8}
          accessibilityLabel="Хайлтыг цэвэрлэх"
          style={styles.clear}
        >
          <Icon name="close" size={18} color={colors.textMuted} />
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: HIT + 4,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, paddingVertical: 10 },
  clear: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
