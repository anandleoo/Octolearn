import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { nodeSize } from '@/lib/pathLayout';
import { motion, radius, useTheme } from '@/theme';
import type { NodeState, Step } from '@/types';

import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';

interface PathNodeProps {
  step: Step;
  state: NodeState;
  onOpen: (step: Step) => void;
  onLocked: (step: Step) => void;
}

/** Steps whose "you are here" intro already played in this app session. */
const introPlayed = new Set<string>();

const STATE_WORD: Record<NodeState, string> = {
  completed: 'дууссан',
  active: 'идэвхтэй',
  locked: 'түгжээтэй',
};

/**
 * One dot on the path. Three looks (done / active / locked) and a different shape for quizzes
 * (rounded square with a star or trophy) so they stand out from lessons (circles).
 */
export function PathNode({ step, state, onOpen, onLocked }: PathNodeProps) {
  const { colors } = useTheme();
  const isQuiz = step.kind === 'quiz';
  const size = nodeSize(step);
  const main = isQuiz ? colors.reward : colors.accent;
  const soft = isQuiz ? colors.rewardSoft : colors.accentSoft;

  // 1) Pop animation when the state changes (e.g. locked -> active after finishing the previous step).
  const pop = useSharedValue(1);
  const previous = useSharedValue<NodeState>(state);
  useEffect(() => {
    if (previous.value !== state) {
      pop.value = 0.85;
      pop.value = withSpring(1, { damping: 20, stiffness: 220 });
      previous.value = state;
    }
  }, [state, pop, previous]);

  // 2) Shake when tapping a locked node.
  const shake = useSharedValue(0);
  const shakeNow = () => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 90 }),
      withTiming(-6, { duration: 80 }),
      withTiming(6, { duration: 70 }),
      withTiming(0, { duration: 50 }),
    );
  };

  // 3) A single ring pulse and one bubble bob to point at the active node. They play once the first time
  //    this node is shown in this session, then stay still (no endless bouncing, nothing on every visit).
  const pulse = useSharedValue(1); // 1 = ring invisible
  const bob = useSharedValue(0);
  useEffect(() => {
    if (state !== 'active' || introPlayed.has(step.id)) return;
    introPlayed.add(step.id);
    pulse.value = withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }));
    bob.value = withSequence(withTiming(-4, { duration: 400 }), withTiming(0, { duration: 400 }));
  }, [state, step.id, pulse, bob]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { translateX: shake.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: state === 'active' ? 0.45 * (1 - pulse.value) : 0,
    transform: [{ scale: 1 + pulse.value * 0.45 }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const bubbleIn = useSharedValue(0);
  useEffect(() => {
    bubbleIn.value = withDelay(state === 'active' ? 300 : 0, withSpring(state === 'active' ? 1 : 0, motion.spring));
  }, [state, bubbleIn]);
  const bubbleVisible = useAnimatedStyle(() => ({ opacity: bubbleIn.value, transform: [{ scale: 0.7 + bubbleIn.value * 0.3 }] }));

  const shape = isQuiz ? 28 : size / 2;
  const icon: { name: IconName; color: string; filled?: boolean } =
    state === 'locked'
      ? { name: 'lock', color: colors.lockedIcon }
      : state === 'completed'
        ? { name: isQuiz ? 'trophy' : 'check', color: main }
        : { name: isQuiz ? 'trophy' : 'play', color: '#FFFFFF', filled: !isQuiz };

  const faceStyle =
    state === 'completed'
      ? { backgroundColor: soft }
      : state === 'active'
        ? { backgroundColor: main }
        : { backgroundColor: colors.locked };

  const kindWord = isQuiz ? 'Шалгалт' : 'Хичээл';
  const title = step.lesson?.title ?? `${step.unit.title} шалгалт`;

  return (
    <View style={{ width: size, height: size }}>
      {state === 'active' && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: shape, backgroundColor: main }, ringStyle]}
        />
      )}
      <Animated.View style={[styles.fill, bodyStyle]}>
        <PressableScale
          feedback={false}
          accessibilityLabel={`${kindWord}: ${title}, ${STATE_WORD[state]}`}
          accessibilityHint={state === 'locked' ? 'Өмнөх хичээлээ эхлээд дуусгана уу' : undefined}
          onPress={() => {
            if (state === 'locked') {
              haptic('warning');
              shakeNow();
              onLocked(step);
            } else {
              haptic('tap');
              onOpen(step);
            }
          }}
          scaleTo={0.9}
          style={[styles.face, { borderRadius: shape }, faceStyle]}
        >
          <Icon name={icon.name} size={isQuiz ? 36 : 32} color={icon.color} filled={icon.filled} strokeWidth={icon.name === 'check' ? 3 : 2.2} />
        </PressableScale>
      </Animated.View>

      {state === 'active' && (
        <Animated.View pointerEvents="none" style={[styles.bubbleWrap, bubbleStyle]}>
          <Animated.View style={[styles.bubble, { backgroundColor: colors.text }, bubbleVisible]}>
            <AppText variant="overline" style={{ color: colors.bg }}>
              ЭХЛЭХ
            </AppText>
            <View style={[styles.tail, { borderTopColor: colors.text }]} />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  face: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Wider than the node on both sides so the label never wraps onto two lines.
  bubbleWrap: { position: 'absolute', top: -42, left: -40, right: -40, alignItems: 'center' },
  bubble: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.sm },
  tail: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
