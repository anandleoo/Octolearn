import { computeNodeStates, courses, defaultCourse, getCourse } from '@/lib/curriculum';
import { streakFromActivity } from '@/lib/gamification';
import {
  applyLessonComplete,
  applyQuizSubmit,
  applySetCourse,
  emptyProgress,
  sanitizeProgress,
  summarize,
} from '@/lib/progress';
import { isAllowedVideoUrl, parseRouteId, sanitizeName } from '@/lib/security';
import type { PersistedProgress } from '@/types';

const steps = defaultCourse.steps;
const DAY = '2026-11-04';
const today = new Date(2026, 10, 4);

/** Completes the first `count` lessons in order, the way a real user would. */
function finishLessons(
  count: number,
  from: PersistedProgress = { ...emptyProgress(), activeCourseId: defaultCourse.id },
): PersistedProgress {
  let p = from;
  for (const step of steps.filter((s) => s.kind === 'lesson').slice(0, count)) {
    const r = applyLessonComplete(p, step.id, DAY);
    if (!r.ok) throw new Error(`could not complete ${step.id}`);
    p = r.next;
  }
  return p;
}

describe('unlock logic', () => {
  it('starts with the first lesson active and everything else locked', () => {
    const { states, activeStep } = computeNodeStates({ lessons: new Set(), quizBest: {} });
    expect(activeStep?.id).toBe('u1-l1');
    expect(states.get('u1-l1')).toBe('active');
    expect(states.get('u1-l2')).toBe('locked');
    expect(states.get('u1-quiz')).toBe('locked');
  });

  it('unlocks the quiz only after all 5 lessons', () => {
    expect(summarize(finishLessons(4), today).states.get('u1-quiz')).toBe('locked');
    expect(summarize(finishLessons(5), today).states.get('u1-quiz')).toBe('active');
  });

  it('refuses to complete a locked lesson', () => {
    expect(applyLessonComplete(emptyProgress(), 'u1-l3', DAY).ok).toBe(false);
    expect(applyLessonComplete(emptyProgress(), 'nope', DAY).ok).toBe(false);
  });

  it('gives no extra XP when a finished lesson is replayed', () => {
    const p = finishLessons(1);
    const again = applyLessonComplete(p, 'u1-l1', DAY);
    expect(again.ok && again.xpGained).toBe(0);
  });
});

describe('quiz rules', () => {
  const ready = finishLessons(5);

  it('passes at 60% and unlocks the next unit', () => {
    const r = applyQuizSubmit(ready, 'u1-quiz', 3, DAY);
    expect(r.ok && r.passed).toBe(true);
    if (!r.ok) return;
    expect(r.xpGained).toBe(20);
    expect(summarize(r.next, today).states.get('u2-l1')).toBe('active');
  });

  it('fails below 60%, keeps the quiz active, and awards nothing', () => {
    const r = applyQuizSubmit(ready, 'u1-quiz', 2, DAY);
    expect(r.ok && r.passed).toBe(false);
    if (!r.ok) return;
    expect(r.xpGained).toBe(0);
    const s = summarize(r.next, today);
    expect(s.states.get('u1-quiz')).toBe('active');
    expect(s.states.get('u2-l1')).toBe('locked');
  });

  it('awards quiz XP only the first time it is passed', () => {
    const first = applyQuizSubmit(ready, 'u1-quiz', 5, DAY);
    if (!first.ok) throw new Error('first submit failed');
    const second = applyQuizSubmit(first.next, 'u1-quiz', 5, DAY);
    expect(second.ok && second.xpGained).toBe(0);
  });

  it('rejects impossible scores and locked quizzes', () => {
    expect(applyQuizSubmit(ready, 'u1-quiz', 6, DAY).ok).toBe(false);
    expect(applyQuizSubmit(ready, 'u1-quiz', -1, DAY).ok).toBe(false);
    expect(applyQuizSubmit(ready, 'u1-quiz', 1.5, DAY).ok).toBe(false);
    expect(applyQuizSubmit(emptyProgress(), 'u1-quiz', 5, DAY).ok).toBe(false);
  });
});

