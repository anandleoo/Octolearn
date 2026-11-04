import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

/** Pages shown while nobody is signed in. The root layout hides this whole group once someone is. */
export default function AuthLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.bg } }} />;
}
