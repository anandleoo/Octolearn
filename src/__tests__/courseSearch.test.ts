import { defaultCourse } from '@/lib/curriculum';
import { isSearching, searchSteps } from '@/lib/courseSearch';
import { sanitizeBio } from '@/lib/security';

const steps = defaultCourse.steps;

describe('searchSteps', () => {
  it('returns everything for an empty box', () => {
    expect(isSearching('   ')).toBe(false);
    expect(searchSteps(steps, '  ')).toHaveLength(steps.length);
  });

  it('finds a lesson by its title, ignoring case and extra spaces', () => {
    const first = steps[0]?.lesson?.title ?? '';
    const found = searchSteps(steps, `  ${first.toUpperCase()} `);
    expect(found.map((s) => s.id)).toContain(steps[0]?.id);
  });

  it('finds quizzes by the word "шалгалт" and requires every word to match', () => {
    const found = searchSteps(steps, 'шалгалт');
    expect(found.some((s) => s.kind === 'quiz')).toBe(true);
    expect(searchSteps(steps, 'шалгалт zzzzzz')).toHaveLength(0);
  });
});

describe('sanitizeBio', () => {
  it('strips control characters, collapses spaces and caps the length', () => {
    expect(sanitizeBio('  hi\n\tthere\u0000  ')).toBe('hi there');
    expect(sanitizeBio('x'.repeat(200))).toHaveLength(80);
    expect(sanitizeBio(42)).toBe('');
  });
});
