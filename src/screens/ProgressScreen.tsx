import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../storage/store';
import { addDays, fromKey, isoWeekday, MONTHS, startOfWeek, toKey, weekKey } from '../lib/dates';
import { weekStats, mainDone, milesInWeek, longestRunInWeek } from '../lib/schedule';
import { splitFor } from '../data/split';
import { fmt1, fromUnit, signed, toUnit } from '../lib/format';
import { colors, radius, type } from '../theme';
import { Card, PrimaryButton, SectionLabel } from '../components/ui';
import { BarChart, LineChart } from '../components/Charts';
import { Ring } from '../components/Ring';
import { Chip, NumInput } from '../components/inputs';
import { useHideTabBar } from '../components/TabBarVisibility';

const RANGES = [['1M', 31], ['3M', 92], ['6M', 183], ['All', 100000]] as const;
const md = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[type.label, { fontSize: 10 }]}>{label}</Text>
      <Text style={[type.num, { fontSize: 19, marginTop: 4 }]}>{value}</Text>
      {sub ? <Text style={[type.small, { fontSize: 11 }]}>{sub}</Text> : null}
    </View>
  );
}

export function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { state, today, logWeight, setGoalWeight, setUnit } = useApp();
  const unit = state.unit;
  const [range, setRange] = useState<(typeof RANGES)[number][0]>('3M');
  const [sheet, setSheet] = useState<null | 'weight' | 'goal'>(null);
  const [draft, setDraft] = useState<number | undefined>();
  useHideTabBar(!!sheet);

  const all = state.weighIns;
  const days = RANGES.find(r => r[0] === range)![1];
  const cutoff = toKey(addDays(today, -days));
  const shown = all.filter(w => w.date >= cutoff);
  const u = (lb: number) => toUnit(lb, unit);
  const first = all[0], last = all[all.length - 1], prev = all[all.length - 2];
  const thisWeekLogged = !!last && weekKey(fromKey(last.date)) === weekKey(today);

  // Training stats: last 8 weeks
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(startOfWeek(today), -7 * (7 - i)));
  const wkLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const workoutsBars = weeks.map(d => ({ label: wkLabel(d), value: weekStats(state, d).workouts }));
  const absBars = weeks.map(d => ({ label: wkLabel(d), value: weekStats(state, d).abs }));
  const milesBars = weeks.map(d => ({ label: wkLabel(d), value: Math.round(milesInWeek(state, d) * 10) / 10 }));
  const longRuns = weeks.map(d => ({ t: d.getTime(), v: longestRunInWeek(state, d), label: md(d) })).filter(p => p.v > 0);

  // Monthly consistency: completed main workouts out of scheduled days so far this month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  let scheduled = 0, completed = 0;
  for (let d = monthStart; toKey(d) <= toKey(today); d = addDays(d, 1)) {
    if (splitFor(isoWeekday(d)).kind === 'rest' || toKey(d) < state.startDate) continue;
    if (toKey(d) === toKey(today) && !mainDone(state, d)) continue; // today isn't missed yet
    scheduled++; if (mainDone(state, d)) completed++;
  }
  const consistency = scheduled ? completed / scheduled : 0;

  const openWeight = () => { setDraft(last ? +fmt1(u(last.lb)) : undefined); setSheet('weight'); };
  const openGoal = () => { setDraft(state.goalWeightLb ? +fmt1(u(state.goalWeightLb)) : undefined); setSheet('goal'); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 140, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 4, marginTop: 6, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Text style={type.hero}>Progress</Text>
          <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.pill, padding: 3 }}>
            {(['lb', 'kg'] as const).map(x => (
              <Pressable key={x} onPress={() => setUnit(x)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: unit === x ? colors.cardRaised : 'transparent' }}>
                <Text style={[type.small, { color: unit === x ? colors.text : colors.textDim, fontWeight: '700' }]}>{x}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Card>
          <SectionLabel right={<Pressable onPress={openGoal} hitSlop={10}><Text style={[type.small, { color: colors.accent, fontWeight: '700' }]}>{state.goalWeightLb ? `Goal ${fmt1(u(state.goalWeightLb))} ${unit}` : 'Set goal'}</Text></Pressable>}>Bodyweight</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[type.hero, { fontSize: 40 }]}>{last ? fmt1(u(last.lb)) : '–'}</Text>
            <Text style={[type.dim, { fontSize: 17 }]}>{unit}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
            <Stat label="Start" value={first ? fmt1(u(first.lb)) : '–'} sub={first ? md(fromKey(first.date)) : undefined} />
            <Stat label="Current" value={last ? fmt1(u(last.lb)) : '–'} sub={last ? md(fromKey(last.date)) : undefined} />
            <Stat label="Total" value={first && last ? signed(u(last.lb) - u(first.lb)) : '–'} sub={unit} />
            <Stat label="Last week" value={prev && last ? signed(u(last.lb) - u(prev.lb)) : '–'} sub={unit} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
            {RANGES.map(([r]) => <Chip key={r} label={r} on={range === r} onPress={() => setRange(r)} />)}
          </View>
          <View style={{ marginTop: 10 }}>
            {shown.length ? (
              <LineChart data={shown.map(w => ({ t: fromKey(w.date).getTime(), v: +fmt1(u(w.lb)), label: md(fromKey(w.date)) }))}
                goal={state.goalWeightLb ? +fmt1(u(state.goalWeightLb)) : undefined} goalLabel="Goal" format={v => fmt1(v)} />
            ) : (
              <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-down-outline" size={30} color={colors.textFaint} />
                <Text style={[type.dim, { marginTop: 8, textAlign: 'center' }]}>{all.length ? 'No weigh-ins in this range.' : 'Log your first weigh-in to start the graph.'}</Text>
              </View>
            )}
          </View>
          <View style={{ marginTop: 14 }}>
            <PrimaryButton title={thisWeekLogged ? 'Update this week’s weight' : 'Log this week’s weight'} icon="scale-outline" onPress={openWeight} />
          </View>
          <Text style={[type.small, { fontSize: 12, marginTop: 10, textAlign: 'center' }]}>Once a week is plenty. Same day, same time, ideally Monday morning.</Text>
        </Card>

        <Text style={[type.label, { marginLeft: 4, marginTop: 6 }]}>Training</Text>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Ring progress={consistency} color={colors.accent} size={88} stroke={9}>
              <Text style={[type.num, { fontSize: 20 }]}>{Math.round(consistency * 100)}%</Text>
            </Ring>
            <View style={{ flex: 1 }}>
              <Text style={type.label}>{MONTHS[today.getMonth()]} consistency</Text>
              <Text style={[type.body, { marginTop: 6 }]}>{completed} of {scheduled} workouts done so far this month</Text>
            </View>
          </View>
        </Card>

        <Card>
          <SectionLabel right={<Text style={[type.small, { fontSize: 12 }]}>goal 6</Text>}>Workouts per week</SectionLabel>
          <BarChart data={workoutsBars} goal={6} max={6} />
        </Card>

        <Card>
          <SectionLabel right={<Text style={[type.small, { fontSize: 12 }]}>goal 3</Text>}>Abs sessions per week</SectionLabel>
          <BarChart data={absBars} goal={3} max={3} color={colors.abs} />
        </Card>

        <Card>
          <SectionLabel right={<Text style={[type.small, { fontSize: 12 }]}>miles</Text>}>Running per week</SectionLabel>
          <BarChart data={milesBars} format={v => fmt1(v)} />
        </Card>

        <Card>
          <SectionLabel right={<Text style={[type.small, { fontSize: 12 }]}>miles</Text>}>Long run trend</SectionLabel>
          {longRuns.length ? <LineChart data={longRuns} height={170} format={v => fmt1(v)} />
            : <Text style={[type.dim, { paddingVertical: 20, textAlign: 'center' }]}>Your longest run each week will show here.</Text>}
        </Card>
      </ScrollView>

      {sheet ? (
        <Pressable onPress={() => setSheet(null)} style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' } as any}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: insets.bottom + 28 }}>
            <Text style={[type.title, { textAlign: 'center' }]}>{sheet === 'weight' ? 'This week’s weight' : 'Goal weight'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 22 }}>
              <Pressable onPress={() => setDraft(d => +((d ?? 0) - 0.2).toFixed(1))} style={stepBtn}><Ionicons name="remove" size={26} color={colors.text} /></Pressable>
              <NumInput value={draft} onChange={setDraft} placeholder="0.0" suffix={unit} width={150} style={{ height: 64 }} />
              <Pressable onPress={() => setDraft(d => +((d ?? 0) + 0.2).toFixed(1))} style={stepBtn}><Ionicons name="add" size={26} color={colors.text} /></Pressable>
            </View>
            <View style={{ marginTop: 22 }}>
              <PrimaryButton title="Save" icon="checkmark" onPress={() => {
                if (sheet === 'weight' && draft) logWeight(today, fromUnit(draft, unit));
                if (sheet === 'goal') setGoalWeight(draft ? fromUnit(draft, unit) : undefined);
                setSheet(null);
              }} />
            </View>
            {sheet === 'goal' && state.goalWeightLb ? (
              <Pressable onPress={() => { setGoalWeight(undefined); setSheet(null); }} style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={[type.small, { color: colors.textDim }]}>Remove goal</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
}

const stepBtn = { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.cardRaised, alignItems: 'center', justifyContent: 'center' } as const;
