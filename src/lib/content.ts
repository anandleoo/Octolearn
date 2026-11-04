import engA1 from '@/data/courses/eng-a1.json';
import engA2 from '@/data/courses/eng-a2.json';
import jpnA1 from '@/data/courses/jpn-a1.json';
import type { CourseData } from '@/types';

import { isAllowedVideoUrl, isPlainObject } from './security';

/** Every unit has exactly this many lessons (then one quiz). The pathway layout relies on it. */
export const LESSONS_PER_UNIT = 5;

/**
 * Checks one course JSON at start-up. If content is ever loaded from a server,
 * this is the gate that stops a malformed or malicious file from reaching the UI.
 * It throws with a clear message so a content mistake is caught immediately in development.
 * `seen` is shared between courses so an id can never appear twice anywhere (progress is saved by id).
 */
function assertCourse(data: unknown, seen: Set<string>): CourseData {
  const fail = (why: string): never => {
    throw new Error(`Invalid course data: ${why}`);
  };
  if (!isPlainObject(data) || !isPlainObject(data.course) || !Array.isArray(data.units) || data.units.length === 0) {
    return fail('missing course or units');
  }
  const course = data.course as unknown as CourseData['course'];
  if (typeof course.id !== 'string' || typeof course.title !== 'string') fail('course needs an id and a title');
  if (seen.has(course.id)) fail(`duplicate course id ${course.id}`);
  seen.add(course.id);

  for (const unit of data.units as CourseData['units']) {
    if (unit.lessons?.length !== LESSONS_PER_UNIT) fail(`${unit.id}: a unit needs exactly ${LESSONS_PER_UNIT} lessons`);
    const qn = unit.quiz?.questions?.length;
    if (!qn || qn < 3 || qn > 5) fail(`${unit.id}: quiz needs 3-5 questions`);
    for (const id of [...unit.lessons.map((l) => l.id), unit.quiz.id]) {
      if (seen.has(id)) fail(`duplicate id ${id}`);
      seen.add(id);
    }
    for (const lesson of unit.lessons) {
      if (!isAllowedVideoUrl(lesson.videoUrl)) fail(`${lesson.id}: video URL not allowed`);
    }
    for (const q of unit.quiz.questions) {
      if (q.options.length !== 3 || ![0, 1, 2].includes(q.answerIndex)) {
        fail(`${unit.id}/${q.id}: needs 3 options and a valid answerIndex`);
      }
    }
  }
  return data as unknown as CourseData;
}

function loadAll(raw: unknown[]): CourseData[] {
  const seen = new Set<string>();
  return raw.map((r) => assertCourse(r, seen));
}

/** All courses, in the order they are offered. The first one is the default. */
export const courseDatas: CourseData[] = loadAll([engA1, engA2, jpnA1]);
