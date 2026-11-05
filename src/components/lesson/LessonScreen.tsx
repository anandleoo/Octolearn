import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useExit } from '@/hooks/useExit';
import { useLessonPlayback, WATCH_THRESHOLD } from '@/hooks/useLessonPlayback';
import { checkOnline, useOnline } from '@/hooks/useOnline';
import { getCourse } from '@/lib/curriculum';
import { haptic } from '@/lib/haptics';
import { useProgressStore } from '@/store/progressStore';
import { showToast } from '@/store/toastStore';
import { spacing } from '@/theme';
import type { NodeState, Step } from '@/types';

import { ResultView } from '../feedback/ResultView';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { StatTile } from '../ui/StatTile';
import { ProgressBar } from '../ui/ProgressBar';
import { Reveal } from '../ui/Reveal';
import { Screen } from '../ui/Screen';
import { ScreenHeader } from '../ui/ScreenHeader';
import { OfflineCard } from './OfflineCard';
import { VideoErrorCard } from './VideoErrorCard';
import { VideoPlayer } from './VideoPlayer';

/** Video lesson screen (brief section 3.3). Rendered by the route only after StepGate approves it. */
export function LessonScreen({ step, state }: { step: Step; state: NodeState }) {
  const lesson = step.lesson;
  const exit = useExit();
  const router = useRouter();
  const { autoplay, fail } = useLocalSearchParams<{ autoplay?: string; fail?: string }>();
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const playback = useLessonPlayback(
    // `?fail=1` (used by the demo screen in Settings) points the player at a refused address to show the error page.
    fail === '1' ? 'https://blocked.invalid/demo.mp4' : (lesson?.videoUrl ?? ''),
    autoplay === '1',
  );
  const [reward, setReward] = useState<number | null>(null);
  const online = useOnline();

  // When the connection comes back and the video had failed, try it again without making the learner tap.
  const wasOnline = useRef(online);
  const { failed, retry } = playback;
  useEffect(() => {
    if (online && !wasOnline.current && failed) retry();
    wasOnline.current = online;
  }, [online, failed, retry]);

  if (!lesson) return null;
  const alreadyDone = state === 'completed';
  const total = step.unit.lessons.length;
  const course = getCourse(step.courseId);
  const next = course?.steps[step.index + 1];
  const lessonXp = course?.rewards.lessonXp ?? 0;

  const finish = () => {
    playback.pause();
    const result = completeLesson(step.id);
    if (!result.ok) return exit(); // refused by the store's own checks
    haptic('success');
    setReward(result.xpGained);
  };

  // Replace (not push) so the back button after a chain of lessons still returns to where you started.
  const goNext = () => {
    if (!next) return;
    router.replace(next.kind === 'lesson' ? `/lesson/${next.id}?autoplay=1` : `/quiz/${next.id}`);
  };
  const goHome = () => router.dismissTo('/');
  const retryVideo = () => (fail === '1' ? router.setParams({ fail: '0' }) : playback.retry());
  // No internet and the video is not playing: say so, instead of a generic "video failed" page.
  const offline = !online && (playback.failed || playback.status !== 'readyToPlay');
  const checkAgain = async () => {
    if (await checkOnline()) playback.retry();
    else showToast('Одоогоор интернэт холболт алга', 'danger');
  };

  if (reward !== null) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ResultView
          tone="success"
          icon="check"
          confetti
          title="Хичээл дууслаа!"
          subtitle={
            next
              ? next.kind === 'quiz'
                ? 'Шалгалт нээгдлээ'
                : 'Дараагийн хичээл нээгдлээ'
              : 'Та курсийг бүрэн дуусгалаа'
          }
          xpLabel={reward > 0 ? `+${reward} XP` : undefined}
          primaryLabel={next ? (next.kind === 'quiz' ? 'Шалгалт өгөх' : 'Дараагийн хичээл') : 'Нүүр рүү буцах'}
          onPrimary={next ? goNext : goHome}
          secondaryLabel={next ? 'Нүүр рүү буцах' : undefined}
          onSecondary={next ? goHome : undefined}
        />
      </Screen>
    );
  }

  const percentWatched = Math.round(playback.watchedRatio * 100);

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title={`Бүлэг ${step.unitIndex + 1} · Хичээл ${step.indexInUnit + 1} / ${total}`} onBack={exit} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal>
          {offline ? (
            <OfflineCard onRetry={checkAgain} />
          ) : playback.failed ? (
            <VideoErrorCard onRetry={retryVideo} />
          ) : (
            <VideoPlayer playback={playback} />
          )}
        </Reveal>
        <Reveal index={1} style={styles.block}>
          <AppText variant="display">{lesson.title}</AppText>
        </Reveal>
        <Reveal index={2} style={styles.tiles}>
          <StatTile icon="clock"
            value={`${Math.floor(lesson.durationSec / 60)}:${String(lesson.durationSec % 60).padStart(2, '0')}`}
            label="Хугацаа"
          />
          {alreadyDone ? (
            <StatTile icon="check" value="Дууссан" label="Төлөв" />
          ) : (
            <StatTile icon="xp" value={`+${lessonXp}`} label="XP" />
          )}
          <StatTile icon="book" value={`${step.indexInUnit + 1} / ${total}`} label="Хичээл" />
        </Reveal>
        <Reveal index={3}>
          <AppText variant="body" color="textMuted">
            {lesson.description}
          </AppText>
        </Reveal>
      </ScrollView>

      <Reveal index={4} style={styles.footer}>
        {alreadyDone ? (
          <Button label="Буцах" onPress={exit} variant="cancel" />
        ) : (
          <>
            <View style={styles.hint}>
              <ProgressBar value={Math.min(1, playback.watchedRatio / WATCH_THRESHOLD)} height={8} color="success" label="Үзсэн хэмжээ" />
              <AppText variant="caption" color="textMuted">
                {playback.canFinish
                  ? 'Бэлэн боллоо. Дуусгах товчийг дарна уу.'
                  : `Үзсэн ${percentWatched}% · ${Math.round(WATCH_THRESHOLD * 100)}%-иас дээш үзвэл товч идэвхжинэ`}
              </AppText>
            </View>
            <Button
              label="Дуусгах"
              onPress={finish}
              disabled={!playback.canFinish}
              accessibilityHint="Видеоны 90%-ийг үзсэний дараа идэвхжинэ"
            />
          </>
        )}
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: spacing.sm, paddingBottom: 24, gap: 16 },
  block: { gap: 12 },
  tiles: { flexDirection: 'row', gap: 10 },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8, gap: 12 },
  hint: { gap: 6 },
});
