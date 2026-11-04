/** Content shapes. These mirror data/course.json (see lib/content.ts for the runtime check). */

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSec: number;
}

export interface Question {
  id: string;
  text: string;
  options: [string, string, string];
  answerIndex: 0 | 1 | 2;
}

export interface Quiz {
  id: string;
  passPercent: number;
  questions: Question[];
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
  quiz: Quiz;
}

export interface CourseData {
  course: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    /** Name of an icon from the app's icon set; unknown names fall back to a book. */
    icon: string;
  };
  rewards: { lessonXp: number; quizXp: number };
  units: Unit[];
}

/** A "step" is one dot on the pathway: either a lesson or a unit's quiz. */
export type StepKind = 'lesson' | 'quiz';

/** completed = done, active = the one to do next, locked = not reachable yet. */
export type NodeState = 'completed' | 'active' | 'locked';

export interface Step {
  id: string;
  kind: StepKind;
  /** Which course this step belongs to. */
  courseId: string;
  /** Position in its course (0-based). Drives order and the zigzag shape. */
  index: number;
  unitIndex: number;
  /** Position inside the unit (0-based). Lessons 0-4, the quiz is 5. */
  indexInUnit: number;
  unit: Unit;
  lesson?: Lesson;
  quiz?: Quiz;
}

export interface QuizRecord {
  /** Best score in whole percent (0-100). Whether it "passed" is derived, never stored. */
  bestPercent: number;
  attempts: number;
}

/** The only data we write to the device. Everything else (XP, level, unlocks…) is derived. */
export interface PersistedProgress {
  /** The course shown on Home, or null until the learner picks one. Switching never touches what was completed. */
  activeCourseId: string | null;
  completedLessons: string[];
  quizzes: Record<string, QuizRecord>;
  /** Local date (YYYY-MM-DD) -> XP earned that day. Feeds the streak and the weekly chart. */
  activity: Record<string, number>;
}
