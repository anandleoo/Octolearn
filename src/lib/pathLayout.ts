import type { Step } from '@/types';

import { LESSONS_PER_UNIT } from './content';

/**
 * All the numbers that decide where things sit on the pathway.
 * Every unit has the same size, so we can calculate any node's position with plain maths.
 * That is what makes "scroll to the active lesson on open" exact, with no measuring needed.
 */
export const NODE_SIZE = 72;
export const QUIZ_NODE_SIZE = 80;
export const ROW_HEIGHT = 104; // vertical distance between two node centres
export const TRACK_TOP = 60; // room above the first node for the "ЭХЛЭХ" bubble
export const TRACK_BOTTOM = 36;
export const HEADER_HEIGHT = 92;
export const HEADER_GAP = 8;
export const UNIT_GAP = 28;
export const LIST_TOP_PADDING = 16;

/** Lessons plus the quiz. Content validation guarantees every unit has this shape. */
const NODES_PER_UNIT = LESSONS_PER_UNIT + 1;

export const nodeSize = (step: Step) => (step.kind === 'quiz' ? QUIZ_NODE_SIZE : NODE_SIZE);

export const trackHeight = (unitIndex: number) =>
  TRACK_TOP + (NODES_PER_UNIT - 1) * ROW_HEIGHT + QUIZ_NODE_SIZE / 2 + TRACK_BOTTOM;

export const unitHeight = (unitIndex: number) =>
  HEADER_HEIGHT + HEADER_GAP + trackHeight(unitIndex) + UNIT_GAP;

/** Distance from the top of the scroll content to the top of a unit block. */
export function unitTop(unitIndex: number): number {
  let y = LIST_TOP_PADDING;
  for (let i = 0; i < unitIndex; i++) y += unitHeight(i);
  return y;
}

/** Centre of a node inside its unit's track. The zig-zag is a sine wave over the node's course-wide index. */
export function nodeCenter(step: Step, width: number): { x: number; y: number } {
  const amplitude = Math.min(84, Math.max(48, width * 0.2));
  return {
    x: width / 2 + Math.sin(step.index * 1.25) * amplitude,
    y: TRACK_TOP + step.indexInUnit * ROW_HEIGHT,
  };
}

/** Scroll position that puts a node comfortably in the upper-middle of the screen. */
export function scrollYForStep(step: Step, viewportHeight: number): number {
  const nodeY = unitTop(step.unitIndex) + HEADER_HEIGHT + HEADER_GAP + nodeCenter(step, 0).y;
  return Math.max(0, nodeY - viewportHeight * 0.4);
}

/** Smooth S-curve between two node centres, as an SVG path string. */
export function curveBetween(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
}
