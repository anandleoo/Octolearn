import { StyleSheet, View } from 'react-native';

import { radius } from '@/theme';

import { Skeleton } from '../ui/Skeleton';

/** Courses while progress loads: title, the course dropdown, the course card and a few collapsed unit rows. */
export function CoursesSkeleton() {
  return (
    <View accessibilityLabel="Ачаалж байна" accessibilityState={{ busy: true }} style={styles.fill}>
      <View style={styles.title}>
        <Skeleton width={190} height={30} />
      </View>
      <View style={styles.body}>
        <View style={styles.block}>
          <Skeleton width={90} height={12} />
          <Skeleton height={64} />
        </View>
        <Skeleton height={190} rounded={radius.lg} />
        <Skeleton width={150} height={20} />
        <View style={styles.block}>
          <Skeleton height={48} />
          <Skeleton height={72} rounded={radius.lg} />
          <Skeleton height={72} rounded={radius.lg} />
          <Skeleton height={72} rounded={radius.lg} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  title: { height: 76, paddingHorizontal: 20, justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 16, gap: 24 },
  block: { gap: 12 },
});
