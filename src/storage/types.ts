import { DateKey } from '../lib/dates';

export type SetLog = { weight?: number; reps?: number; secs?: number; done: boolean };
export type ExerciseLog = { name: string; sets: SetLog[] };
export type RunLog = { miles?: number; seconds?: number; effort?: number };

export type PartLog = {
  done: boolean;
  at?: number;
  exercises?: ExerciseLog[]; // lift and abs parts
  run?: RunLog; // run parts
};

/** A workout from the library she logged on a day it wasn't scheduled. */
export type ExtraLog = { id: string; libraryId: string; title: string; kind: 'run' | 'cross'; done: boolean; run?: RunLog; minutes?: number };

export type DayLog = {
  parts: Record<string, PartLog>; // keyed by part id: 'main', 'runclub', 'abs', 'easyrun'
  extras?: ExtraLog[];
  rating?: number; // 1–5
  effort?: number; // 1–10
  journal?: string;
  savedAt?: number;
};

export type WeighIn = { date: DateKey; lb: number };

export type HalfMarathonState = {
  startDate: DateKey | null; // Monday of week 1; null until she taps "Start plan"
  easyRunWeekday: number; // ISO weekday for the easy run (default Tuesday)
  goalSeconds?: number; // optional goal finish time
};

export type AppState = {
  version: 1;
  startDate: DateKey; // first launch; days before this are shown as neutral, never "missed"
  logs: Record<DateKey, DayLog>;
  absWeeks: Record<DateKey, number[]>; // week (Monday key) → ISO weekdays with abs; missing = defaults
  favorites: string[]; // verse refs
  weighIns: WeighIn[];
  goalWeightLb?: number;
  unit: 'lb' | 'kg';
  hm: HalfMarathonState;
};
