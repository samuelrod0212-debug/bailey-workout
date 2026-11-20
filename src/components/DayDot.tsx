import React from 'react';
import { View } from 'react-native';
import { DayStatus } from '../lib/schedule';
import { colors } from '../theme';

/** The small state marker under a date: done, partial, missed, rest, upcoming. */
export function StatusDot({ status, size = 6 }: { status: DayStatus; size?: number }) {
  const base = { width: size, height: size, borderRadius: size / 2 };
  switch (status) {
    case 'done': return <View style={[base, { backgroundColor: colors.accent }]} />;
    case 'partial': return <View style={[base, { borderWidth: 1.5, borderColor: colors.accent }]} />;
    case 'missed': return <View style={[base, { borderWidth: 1.5, borderColor: colors.missed }]} />;
    case 'rest': return <View style={{ width: size + 2, height: 2, borderRadius: 1, backgroundColor: colors.textFaint }} />;
    case 'upcoming':
    case 'today': return <View style={[base, { backgroundColor: '#3A3F47' }]} />;
    default: return <View style={base} />;
  }
}

/** Small cyan marker for an abs session: filled once done, hollow while planned. */
export function AbsDot({ done, size = 5 }: { done: boolean; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: done ? colors.abs : 'transparent', borderWidth: done ? 0 : 1.2, borderColor: colors.abs }} />;
}
