import type { PersistedProgress, QuizRecord } from '@/types';

import {
  type Completion,
  computeAllStates,
  courses,
  defaultCourse,
  findStep,
  getCourse,
  isStepDone,
} from './curriculum';
import { DATE_KEY_PATTERN } from './dates';
import { levelFromXp, streakFromActivity } from './gamification';
import { clampInt, isPlainObject } from './security';

export const emptyProgress = (): PersistedProgress => ({
  activeCourseId: null,
  completedLessons: [],
  quizzes: {},
  activity: {},
});

const MAX_ACTIVITY_DAYS = 400;
const MAX_DAILY_XP = 10_000;

function toCompletion(p: PersistedProgress): Completion {
  return {
    lessons: new Set(p.completedLessons),
    quizBest: Object.fromEntries(Object.entries(p.quizzes).map(([id, r]) => [id, r.bestPercent])),
  };
}

/**
 * Turns whatever was found in storage into data we can trust.
 * Storage is just a file on the phone: it can be corrupted, edited, or left over from an older version.
 * So we never trust its shape; we rebuild a clean object field by field.
 */
export function sanitizeProgress(raw: unknown): PersistedProgress {
  const clean = emptyProgress();
  if (!isPlainObject(raw)) return clean;

  if (typeof raw.activeCourseId === 'string' && getCourse(raw.activeCourseId)) {
    clean.activeCourseId = raw.activeCourseId;
  }

  // Only known quizzes, only whole numbers in a sane range.
  if (isPlainObject(raw.quizzes)) {
    for (const [id, value] of Object.entries(raw.quizzes)) {
      const step = findStep(id);
      if (step?.kind !== 'quiz' || !isPlainObject(value)) continue;
      const bestPercent = clampInt(value.bestPercent, 0, 100);
      const attempts = clampInt(value.attempts, 1, 999);
      if (bestPercent === null || attempts === null) continue;
      clean.quizzes[id] = { bestPercent, attempts };
    }
  }

  const lessons = new Set<string>();
  if (Array.isArray(raw.completedLessons)) {
    for (const id of raw.completedLessons) {
      if (typeof id === 'string' && findStep(id)?.kind === 'lesson') lessons.add(id);
    }
  }

  // The path is linear, so "done" steps must form an unbroken run from the start.
  // Everything after the first unfinished step can only come from tampering, so it is dropped.
  // (A failed attempt on the quiz that is currently active is real history, so it is kept.)
  const keptLessons: string[] = [];
  const keptQuizzes: Record<string, QuizRecord> = {};
  const quizBest = toBest(clean.quizzes);
  for (const course of courses) {
    for (const step of course.steps) {
      if (step.kind === 'lesson') {
        if (!lessons.has(step.id)) break;
        keptLessons.push(step.id);
      } else {
        const record = clean.quizzes[step.id];
        if (record) keptQuizzes[step.id] = record;
        if (!isStepDone(step, { lessons, quizBest })) break;
      }
    }
  }
  clean.completedLessons = keptLessons;
  // Older saves have no chosen course: if the learner already did lessons, continue with that course.
  if (clean.activeCourseId === null && keptLessons[0]) {
    clean.activeCourseId = findStep(keptLessons[0])?.courseId ?? null;
  }
  clean.quizzes = keptQuizzes;

  if (isPlainObject(raw.activity)) {
    const days = Object.entries(raw.activity)
      .filter(([key]) => DATE_KEY_PATTERN.test(key))
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, MAX_ACTIVITY_DAYS);
    for (const [key, xp] of days) {
      const value = clampInt(xp, 0, MAX_DAILY_XP);
      if (value !== null) clean.activity[key] = value;
    }
  }
  return clean;
}

function toBest(quizzes: Record<string, QuizRecord>): Record<string, number> {
  return Object.fromEntries(Object.entries(quizzes).map(([id, r]) => [id, r.bestPercent]));
}

/* ---------- Derived numbers: calculated fresh every time, never saved ---------- */

/** Numbers for one course (shown on its card in the Courses page). */
export interface CourseStats {
  completedSteps: number;
  totalSteps: number;
  percent: number;
  lessonsDone: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
}

/**
 * XP, level, streak and averages count everything you did in every course.
 * The path (states, active step, percent) is for the course currently selected;
 * `course` is null until the learner has picked one.
 */
