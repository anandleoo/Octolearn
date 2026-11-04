import { StyleSheet, View } from 'react-native';

import { HEADER_HEIGHT } from '@/lib/pathLayout';
import { radius } from '@/theme';

import { Skeleton } from '../ui/Skeleton';

/** Zig-zag offsets (px from centre) for the placeholder path dots. */
const DOTS = [0, -44, 30, -26, 40, 0];

/** Home while progress loads: header, one unit banner and a zig-zag of grey dots, in the same places as the real thing. */
export function HomeSkeleton() {
  return (
    <View accessibilityLabel="Ачаалж байна" accessibilityState={{ busy: true }} style={styles.fill}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Skeleton width={44} height={44} rounded={22} />
          <View style={styles.greeting}>
            <Skeleton width={60} height={12} />
            <Skeleton width={120} height={20} />
          </View>
          <Skeleton width={72} height={30} rounded={15} />
          <Skeleton width={80} height={30} rounded={15} />
        </View>
        <Skeleton height={8} rounded={4} />
        <Skeleton width="70%" height={12} />
      </View>
      <View style={styles.body}>
        <Skeleton height={HEADER_HEIGHT} rounded={radius.lg} />
        <View style={styles.path}>
          {DOTS.map((offset, i) => (
            <Skeleton key={i} width={72} height={72} rounded={36} style={{ transform: [{ translateX: offset }] }} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { flex: 1, gap: 6 },
  body: { paddingHorizontal: 20, paddingTop: 16, gap: 28 },
  path: { alignItems: 'center', gap: 32 },
});
