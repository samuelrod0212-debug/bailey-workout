// ─────────────────────────────────────────────────────────────
//  12-WEEK HALF MARATHON PLAN  (middle-beginner: runs ~3 mi comfortably today)
//
//  3 runs a week, built around her lifting split:
//    • Easy run  — default Tuesday (she can change the day in the Half Marathon tab)
//    • Run Club  — Wednesday quality session (intervals, tempo or hills)
//    • Long run  — Saturday
//  Long run builds from 4 mi to 10 mi by week 10, with cutback weeks 4 and 8 and a taper in 11–12.
//  Race day is Saturday of week 12.
//
//  Effort is the 1–10 scale + talk test (see EFFORT_GUIDE). Edit freely: each week is plain data.
// ─────────────────────────────────────────────────────────────

export type HMRunKind = 'easy' | 'quality' | 'long' | 'race';
export type HMRun = {
  kind: HMRunKind;
  title: string; // short name shown on cards, e.g. "Tempo 2×10 min"
  miles: number; // approximate total distance including warm-up / cool-down
  detail: string; // how to run it
  effort: string; // e.g. "3–4/10"
  libraryId?: string; // link to WORKOUT_LIBRARY for the full explanation
};
export type HMWeek = {
  week: number;
  phase: 'Base' | 'Build' | 'Cutback' | 'Peak' | 'Taper' | 'Race week';
  focus: string;
  easy: HMRun;
  quality: HMRun;
  long: HMRun;
};

const easy = (miles: number, extra = ''): HMRun => ({
  kind: 'easy', title: `Easy ${miles} mi`, miles, effort: '3–4/10', libraryId: 'easy',
  detail: `Conversational pace the whole way. You should be able to talk in full sentences.${extra}`,
});
const long = (miles: number, extra = ''): HMRun => ({
  kind: 'long', title: `Long run ${miles} mi`, miles, effort: '3–5/10', libraryId: 'long',
  detail: `Slow and steady. Walk breaks are fine. Bring water for anything over 6 mi.${extra}`,
});

