import { useRouter } from 'expo-router';

import { ErrorPage } from '@/components/feedback/ErrorPage';
import { useExit } from '@/hooks/useExit';

/**
 * Demo only (opened from Settings): shows the exact page people see after a real crash, without crashing anything.
 * The buttons just go back, because there is nothing to recover from.
 */
export default function DemoErrorScreen() {
  const exit = useExit();
  const router = useRouter();
  return <ErrorPage onRetry={exit} onHome={() => router.dismissTo('/')} />;
}
