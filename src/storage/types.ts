import { DateKey } from '../lib/dates';

export type PartLog = { done: boolean; at?: number };
export type DayLog = {
  parts: Record<string, PartLog>; // keyed by part id: 'main', 'runclub', 'abs'
  rating?: number; effort?: number; energy?: number; journal?: string;
};
export type WeighIn = { date: DateKey; lb: number };

export type AppState = {
  version: 1;
  startDate: DateKey; // first launch; days before this are shown as neutral, never "missed"
  logs: Record<DateKey, DayLog>;
  absWeeks: Record<DateKey, number[]>; // week (Monday key) → ISO weekdays with abs; missing = defaults
  favorites: string[]; // verse refs
  weighIns: WeighIn[];
  unit: 'lb' | 'kg';
};
