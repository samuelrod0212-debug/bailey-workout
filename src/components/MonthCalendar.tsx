import React, { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';
import { useApp } from '../storage/store';
import { monthGrid, MONTHS, sameDay, toKey, WEEKDAYS_SHORT } from '../lib/dates';
import { dayStatus, planFor, absDone } from '../lib/schedule';
import { colors, type } from '../theme';
import { IconButton } from './ui';
import { StatusDot, AbsDot } from './DayDot';

export function MonthCalendar({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const { state, today } = useApp();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const go = (dir: number) => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slide, { toValue: -dir * 24, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setCursor(c => { const d = new Date(c.y, c.m + dir, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
      slide.setValue(dir * 24);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 20 }),
      ]).start();
    });
  };
  const goRef = useRef(go); goRef.current = go;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => { if (g.dx < -40) goRef.current(1); else if (g.dx > 40) goRef.current(-1); },
  })).current;

  const rows = monthGrid(cursor.y, cursor.m);
  const isCurrentMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth();

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <IconButton icon="chevron-back" onPress={() => go(-1)} />
        <Pressable onPress={() => !isCurrentMonth && setCursor({ y: today.getFullYear(), m: today.getMonth() })}>
          <Text style={[type.h2, { fontSize: 17 }]}>{MONTHS[cursor.m]} {cursor.y}</Text>
        </Pressable>
        <IconButton icon="chevron-forward" onPress={() => go(1)} />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {WEEKDAYS_SHORT.map(w => (
          <Text key={w} style={[type.small, { flex: 1, textAlign: 'center', fontSize: 12, color: colors.textFaint }]}>{w[0]}</Text>
        ))}
      </View>
      <Animated.View {...pan.panHandlers} style={{ opacity: fade, transform: [{ translateX: slide }] }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row' }}>
            {row.map((d, ci) => {
              if (!d) return <View key={ci} style={{ flex: 1, height: 54 }} />;
              const isToday = sameDay(d, today);
              const isSel = sameDay(d, selected);
              const st = dayStatus(state, d, today);
              const plan = planFor(state, d);
              const future = toKey(d) > toKey(today);
              return (
                <Pressable key={ci} onPress={() => onSelect(d)} style={{ flex: 1, height: 54, alignItems: 'center', paddingTop: 4 }}>
                  <View style={{
                    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isToday ? colors.accent : 'transparent',
                    borderWidth: isSel && !isToday ? 1.5 : 0, borderColor: colors.accent,
                  }}>
                    <Text style={[type.body, {
                      fontSize: 15, fontWeight: isToday ? '800' : '500',
                      color: isToday ? colors.accentInk : future ? colors.textDim : colors.text,
                    }]}>{d.getDate()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 3, height: 8, marginTop: 4, alignItems: 'center' }}>
                    {st !== 'today' && <StatusDot status={st} size={5} />}
                    {plan.hasAbs ? <AbsDot done={absDone(state, d)} size={4.5} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </Animated.View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10, justifyContent: 'center' }}>
        {([['done', 'Done'], ['missed', 'Missed'], ['upcoming', 'Planned'], ['rest', 'Rest']] as const).map(([s, l]) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <StatusDot status={s} /><Text style={[type.small, { fontSize: 12 }]}>{l}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AbsDot done /><Text style={[type.small, { fontSize: 12 }]}>Abs</Text>
        </View>
      </View>
    </View>
  );
}
