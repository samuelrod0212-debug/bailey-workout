// Parsing and formatting for the numbers she types mid-workout.

/** "45" → 45 min, "45:30" → 45 min 30 s, "1:02:30" → 1 h 2 min 30 s. Returns seconds. */
export function parseDuration(text: string): number | undefined {
  const t = text.trim();
  if (!t) return undefined;
  const parts = t.split(':').map(p => Number(p));
  if (parts.some(n => !Number.isFinite(n) || n < 0)) return undefined;
  if (parts.length === 1) return Math.round(parts[0] * 60);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return undefined;
}

export function formatDuration(sec?: number): string {
  if (sec == null || !Number.isFinite(sec)) return '';
  const s = Math.round(sec);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? h + ':' : ''}${mm}:${String(r).padStart(2, '0')}`;
}

/** Pace in seconds per mile → "9:45". */
export function formatPace(secPerMile?: number): string {
  if (!secPerMile || !Number.isFinite(secPerMile)) return '–';
  const m = Math.floor(secPerMile / 60), s = Math.round(secPerMile % 60);
  return s === 60 ? `${m + 1}:00` : `${m}:${String(s).padStart(2, '0')}`;
}

export const LB_PER_KG = 2.20462;
export const toUnit = (lb: number, unit: 'lb' | 'kg') => (unit === 'kg' ? lb / LB_PER_KG : lb);
export const fromUnit = (v: number, unit: 'lb' | 'kg') => (unit === 'kg' ? v * LB_PER_KG : v);
export const fmt1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, '');
export const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${fmt1(Math.abs(n))}`;