export function summarize(p: PersistedProgress, today: Date) {
  const done = toCompletion(p);
  const { states, activeStepByCourse } = computeAllStates(done);
  const course = getCourse(p.activeCourseId) ?? null;

  let xp = 0;
  let quizzesPassed = 0;
  const courseStats = new Map<string, CourseStats>();
  for (const c of courses) {
    const stats: CourseStats = {
      completedSteps: 0,
      totalSteps: c.steps.length,
      percent: 0,
      lessonsDone: 0,
      totalLessons: 0,
      quizzesPassed: 0,
      totalQuizzes: 0,
    };
    for (const step of c.steps) {
      const finished = isStepDone(step, done);
      if (step.kind === 'lesson') {
        stats.totalLessons += 1;
        if (finished) {
          stats.lessonsDone += 1;
          xp += c.rewards.lessonXp;
        }
      } else {
        stats.totalQuizzes += 1;
        if (finished) {
          stats.quizzesPassed += 1;
          xp += c.rewards.quizXp;
        }
      }
      if (finished) stats.completedSteps += 1;
    }
    stats.percent = Math.round((stats.completedSteps / stats.totalSteps) * 100);
    quizzesPassed += stats.quizzesPassed;
    courseStats.set(c.id, stats);
  }

  const attempted = Object.values(p.quizzes);
  const averageScore = attempted.length
    ? Math.round(attempted.reduce((sum, r) => sum + r.bestPercent, 0) / attempted.length)
    : null;
  const current = course ? courseStats.get(course.id) : undefined;

  return {
    course,
    courseStats,
    states,
    activeStep: course ? activeStepByCourse.get(course.id) : undefined,
    xp,
    ...levelFromXp(xp),
    streak: streakFromActivity(p.activity, today),
    lessonsDone: p.completedLessons.length,
    quizzesPassed,
    averageScore,
    completedSteps: current?.completedSteps ?? 0,
    totalSteps: current?.totalSteps ?? 0,
    percent: current?.percent ?? 0,
  };
}

export type ProgressSummary = ReturnType<typeof summarize>;

/* ---------- Rules for changing progress. Pure: take old data, return new data (or a refusal). ---------- */

export type CompleteLessonResult =
  | { ok: false }
  | { ok: true; next: PersistedProgress; xpGained: number };

export function applyLessonComplete(
  p: PersistedProgress,
  lessonId: string,
  dayKey: string,
): CompleteLessonResult {
  const step = findStep(lessonId);
  if (step?.kind !== 'lesson') return { ok: false };
  const state = computeAllStates(toCompletion(p)).states.get(lessonId);
  if (state === 'locked') return { ok: false };
  if (state === 'completed') return { ok: true, next: p, xpGained: 0 }; // re-watching: no extra XP

  const xpGained = (getCourse(step.courseId) ?? defaultCourse).rewards.lessonXp;
  return {
    ok: true,
    xpGained,
    next: {
      ...p,
      completedLessons: [...p.completedLessons, lessonId],
      activity: addActivity(p.activity, dayKey, xpGained),
    },
  };
}

export type SubmitQuizResult =
  | { ok: false }
  | {
      ok: true;
      next: PersistedProgress;
      percent: number;
      passed: boolean;
      xpGained: number;
    };

export function applyQuizSubmit(
  p: PersistedProgress,
  quizId: string,
  correct: number,
  dayKey: string,
): SubmitQuizResult {
  const step = findStep(quizId);
  if (step?.kind !== 'quiz' || !step.quiz) return { ok: false };
  const total = step.quiz.questions.length;
  if (!Number.isInteger(correct) || correct < 0 || correct > total) return { ok: false };
  if (computeAllStates(toCompletion(p)).states.get(quizId) === 'locked') return { ok: false };

  const percent = Math.round((correct / total) * 100);
  const passed = percent >= step.quiz.passPercent;
  const previous = p.quizzes[quizId];
  const alreadyPassed = !!previous && previous.bestPercent >= step.quiz.passPercent;
  const quizXp = (getCourse(step.courseId) ?? defaultCourse).rewards.quizXp;
  const xpGained = passed && !alreadyPassed ? quizXp : 0; // XP only the first time you pass

  return {
    ok: true,
    percent,
    passed,
    xpGained,
    next: {
      ...p,
      quizzes: {
        ...p.quizzes,
        [quizId]: {
          bestPercent: Math.max(previous?.bestPercent ?? 0, percent),
          attempts: (previous?.attempts ?? 0) + 1,
        },
      },
      activity: addActivity(p.activity, dayKey, xpGained),
    },
  };
}

/** Records that the user did something today (even 0 XP counts for the streak). */
function addActivity(
  activity: Record<string, number>,
  dayKey: string,
  xp: number,
): Record<string, number> {
  return { ...activity, [dayKey]: Math.min(MAX_DAILY_XP, (activity[dayKey] ?? 0) + xp) };
}

/**
 * Switches the course shown on Home; `null` means "no course selected". Unknown ids are refused;
 * nothing already completed is ever touched.
 */
export function applySetCourse(p: PersistedProgress, courseId: string | null): PersistedProgress | null {
  if (courseId !== null && !getCourse(courseId)) return null;
  return { ...p, activeCourseId: courseId };
}
