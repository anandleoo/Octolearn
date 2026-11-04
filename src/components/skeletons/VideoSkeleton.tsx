import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon } from '../ui/Icon';
import { Skeleton } from '../ui/Skeleton';

/** Fills the video box while the video is loading: a pulsing block with a faint play icon. */
export function VideoSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityLabel="Видео ачаалж байна">
      <Skeleton height={0} rounded={0} style={[StyleSheet.absoluteFill, styles.fill]} />
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Icon name="play" size={34} color={colors.lockedIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
