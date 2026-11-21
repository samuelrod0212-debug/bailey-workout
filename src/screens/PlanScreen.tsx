import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../storage/store';
import { addDays, isoWeekday, MONTHS, sameDay, startOfWeek, toKey, weekDates, WEEKDAYS_LONG } from '../lib/dates';
import { absDone, dayStatus, DayStatus, planFor, weekStats, mainDone } from '../lib/schedule';
import { ABS_PER_WEEK } from '../data/split';
import { MUSCLE_LABELS } from '../data/muscles';
import { colors, radius, type } from '../theme';
import { Card, IconButton, Tag } from '../components/ui';
import { BodyPair } from '../components/BodyMap';
import { useToast } from '../components/Toast';

function StatusBadge({ status, partsDone, partsTotal }: { status: DayStatus; partsDone: number; partsTotal: number }) {
  const S = 34;
  if (status === 'done') return <View style={{ width: S, height: S, borderRadius: S / 2, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark" size={20} color={colors.accentInk} /></View>;
  if (status === 'missed') return <View style={{ width: S, height: S, borderRadius: S / 2, borderWidth: 2, borderColor: colors.missed, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={18} color={colors.missed} /></View>;
  if (status === 'rest') return <View style={{ width: S, height: S, borderRadius: S / 2, backgroundColor: colors.cardRaised, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="moon" size={15} color={colors.textDim} /></View>;
  const border = status === 'today' || status === 'partial' ? colors.accent : colors.stroke;
  return (
    <View style={{ width: S, height: S, borderRadius: S / 2, borderWidth: 2, borderColor: border, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[type.small, { fontSize: 11, color: status === 'upcoming' ? colors.textFaint : colors.text, fontWeight: '700' }]}>{partsDone}/{partsTotal}</Text>
    </View>
  );
}

export function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { state, today, toggleAbs } = useApp();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const days = weekDates(weekStart);
  const stats = weekStats(state, weekStart);
  const absPlanned = days.filter(d => planFor(state, d).hasAbs).length;
  const isThisWeek = sameDay(weekStart, startOfWeek(today));
  const nudge = isThisWeek && isoWeekday(today) >= 3 && stats.abs === 0;
  const range = `${MONTHS[days[0].getMonth()].slice(0, 3)} ${days[0].getDate()} – ${days[6].getMonth() !== days[0].getMonth() ? MONTHS[days[6].getMonth()].slice(0, 3) + ' ' : ''}${days[6].getDate()}`;

  const onAbs = (d: Date) => {
    if (absDone(state, d)) { toast('That abs session is already logged.'); return; }
    const r = toggleAbs(d);
    Haptics.selectionAsync().catch(() => {});
    if (r === 'full') toast(`Already ${ABS_PER_WEEK} abs days this week. Remove one first.`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 140, gap: 12 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 4, marginTop: 6 }}>
        <Text style={type.hero}>My Plan</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 4 }}>
        <IconButton icon="chevron-back" onPress={() => setWeekStart(addDays(weekStart, -7))} />
        <Pressable onPress={() => setWeekStart(startOfWeek(today))} style={{ alignItems: 'center' }}>
          <Text style={[type.label, { color: colors.text, fontSize: 12 }]}>{isThisWeek ? 'This week' : 'Week of'}</Text>
          <Text style={[type.small, { fontSize: 12 }]}>{range}</Text>
        </Pressable>
        <IconButton icon="chevron-forward" onPress={() => setWeekStart(addDays(weekStart, 7))} />
      </View>

      <Card>
        <Text style={type.label}>Weekly split</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10, gap: 6 }}>
          <Text style={[type.num, { fontSize: 26 }]}>{Math.round((stats.workouts / stats.workoutsGoal) * 100)}%</Text>
          <Text style={[type.label, { color: colors.text }]}>accomplished</Text>
        </View>
        <View style={{ height: 6, backgroundColor: colors.stroke, borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
          <View style={{ height: 6, width: `${(stats.workouts / stats.workoutsGoal) * 100}%`, backgroundColor: colors.accent, borderRadius: 3 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          <Text style={[type.body, { fontSize: 15 }]}>Workouts: <Text style={{ fontWeight: '700' }}>{stats.workouts} of {stats.workoutsGoal}</Text></Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[type.body, { fontSize: 15, color: colors.abs }]}>Abs: <Text style={{ fontWeight: '700' }}>{stats.abs} of {ABS_PER_WEEK}</Text></Text>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {Array.from({ length: ABS_PER_WEEK }, (_, i) => (
                <View key={i} style={{ width: 14, height: 6, borderRadius: 3, backgroundColor: i < stats.abs ? colors.abs : i < absPlanned ? 'rgba(240,239,232,0.3)' : colors.stroke }} />
              ))}
            </View>
          </View>
        </View>
        {nudge ? (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.absSoft, borderRadius: radius.sm, padding: 12, marginTop: 14 }}>
            <Ionicons name="sparkles" size={18} color={colors.abs} />
            <Text style={[type.body, { fontSize: 14, flex: 1 }]}>No abs yet this week. Tap “+ Abs” on any day that works for you.</Text>
          </View>
        ) : null}
      </Card>

      {days.map(d => {
        const plan = planFor(state, d);
        const { split } = plan;
        const st = dayStatus(state, d, today);
        const isToday = sameDay(d, today);
        const rest = split.kind === 'rest';
        const log = state.logs[toKey(d)];
        const partsDone = split.parts.filter(p => log?.parts[p.id]?.done).length;
        const aDone = absDone(state, d);
        return (
          <Card key={toKey(d)} style={{ padding: 16, borderWidth: isToday ? 1.5 : 0, borderColor: colors.accent, opacity: rest ? 0.92 : 1 }}>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[type.label, { color: isToday ? colors.accent : colors.textDim }]}>{WEEKDAYS_LONG[isoWeekday(d) - 1]}</Text>
                  <Text style={[type.small, { fontSize: 12 }]}>{MONTHS[d.getMonth()].slice(0, 3)} {d.getDate()}</Text>
                  {isToday ? <View style={{ backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><Text style={[type.label, { color: colors.accentInk, fontSize: 9.5 }]}>Today</Text></View> : null}
                </View>
                <Text style={[type.h2, { fontSize: 20, marginTop: 6 }]}>{split.name}</Text>
                <Text style={[type.dim, { fontSize: 14, marginTop: 2 }]}>{split.focus}</Text>
                {split.muscles.length && split.kind !== 'run' ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {split.muscles.map(m => (
                      <View key={m} style={{ backgroundColor: colors.cardRaised, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={[type.small, { fontSize: 12, color: colors.text }]}>{MUSCLE_LABELS[m]}</Text>
                      </View>
                    ))}
                  </View>
                ) : split.kind === 'run' ? (
                  <View style={{ flexDirection: 'row', marginTop: 10 }}><Tag text="Cardio" icon="heart" /></View>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <StatusBadge status={st} partsDone={partsDone} partsTotal={split.parts.length} />
                {!rest || plan.hasAbs ? <View style={{ marginTop: 8 }}><BodyPair muscles={plan.muscles} height={84} gap={1} /></View> : null}
              </View>
            </View>

            {split.parts.length > 1 ? (
              <View style={{ marginTop: 12, gap: 6 }}>
                {split.parts.map(p => {
                  const done = !!log?.parts[p.id]?.done;
                  return (
                    <View key={p.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={done ? colors.accent : colors.textFaint} style={{ marginTop: 1 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[type.body, { fontSize: 14 }]}>{p.title}</Text>
                        {p.note ? <Text style={[type.small, { fontSize: 12, marginTop: 1 }]}>{p.note}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <Pressable onPress={() => onAbs(d)} style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill,
                backgroundColor: plan.hasAbs ? colors.absSoft : 'transparent', borderWidth: 1.2, borderColor: plan.hasAbs ? colors.abs : colors.stroke,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}>
                <Ionicons name={aDone ? 'checkmark-circle' : plan.hasAbs ? 'flash' : 'add'} size={16} color={plan.hasAbs ? colors.abs : colors.textDim} />
                <Text style={[type.small, { color: plan.hasAbs ? colors.abs : colors.textDim, fontWeight: '700' }]}>
                  {plan.hasAbs ? 'Abs' : 'Add Abs'}
                </Text>
                {plan.hasAbs && !aDone ? <Ionicons name="close" size={14} color={colors.abs} style={{ marginLeft: 2, opacity: 0.7 }} /> : null}
              </Pressable>
              {rest ? <Text style={[type.small, { fontSize: 12 }]}>Recovery</Text> : mainDone(state, d) ? <Text style={[type.small, { fontSize: 12, color: colors.accent }]}>Completed</Text> : null}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}
