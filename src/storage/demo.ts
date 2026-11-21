// Demo history used ONLY for preview screenshots (web build with ?demo=1). Never saved.
import { AppState, DayLog } from './types';
import { addDays, isoWeekday, toKey, startOfWeek } from '../lib/dates';
import { freshState } from './persist';
import { planFor, templateExercises } from '../lib/schedule';
import { exercisesFor } from '../data/exercises';

const NOTES = [
  'Felt strong today. Going up 5 lb next week.',
  'Tired from work but got it done. Shoulders were a little tight.',
  'Great run club session, kept the reps even.',
  'Everything felt smooth today. Good sleep helped.',
  'Short on time so I moved fast between sets. Good pump.',
  'Legs were heavy after yesterday. Kept the easy run truly easy.',
];

export function demoState(today: Date): AppState {
  const s = freshState();
  const weeksBack = 9;
  s.startDate = toKey(addDays(startOfWeek(today), -7 * weeksBack));
  s.hm = { startDate: toKey(addDays(startOfWeek(today), -14)), easyRunWeekday: 2 };
  const missed = new Set([toKey(addDays(today, -12)), toKey(addDays(today, -26)), toKey(addDays(today, -40))]);
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

  for (let i = weeksBack * 7; i >= 0; i--) {
    const d = addDays(today, -i);
    const k = toKey(d);
    if (k < s.startDate || missed.has(k)) continue;
    const plan = planFor(s, d);
    if (!plan.parts.length) continue;
    if (i === 0) continue; // leave today open so the screenshots show "Log workout"
    const log: DayLog = { parts: {} };
    for (const p of plan.parts) {
      if (p.kind === 'run') {
        const miles = p.hm?.miles ?? (isoWeekday(d) === 6 ? 4 + Math.min(3, (weeksBack * 7 - i) / 21) : 3);
        const pace = p.hm?.kind === 'quality' ? 590 : 640;
        const m = Math.round(miles * 10) / 10;
        log.parts[p.id] = { done: true, run: { miles: m, seconds: Math.round(m * (pace + rnd() * 40)), effort: p.hm?.kind === 'quality' ? 7 : 4 } };
      } else {
        const tmpl = p.kind === 'lift' ? exercisesFor(plan.split.id, p.id) : [];
        const progress = 1 + (weeksBack * 7 - i) / 200;
        log.parts[p.id] = {
          done: !(p.kind === 'abs' && i === 2),
          exercises: templateExercises(plan, p.id).map((ex, j) => ({
            ...ex,
            sets: ex.sets.map(() => p.kind === 'abs'
              ? (ex.name.includes('Plank') || ex.name.includes('Hold') ? { secs: 30 + Math.round(rnd() * 15), done: true } : { reps: 12 + Math.round(rnd() * 4), done: true })
              : { weight: Math.round(((tmpl[j]?.name.match(/Squat|Thrust|Deadlift/) ? 95 : tmpl[j]?.name.match(/Row|Pulldown/) ? 50 : tmpl[j]?.name.match(/Press/) ? 20 : 15) * progress) / 5) * 5, reps: parseInt(tmpl[j]?.reps ?? '10', 10) + Math.round(rnd()), done: true }),
          })),
        };
      }
    }
    log.rating = rnd() > 0.75 ? 5 : rnd() > 0.2 ? 4 : 3;
    log.effort = 6 + Math.round(rnd() * 3);
    if (rnd() > 0.45) log.journal = NOTES[Math.floor(rnd() * NOTES.length)];
    s.logs[k] = log;
  }

  let w = 152.4;
  for (let i = weeksBack; i >= 0; i--) {
    w -= 0.35 + (rnd() - 0.4) * 0.6;
    s.weighIns.push({ date: toKey(addDays(startOfWeek(today), -7 * i)), lb: Math.round(w * 10) / 10 });
  }
  s.goalWeightLb = 145;
  return s;
}
