// Front/back body figures. Muscles in `muscles` light up in the accent color; everything else is muted.
// Each shape is drawn once for the figure's left half and mirrored for the right.
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Ellipse, G } from 'react-native-svg';
import { MuscleId } from '../data/muscles';
import { colors } from '../theme';

type Shape = { d: string; muscle?: MuscleId; center?: boolean };

const FRONT: Shape[] = [
  { d: 'M45 24 L55 24 L56.5 33 L43.5 33 Z', center: true },
  { d: 'M43.5 31 C40 33 36 34.5 32.5 35.5 L44.5 37 Z', muscle: 'traps' },
  { d: 'M31.5 36 C25.5 37 21.5 42.5 22 51 C24.5 49.5 26.5 47 27.5 44 C28.5 40.5 29.5 38 31.5 36 Z', muscle: 'sideDelts' },
  { d: 'M33 36.5 C30.5 39 29.2 42.5 29 46.5 C32.5 46 35.6 43.8 37.4 40.6 C37.6 38.2 35.8 36.6 33 36.5 Z', muscle: 'frontDelts' },
  { d: 'M49.2 38.5 L39.5 38.5 C35.5 41.5 34.2 47 35 52 C38 56.8 44.5 58 49.2 56.2 Z', muscle: 'chest' },
  { d: 'M27.4 49.5 C23.4 53.5 22 61.5 23 69.5 C26 70.5 29 68.6 30.8 65.5 C32 59.5 31.3 53.5 27.4 49.5 Z', muscle: 'biceps' },
  { d: 'M22.5 72 C19.4 78.5 17.4 88 17 96 L21 97 C24.4 90 27 81.5 28.6 72.6 C26.6 73.4 24.4 73.2 22.5 72 Z', muscle: 'forearms' },
  { d: 'M44.6 59 h4.6 v7 h-4.6 Z', muscle: 'abs' },
  { d: 'M44.6 67.2 h4.6 v7 h-4.6 Z', muscle: 'abs' },
  { d: 'M44.6 75.4 h4.6 v7 h-4.6 Z', muscle: 'abs' },
  { d: 'M44.6 83.6 h4.6 v11.5 C47 94 45.4 90 44.6 86 Z', muscle: 'abs' },
  { d: 'M42.8 58.5 C38.6 60 36.6 66.5 37.2 74 C37.8 81.5 39.8 87.5 43.2 91.5 Z', muscle: 'obliques' },
  { d: 'M37.6 90 C41 95 45.5 99 50 101 L50 106 C45 105.5 40.5 103 37.4 99.5 Z', center: false },
  { d: 'M37.6 101 C34 110.5 33 123 35 136 C37.4 141.5 42 143.5 45.6 140.5 C47 128 46.8 113 43.8 104 C41.6 103.5 39.4 102.5 37.6 101 Z', muscle: 'quads' },
  { d: 'M45.4 105 C48.4 111 49.6 120.5 48.6 131 C47.4 126.5 47 117.5 45.4 105 Z', muscle: 'adductors' },
  { d: 'M36.2 151.5 C34 160 34.4 172 37 182.5 L41.4 183 C43.4 172.5 44.4 161 44 151.5 C41.4 153 38.6 153 36.2 151.5 Z', muscle: 'calves' },
];

const BACK: Shape[] = [
  { d: 'M45 24 L55 24 L56 31 L44 31 Z', center: true },
  { d: 'M50 27 L43.5 32.5 L32.6 36.2 L43.4 39.6 L50 55 Z', muscle: 'traps' },
  { d: 'M31.4 36.6 C25.4 37.6 22 43.5 22.2 51 C27 49.4 31.8 45.4 35.2 40 Z', muscle: 'rearDelts' },
  { d: 'M43.6 41.4 L49.2 55.6 L49.2 63.5 L41.6 58.2 C39.6 52.4 40.4 46 43.6 41.4 Z', muscle: 'upperBack' },
  { d: 'M37.4 44.6 C34.2 52 34.8 62.5 38.8 72 C41.8 76 45.6 78 48.6 76.4 L48.6 66 L40.4 59.6 C38.8 54.6 38.2 49.6 37.4 44.6 Z', muscle: 'lats' },
  { d: 'M43.2 79.6 C45.6 79 47.6 78.6 49.2 78.6 L49.2 90 L41.6 89.6 C42.2 86 42.6 82.6 43.2 79.6 Z', muscle: 'lowerBack' },
  { d: 'M27.4 49.5 C23.4 53.5 22 61.5 23 69.5 C26 70.5 29 68.6 30.8 65.5 C32 59.5 31.3 53.5 27.4 49.5 Z', muscle: 'triceps' },
  { d: 'M22.5 72 C19.4 78.5 17.4 88 17 96 L21 97 C24.4 90 27 81.5 28.6 72.6 C26.6 73.4 24.4 73.2 22.5 72 Z', muscle: 'forearms' },
  { d: 'M49.2 92 C42.4 91 37 95 37 103 C37 110 42 114.6 49.2 112.6 Z', muscle: 'glutes' },
  { d: 'M37.6 115 C34.8 124 34.6 134 36.6 142.6 L41.6 143.4 C43.8 134 45.8 124.4 47.4 115.6 C44 116.6 40.6 116.4 37.6 115 Z', muscle: 'hamstrings' },
  { d: 'M36 150.2 C33 157.6 33.8 168 37.8 176.4 C41 176.6 43.4 170.6 44.2 161 C44.4 155 42.4 150.6 36 150.2 Z', muscle: 'calves' },
];

// Non-muscle parts (head, hands, knees, feet) drawn in the base tone.
function Base({ back }: { back?: boolean }) {
  const half = (
    <>
      <Ellipse cx={18.6} cy={101.6} rx={3.1} ry={5} />
      <Ellipse cx={40.6} cy={146.8} rx={4.6} ry={4} />
      {back ? <Path d="M37.8 178 C38 183 39 186 41.6 186 L43 179 Z" /> : null}
      <Ellipse cx={40.2} cy={189.5} rx={4.2} ry={3} />
      {back ? <Path d="M37.2 92 C37 96 36.8 100 37 103 L37 90.4 Z" /> : null}
    </>
  );
  return (
    <G fill={colors.muscleBase}>
      <Ellipse cx={50} cy={14} rx={8.6} ry={10.6} />
      {half}
      <G transform="translate(100,0) scale(-1,1)">{half}</G>
    </G>
  );
}

export function BodyFigure({ side, muscles, height = 180, highlight = colors.accent }: { side: 'front' | 'back'; muscles: MuscleId[]; height?: number; highlight?: string }) {
  const shapes = side === 'front' ? FRONT : BACK;
  const on = new Set(muscles);
  const fill = (s: Shape) => (s.muscle ? (on.has(s.muscle) ? highlight : colors.muscleIdle) : colors.muscleBase);
  return (
    <Svg width={(height * 70) / 196} height={height} viewBox="15 1 70 196">
      <Base back={side === 'back'} />
      {shapes.map((s, i) => (
        <G key={i}>
          <Path d={s.d} fill={fill(s)} />
          {!s.center && <Path d={s.d} fill={fill(s)} transform="translate(100,0) scale(-1,1)" />}
        </G>
      ))}
    </Svg>
  );
}

/** Front + back side by side. */
export function BodyPair({ muscles, height = 120, gap = 6 }: { muscles: MuscleId[]; height?: number; gap?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap }}>
      <BodyFigure side="front" muscles={muscles} height={height} />
      <BodyFigure side="back" muscles={muscles} height={height} />
    </View>
  );
}
