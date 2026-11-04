import type { CourseData, NodeState, Step, Unit } from '@/types';

import { courseDatas } from './content';

/** One course ready for the UI: its info, units, and its units flattened into one ordered list of steps. */
export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  rewards: CourseData['rewards'];
  units: Unit[];
  /** L1 L2 L3 L4 L5 Quiz, L1 L2 … */
  steps: Step[];
}

function buildCourse(data: CourseData): Course {
  const steps: Step[] = [];
  data.units.forEach((unit, unitIndex) => {
    unit.lessons.forEach((lesson, i) => {
      steps.push({
        id: lesson.id,
        kind: 'lesson',
        courseId: data.course.id,
        index: steps.length,
        unitIndex,
        indexInUnit: i,
        unit,
        lesson,
      });
    });
    steps.push({
      id: unit.quiz.id,
      kind: 'quiz',
      courseId: data.course.id,
      index: steps.length,
      unitIndex,
      indexInUnit: unit.lessons.length,
      unit,
      quiz: unit.quiz,
    });
  });
  return { ...data.course, rewards: data.rewards, units: data.units, steps };
}

export const courses: Course[] = courseDatas.map(buildCourse);
/** Course shown first, and the fallback whenever a saved course id is missing or unknown. */
export const defaultCourse: Course = courses[0] as Course;

const courseById = new Map(courses.map((c) => [c.id, c]));
const stepById = new Map(courses.flatMap((c) => c.steps).map((s) => [s.id, s]));

export function getCourse(id: string | null | undefined): Course | undefined {
  return id ? courseById.get(id) : undefined;
}

/** Looks up a step in any course. Ids are unique across all courses. */
export function findStep(id: string | null | undefined): Step | undefined {
  return id ? stepById.get(id) : undefined;
}

/** What we know has been done. Kept tiny on purpose so tests and the store can both build it. */
export interface Completion {
  lessons: ReadonlySet<string>;
  /** quizId -> best percent */
  quizBest: Readonly<Record<string, number>>;
}

export function isStepDone(step: Step, done: Completion): boolean {
  if (step.kind === 'lesson') return done.lessons.has(step.id);
  const best = done.quizBest[step.id];
  return best !== undefined && best >= (step.quiz?.passPercent ?? 100);
}

/**
 * Linear path rule, applied to one course: every step before the first unfinished one is "completed",
 * the first unfinished one is "active", everything after it is "locked".
 * Because this is calculated (never saved), nobody can unlock a step by editing storage.
 */
export function computeNodeStates(
  done: Completion,
  courseSteps: Step[] = defaultCourse.steps,
): { states: Map<string, NodeState>; activeStep: Step | undefined } {
  const states = new Map<string, NodeState>();
  let activeStep: Step | undefined;
  for (const step of courseSteps) {
    if (!activeStep && isStepDone(step, done)) {
      states.set(step.id, 'completed');
    } else if (!activeStep) {
      activeStep = step;
      states.set(step.id, 'active');
    } else {
      states.set(step.id, 'locked');
    }
  }
  return { states, activeStep };
}

/** States of every step in every course (each course unlocks on its own), plus each course's next step. */
export function computeAllStates(done: Completion): {
  states: Map<string, NodeState>;
  activeStepByCourse: Map<string, Step | undefined>;
} {
  const states = new Map<string, NodeState>();
  const activeStepByCourse = new Map<string, Step | undefined>();
  for (const course of courses) {
    const result = computeNodeStates(done, course.steps);
    result.states.forEach((state, id) => states.set(id, state));
    activeStepByCourse.set(course.id, result.activeStep);
  }
  return { states, activeStepByCourse };
}
