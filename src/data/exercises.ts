// ⚠️⚠️⚠️  PLACEHOLDER EXERCISES — REPLACE WITH BAILEY'S REAL PLAN  ⚠️⚠️⚠️
// Keyed by SplitDay.id + part id (see split.ts). Each list is in the order she does them.
//
//   sets: number of working sets
//   reps: a target string so ranges work ("8-10", "12", "AMRAP")
//   rest: optional rest timer in seconds (started when she checks a set)
//
// Run parts use `run` targets instead of sets.

export type LiftExercise = {
  name: string;
  sets: number;
  reps: string;
  rest?: number;
  notes?: string;
  placeholder?: true;
};
export type RunTarget = { name: string; distance?: string; notes?: string; placeholder?: true };

export const EXERCISES: Record<string, LiftExercise[]> = {
  'legs-glute-quad/main': [
    { name: 'Barbell Hip Thrust', sets: 4, reps: '8-10', rest: 120, placeholder: true },
    { name: 'Back Squat', sets: 4, reps: '6-8', rest: 150, placeholder: true },
    { name: 'Bulgarian Split Squat', sets: 3, reps: '10 / leg', rest: 90, placeholder: true },
    { name: 'Leg Extension', sets: 3, reps: '12-15', rest: 60, placeholder: true },
    { name: 'Cable Adductor', sets: 3, reps: '12-15', rest: 60, placeholder: true },
    { name: 'Standing Calf Raise', sets: 4, reps: '12-15', rest: 60, placeholder: true },
  ],
  'push/main': [
    { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: 120, placeholder: true },
    { name: 'Seated Shoulder Press', sets: 3, reps: '8-10', rest: 90, placeholder: true },
    { name: 'Cable Fly', sets: 3, reps: '12-15', rest: 60, placeholder: true },
    { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: 60, placeholder: true },
    { name: 'Rope Triceps Pushdown', sets: 3, reps: '10-12', rest: 60, placeholder: true },
  ],
  'pull-runclub/main': [
    { name: 'Lat Pulldown', sets: 4, reps: '8-10', rest: 90, placeholder: true },
    { name: 'Chest-Supported Row', sets: 4, reps: '8-10', rest: 90, placeholder: true },
    { name: 'Single-Arm Cable Row', sets: 3, reps: '10-12', rest: 60, placeholder: true },
    { name: 'Reverse Pec Deck', sets: 3, reps: '12-15', rest: 60, placeholder: true },
    { name: 'Dumbbell Curl', sets: 3, reps: '10-12', rest: 60, placeholder: true },
  ],
  'legs-glute-ham/main': [
    { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: 120, placeholder: true },
    { name: 'Hip Thrust', sets: 4, reps: '10-12', rest: 90, placeholder: true },
    { name: 'Seated Leg Curl', sets: 3, reps: '10-12', rest: 60, placeholder: true },
    { name: 'Cable Kickback', sets: 3, reps: '12 / leg', rest: 45, placeholder: true },
    { name: 'Seated Calf Raise', sets: 4, reps: '12-15', rest: 45, placeholder: true },
  ],
  'arms/main': [
    { name: 'EZ-Bar Curl', sets: 3, reps: '8-10', rest: 75, placeholder: true },
    { name: 'Overhead Triceps Extension', sets: 3, reps: '10-12', rest: 75, placeholder: true },
    { name: 'Arnold Press', sets: 3, reps: '8-10', rest: 90, placeholder: true },
    { name: 'Hammer Curl', sets: 3, reps: '10-12', rest: 60, placeholder: true },
    { name: 'Lateral Raise', sets: 3, reps: '12-15', rest: 45, placeholder: true },
    { name: 'Triceps Dip (assisted)', sets: 3, reps: '8-12', rest: 60, placeholder: true },
  ],
};

export const RUNS: Record<string, RunTarget> = {
  'pull-runclub/runclub': { name: 'Standard Run Club', notes: 'Track workout, late afternoon', placeholder: true },
  'long-run/main': { name: 'Long Run', distance: '6 mi', notes: 'Easy conversational pace', placeholder: true },
};

export function exercisesFor(dayId: string, partId = 'main'): LiftExercise[] {
  return EXERCISES[`${dayId}/${partId}`] ?? [];
}
