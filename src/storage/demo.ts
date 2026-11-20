// Demo history used ONLY for preview screenshots (web build with ?demo=1). Never saved.
import { AppState } from './types';
import { addDays, isoWeekday, toKey, startOfWeek } from '../lib/dates';
import { splitFor } from '../data/split';
import { freshState } from './persist';

export function demoState(today: Date): AppState {
  const s = freshState();
  s.startDate = toKey(addDays(startOfWeek(today), -35));
  const missed = new Set([toKey(addDays(today, -9)), toKey(addDays(today, -23))]);
  for (let i = 40; i >= 1; i--) {
    const d = addDays(today, -i);
    const k = toKey(d);
    if (k < s.startDate) continue;
    const sp = splitFor(isoWeekday(d));
    if (sp.kind === 'rest' || missed.has(k)) continue;
    const parts: AppState['logs'][string]['parts'] = {};
    sp.parts.forEach(p => (parts[p.id] = { done: true }));
    if ([1, 3, 5].includes(isoWeekday(d)) && i !== 2) parts.abs = { done: true };
    s.logs[k] = { parts, rating: 4 };
  }
  let w = 148.6;
  for (let i = 5; i >= 0; i--) { s.weighIns.push({ date: toKey(addDays(startOfWeek(today), -7 * i)), lb: +(w -= 0.5).toFixed(1) }); }
  return s;
}
