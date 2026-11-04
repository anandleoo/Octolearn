import { StyleSheet } from 'react-native';

import { HIT, radius, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  tone?: 'plain' | 'overlay' | 'circle';
}

/** Round icon-only button with a 48dp touch area. `label` is required: it's what screen readers say. */
export function IconButton({ icon, label, onPress, size = 24, tone = 'plain' }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={6}
      style={[
        styles.base,
        tone === 'overlay' && { backgroundColor: 'rgba(0,0,0,0.45)' },
        tone === 'circle' && { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
      ]}
    >
      <Icon name={icon} size={size} color={tone === 'overlay' ? '#FFFFFF' : colors.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { width: HIT, height: HIT, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
