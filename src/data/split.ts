// ─────────────────────────────────────────────────────────────
//  BAILEY'S WEEKLY SPLIT
//  Edit names, muscles, and parts here. Exercises live in exercises.ts.
//  weekday: 1 = Monday … 7 = Sunday (ISO weekday)
// ─────────────────────────────────────────────────────────────
import { MuscleId } from './muscles';

export type PartKind = 'lift' | 'run' | 'abs';
export type WorkoutPart = { id: string; kind: PartKind; title: string; note?: string };
export type DayKind = 'lift' | 'run' | 'rest';

export type SplitDay = {
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  id: string; // used as the key into EXERCISES
  name: string; // shown on cards, e.g. "Push"
  shortName: string; // shown in tight spots, e.g. the week strip
  focus: string; // one-line description of the muscle focus
  kind: DayKind;
  muscles: MuscleId[]; // highlighted on the body map
  parts: WorkoutPart[]; // checkable pieces of the day (abs is appended automatically when scheduled)
  icon: 'legs' | 'push' | 'pull' | 'arms' | 'run' | 'rest';
};

export const SPLIT: SplitDay[] = [
  {
    weekday: 1, id: 'legs-glute-quad', name: 'Legs', shortName: 'Legs', focus: 'Glute & quad focus', kind: 'lift', icon: 'legs',
    muscles: ['glutes', 'quads', 'adductors', 'calves'],
    parts: [{ id: 'main', kind: 'lift', title: 'Legs: Glute & Quad' }],
  },
  {
    weekday: 2, id: 'push', name: 'Push', shortName: 'Push', focus: 'Chest, triceps, front & side delts', kind: 'lift', icon: 'push',
    muscles: ['chest', 'triceps', 'frontDelts', 'sideDelts'],
    parts: [{ id: 'main', kind: 'lift', title: 'Push' }],
  },
  {
    weekday: 3, id: 'pull-runclub', name: 'Pull + Run Club', shortName: 'Pull', focus: 'Back, biceps, rear delts + track session', kind: 'lift', icon: 'pull',
    muscles: ['upperBack', 'lats', 'biceps', 'rearDelts', 'forearms'],
    parts: [
      { id: 'main', kind: 'lift', title: 'Pull' },
      { id: 'runclub', kind: 'run', title: 'Standard Run Club', note: 'Track workout · late afternoon' },
    ],
  },
  {
    weekday: 4, id: 'legs-glute-ham', name: 'Legs', shortName: 'Legs', focus: 'Glute & hamstring focus', kind: 'lift', icon: 'legs',
    muscles: ['glutes', 'hamstrings', 'calves'],
    parts: [{ id: 'main', kind: 'lift', title: 'Legs: Glute & Hamstring' }],
  },
  {
    weekday: 5, id: 'arms', name: 'Full Arm Day', shortName: 'Arms', focus: 'Biceps, triceps, shoulders', kind: 'lift', icon: 'arms',
    muscles: ['biceps', 'triceps', 'frontDelts', 'sideDelts', 'rearDelts', 'forearms'],
    parts: [{ id: 'main', kind: 'lift', title: 'Full Arm Day' }],
  },
  {
    weekday: 6, id: 'long-run', name: 'Long Run', shortName: 'Run', focus: 'Cardio only, no lifting', kind: 'run', icon: 'run',
    muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    parts: [{ id: 'main', kind: 'run', title: 'Long Run' }],
  },
  {
    weekday: 7, id: 'rest', name: 'Rest Day', shortName: 'Rest', focus: 'Recovery', kind: 'rest', icon: 'rest',
    muscles: [],
    parts: [],
  },
];

// Days that get abs by default each week (she can change any week in the Plan tab).
export const DEFAULT_ABS_WEEKDAYS: number[] = [1, 3, 5]; // Mon, Wed, Fri
export const ABS_PER_WEEK = 3;
export const MAIN_WORKOUTS_PER_WEEK = 6;

export const RECOVERY_MESSAGES = [
  'Rest is part of the program. Hydrate, stretch, and let it all rebuild.',
  'Easy walk, good food, early night. Tomorrow you go again.',
  'Muscles grow on rest days. Take this one seriously.',
];

export function splitFor(weekday: number): SplitDay {
  return SPLIT.find(d => d.weekday === weekday)!;
}
