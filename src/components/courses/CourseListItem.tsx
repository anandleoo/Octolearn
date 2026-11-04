import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon, type IconName } from '../ui/Icon';
import { DonutProgress } from '../ui/DonutProgress';

interface CourseListItemProps {
  title: string;
  subtitle: string;
  icon: IconName;
  unitCount: number;
  lessonCount: number;
  percent: number;
  onSwitch: () => void;
}

/** A course you are not on right now: what it is, how far you got, and a button to switch to it. */
export function CourseListItem({ title, subtitle, icon, unitCount, lessonCount, percent, onSwitch }: CourseListItemProps) {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <Icon name={icon} size={22} color={colors.accent} />
        </View>
        <View style={styles.text}>
          <AppText variant="heading" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {subtitle}
          </AppText>
        </View>
        <DonutProgress
          value={percent / 100}
          size={56}
          strokeWidth={6}
          label={`${percent}%`}
          accessibilityLabel={`${title}: ахиц`}
        />
      </View>
      <AppText variant="caption" color="textMuted">
        {unitCount} бүлэг · {lessonCount} хичээл
      </AppText>
      <Button label={percent > 0 ? 'Энэ курс руу шилжих' : 'Эхлэх'} variant="secondary" onPress={onSwitch} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0, gap: 1 },
});
