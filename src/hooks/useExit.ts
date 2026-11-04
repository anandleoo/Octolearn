import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/** Go back if there is a screen to go back to; otherwise (e.g. opened from a link) land on Home. */
export function useExit() {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);
}
