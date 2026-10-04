export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const HISTORY_DAYS = 30;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** Local-time day key, e.g. "2026-10-04". */
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

/** The last `n` days ending today, oldest first. */
export function lastNDays(n: number): Date[] {
  const now = new Date();
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
  }
  return days;
}

export function formatDay(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
