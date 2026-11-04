import { createContext, type ReactNode, useContext } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import {
  type SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

/** 0 = tab bar expanded (icons + label), 1 = collapsed (icons only). Lives on the UI thread. */
const CollapseContext = createContext<SharedValue<number> | null>(null);

export function TabBarCollapseProvider({ children }: { children: ReactNode }) {
  const collapsed = useSharedValue(0);
  return <CollapseContext.Provider value={collapsed}>{children}</CollapseContext.Provider>;
}

export function useTabBarCollapsed(): SharedValue<number> {
  const value = useContext(CollapseContext);
  if (!value) throw new Error('useTabBarCollapsed must be used inside TabBarCollapseProvider');
  return value;
}

const SCROLL_THRESHOLD = 8; // ignore tiny jitters
const TOP_ZONE = 24; // always expanded near the very top

/**
 * Give `onScroll` to a scroll view. Scrolling down shrinks the tab bar to icons,
 * scrolling up (or reaching the top) expands it again. Same idea as the banking app screenshots.
 * `scrollY` is the live scroll position (on the UI thread) so headers can morph with it.
 */
export function useScreenScroll() {
  const collapsed = useTabBarCollapsed();
  const lastY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  // True only while a finger (or its fling) is moving the list, so the automatic
  // "scroll to the active lesson" on Home does not shrink the bar by mistake.
  const userScrolling = useSharedValue(false);

  // Each time this screen becomes visible, start with the bar expanded.
  useFocusEffect(
    useCallback(() => {
      collapsed.value = 0;
    }, [collapsed]),
  );

  const onScroll = useAnimatedScrollHandler({
    onBeginDrag: () => {
      userScrolling.value = true;
    },
    onEndDrag: (event) => {
      if (Math.abs(event.velocity?.y ?? 0) < 0.05) userScrolling.value = false;
    },
    onMomentumEnd: () => {
      userScrolling.value = false;
    },
    onScroll: (event) => {
      const y = Math.max(0, event.contentOffset.y);
      scrollY.value = y;
      const dy = y - lastY.value;
      if (!userScrolling.value) {
        lastY.value = y;
        return;
      }
      if (y < TOP_ZONE) collapsed.value = 0;
      else if (dy > SCROLL_THRESHOLD) collapsed.value = 1;
      else if (dy < -SCROLL_THRESHOLD) collapsed.value = 0;
      lastY.value = y;
    },
  });

  return { onScroll, scrollY };
}
