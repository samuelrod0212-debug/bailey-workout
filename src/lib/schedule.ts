// Pure functions that turn the split + her logs into what the screens show.
import { AppState, DayLog, ExerciseLog, RunLog } from '../storage/types';
import { SPLIT, SplitDay, WorkoutPart, splitFor, DEFAULT_ABS_WEEKDAYS, ABS_PER_WEEK, MAIN_WORKOUTS_PER_WEEK } from '../data/split';
import { ABS_ROUTINES, AbsRoutine } from '../data/absRoutines';
import { MuscleId, CORE_MUSCLES } from '../data/muscles';
import { exercisesFor, RUNS } from '../data/exercises';
import { HALF_MARATHON_PLAN, HMRun, HMWeek, HM_WEEKS } from '../data/halfMarathon';
import { addDays, fromKey, isoWeekday, startOfDay, startOfWeek, toKey, weekDates, weekKey } from './dates';

export type DayStatus = 'done' | 'partial' | 'missed' | 'rest' | 'upcoming' | 'today' | 'none';

export function absWeekdays(s: AppState, d: Date): number[] {
  return s.absWeeks[weekKey(d)] ?? DEFAULT_ABS_WEEKDAYS;
}
export const absChosenThisWeek = (s: AppState, d: Date) => s.absWeeks[weekKey(d)] !== undefined;

// ── Half marathon ────────────────────────────────────────────
export const RUN_LEG_MUSCLES: MuscleId[] = ['quads', 'hamstrings', 'glutes', 'calves'];

/** 1-based week of the half-marathon plan for a date, or null outside the plan. */
export function hmWeekNumber(s: AppState, d: Date): number | null {
  if (!s.hm.startDate) return null;
  const days = Math.floor((startOfDay(d).getTime() - fromKey(s.hm.startDate).getTime()) / 86400000);
  if (days < 0 || days >= HM_WEEKS * 7) return null;
  return Math.floor(days / 7) + 1;
}
export const hmWeek = (s: AppState, d: Date): HMWeek | null => {
  const n = hmWeekNumber(s, d);
  return n ? HALF_MARATHON_PLAN[n - 1] : null;
};
export const raceDay = (s: AppState) => (s.hm.startDate ? addDays(fromKey(s.hm.startDate), HM_WEEKS * 7 - 2) : null); // Saturday of the last week

/** The three runs of a plan week with their calendar dates and the part id they're logged under. */
export function hmRunsForWeek(s: AppState, weekNumber: number) {
  const w = HALF_MARATHON_PLAN[weekNumber - 1];
  const monday = addDays(fromKey(s.hm.startDate!), (weekNumber - 1) * 7);
  return [
    { run: w.easy, date: addDays(monday, s.hm.easyRunWeekday - 1), partId: 'easyrun' },
    { run: w.quality, date: addDays(monday, 2), partId: 'runclub' },
    { run: w.long, date: addDays(monday, 5), partId: 'main' },
  ];
}

// ── Day plan ─────────────────────────────────────────────────
export type PlanPart = WorkoutPart & { target?: string; hm?: HMRun };

export type DayPlan = {
  date: Date;
  split: SplitDay;
  hasAbs: boolean;
  absRoutine?: AbsRoutine;
  parts: PlanPart[]; // main parts, the half-marathon easy run if it falls today, then abs if scheduled
  muscles: MuscleId[];
  hmWeek: HMWeek | null;
};

export function planFor(s: AppState, date: Date): DayPlan {
  const wd = isoWeekday(date);
  const split = splitFor(wd);
  const absDays = [...absWeekdays(s, date)].sort();
  const hasAbs = absDays.includes(wd);
  const absRoutine = hasAbs ? ABS_ROUTINES[absDays.indexOf(wd) % ABS_ROUTINES.length] : undefined;
  const week = hmWeek(s, date);

  const parts: PlanPart[] = split.parts.map(p => {
    if (p.kind !== 'run') return { ...p };
    const hm = !week ? undefined : wd === 3 ? week.quality : wd === 6 ? week.long : undefined;
    if (hm) return { ...p, title: wd === 3 ? `Run Club · ${hm.title}` : hm.title, target: hm.detail, hm };
    const r = RUNS[`${split.id}/${p.id}`];
    return { ...p, target: [r?.distance, r?.notes].filter(Boolean).join(' · ') || undefined };
  });
  if (week && wd === s.hm.easyRunWeekday && !parts.some(p => p.kind === 'run')) {
    parts.push({ id: 'easyrun', kind: 'run', title: week.easy.title, target: week.easy.detail, hm: week.easy });
  }
  if (hasAbs) parts.push({ id: 'abs', kind: 'abs', title: 'Abs', target: absRoutine ? `${absRoutine.name} · ${absRoutine.focus}` : undefined });

  let muscles = split.muscles;
  if (parts.some(p => p.id === 'easyrun')) muscles = Array.from(new Set([...muscles, ...RUN_LEG_MUSCLES]));
  if (hasAbs) muscles = Array.from(new Set([...muscles, ...CORE_MUSCLES]));
  return { date, split, hasAbs, absRoutine, parts, muscles, hmWeek: week };
}

/** Fresh, empty set logs for a lift or abs part, based on the data files. */
export function templateExercises(plan: DayPlan, partId: string): ExerciseLog[] {
  if (partId === 'abs') {
    return (plan.absRoutine?.exercises ?? []).map(e => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ done: false })) }));
  }
  return exercisesFor(plan.split.id, partId).map(e => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ done: false })) }));
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
  const weighed = s.weighIns.some(w => weekKey(fromKey(w.date)) === weekKey(d));
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

// ── Runs ─────────────────────────────────────────────────────
/** Every run she logged on a day (scheduled run parts + library extras), with distance. */
export function runsOn(log: DayLog | undefined): RunLog[] {
  if (!log) return [];
  const out: RunLog[] = [];
  for (const [id, p] of Object.entries(log.parts)) if (p.run && (p.done || p.run.miles) && id !== 'abs') out.push(p.run);
  for (const e of log.extras ?? []) if (e.kind === 'run' && e.run && (e.done || e.run.miles)) out.push(e.run);
  return out;
}
export function milesInWeek(s: AppState, d: Date) {
  return weekDates(d).reduce((sum, x) => sum + runsOn(s.logs[toKey(x)]).reduce((a, r) => a + (r.miles ?? 0), 0), 0);
}
export function longestRunInWeek(s: AppState, d: Date) {
  return weekDates(d).reduce((m, x) => Math.max(m, ...runsOn(s.logs[toKey(x)]).map(r => r.miles ?? 0)), 0);
}

/** Days that have anything logged, newest first. */
export function loggedDays(s: AppState): Date[] {
  return Object.entries(s.logs)
    .filter(([, l]) => Object.values(l.parts).some(p => p.done) || (l.extras ?? []).some(e => e.done) || l.rating || l.journal)
    .map(([k]) => fromKey(k))
    .sort((a, b) => b.getTime() - a.getTime());
}

export const SPLIT_DAYS = SPLIT;
export { startOfWeek };
