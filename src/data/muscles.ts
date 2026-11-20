// Muscle groups the body map can highlight. Add an id here, then draw it in components/BodyMap.tsx.
export type MuscleId =
  | 'chest' | 'frontDelts' | 'sideDelts' | 'rearDelts' | 'traps'
  | 'biceps' | 'triceps' | 'forearms'
  | 'upperBack' | 'lats' | 'lowerBack'
  | 'abs' | 'obliques'
  | 'glutes' | 'quads' | 'hamstrings' | 'adductors' | 'calves';

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest: 'Chest', frontDelts: 'Front delts', sideDelts: 'Side delts', rearDelts: 'Rear delts', traps: 'Traps',
  biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
  upperBack: 'Upper back', lats: 'Lats', lowerBack: 'Lower back',
  abs: 'Abs', obliques: 'Obliques',
  glutes: 'Glutes', quads: 'Quads', hamstrings: 'Hamstrings', adductors: 'Adductors', calves: 'Calves',
};

export const CORE_MUSCLES: MuscleId[] = ['abs', 'obliques'];
