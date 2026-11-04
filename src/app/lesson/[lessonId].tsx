import { useLocalSearchParams } from 'expo-router';

import { LessonScreen } from '@/components/lesson/LessonScreen';
import { StepGate } from '@/components/navigation/StepGate';

export default function LessonRoute() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  return (
    <StepGate kind="lesson" rawId={lessonId}>
      {(step, state) => <LessonScreen key={step.id} step={step} state={state} />}
    </StepGate>
  );
}
