// ⚠️⚠️⚠️  PLACEHOLDER ABS ROUTINES — REPLACE WITH BAILEY'S REAL PLAN  ⚠️⚠️⚠️
// Three short circuits (about 10–15 min). The app rotates A → B → C through the week:
// her 1st abs session of the week uses A, the 2nd uses B, the 3rd uses C.
// Use `reps` for rep-based moves, or `holdSeconds` for timed holds like planks.

export type AbsExercise = { name: string; sets: number; reps?: string; holdSeconds?: number; placeholder?: true };
export type AbsRoutine = { id: string; name: string; focus: string; rounds: number; exercises: AbsExercise[] };

export const ABS_ROUTINES: AbsRoutine[] = [
  {
    id: 'abs-a', name: 'Abs A', focus: 'Upper abs + plank', rounds: 3,
    exercises: [
      { name: 'Cable Crunch', sets: 3, reps: '12-15', placeholder: true },
      { name: 'Weighted Sit-Up', sets: 3, reps: '10-12', placeholder: true },
      { name: 'Front Plank', sets: 3, holdSeconds: 45, placeholder: true },
    ],
  },
  {
    id: 'abs-b', name: 'Abs B', focus: 'Lower abs + hollow hold', rounds: 3,
    exercises: [
      { name: 'Hanging Knee Raise', sets: 3, reps: '10-12', placeholder: true },
      { name: 'Reverse Crunch', sets: 3, reps: '12-15', placeholder: true },
      { name: 'Hollow Body Hold', sets: 3, holdSeconds: 30, placeholder: true },
    ],
  },
  {
    id: 'abs-c', name: 'Abs C', focus: 'Obliques + side plank', rounds: 3,
    exercises: [
      { name: 'Russian Twist', sets: 3, reps: '20 total', placeholder: true },
      { name: 'Bicycle Crunch', sets: 3, reps: '20 total', placeholder: true },
      { name: 'Side Plank', sets: 3, holdSeconds: 30, placeholder: true },
    ],
  },
];
