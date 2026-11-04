import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';

import { useExit } from '@/hooks/useExit';
import { getCourse } from '@/lib/curriculum';
import { haptic } from '@/lib/haptics';
import { confirmDialog } from '@/store/confirmStore';
import { useProgressStore } from '@/store/progressStore';
import { radius, useTheme } from '@/theme';
import type { Step } from '@/types';

import { ResultView } from '../feedback/ResultView';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { ProgressBar } from '../ui/ProgressBar';
import { Screen } from '../ui/Screen';
import { OptionRow, type OptionStatus } from './OptionRow';

const LETTERS = ['A', 'B', 'C'];

interface Outcome {
  correct: number;
  percent: number;
  passed: boolean;
  xpGained: number;
}

/** Multiple-choice quiz (brief section 3.4): one question per screen, check, feedback, result. */
export function QuizScreen({ step }: { step: Step }) {
  const { colors } = useTheme();
  const exit = useExit();
  const submitQuiz = useProgressStore((s) => s.submitQuiz);

  const quiz = step.quiz;
  const [attempt, setAttempt] = useState(0); // bumping this restarts the quiz with a clean state
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const submitted = useRef(false);

  if (!quiz) return null;
  const total = quiz.questions.length;
  const question = quiz.questions[index];
  if (!question) return null;
  const isCorrect = selected === question.answerIndex;
  const isLast = index === total - 1;

  const restart = () => {
    submitted.current = false;
    setAttempt((a) => a + 1);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrect(0);
    setOutcome(null);
  };

  const confirmExit = async () => {
    if (index === 0 && !checked) return exit();
    const leave = await confirmDialog({
      title: 'Шалгалтаас гарах уу?',
      message: 'Одоогийн хариултууд хадгалагдахгүй.',
      confirmLabel: 'Гарах',
      cancelLabel: 'Үргэлжлүүлэх',
      tone: 'danger',
      icon: 'close',
    });
    if (leave) exit();
  };

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      haptic('success');
    } else {
      haptic('error');
    }
  };

  const advance = () => {
    if (!isLast) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    if (submitted.current) return; // one submission per attempt, even on a double tap
    submitted.current = true;
    const result = submitQuiz(quiz.id, correct);
    if (!result.ok) return exit();
    setOutcome({ correct, percent: result.percent, passed: result.passed, xpGained: result.xpGained });
  };

  if (outcome) {
    return (
      <Screen edges={['top', 'bottom']}>
        {outcome.passed ? (
          <ResultView
            key={`pass-${attempt}`}
            tone="reward"
            icon="trophy"
            confetti
            title={`Тэнцлээ! ${outcome.correct} / ${total}`}
            detail={`${outcome.percent}%`}
            subtitle={step.index < (getCourse(step.courseId)?.steps.length ?? 0) - 1 ? 'Дараагийн бүлэг нээгдлээ' : 'Та курсийг бүрэн дуусгалаа'}
            xpLabel={outcome.xpGained > 0 ? `+${outcome.xpGained} XP` : undefined}
            primaryLabel="Үргэлжлүүлэх"
            onPrimary={exit}
            secondaryLabel="Дахин өгөх"
            onSecondary={restart}
          />
        ) : (
          <ResultView
            key={`fail-${attempt}`}
            tone="fail"
            icon="close"
            title={`${outcome.correct} / ${total}`}
            detail={`${outcome.percent}%`}
            subtitle={`Тэнцэхийн тулд ${quiz.passPercent}%-иас дээш оноо авах хэрэгтэй. Дахин оролдоорой!`}
            primaryLabel="Дахин өгөх"
            onPrimary={restart}
            secondaryLabel="Хаах"
            onSecondary={exit}
          />
        )}
      </Screen>
    );
  }

  const statusOf = (i: number): OptionStatus => {
    if (!checked) return i === selected ? 'selected' : 'idle';
    if (i === question.answerIndex) return 'correct';
    if (i === selected) return 'wrong';
    return 'dimmed';
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.top}>
        <IconButton icon="close" label="Шалгалтаас гарах" onPress={confirmExit} tone="circle" size={22} />
        <View style={styles.bar}>
          <ProgressBar value={(index + (checked ? 1 : 0)) / total} color="success" label="Шалгалтын ахиц" />
        </View>
        <AppText variant="caption" color="textMuted" style={styles.counter}>
          Асуулт {index + 1} / {total}
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View key={`${attempt}-${question.id}`} entering={FadeInRight.duration(280)} style={styles.question}>
          <AppText variant="title" accessibilityRole="header">
            {question.text}
          </AppText>
          <View style={styles.options}>
            {question.options.map((text, i) => (
              <OptionRow
                key={text}
                letter={LETTERS[i] ?? String(i + 1)}
                text={text}
                status={statusOf(i)}
                disabled={checked}
                onPress={() => setSelected(i)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {checked ? (
        <Animated.View
          entering={FadeInUp.duration(240)}
          style={[styles.feedback, { backgroundColor: isCorrect ? colors.successSoft : colors.dangerSoft }]}
        >
          <View style={styles.feedbackText}>
            <Icon name={isCorrect ? 'check' : 'close'} size={24} color={isCorrect ? colors.success : colors.danger} />
            <View style={styles.feedbackLabel} accessibilityLiveRegion="polite">
              <AppText variant="heading" style={{ color: isCorrect ? colors.success : colors.danger }}>
                {isCorrect ? 'Зөв!' : 'Буруу'}
              </AppText>
              {!isCorrect && (
                <AppText variant="body" style={{ color: colors.danger }}>
                  Зөв хариулт: {question.options[question.answerIndex]}
                </AppText>
              )}
            </View>
          </View>
          <Button label={isLast ? 'Дүнг харах' : 'Үргэлжлүүлэх'} onPress={advance} variant={isCorrect ? 'primary' : 'danger'} />
        </Animated.View>
      ) : (
        <View style={styles.footer}>
          <Button label="Шалгах" onPress={check} disabled={selected === null} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 16, paddingBottom: 4, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  bar: { flex: 1, paddingHorizontal: 16 },
  counter: { width: '100%', textAlign: 'right', marginTop: 2 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  question: { gap: 24 },
  options: { gap: 12 },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  feedback: {
    padding: 20,
    paddingBottom: 16,
    gap: 16,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  feedbackText: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  feedbackLabel: { flex: 1, gap: 2 },
});
