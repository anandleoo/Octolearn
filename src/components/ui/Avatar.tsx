import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

/** Circle with the first letter of the name (the brief allows an image or an initial). */
export function Avatar({ name, size = 88 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?';
  return (
    <View
      accessibilityLabel={`${name} аватар`}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accentSoft }]}
    >
      <AppText variant="display" color="accent" style={{ fontSize: size * 0.42, lineHeight: size * 0.55 }}>
        {initial}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({ circle: { alignItems: 'center', justifyContent: 'center' } });
