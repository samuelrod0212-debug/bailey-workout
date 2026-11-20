import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../storage/store';
import { greeting, longDate, sameDay, weekDates } from '../lib/dates';
import { weekStats, dayStreak } from '../lib/schedule';
import { colors, type } from '../theme';
import { Card, SectionLabel } from '../components/ui';
import { LogoWordmark } from '../components/Logo';
import { RingStat } from '../components/Ring';
import { WeekStrip } from '../components/WeekStrip';
import { MonthCalendar } from '../components/MonthCalendar';
import { TodayCard } from '../components/TodayCard';
import { VerseCard } from '../components/VerseCard';

export function HomeScreen({ onStart }: { onStart: (d: Date) => void }) {
  const insets = useSafeAreaInsets();
  const { state, today } = useApp();
  const [selected, setSelected] = useState(today);
  const now = new Date();
  const w = weekStats(state, today);
  const streak = dayStreak(state, today);
  const left = w.workoutsGoal - w.workouts;
  const inThisWeek = weekDates(today).some(d => sameDay(d, selected));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 140, gap: 14 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <LogoWordmark />
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cardRaised, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[type.small, { color: colors.text, fontWeight: '700' }]}>BM</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 4, marginTop: 10, marginBottom: 4 }}>
        <Text style={type.hero}>{greeting(now)}, Bailey</Text>
        <Text style={[type.dim, { marginTop: 4, fontSize: 16 }]}>{longDate(today)}</Text>
      </View>

      <Card style={{ paddingVertical: 20, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          <RingStat label="Workouts" value={`${w.workouts}`} sub={`of ${w.workoutsGoal}`} progress={w.workouts / w.workoutsGoal} color={colors.accent} />
          <RingStat label="Abs" value={`${w.abs}`} sub={`of ${w.absGoal}`} progress={w.abs / w.absGoal} color={colors.abs} />
          <RingStat label="Streak" value={`${streak}`} sub="days" progress={Math.min(1, streak / 12)} color={colors.streak} />
          <RingStat label="Weigh-in" value={w.weighed ? '✓' : '–'} sub={w.weighed ? 'done' : 'due'} progress={w.weighed ? 1 : 0} color={colors.weigh} />
        </View>
      </Card>

      <Card style={{ padding: 16 }}>
        <SectionLabel right={<Text style={[type.small, { fontSize: 13 }]}>{left > 0 ? `${left} of ${w.workoutsGoal} left` : 'Week complete'}</Text>}>My Day</SectionLabel>
        <WeekStrip selected={inThisWeek ? selected : today} onSelect={setSelected} />
        <View style={{ height: 16 }} />
        <TodayCard date={selected} onStart={onStart} />
      </Card>

      <Card style={{ padding: 14 }}>
        <SectionLabel>{'  My Month'}</SectionLabel>
        <MonthCalendar selected={selected} onSelect={setSelected} />
      </Card>

      <VerseCard />
    </ScrollView>
  );
}
