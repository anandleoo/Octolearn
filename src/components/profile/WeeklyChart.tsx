import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { motion, radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';

const DAY_LABELS = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
const MAX_BAR = 84;

function Bar({ ratio, isToday, delay }: { ratio: number; isToday: boolean; delay: number }) {
  const { colors } = useTheme();
  const grow = useSharedValue(0);
  useEffect(() => {
    grow.value = withDelay(delay, withSpring(ratio, motion.softSpring));
  }, [ratio, delay, grow]);
  const style = useAnimatedStyle(() => ({ height: 8 + grow.value * (MAX_BAR - 8) }));
  return (
    <Animated.View
      style={[styles.bar, { backgroundColor: isToday ? colors.accent : colors.accentSoft }, style]}
    />
  );
}

interface WeeklyChartProps {
  days: { key: string; date: Date; xp: number }[];
}

/** Seven bars, one per day, oldest to today. Bar height = XP earned that day. */
export function WeeklyChart({ days }: WeeklyChartProps) {
  const max = Math.max(1, ...days.map((d) => d.xp));
  const summary = days.map((d) => `${DAY_LABELS[d.date.getDay()]} ${d.xp} XP`).join(', ');
  return (
    <View accessible accessibilityLabel={`Энэ долоо хоногийн идэвх: ${summary}`} style={styles.row}>
      {days.map((day, i) => (
        <View key={day.key} style={styles.col}>
          <View style={styles.barSlot}>
            <Bar ratio={day.xp / max} isToday={i === days.length - 1} delay={i * 60} />
          </View>
          <AppText variant="caption" color="textMuted">
            {DAY_LABELS[day.date.getDay()]}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  barSlot: { height: MAX_BAR, justifyContent: 'flex-end', width: '100%' },
  bar: { width: '100%', borderRadius: radius.sm },
});
