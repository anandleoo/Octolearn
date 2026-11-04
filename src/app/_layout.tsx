import { useFonts } from 'expo-font';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorPage } from '@/components/feedback/ErrorPage';
import { ConfirmHost } from '@/components/feedback/ConfirmHost';
import { ErrorBoundary as CrashGuard } from '@/components/feedback/ErrorBoundary';
import { ToastHost } from '@/components/feedback/Toast';
import { useHydrated } from '@/hooks/useHydrated';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme';

// Keep the splash screen up until fonts and saved progress are ready, so the user never sees a half-drawn app.
SplashScreen.preventAutoHideAsync().catch(() => {});

/** Expo Router shows this page when any screen throws while rendering; "retry" re-renders the route. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorPage onRetry={() => void retry()} />;
}

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  // Only the four Nunito weights the theme uses (names must match theme/index.ts `fonts`).
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular: require('@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf'),
    Nunito_600SemiBold: require('@expo-google-fonts/nunito/600SemiBold/Nunito_600SemiBold.ttf'),
    Nunito_700Bold: require('@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf'),
    Nunito_800ExtraBold: require('@expo-google-fonts/nunito/800ExtraBold/Nunito_800ExtraBold.ttf'),
  });
  const hydrated = useHydrated();
  const signedIn = useAuthStore((s) => s.status === 'signedIn');

  // Read the saved sign-in once at app start; until it finishes the splash screen stays up.
  useEffect(() => {
    useAuthStore.getState().restore();
  }, []);
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <CrashGuard>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          {/* Protected routes: while `guard` is false the router refuses to open them, even from a deep link. */}
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="lesson/[lessonId]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen
              name="quiz/[quizId]"
              options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
            />
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="demo-loading" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="demo-error" options={{ animation: 'fade' }} />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          </Stack.Protected>
        </Stack>
        <ConfirmHost />
        <ToastHost />
      </SafeAreaProvider>
    </CrashGuard>
  );
}
