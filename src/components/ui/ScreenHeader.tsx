import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { IconButton } from './IconButton';
import type { IconName } from './Icon';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  icon?: IconName;
  backLabel?: string;
  right?: React.ReactNode;
}

/** Top bar for stacked screens (lesson, quiz): back/close button on the left, title in the middle. */
export function ScreenHeader({ title, onBack, icon = 'back', backLabel = 'Буцах', right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <IconButton icon={icon} label={backLabel} onPress={onBack} tone="circle" size={22} />
      <AppText variant="heading" style={styles.title} numberOfLines={1}>
        {title}
      </AppText>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, minHeight: 60 },
  title: { flex: 1, textAlign: 'center' },
  side: { width: 48, alignItems: 'center' },
});
