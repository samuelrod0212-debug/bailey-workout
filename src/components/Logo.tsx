// The Core logo (assets/05-core-workout-logo.pdf), redrawn as SVG so it stays sharp at any size.
// Colors come straight from the logo: cream tile, ink outer C, coral inner C.
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { brand, colors, fontFamily } from '../theme';

const OUTER = 'M 576.335938 655.753906 C 529.238281 708.054688 454.785156 725.929688 389.078125 700.707031 C 323.371094 675.484375 280 612.382812 280 542 C 280 471.617188 323.371094 408.515625 389.078125 383.292969 C 454.785156 358.070312 529.238281 375.945312 576.335938 428.246094';
const INNER = 'M 526.367188 618.367188 C 495.238281 649.5 448.328125 658.617188 407.800781 641.414062 C 367.277344 624.210938 341.25 584.132812 342.015625 540.113281 C 342.785156 496.097656 370.195312 456.949219 411.296875 441.171875 C 452.398438 425.394531 498.960938 436.144531 528.984375 468.34375';
const FLIP = 'matrix(1,0,0,-1,0,900)';

/** App-icon style tile: cream rounded square with the mark. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="150 57 600 600">
      <Rect x={150} y={57} width={600} height={600} rx={176} fill={brand.cream} />
      <Path d={OUTER} transform={FLIP} stroke={brand.ink} strokeWidth={48} strokeLinecap="round" fill="none" />
      <Path d={INNER} transform={FLIP} stroke={brand.coral} strokeWidth={25} strokeLinecap="round" fill="none" />
      <Circle cx={453} cy={358} r={30} fill={brand.ink} />
    </Svg>
  );
}

/** The mark alone, recolored for a dark background (cream outer C, coral inner C). */
export function LogoGlyph({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="240 140 400 430">
      <Path d={OUTER} transform={FLIP} stroke={brand.cream} strokeWidth={48} strokeLinecap="round" fill="none" />
      <Path d={INNER} transform={FLIP} stroke={brand.coral} strokeWidth={25} strokeLinecap="round" fill="none" />
      <Circle cx={453} cy={358} r={30} fill={brand.cream} />
    </Svg>
  );
}

export function LogoWordmark() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={36} />
      <Text style={{ fontFamily, color: colors.text, fontWeight: '800', fontSize: 15, letterSpacing: 3 }}>CORE</Text>
    </View>
  );
}
