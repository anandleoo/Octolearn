import { type ReactNode, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { type ColorName, type TextVariant, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface CollapsibleSectionProps {
  title: string;
  /** Small text on the right of the title, e.g. a count. */
  hint?: string;
  titleVariant?: TextVariant;
  titleColor?: ColorName;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A heading that folds its content away when tapped. Used for course lists and the settings danger zone. */
export function CollapsibleSection({
  title,
  hint,
  titleVariant = 'heading',
  titleColor = 'text',
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const turn = useSharedValue(defaultOpen ? 1 : 0);
  useEffect(() => {
    turn.value = withTiming(open ? 1 : 0, { duration: 200 });
  }, [open, turn]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 180}deg` }] }));

  return (
    <Animated.View layout={LinearTransition.duration(220)} style={styles.wrap}>
      <PressableScale
        onPress={() => setOpen(!open)}
        feedback="select"
        scaleTo={0.99}
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <AppText variant={titleVariant} color={titleColor} accessibilityRole="header" style={styles.title}>
          {title}
        </AppText>
        {hint ? (
          <AppText variant="caption" color="textMuted">
            {hint}
          </AppText>
        ) : null}
        <Animated.View style={chevron}>
          <Icon name="down" size={20} color={colors[titleColor === 'text' ? 'textMuted' : titleColor]} />
        </Animated.View>
      </PressableScale>
      {open && (
        <Animated.View entering={FadeIn.duration(180)}>
          <View style={styles.body}>{children}</View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36 },
  title: { flex: 1 },
  body: { gap: 12 },
});
