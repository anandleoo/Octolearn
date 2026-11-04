import { StyleSheet, View } from 'react-native';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DonutProgress } from '../ui/DonutProgress';

interface CourseCardProps {
  title: string;
  subtitle: string;
  lessonsDone: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  percent: number;
  /** "Үргэлжлүүлэх" while there is something left, "Дахин үзэх" once everything is done. */
  finished: boolean;
  onContinue: () => void;
}

/** The course the learner is on: a progress ring, title, how far along, and one button to jump back in. */
export function CourseCard({
  title,
  subtitle,
  lessonsDone,
  totalLessons,
  quizzesPassed,
  totalQuizzes,
  percent,
  finished,
  onContinue,
}: CourseCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <DonutProgress value={percent / 100} label={`${percent}%`} accessibilityLabel="Курсийн ахиц" />
        <View style={styles.text}>
          <AppText variant="overline" color="accent">
            {finished ? 'ДУУССАН' : 'ЯВАГДАЖ БУЙ'}
          </AppText>
          <AppText variant="heading" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {subtitle}
          </AppText>
        </View>
      </View>
      <View style={styles.counts}>
        <AppText variant="caption" color="textMuted">
          {lessonsDone} / {totalLessons} хичээл
        </AppText>
        <AppText variant="caption" color="textMuted">
          {quizzesPassed} / {totalQuizzes} шалгалт
        </AppText>
      </View>
      <Button label={finished ? 'Дахин үзэх' : 'Үргэлжлүүлэх'} icon="play" onPress={onContinue} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  text: { flex: 1, minWidth: 0, gap: 2 },
  counts: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
