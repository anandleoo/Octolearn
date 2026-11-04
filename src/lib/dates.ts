/** Local calendar date as YYYY-MM-DD. Streaks are about the user's own day, so we avoid UTC. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** "2026 оны 11-р сар" from an ISO date string. Empty if the date is not valid. */
export function monthYearMn(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()} оны ${d.getMonth() + 1}-р сар`;
}
