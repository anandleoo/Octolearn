import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { NoCourseState } from '@/components/courses/NoCourseState';
import { TAB_BAR_CLEARANCE } from '@/components/navigation/FloatingTabBar';
import { PathUnit } from '@/components/pathway/PathUnit';
import { HomeSkeleton } from '@/components/skeletons/HomeSkeleton';
import { ProgressHeader } from '@/components/pathway/ProgressHeader';
import { Screen } from '@/components/ui/Screen';
import { useScreenScroll } from '@/hooks/useTabBarCollapse';
import type { Course } from '@/lib/curriculum';
import { LIST_TOP_PADDING, scrollYForStep } from '@/lib/pathLayout';
import { useAuthStore } from '@/store/authStore';
import { useProgress } from '@/store/progressStore';
import { showToast } from '@/store/toastStore';
import type { Step } from '@/types';

/** Home: the zig-zag path of the selected course (brief 3.1) with the progress header on top (3.2). */
export default function HomeScreen() {
  const { course } = useProgress();
  const ready = useAuthStore((s) => s.progressReady);
  return <Screen>{!ready ? <HomeSkeleton /> : course ? <CoursePath course={course} /> : <NoCourseState />}</Screen>;
}

function CoursePath({ course }: { course: Course }) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { states, activeStep, xp, streak, completedSteps, totalSteps, percent } = useProgress();
  const name = useAuthStore((s) => s.user?.name ?? '');
  const { steps, units } = course;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { onScroll, scrollY } = useScreenScroll();
  const firstVisit = useRef(true);

  // Jump to the active lesson when the app opens; glide to the new one when coming back after finishing a step.
  const activeId = activeStep?.id;
  useFocusEffect(
    useCallback(() => {
      const target = steps.find((s) => s.id === activeId) ?? steps[steps.length - 1];
      if (!target) return;
      const animated = !firstVisit.current;
      const timer = setTimeout(
        () => scrollRef.current?.scrollTo({ y: scrollYForStep(target, height - 220), animated }),
        animated ? 350 : 0,
      );
      firstVisit.current = false;
      return () => clearTimeout(timer);
    }, [activeId, steps, height, scrollRef]),
  );

  const open = (step: Step) => {
    router.push(step.kind === 'lesson' ? `/lesson/${step.id}` : `/quiz/${step.id}`);
  };
  const locked = () => showToast('Өмнөх хичээлээ эхлээд дуусгана уу');

  return (
    <>
      <ProgressHeader
        name={name}
        courseTitle={course.title}
        xp={xp}
        streak={streak}
        completed={completedSteps}
        total={totalSteps}
        percent={percent}
        scrollY={scrollY}
      />
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: LIST_TOP_PADDING, paddingBottom: TAB_BAR_CLEARANCE }}
      >
        {units.map((unit, unitIndex) => (
          <PathUnit
            key={unit.id}
            unit={unit}
            unitIndex={unitIndex}
            unitSteps={steps.filter((s) => s.unitIndex === unitIndex)}
            states={states}
            width={width}
            onOpen={open}
            onLocked={locked}
          />
        ))}
      </Animated.ScrollView>
    </>
  );
}
