import React from 'react';
import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SplitDay } from '../data/split';
import { colors } from '../theme';

export function WorkoutIcon({ day, size = 48, muted }: { day: SplitDay; size?: number; muted?: boolean }) {
  const ink = muted ? colors.textDim : colors.accentInk;
  const glyph = size * 0.5;
  const icon = {
    legs: <MaterialCommunityIcons name="weight-lifter" size={glyph} color={ink} />,
    push: <MaterialCommunityIcons name="dumbbell" size={glyph} color={ink} />,
    pull: <MaterialCommunityIcons name="rowing" size={glyph} color={ink} />,
    arms: <MaterialCommunityIcons name="arm-flex" size={glyph} color={ink} />,
    run: <MaterialCommunityIcons name="run-fast" size={glyph} color={ink} />,
    rest: <Ionicons name="moon" size={glyph * 0.85} color={ink} />,
  }[day.icon];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: muted ? colors.cardRaised : colors.accent, alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </View>
  );
}
