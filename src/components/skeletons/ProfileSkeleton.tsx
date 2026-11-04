import { StyleSheet, View } from 'react-native';

import { radius } from '@/theme';

import { Skeleton } from '../ui/Skeleton';

/** Profile while progress loads: title, the identity card, six stat tiles and the week chart. */
export function ProfileSkeleton() {
  return (
    <View accessibilityLabel="Ачаалж байна" accessibilityState={{ busy: true }} style={styles.fill}>
      <View style={styles.title}>
        <Skeleton width={140} height={30} />
      </View>
      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.identity}>
            <Skeleton width={72} height={72} rounded={36} />
            <View style={styles.texts}>
              <Skeleton width={150} height={22} />
              <Skeleton width={190} height={14} />
              <Skeleton width={120} height={14} />
            </View>
          </View>
          <Skeleton height={48} />
          <Skeleton height={8} rounded={4} />
        </View>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.tiles}>
            <Skeleton height={96} style={styles.tile} />
            <Skeleton height={96} style={styles.tile} />
          </View>
        ))}
        <Skeleton height={150} rounded={radius.lg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  title: { height: 76, paddingHorizontal: 20, justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  hero: { gap: 16, padding: 16, borderRadius: radius.lg },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  texts: { flex: 1, gap: 8 },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, width: undefined },
});
