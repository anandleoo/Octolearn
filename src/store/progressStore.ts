import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { dateKey } from '@/lib/dates';
import {
  applyLessonComplete,
  applyQuizSubmit,
  applySetCourse,
  emptyProgress,
  sanitizeProgress,
  summarize,
  type CompleteLessonResult,
  type SubmitQuizResult,
} from '@/lib/progress';
import type { PersistedProgress } from '@/types';

/** If the device storage throws (full disk, corrupted), the app keeps working with fresh progress. */
const safeStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      // Ignore: losing one save is better than crashing the lesson screen.
    }
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Ignore, same reason.
    }
  },
};

/** Accepts every write and keeps nothing. Used while nobody is signed in, so no save can land in a stranger's file. */
const nullStorage: StateStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

/** Every account has its own progress file, so two people on one phone never share XP. */
export const progressKey = (userId: string) => `octolearn.progress.v1.${userId}`;

interface ProgressActions {
  completeLesson: (lessonId: string) => CompleteLessonResult;
  submitQuiz: (quizId: string, correct: number) => SubmitQuizResult;
  /** Pass null to deselect the course. Returns false for an unknown course id. */
  setActiveCourse: (courseId: string | null) => boolean;
  reset: () => void;
}

type ProgressStore = PersistedProgress & ProgressActions;

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...emptyProgress(),

      completeLesson: (lessonId) => {
        const result = applyLessonComplete(get(), lessonId, dateKey(new Date()));
        if (result.ok) set(result.next);
        return result;
      },

      submitQuiz: (quizId, correct) => {
        const result = applyQuizSubmit(get(), quizId, correct, dateKey(new Date()));
        if (result.ok) set(result.next);
        return result;
      },

      setActiveCourse: (courseId) => {
        const next = applySetCourse(get(), courseId);
        if (next) set(next);
        return next !== null;
      },

      // Wipes completed work but keeps the course you were on.
      reset: () => set({ ...emptyProgress(), activeCourseId: get().activeCourseId }),
    }),
    {
      name: 'octolearn.progress.v1.none',
      version: 1,
      storage: createJSONStorage(() => nullStorage),
      // Nothing is read until someone signs in (see loadProgressFor).
      skipHydration: true,
      // Save only the data, never the functions.
      partialize: ({ activeCourseId, completedLessons, quizzes, activity }) => ({
        activeCourseId,
        completedLessons,
        quizzes,
        activity,
      }),
      // Runs when the saved file is loaded: rebuild it through the sanitizer instead of trusting it.
      merge: (saved, current) => ({ ...current, ...sanitizeProgress(saved) }),
    },
  ),
);

/** Points the store at one account's progress file and loads it. Call after sign-in, before showing any screen. */
export async function loadProgressFor(userId: string): Promise<void> {
  useProgressStore.persist.setOptions({ name: progressKey(userId), storage: createJSONStorage(() => safeStorage) });
  await useProgressStore.persist.rehydrate();
}

/** After sign-out: wipe the in-memory copy without touching the saved file. */
export function detachProgress(): void {
  useProgressStore.persist.setOptions({ name: 'octolearn.progress.v1.none', storage: createJSONStorage(() => nullStorage) });
  useProgressStore.setState(emptyProgress());
}

/** Deletes one account's saved progress (used when the account is deleted). */
export async function deleteProgressFor(userId: string): Promise<void> {
  await safeStorage.removeItem(progressKey(userId));
}

/** The numbers every screen needs (XP, level, unlock states…), recalculated when the saved data changes. */
export function useProgress() {
  const activeCourseId = useProgressStore((s) => s.activeCourseId);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const quizzes = useProgressStore((s) => s.quizzes);
  const activity = useProgressStore((s) => s.activity);

  return useMemo(
    () => ({ activity, ...summarize({ activeCourseId, completedLessons, quizzes, activity }, new Date()) }),
    [activeCourseId, completedLessons, quizzes, activity],
  );
}