describe('derived numbers', () => {
  it('computes XP, percent and level from what was completed', () => {
    const s = summarize(finishLessons(5), today);
    expect(s.xp).toBe(50);
    expect(s.completedSteps).toBe(5);
    expect(s.totalSteps).toBe(18);
    expect(s.percent).toBe(28);
    expect(s.level).toBe(1);
  });

  it('counts a streak across consecutive days, and keeps it alive until midnight', () => {
    const activity = { '2026-11-02': 10, '2026-11-03': 0 };
    expect(streakFromActivity(activity, today)).toBe(2); // nothing yet today, yesterday still counts
    expect(streakFromActivity({ ...activity, '2026-11-04': 10 }, today)).toBe(3);
    expect(streakFromActivity({ '2026-11-01': 5 }, today)).toBe(0); // gap
  });
});

describe('sanitizeProgress (tamper and corruption defence)', () => {
  it('returns clean defaults for garbage', () => {
    for (const junk of [null, undefined, 42, 'x', [], { completedLessons: 'all' }]) {
      expect(sanitizeProgress(junk).completedLessons).toEqual([]);
    }
  });

  it('drops unknown ids and duplicates', () => {
    const p = sanitizeProgress({ completedLessons: ['u1-l1', 'u1-l1', 'hack', 42, 'u1-quiz'] });
    expect(p.completedLessons).toEqual(['u1-l1']);
  });

  it('drops lessons that skip a locked step', () => {
    // u1-l2 missing, so u1-l3 can not be real.
    const p = sanitizeProgress({ completedLessons: ['u1-l1', 'u1-l3', 'u1-l4'] });
    expect(p.completedLessons).toEqual(['u1-l1']);
  });

  it('drops a forged quiz pass that skips lessons, and clamps numbers', () => {
    const p = sanitizeProgress({
      quizzes: { 'u2-quiz': { bestPercent: 100, attempts: 1 }, 'u1-quiz': { bestPercent: 9999, attempts: -5 } },
    });
    expect(p.quizzes).toEqual({}); // lessons are not done, so neither quiz record can be real
  });

  it('keeps a legitimate failed attempt on the active quiz', () => {
    const base = finishLessons(5);
    const p = sanitizeProgress({ ...base, quizzes: { 'u1-quiz': { bestPercent: 40, attempts: 2 } } });
    expect(p.quizzes['u1-quiz']).toEqual({ bestPercent: 40, attempts: 2 });
  });

  it('rejects malformed activity keys', () => {
    const p = sanitizeProgress({ activity: { '2026-11-04': 30, 'x': 5, '__proto__': 1 } });
    expect(p.activity).toEqual({ '2026-11-04': 30 });
  });
});

describe('security helpers', () => {
  it('accepts only https video from allowed hosts', () => {
    expect(isAllowedVideoUrl('https://download.samplelib.com/mp4/sample-5s.mp4')).toBe(true);
    expect(isAllowedVideoUrl('http://download.samplelib.com/mp4/sample-5s.mp4')).toBe(false);
    expect(isAllowedVideoUrl('https://evil.example.com/a.mp4')).toBe(false);
    expect(isAllowedVideoUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedVideoUrl(null)).toBe(false);
  });

  it('only lets id-shaped route params through', () => {
    expect(parseRouteId('u1-l1')).toBe('u1-l1');
    expect(parseRouteId(['u1-l1', 'x'])).toBe('u1-l1');
    expect(parseRouteId('../../etc/passwd')).toBeNull();
    expect(parseRouteId('')).toBeNull();
    expect(parseRouteId(undefined)).toBeNull();
  });

  it('cleans names', () => {
    expect(sanitizeName('  Болд   Бат  ')).toBe('Болд Бат');
    expect(sanitizeName('   ')).toBeNull();
    expect(sanitizeName('a'.repeat(100))?.length).toBe(24);
  });
});