export const HALF_MARATHON_PLAN: HMWeek[] = [
  {
    week: 1, phase: 'Base', focus: 'Find an easy rhythm. Nothing should feel hard yet.',
    easy: easy(2.5),
    quality: { kind: 'quality', title: 'Fartlek 6×1 min', miles: 3, effort: '6–7/10 on the fast bits', libraryId: 'fartlek',
      detail: '10 min easy warm-up. Then 6 × (1 min quick, 2 min easy jog). 5–10 min easy cool-down.' },
    long: long(4),
  },
  {
    week: 2, phase: 'Base', focus: 'Add a little distance and some hill strength.',
    easy: easy(3),
    quality: { kind: 'quality', title: 'Hill repeats 6×30 s', miles: 3, effort: '7–8/10 uphill', libraryId: 'hills',
      detail: '10 min easy warm-up. Find a moderate hill: 6 × 30 s strong uphill, walk or jog back down. Cool down easy.' },
    long: long(4.5),
  },
  {
    week: 3, phase: 'Base', focus: 'First taste of tempo: comfortably hard, controlled.',
    easy: easy(3),
    quality: { kind: 'quality', title: 'Tempo 2×8 min', miles: 3.5, effort: '6–7/10', libraryId: 'tempo',
      detail: '10 min easy warm-up. 2 × 8 min at tempo effort with 2 min easy jog between. Cool down easy.' },
    long: long(5),
  },
  {
    week: 4, phase: 'Cutback', focus: 'Lighter week so the first three weeks sink in.',
    easy: easy(2.5),
    quality: { kind: 'quality', title: 'Easy fartlek 8×1 min', miles: 3, effort: '5–6/10', libraryId: 'fartlek',
      detail: '10 min easy. 8 × (1 min brisk, 1 min easy). Keep the brisk parts relaxed, not all-out.' },
    long: long(4),
  },
  {
    week: 5, phase: 'Build', focus: 'Speed work starts. Short and sharp, then easy.',
    easy: easy(3, ' Finish with 4 × 20 s strides.'),
    quality: { kind: 'quality', title: '6×400 m', miles: 3.5, effort: '8/10 on each rep', libraryId: 'int400',
      detail: '10–15 min easy warm-up. 6 × 400 m (one track lap) at 5K effort with 90 s easy jog between. Cool down easy.' },
    long: long(6),
  },
  {
    week: 6, phase: 'Build', focus: 'Longer tempo. This is the pace that makes race day feel easier.',
    easy: easy(3.5),
    quality: { kind: 'quality', title: 'Tempo 2×10 min', miles: 4, effort: '6–7/10', libraryId: 'tempo',
      detail: '10 min easy warm-up. 2 × 10 min at tempo effort with 2 min easy jog between. Cool down easy.' },
    long: long(7),
  },
  {
    week: 7, phase: 'Build', focus: 'Longer intervals and the biggest long run so far.',
    easy: easy(3.5, ' Finish with 4 × 20 s strides.'),
    quality: { kind: 'quality', title: '4×800 m', miles: 4, effort: '7–8/10', libraryId: 'int800',
      detail: '10–15 min easy warm-up. 4 × 800 m (two laps) at 10K effort with 2 min easy jog between. Cool down easy.' },
    long: long(8),
  },
  {
    week: 8, phase: 'Cutback', focus: 'Recover and absorb. Shorter long run.',
    easy: easy(3),
    quality: { kind: 'quality', title: 'Hill repeats 8×45 s', miles: 3.5, effort: '7–8/10 uphill', libraryId: 'hills',
      detail: '10 min easy warm-up. 8 × 45 s strong uphill, easy jog back down. Cool down easy.' },
    long: long(6),
  },
  {
    week: 9, phase: 'Peak', focus: 'Peak training starts. Continuous tempo and a 9-miler.',
    easy: easy(4),
    quality: { kind: 'quality', title: 'Tempo 20 min', miles: 4.5, effort: '6–7/10', libraryId: 'tempo',
      detail: '10 min easy warm-up. 20 min continuous at tempo effort. Cool down easy.' },
    long: long(9, ' Practice your race-day fuel (gel or chews around mile 5).'),
  },
  {
    week: 10, phase: 'Peak', focus: 'The big one: 10 miles. You are ready for 13.1 after this.',
    easy: easy(4),
    quality: { kind: 'quality', title: '3×1 mi at goal pace', miles: 5, effort: '6–7/10', libraryId: 'progression',
      detail: '10 min easy warm-up. 3 × 1 mile at your goal half marathon pace with 2 min easy jog between. Cool down easy.' },
    long: long(10, ' Last 2 miles at goal race pace if you feel good.'),
  },
  {
    week: 11, phase: 'Taper', focus: 'Less volume, keep a little sharpness. Sleep and eat well.',
    easy: easy(3.5),
    quality: { kind: 'quality', title: 'Tempo 2×10 min', miles: 4, effort: '6–7/10', libraryId: 'tempo',
      detail: '10 min easy warm-up. 2 × 10 min at tempo effort with 2 min easy jog between. Cool down easy.' },
    long: long(7),
  },
  {
    week: 12, phase: 'Race week', focus: 'Stay fresh. Short and easy, then race Saturday.',
    easy: easy(3, ' Add 4 × 20 s strides at the end.'),
    quality: { kind: 'quality', title: 'Shakeout + strides', miles: 2.5, effort: '3–4/10', libraryId: 'strides',
      detail: '20–25 min very easy with 4 × 20 s relaxed strides. Skip the hard Run Club workout this week.' },
    long: { kind: 'race', title: 'RACE DAY · 13.1 mi', miles: 13.1, effort: 'Start at 6/10, finish strong', libraryId: 'long',
      detail: 'Start slower than you want to for the first 2 miles. Settle in, fuel every 4–5 miles, and pick it up over the last 5K if you have it.' },
  },
];

export const HM_WEEKS = HALF_MARATHON_PLAN.length;
export const HALF_MARATHON_MILES = 13.1094;
export const DEFAULT_EASY_RUN_WEEKDAY = 2; // Tuesday

export const EFFORT_GUIDE = [
  { range: '1–2', name: 'Very easy', talk: 'Could sing', use: 'Warm-up, walking breaks' },
  { range: '3–4', name: 'Easy', talk: 'Full sentences', use: 'Easy runs, most of the long run' },
  { range: '5–6', name: 'Steady', talk: 'Short sentences', use: 'Late long run, goal pace' },
  { range: '6–7', name: 'Tempo', talk: 'A few words', use: 'Tempo runs' },
  { range: '8–9', name: 'Hard', talk: 'One word at a time', use: '400s, 800s, hills' },
  { range: '10', name: 'All-out', talk: 'Can’t talk', use: 'Not needed in this plan' },
];

// ─────────────────────────────────────────────────────────────
//  WORKOUT LIBRARY — she can browse these and log any of them on any day.
// ─────────────────────────────────────────────────────────────
export type LibraryWorkout = {
  id: string;
  name: string;
  kind: 'run' | 'cross';
  what: string;
  how: string;
  feel: string;
  effort: string;
  minutes: string;
};

