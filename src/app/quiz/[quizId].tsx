import { useLocalSearchParams } from 'expo-router';

import { StepGate } from '@/components/navigation/StepGate';
import { QuizScreen } from '@/components/quiz/QuizScreen';

export default function QuizRoute() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  return (
    <StepGate kind="quiz" rawId={quizId}>
      {(step) => <QuizScreen key={step.id} step={step} />}
    </StepGate>
  );
}