describe('multiple courses', () => {
  const second = courses[1];
  if (!second) throw new Error('expected at least two courses');
  const secondFirst = second.steps[0];
  const secondLesson = (n: number) => second.steps.filter((s) => s.kind === 'lesson')[n];

  it('offers several courses, each starting with its own first lesson active', () => {
    expect(courses.length).toBeGreaterThanOrEqual(3);
    const s = summarize(emptyProgress(), today);
    expect(s.states.get(defaultCourse.steps[0]?.id ?? '')).toBe('active');
    expect(s.states.get(secondFirst?.id ?? '')).toBe('active');
    expect(s.states.get(second.steps[1]?.id ?? '')).toBe('locked');
  });

  it('keeps progress separate: finishing a lesson in one course does not unlock another', () => {
    const afterCourse1 = finishLessons(2);
    expect(summarize(afterCourse1, today).courseStats.get(second.id)?.completedSteps).toBe(0);
    const r = applyLessonComplete(afterCourse1, secondFirst?.id ?? '', DAY);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(summarize(r.next, today).courseStats.get(second.id)?.completedSteps).toBe(1);
    expect(summarize(r.next, today).courseStats.get(defaultCourse.id)?.completedSteps).toBe(2);
  });

  it('refuses a locked lesson of another course', () => {
    expect(applyLessonComplete(emptyProgress(), secondLesson(2)?.id ?? '', DAY).ok).toBe(false);
  });

  it('adds XP from every course together, but percent follows the selected course', () => {
    const r = applyLessonComplete(finishLessons(2), secondFirst?.id ?? '', DAY);
    if (!r.ok) throw new Error('lesson failed');
    const onFirst = summarize({ ...r.next, activeCourseId: defaultCourse.id }, today);
    expect(onFirst.xp).toBe(30);
    expect(onFirst.completedSteps).toBe(2);
    const onSecond = summarize({ ...r.next, activeCourseId: second.id }, today);
    expect(onSecond.xp).toBe(30);
    expect(onSecond.completedSteps).toBe(1);
    expect(onSecond.course?.id).toBe(second.id);
  });

  it('switches course without touching completed work, and refuses unknown courses', () => {
    const done = finishLessons(3);
    const switched = applySetCourse(done, second.id);
    expect(switched?.activeCourseId).toBe(second.id);
    expect(switched?.completedLessons).toEqual(done.completedLessons);
    expect(applySetCourse(done, 'nope')).toBeNull();
    // Choosing no course keeps everything that was completed.
    const none = applySetCourse(done, null);
    expect(none?.activeCourseId).toBeNull();
    expect(none?.completedLessons).toEqual(done.completedLessons);
    expect(summarize(none as PersistedProgress, today).course).toBeNull();
  });

  it('starts with no course chosen, and ignores unknown saved ids', () => {
    expect(emptyProgress().activeCourseId).toBeNull();
    expect(summarize(emptyProgress(), today).course).toBeNull();
    expect(summarize(emptyProgress(), today).percent).toBe(0);
    expect(sanitizeProgress({ activeCourseId: 'hacked' }).activeCourseId).toBeNull();
    expect(sanitizeProgress({ activeCourseId: 42 }).activeCourseId).toBeNull();
    expect(sanitizeProgress({ activeCourseId: second.id }).activeCourseId).toBe(second.id);
    expect(getCourse(second.id)?.steps.length).toBe(second.steps.length);
  });

  it('continues with the course already studied when an older save has no chosen course', () => {
    const old = sanitizeProgress({ completedLessons: [secondFirst?.id] });
    expect(old.activeCourseId).toBe(second.id);
  });

  it('drops forged completions that skip a step in the second course', () => {
    const p = sanitizeProgress({ completedLessons: [secondFirst?.id, secondLesson(2)?.id] });
    expect(p.completedLessons).toEqual([secondFirst?.id]);
  });
});
