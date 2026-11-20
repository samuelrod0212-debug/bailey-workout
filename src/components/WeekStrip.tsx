import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../storage/store';
import { weekDates, sameDay, WEEKDAYS_SHORT, toKey } from '../lib/dates';
import { dayStatus, planFor, absDone } from '../lib/schedule';
import { colors, type } from '../theme';
import { StatusDot, AbsDot } from './DayDot';

/** openGym-style Mon–Sun strip. */
export function WeekStrip({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const { state, today } = useApp();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {weekDates(today).map((d, i) => {
        const isToday = sameDay(d, today);
        const isSel = sameDay(d, selected);
        const st = dayStatus(state, d, today);
        const plan = planFor(state, d);
        return (
          <Pressable key={toKey(d)} onPress={() => onSelect(d)} style={{ alignItems: 'center', width: 42 }}>
            <Text style={[type.small, { color: isToday ? colors.text : colors.textDim, marginBottom: 8 }]}>{WEEKDAYS_SHORT[i].slice(0, 2)}</Text>
            <View style={{
              width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
              backgroundColor: isToday ? colors.accent : 'transparent',
              borderWidth: isSel && !isToday ? 1.5 : 0, borderColor: colors.accent,
            }}>
              <Text style={[type.h2, { fontSize: 18, color: isToday ? colors.accentInk : colors.text, fontWeight: isToday ? '800' : '600' }]}>{d.getDate()}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3, height: 8, marginTop: 7, alignItems: 'center' }}>
              <StatusDot status={st} />
              {plan.hasAbs ? <AbsDot done={absDone(state, d)} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
