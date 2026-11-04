import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarCollapsed } from '@/hooks/useTabBarCollapse';
import { haptic } from '@/lib/haptics';
import { HIT, cardShadow, motion, radius, typography, useTheme } from '@/theme';

import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';

interface TabConfig {
  label: string;
  icon: IconName;
}

/** One entry per route file in app/(tabs). Add a tab here and in the layout and the bar adapts. */
const TABS: Record<string, TabConfig> = {
  index: { label: 'Нүүр', icon: 'home' },
  courses: { label: 'Хичээл', icon: 'book' },
  profile: { label: 'Профайл', icon: 'user' },
};

const ITEM = 56; // width of an icon-only item (also its height)
const LABEL_GAP = 4;
/** Label font size, and a width estimate for it: Nunito Bold is roughly 0.62em per Cyrillic letter, plus padding. */
const LABEL_SIZE = 15;
const labelWidth = (label: string) => Math.ceil(label.length * LABEL_SIZE * 0.68) + 8;

function TabItem({
  config,
  focused,
  collapse,
  onPress,
}: {
  config: TabConfig;
  focused: boolean;
  collapse: SharedValue<number>;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const focus = useSharedValue(focused ? 1 : 0);
  const extra = labelWidth(config.label) + LABEL_GAP;

  useEffect(() => {
    focus.value = withSpring(focused ? 1 : 0, motion.spring);
  }, [focused, focus]);

  // The focused item grows to reveal its label, unless the whole bar is collapsed.
  const itemStyle = useAnimatedStyle(() => ({
    width: ITEM + focus.value * (1 - collapse.value) * extra,
  }));
  const pillStyle = useAnimatedStyle(() => ({ opacity: focus.value }));
  const labelStyle = useAnimatedStyle(() => {
    const visible = focus.value * (1 - collapse.value);
    return { opacity: visible, transform: [{ translateX: interpolate(visible, [0, 1], [-8, 0]) }] };
  });

  return (
    <PressableScale
      onPress={onPress}
      feedback="select"
      accessibilityRole="tab"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: focused }}
      scaleTo={0.92}
    >
      <Animated.View style={[styles.item, itemStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.pill, { backgroundColor: colors.accentSoft }, pillStyle]} />
        <View style={styles.iconBox}>
          <Icon name={config.icon} size={24} color={focused ? colors.accent : colors.textMuted} strokeWidth={2.2} />
        </View>
        <Animated.Text
          numberOfLines={1}
          allowFontScaling={false}
          style={[typography.heading, styles.label, { fontSize: LABEL_SIZE, color: colors.accent, width: extra }, labelStyle]}
        >
          {config.label}
        </Animated.Text>
      </Animated.View>
    </PressableScale>
  );
}

/**
 * Floating pill-shaped tab bar. Switching tabs makes the active item stretch open to show its name;
 * scrolling down squeezes every item back to an icon. Replaces the default bottom bar via Tabs' `tabBar` prop.
 */
export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const collapsed = useTabBarCollapsed();
  const collapse = useDerivedValue(() => withSpring(collapsed.value, motion.softSpring));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
      <View
        accessibilityRole="tablist"
        style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }, cardShadow(colors.shadow)]}
      >
        {state.routes.map((route, index) => {
          const config = TABS[route.name];
          if (!config) return null;
          const focused = state.index === index;
          return (
            <TabItem
              key={route.key}
              config={config}
              focused={focused}
              collapse={collapse}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
                else haptic('tap');
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

/** How much space screens must leave at the bottom so content isn't hidden behind the bar. */
export const TAB_BAR_CLEARANCE = 110;

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  item: {
    height: ITEM,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: radius.pill,
    minHeight: HIT,
  },
  pill: { borderRadius: radius.pill },
  iconBox: { width: ITEM, height: ITEM, alignItems: 'center', justifyContent: 'center' },
  label: { marginLeft: -LABEL_GAP - 2 },
});
