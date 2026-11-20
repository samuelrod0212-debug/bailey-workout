// All "today" logic uses the device's local date.
export type DateKey = string; // 'YYYY-MM-DD' in local time

const pad = (n: number) => String(n).padStart(2, '0');
export const toKey = (d: Date): DateKey => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: DateKey) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const isoWeekday = (d: Date) => ((d.getDay() + 6) % 7) + 1; // Mon=1 … Sun=7
export const startOfWeek = (d: Date) => addDays(startOfDay(d), 1 - isoWeekday(d));
export const weekKey = (d: Date): DateKey => toKey(startOfWeek(d));
export const weekDates = (d: Date) => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(d), i));
export const sameDay = (a: Date, b: Date) => toKey(a) === toKey(b);

export function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.round((startOfDay(d).getTime() - start.getTime()) / 86400000) + 1; // 1…366
}

/** Weeks of the month grid (Monday-first), padded with nulls. */
export function monthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = isoWeekday(first) - 1;
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))];
  while (cells.length % 7) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function longDate(d: Date) {
  return `${WEEKDAYS_LONG[isoWeekday(d) - 1]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
export function greeting(d: Date) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