export const WORKOUT_LIBRARY: LibraryWorkout[] = [
  { id: 'easy', name: 'Easy run', kind: 'run', effort: '3–4/10', minutes: '20–45 min',
    what: 'The base of all running fitness. Builds your heart, legs and endurance without wearing you down.',
    how: 'Run at a relaxed pace the whole way. If you can’t talk in full sentences, slow down. Walk breaks are fine.',
    feel: 'Like you could keep going a lot longer. You finish feeling better than when you started.' },
  { id: 'recovery', name: 'Recovery jog', kind: 'run', effort: '2–3/10', minutes: '15–25 min',
    what: 'A very short, very slow jog to loosen up the day after a hard session.',
    how: 'Slower than your easy pace. Flat route. Stop early if your legs feel heavy instead of looser.',
    feel: 'Almost too easy. That’s the point.' },
  { id: 'long', name: 'Long run', kind: 'run', effort: '3–5/10', minutes: '45–120 min',
    what: 'The most important run of the week. Teaches your body to keep going for the full 13.1.',
    how: 'Start slow and stay steady. Bring water past 6 miles and practice your race fuel past 8.',
    feel: 'Easy for most of it, tired but in control at the end.' },
  { id: 'tempo', name: 'Tempo run', kind: 'run', effort: '6–7/10', minutes: '30–45 min',
    what: 'Running at a “comfortably hard” pace you could hold for about an hour. Raises the speed you can sustain.',
    how: '10 min easy, then 15–25 min at tempo (in one block or split with short jogs), then 10 min easy.',
    feel: 'You can say a few words but don’t want to chat. Focused, not straining.' },
  { id: 'int400', name: '400 m intervals', kind: 'run', effort: '8/10', minutes: '35–40 min',
    what: 'Short, fast repeats (one track lap) that build speed and running form.',
    how: 'Warm up 10–15 min. Run 6–8 × 400 m fast with 90 s easy jog between. Cool down 10 min.',
    feel: 'Hard but repeatable. The last rep should be as fast as the first.' },
  { id: 'int800', name: '800 m intervals', kind: 'run', effort: '7–8/10', minutes: '40–45 min',
    what: 'Two-lap repeats that build the strength to hold a faster pace for longer.',
    how: 'Warm up 10–15 min. Run 4–5 × 800 m at a strong pace with 2 min easy jog between. Cool down 10 min.',
    feel: 'Hard in the second lap of each rep. Controlled breathing, not gasping.' },
  { id: 'fartlek', name: 'Fartlek', kind: 'run', effort: '5–7/10', minutes: '25–35 min',
    what: 'Swedish for “speed play”. Mix short quick bursts into an easy run. Great for building speed gently.',
    how: 'After 10 min easy, alternate 1 min quick and 1–2 min easy, 6–8 times. Cool down easy.',
    feel: 'Playful. The quick bits feel brisk, not all-out.' },
  { id: 'hills', name: 'Hill repeats', kind: 'run', effort: '7–8/10', minutes: '30–40 min',
    what: 'Short hard efforts uphill. Builds leg strength and power with less pounding than flat speed work.',
    how: 'Warm up 10 min. Run 6–10 × 30–60 s up a moderate hill, walk or jog back down. Cool down easy.',
    feel: 'Strong and powerful going up. Drive your arms and stay tall.' },
  { id: 'progression', name: 'Progression run', kind: 'run', effort: '3 → 7/10', minutes: '30–50 min',
    what: 'Start easy and get a little faster every few minutes. Teaches you to finish strong.',
    how: 'Split the run into thirds: easy, steady, then tempo effort for the last third.',
    feel: 'Easy at first, satisfying and strong at the end.' },
  { id: 'strides', name: 'Strides', kind: 'run', effort: '7/10', minutes: '5 min (add-on)',
    what: '20-second relaxed accelerations after an easy run. Sharpens form and turnover.',
    how: 'After an easy run, do 4–6 × 20 s, building to fast but relaxed. Walk back between each.',
    feel: 'Smooth and quick. Never a sprint.' },
  { id: 'bike', name: 'Bike', kind: 'cross', effort: '3–5/10', minutes: '20–45 min',
    what: 'Low-impact cardio that builds fitness while giving your legs a break from pounding.',
    how: 'Spin at an easy to moderate effort. Keep a high cadence and light resistance.',
    feel: 'Like an easy run without the impact.' },
  { id: 'elliptical', name: 'Elliptical', kind: 'cross', effort: '3–5/10', minutes: '20–40 min',
    what: 'The closest gym machine to running, with no impact.',
    how: 'Easy to moderate effort. Stand tall and use the handles lightly.',
    feel: 'Steady. You should be able to talk.' },
  { id: 'incline', name: 'Incline walk', kind: 'cross', effort: '3–5/10', minutes: '20–40 min',
    what: 'Treadmill walk on an incline. Great on rest days or when legs need a break.',
    how: 'Set 8–12% incline at a brisk walk. Don’t hold the rails.',
    feel: 'Breathing harder, but no pounding.' },
];

export const libraryById = (id?: string) => WORKOUT_LIBRARY.find(w => w.id === id);
