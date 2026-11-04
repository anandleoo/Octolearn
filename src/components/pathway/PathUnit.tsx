import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { curveBetween, HEADER_GAP, nodeCenter, nodeSize, trackHeight, unitHeight } from '@/lib/pathLayout';
import { useTheme } from '@/theme';
import type { NodeState, Step, Unit } from '@/types';

import { PathNode } from './PathNode';
import { UnitHeader } from './UnitHeader';

interface PathUnitProps {
  unit: Unit;
  unitIndex: number;
  /** All steps of THIS unit, in order (5 lessons then the quiz). */
  unitSteps: Step[];
  states: Map<string, NodeState>;
  width: number;
  onOpen: (step: Step) => void;
  onLocked: (step: Step) => void;
}

/** One unit: its banner, the dotted trail, and the nodes placed along the trail. */
export function PathUnit({ unit, unitIndex, unitSteps, states, width, onOpen, onLocked }: PathUnitProps) {
  const { colors } = useTheme();
  const height = trackHeight(unitIndex);
  const centers = unitSteps.map((s) => nodeCenter(s, width));

  // The coloured part of the trail reaches up to the first node that isn't completed yet.
  let doneD = '';
  let allD = '';
  for (let i = 0; i < centers.length - 1; i++) {
    const a = centers[i];
    const b = centers[i + 1];
    if (!a || !b) continue;
    const seg = curveBetween(a, b);
    allD += `${seg} `;
    if (states.get(unitSteps[i]?.id ?? '') === 'completed') doneD += `${seg} `;
  }

  const first = unitSteps[0];
  const locked = first ? states.get(first.id) === 'locked' : true;
  const done = unitSteps.filter((s) => s.kind === 'lesson' && states.get(s.id) === 'completed').length;

  return (
    <View style={{ height: unitHeight(unitIndex) }}>
      <View style={styles.headerPad}>
        <UnitHeader unit={unit} unitIndex={unitIndex} locked={locked} done={done} />
      </View>
      <View style={{ height, marginTop: HEADER_GAP }}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Path d={allD} stroke={colors.lockedIcon} strokeOpacity={0.45} strokeWidth={7} strokeLinecap="round" strokeDasharray="1 16" fill="none" />
          {doneD !== '' && (
            <Path d={doneD} stroke={colors.accent} strokeWidth={7} strokeLinecap="round" strokeDasharray="1 16" fill="none" />
          )}
        </Svg>
        {unitSteps.map((step, i) => {
          const c = centers[i];
          if (!c) return null;
          const size = nodeSize(step);
          return (
            <View key={step.id} style={{ position: 'absolute', left: c.x - size / 2, top: c.y - size / 2 }}>
              <PathNode step={step} state={states.get(step.id) ?? 'locked'} onOpen={onOpen} onLocked={onLocked} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ headerPad: { paddingHorizontal: 20 } });
