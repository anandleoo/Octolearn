import { addDays, dateKey } from './dates';

export const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number): { level: number; intoLevel: number; ratio: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return { level, intoLevel, ratio: intoLevel / XP_PER_LEVEL };
}

/**
 * Streak = number of consecutive days with activity, counting back from today.
 * If the user hasn't done anything yet today, yesterday's streak is still alive
 * (they still have until midnight to continue it).
 */
export function streakFromActivity(activity: Record<string, number>, today: Date): number {
  let cursor = today;
  if (!(dateKey(cursor) in activity)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (dateKey(cursor) in activity) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** XP earned on each of the last 7 days, oldest first, ending today. */
export function lastSevenDays(
  activity: Record<string, number>,
  today: Date,
): { key: string; date: Date; xp: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const key = dateKey(date);
    return { key, date, xp: activity[key] ?? 0 };
  });
}

export interface Achievement {
  id: string;
  title: string;
  hint: string;
  icon: 'book' | 'trophy' | 'flame' | 'level';
  unlocked: boolean;
}

/** Badges are derived from progress (never saved), so they always match what the learner actually did. */
export function achievementsFrom(p: {
  lessonsDone: number;
  quizzesPassed: number;
  streak: number;
  percent: number;
}): Achievement[] {
  return [
    { id: 'first-lesson', title: 'Анхны алхам', hint: 'Эхний хичээлээ дуусга', icon: 'book', unlocked: p.lessonsDone >= 1 },
    { id: 'first-quiz', title: 'Шалгалтад тэнцсэн', hint: 'Нэг шалгалтад тэнц', icon: 'trophy', unlocked: p.quizzesPassed >= 1 },
    { id: 'streak-3', title: '3 өдрийн streak', hint: '3 өдөр дараалан суралц', icon: 'flame', unlocked: p.streak >= 3 },
    { id: 'course-done', title: 'Курс дүүргэгч', hint: 'Курсийг 100% дуусга', icon: 'level', unlocked: p.percent >= 100 },
  ];
}
