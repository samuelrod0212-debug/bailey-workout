// Pure functions that turn the split + her logs into what the screens show.
import { AppState } from '../storage/types';
import { SPLIT, SplitDay, WorkoutPart, splitFor, DEFAULT_ABS_WEEKDAYS, ABS_PER_WEEK, MAIN_WORKOUTS_PER_WEEK } from '../data/split';
import { ABS_ROUTINES, AbsRoutine } from '../data/absRoutines';
import { MuscleId, CORE_MUSCLES } from '../data/muscles';
import { addDays, isoWeekday, startOfDay, toKey, weekDates, weekKey } from './dates';

export type DayStatus = 'done' | 'partial' | 'missed' | 'rest' | 'upcoming' | 'today' | 'none';

export function absWeekdays(s: AppState, d: Date): number[] {
  return s.absWeeks[weekKey(d)] ?? DEFAULT_ABS_WEEKDAYS;
}
export const absChosenThisWeek = (s: AppState, d: Date) => s.absWeeks[weekKey(d)] !== undefined;

export type DayPlan = {
  date: Date;
  split: SplitDay;
  hasAbs: boolean;
  absRoutine?: AbsRoutine;
  parts: WorkoutPart[]; // main parts, then abs if scheduled
  muscles: MuscleId[];
};

export function planFor(s: AppState, date: Date): DayPlan {
  const wd = isoWeekday(date);
  const split = splitFor(wd);
  const absDays = [...absWeekdays(s, date)].sort();
  const hasAbs = absDays.includes(wd);
  const absRoutine = hasAbs ? ABS_ROUTINES[absDays.indexOf(wd) % ABS_ROUTINES.length] : undefined;
  const parts: WorkoutPart[] = [...split.parts];
  if (hasAbs) parts.push({ id: 'abs', kind: 'abs', title: absRoutine ? `${absRoutine.name} · ${absRoutine.focus.split(' +')[0]}` : 'Abs' });
  const muscles = hasAbs ? Array.from(new Set([...split.muscles, ...CORE_MUSCLES])) : split.muscles;
  return { date, split, hasAbs, absRoutine, parts, muscles };
}

const partDone = (s: AppState, d: Date, id: string) => !!s.logs[toKey(d)]?.parts[id]?.done;

export function mainDone(s: AppState, d: Date) {
  const sp = splitFor(isoWeekday(d));
  return sp.parts.length > 0 && sp.parts.every(p => partDone(s, d, p.id));
}
export const absDone = (s: AppState, d: Date) => partDone(s, d, 'abs');

export function dayStatus(s: AppState, d: Date, today: Date): DayStatus {
  const k = toKey(d), t = toKey(today);
  const sp = splitFor(isoWeekday(d));
  if (k > t) return sp.kind === 'rest' ? 'rest' : 'upcoming';
  if (sp.kind === 'rest') return 'rest';
  if (mainDone(s, d)) return 'done';
  const anyDone = sp.parts.some(p => partDone(s, d, p.id));
  if (k === t) return anyDone ? 'partial' : 'today';
  if (k < s.startDate) return 'none';
  return anyDone ? 'partial' : 'missed';
}

export function weekStats(s: AppState, d: Date) {
  const days = weekDates(d);
  const workouts = days.filter(x => splitFor(isoWeekday(x)).kind !== 'rest' && mainDone(s, x)).length;
  const abs = days.filter(x => absDone(s, x)).length;
  const weighed = s.weighIns.some(w => weekKey(new Date(w.date + 'T12:00')) === weekKey(d));
  return { workouts, workoutsGoal: MAIN_WORKOUTS_PER_WEEK, abs, absGoal: ABS_PER_WEEK, weighed };
}

/** Consecutive training days completed, walking back from today. Rest days don't break it; today doesn't count against her until it's over. */
export function dayStreak(s: AppState, today: Date) {
  let n = 0;
  let d = startOfDay(today);
  if (!mainDone(s, d)) d = addDays(d, -1);
  for (let i = 0; i < 400; i++, d = addDays(d, -1)) {
    const sp = splitFor(isoWeekday(d));
    if (sp.kind === 'rest') continue;
    if (mainDone(s, d)) n++; else break;
  }
  return n;
}

export const SPLIT_DAYS = SPLIT;
