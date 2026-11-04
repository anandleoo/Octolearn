import type { Step } from '@/types';

const norm = (text: string) => text.toLowerCase().normalize('NFC');

/** The words a step can be found by: its own title and description, its unit's title, and "шалгалт" for quizzes. */
function searchText(step: Step): string {
  const parts =
    step.kind === 'lesson'
      ? [step.lesson?.title, step.lesson?.description]
      : ['Шалгалт', `${step.unit.title} шалгалт`];
  parts.push(step.unit.title, step.unit.subtitle);
  return norm(parts.filter(Boolean).join(' '));
}

export const isSearching = (query: string) => query.trim() !== '';

/** Steps that match every word typed in the search box (case-insensitive). An empty box matches everything. Pure, so it is easy to test. */
export function searchSteps(all: Step[], query: string): Step[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return all;
  return all.filter((step) => {
    const text = searchText(step);
    return words.every((w) => text.includes(w));
  });
}
