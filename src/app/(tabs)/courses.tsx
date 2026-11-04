import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { CourseCard } from '@/components/courses/CourseCard';
import { CourseListItem } from '@/components/courses/CourseListItem';
import { UnitAccordion } from '@/components/courses/UnitAccordion';
import { CoursesSkeleton } from '@/components/skeletons/CoursesSkeleton';
import { TAB_BAR_CLEARANCE } from '@/components/navigation/FloatingTabBar';
import { CollapsingHeader } from '@/components/navigation/CollapsingHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { isIconName } from '@/components/ui/Icon';
import type { Option } from '@/components/ui/OptionSheet';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SearchField } from '@/components/ui/SearchField';
import { Select } from '@/components/ui/Select';
import { useScreenScroll } from '@/hooks/useTabBarCollapse';
import { isSearching, searchSteps } from '@/lib/courseSearch';
import { courses } from '@/lib/curriculum';
import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';
import { useProgress, useProgressStore } from '@/store/progressStore';
import { showToast } from '@/store/toastStore';
import type { Step } from '@/types';

const SCREEN = 'courses';
/** Value of the "no course" choice in the dropdown. */
const NONE = 'none';

/** Courses: switch between courses, see the one you're on (outline, search, filters) and the others. */
export default function CoursesScreen() {
  const router = useRouter();
  const { onScroll, scrollY } = useScreenScroll();
  const p = useProgress();
  const ready = useAuthStore((s) => s.progressReady);
  const setActiveCourse = useProgressStore((s) => s.setActiveCourse);
  const [query, setQuery] = useState('');
  const { course, courseStats } = p;
  const searching = isSearching(query);
  const matches = useMemo(() => (course ? searchSteps(course.steps, query) : []), [course, query]);
  const stats = course ? courseStats.get(course.id) : undefined;

  const open = (step: Step) => router.push(step.kind === 'lesson' ? `/lesson/${step.id}` : `/quiz/${step.id}`);
  const resume = () => {
    const target = p.activeStep ?? course?.steps[0];
    if (target) open(target);
  };

  const switchTo = (id: string) => {
    if (id === NONE) {
      if (!course || !setActiveCourse(null)) return;
      setQuery('');
      haptic('success');
      showToast('Курс сонголт цуцлагдлаа');
      return;
    }
    if (id === course?.id || !setActiveCourse(id)) return;
    setQuery(''); // a search typed for the old course would hide everything in the new one
    haptic('success');
    const next = courses.find((c) => c.id === id);
    showToast(`${course ? 'Курс солигдлоо' : 'Курс сонгогдлоо'}: ${next?.title ?? ''}`);
  };

  const courseOptions: Option<string>[] = [
    ...courses.map((c) => ({
      value: c.id,
      label: c.title,
      description: c.description,
      icon: isIconName(c.icon) ? c.icon : ('book' as const),
      trailing: `${courseStats.get(c.id)?.percent ?? 0}%`,
    })),
    {
      value: NONE,
      label: 'Курс сонгохгүй',
      description: 'Одоогоор ямар ч курсгүй байх. Ахиц хэвээр хадгалагдана.',
      icon: 'close' as const,
    },
  ];
  const others = courses.filter((c) => c.id !== course?.id);

  if (!ready) {
    return (
      <Screen>
        <CoursesSkeleton />
      </Screen>
    );
  }

  return (
    <Screen>
      <CollapsingHeader title="Хичээлүүд" scrollY={scrollY} />
      <Animated.ScrollView
        onScroll={onScroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_CLEARANCE }]}
      >
        <Reveal once={SCREEN} index={1} style={styles.section}>
          <Select
            label="Одоогийн курс"
            title="Курс сонгох"
            options={courseOptions}
            value={course?.id ?? NONE}
            onChange={switchTo}
          />
          {course && (
            <CourseCard
              title={course.title}
              subtitle={course.subtitle}
              lessonsDone={stats?.lessonsDone ?? 0}
              totalLessons={stats?.totalLessons ?? 0}
              quizzesPassed={stats?.quizzesPassed ?? 0}
              totalQuizzes={stats?.totalQuizzes ?? 0}
              percent={stats?.percent ?? 0}
              finished={!p.activeStep}
              onContinue={resume}
            />
          )}
        </Reveal>

        {course ? (
          <>
            <Reveal once={SCREEN} index={2}>
              <CollapsibleSection
                title="Курсийн агуулга"
                hint={searching ? `${matches.length} илэрц` : `${course.units.length} бүлэг`}
              >
                <SearchField value={query} onChangeText={setQuery} placeholder="Хичээл, шалгалт хайх" />

                {searching && matches.length === 0 && (
                  <Card tone="soft" style={styles.empty}>
                    <AppText variant="heading" align="center">
                      Илэрц олдсонгүй
                    </AppText>
                    <AppText variant="body" color="textMuted" align="center">
                      Өөр үг хайгаад үзнэ үү.
                    </AppText>
                    <Button label="Хайлтыг цэвэрлэх" variant="secondary" onPress={() => setQuery('')} />
                  </Card>
                )}

                {course.units.map((unit, i) => {
                  const unitSteps = course.steps.filter((s) => s.unitIndex === i);
                  const visibleSteps = matches.filter((s) => s.unitIndex === i);
                  if (searching && visibleSteps.length === 0) return null;
                  return (
                    <UnitAccordion
                      key={unit.id}
                      unit={unit}
                      unitIndex={i}
                      unitSteps={unitSteps}
                      visibleSteps={visibleSteps}
                      forceOpen={searching}
                      states={p.states}
                      defaultOpen={p.activeStep ? p.activeStep.unitIndex === i : false}
                      onOpen={open}
                      onLocked={() => showToast('Өмнөх хичээлээ эхлээд дуусгана уу')}
                    />
                  );
                })}
              </CollapsibleSection>
            </Reveal>
          </>
        ) : (
          <Reveal once={SCREEN} index={2} style={styles.section}>
            <AppText variant="body" color="textMuted">
              Та курсээ сонгоогүй байна. Доороос нэгийг нь сонгоод суралцаж эхлээрэй.
            </AppText>
          </Reveal>
        )}

        {others.length > 0 && (
          <Reveal once={SCREEN} index={3}>
            <CollapsibleSection title={course ? 'Бусад курсууд' : 'Курсууд'} hint={`${others.length}`}>
              {others.map((c) => (
                <CourseListItem
                  key={c.id}
                  title={c.title}
                  subtitle={c.subtitle}
                  icon={isIconName(c.icon) ? c.icon : 'book'}
                  unitCount={c.units.length}
                  lessonCount={courseStats.get(c.id)?.totalLessons ?? 0}
                  percent={courseStats.get(c.id)?.percent ?? 0}
                  onSwitch={() => switchTo(c.id)}
                />
              ))}
            </CollapsibleSection>
          </Reveal>
        )}
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 24 },
  section: { gap: 16 },
  empty: { gap: 8, alignItems: 'stretch' },
});
