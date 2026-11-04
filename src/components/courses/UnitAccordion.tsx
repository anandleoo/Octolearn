import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';
import type { NodeState, Step, Unit } from '@/types';

import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';

interface UnitAccordionProps {
  unit: Unit;
  unitIndex: number;
  /** Every step of the unit (used for the header's progress count). */
  unitSteps: Step[];
  /** The steps to list when open: all of them normally, only the matches while searching or filtering. */
  visibleSteps: Step[];
  /** Stay open regardless of the toggle, so search results are never hidden behind a closed unit. */
  forceOpen: boolean;
  states: Map<string, NodeState>;
  /** Start expanded (used for the unit the learner is currently in). */
  defaultOpen: boolean;
  onOpen: (step: Step) => void;
  onLocked: () => void;
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function StepRow({
  step,
  state,
  onPress,
}: {
  step: Step;
  state: NodeState;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isQuiz = step.kind === 'quiz';
  const locked = state === 'locked';
  const icon: IconName = locked ? 'lock' : state === 'completed' ? 'check' : isQuiz ? 'trophy' : 'play';
  const title = isQuiz ? 'Бүлгийн шалгалт' : (step.lesson?.title ?? '');
  const meta = isQuiz ? `${step.quiz?.questions.length ?? 0} асуулт` : mmss(step.lesson?.durationSec ?? 0);
  const stateWord = state === 'completed' ? 'дууссан' : locked ? 'түгжээтэй' : 'идэвхтэй';

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
      <PressableScale
        onPress={onPress}
        feedback="select"
        scaleTo={0.98}
        accessibilityLabel={`${title}, ${stateWord}`}
        style={styles.stepRow}
      >
        <View
          style={[
            styles.dot,
            {
              backgroundColor: state === 'active' ? colors.accent : state === 'completed' ? colors.accentSoft : colors.locked,
            },
          ]}
        >
          <Icon
            name={icon}
            size={16}
            color={state === 'active' ? colors.onAccent : state === 'completed' ? colors.accent : colors.lockedIcon}
            filled={icon === 'play' && state === 'active'}
            strokeWidth={icon === 'check' ? 3 : 2.2}
          />
        </View>
        <AppText variant="body" numberOfLines={1} color={locked ? 'textMuted' : 'text'} style={styles.stepTitle}>
          {title}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {meta}
        </AppText>
      </PressableScale>
    </Animated.View>
  );
}

/** One collapsible unit in the course outline: header with progress, rows for each lesson and the quiz. */
export function UnitAccordion({
  unit,
  unitIndex,
  unitSteps,
  visibleSteps,
  forceOpen,
  states,
  defaultOpen,
  onOpen,
  onLocked,
}: UnitAccordionProps) {
  const { colors } = useTheme();
  const [toggled, setOpen] = useState(defaultOpen);
  const open = toggled || forceOpen;
  const turn = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    turn.value = withTiming(open ? 1 : 0, { duration: 200 });
  }, [open, turn]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 180}deg` }] }));

  const done = unitSteps.filter((s) => states.get(s.id) === 'completed').length;
  const title = unit.title.replace(/^Бүлэг \d+:\s*/, '');

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <PressableScale
        onPress={() => setOpen(!open)}
        feedback="select"
        scaleTo={0.99}
        accessibilityLabel={`Бүлэг ${unitIndex + 1}: ${title}. ${done} / ${unitSteps.length} алхам`}
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <View style={[styles.number, { backgroundColor: colors.accentSoft }]}>
          <AppText variant="caption" color="accent" style={styles.numberText}>
            {String(unitIndex + 1).padStart(2, '0')}
          </AppText>
        </View>
        <View style={styles.headerText}>
          <AppText variant="heading" numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {done} / {unitSteps.length} алхам · {unit.subtitle}
          </AppText>
        </View>
        <Animated.View style={chevron}>
          <Icon name="down" size={22} color={colors.textMuted} />
        </Animated.View>
      </PressableScale>
      {open && (
        <View style={[styles.rows, { borderTopColor: colors.border }]}>
          {visibleSteps.map((step) => {
            const state = states.get(step.id) ?? 'locked';
            return <StepRow key={step.id} step={step} state={state} onPress={() => (state === 'locked' ? onLocked() : onOpen(step))} />;
          })}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 72 },
  number: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: 'Nunito_800ExtraBold' },
  headerText: { flex: 1, gap: 1 },
  rows: { borderTopWidth: 1, paddingVertical: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: 52 },
  dot: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { flex: 1 },
});
