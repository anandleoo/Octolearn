import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { TabBarCollapseProvider } from '@/hooks/useTabBarCollapse';
import { useTheme } from '@/theme';

/** The three main tabs. The default bar is replaced with our floating one through the `tabBar` prop. */
export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <TabBarCollapseProvider>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Нүүр' }} />
        <Tabs.Screen name="courses" options={{ title: 'Хичээл' }} />
        <Tabs.Screen name="profile" options={{ title: 'Профайл' }} />
      </Tabs>
    </TabBarCollapseProvider>
  );
}
