import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Square tick box with a label; the whole row is the tap target. */
export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => onChange(!checked)}
      feedback="select"
      scaleTo={0.98}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          { backgroundColor: checked ? colors.accent : colors.surface, borderColor: checked ? colors.accent : colors.border },
        ]}
      >
        {checked && <Icon name="check" size={16} color={colors.onAccent} strokeWidth={3.5} />}
      </View>
      <AppText variant="body">{label}</AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, alignSelf: 'flex-start' },
  box: { width: 24, height: 24, borderRadius: radius.sm - 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
