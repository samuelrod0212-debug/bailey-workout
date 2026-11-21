import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../storage/store';
import { HALF_MARATHON_PLAN, HM_WEEKS, EFFORT_GUIDE, WORKOUT_LIBRARY, HALF_MARATHON_MILES, libraryById, HMRun } from '../data/halfMarathon';
import { hmRunsForWeek, hmWeekNumber, raceDay, milesInWeek } from '../lib/schedule';
import { addDays, fromKey, isoWeekday, MONTHS, startOfWeek, toKey, WEEKDAYS_SHORT, WEEKDAYS_LONG, sameDay } from '../lib/dates';
import { formatDuration, formatPace, parseDuration, fmt1 } from '../lib/format';
import { colors, radius, type } from '../theme';
import { Card, PrimaryButton, SectionLabel, Tag } from '../components/ui';
import { Ring } from '../components/Ring';
import { Chip, TextField } from '../components/inputs';

const short = (d: Date) => `${WEEKDAYS_SHORT[isoWeekday(d) - 1]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
const md = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
const range = (mon: Date) => `${md(mon)} – ${md(addDays(mon, 6))}`;
const nextMonday = (today: Date) => (isoWeekday(today) === 1 ? today : addDays(startOfWeek(today), 7));

function RunRow({ run, date, done, future, onPress }: { run: HMRun; date: Date; done: boolean; future: boolean; onPress: () => void }) {
  const icon = run.kind === 'long' || run.kind === 'race' ? 'trail-sign-outline' : run.kind === 'quality' ? 'flash-outline' : 'walk-outline';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: pressed ? colors.cardRaised : colors.card })}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: done ? colors.accent : colors.cardRaised, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={done ? 'checkmark' : (icon as any)} size={20} color={done ? colors.accentInk : colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[type.small, { fontSize: 12 }]}>{short(date)}{run.kind === 'quality' ? ' · Run Club' : ''}</Text>
        <Text style={[type.body, { fontWeight: '600', marginTop: 1 }]}>{run.title}</Text>
        <Text style={[type.small, { fontSize: 12, marginTop: 1 }]}>Effort {run.effort}</Text>
      </View>
      {future ? <Text style={[type.small, { fontSize: 12 }]}>{fmt1(run.miles)} mi</Text> : <Ionicons name="create-outline" size={20} color={colors.textDim} />}
    </Pressable>
  );
}

export function HalfMarathonScreen({ onLog, onLogExtra }: { onLog: (d: Date) => void; onLogExtra: (libraryId: string) => void }) {
  const insets = useSafeAreaInsets();
  const { state, today, updateHM } = useApp();
  const hm = state.hm;
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [openLib, setOpenLib] = useState<string | null>(null);
  const [goalText, setGoalText] = useState(hm.goalSeconds ? formatDuration(hm.goalSeconds) : '');
  const [confirmReset, setConfirmReset] = useState(false);
  const started = !!hm.startDate;
  const curWeek = hmWeekNumber(state, today);
  const beforeStart = started && toKey(today) < hm.startDate!;
  const race = raceDay(state);
  const daysToRace = race ? Math.round((race.getTime() - today.getTime()) / 86400000) : null;
  const shownWeek = curWeek ?? (beforeStart ? 1 : null);

  const done = (d: Date, partId: string) => !!state.logs[toKey(d)]?.parts[partId]?.done;
  const openRun = (d: Date) => (toKey(d) <= toKey(today) ? onLog(d) : null);

  const goalPace = hm.goalSeconds ? hm.goalSeconds / HALF_MARATHON_MILES : undefined;
  const paces = goalPace ? [
    ['Easy & recovery', goalPace + 75], ['Long run', goalPace + 60], ['Goal race pace', goalPace],
    ['Tempo', goalPace - 15], ['800 m repeats', goalPace - 30], ['400 m repeats', goalPace - 45],
  ] as const : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 140, gap: 14 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 4, marginTop: 6 }}>
        <Text style={type.hero}>Half Marathon</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>12 weeks to 13.1 · built around your lifting</Text>
      </View>

      {!started ? (
        <Card style={{ padding: 22 }}>
          <Text style={{ fontSize: 64, fontWeight: '800', color: colors.accent, letterSpacing: -2 }}>13.1</Text>
          <Text style={[type.h2, { marginTop: 4 }]}>Your 12-week plan is ready</Text>
          <Text style={[type.dim, { marginTop: 8, lineHeight: 22 }]}>Three runs a week that fit around your lifting. Long runs build from 4 to 10 miles, with easier weeks to recover and a taper before race day.</Text>
          <View style={{ gap: 10, marginTop: 16 }}>
            {[['walk-outline', 'Tuesday', 'Easy run, short and conversational'], ['flash-outline', 'Wednesday', 'Run Club: intervals, tempo or hills'], ['trail-sign-outline', 'Saturday', 'Long run']].map(([i, d, t]) => (
              <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name={i as any} size={20} color={colors.accent} />
                <Text style={[type.body, { fontWeight: '700', width: 92 }]}>{d}</Text>
                <Text style={[type.dim, { flex: 1, fontSize: 14 }]}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={[type.small, { marginTop: 18 }]}>Week 1 starts {short(nextMonday(today))}. Race day would be {short(addDays(nextMonday(today), HM_WEEKS * 7 - 2))}.</Text>
          <View style={{ marginTop: 14 }}><PrimaryButton title="Start plan" icon="flag" onPress={() => updateHM({ startDate: toKey(nextMonday(today)) })} /></View>
        </Card>
      ) : null}

      {started && shownWeek ? (() => {
        const w = HALF_MARATHON_PLAN[shownWeek - 1];
        const runs = hmRunsForWeek(state, shownWeek);
        const planned = runs.reduce((a, r) => a + r.run.miles, 0);
        const logged = milesInWeek(state, runs[0].date);
        const nextLong = runs[2];
        return (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Ring progress={planned ? logged / planned : 0} color={colors.accent} size={96} stroke={9}>
                <Text style={[type.num, { fontSize: 22 }]}>{fmt1(logged)}</Text>
                <Text style={[type.small, { fontSize: 11, marginTop: -2 }]}>of {fmt1(planned)} mi</Text>
              </Ring>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: colors.accent }]}>{beforeStart ? 'Starts Monday' : `Week ${shownWeek} of ${HM_WEEKS}`} · {w.phase}</Text>
                <Text style={[type.body, { marginTop: 6, lineHeight: 22 }]}>{w.focus}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <View style={{ flex: 1, backgroundColor: colors.cardRaised, borderRadius: radius.sm, padding: 12 }}>
                <Text style={[type.label, { fontSize: 10 }]}>Next long run</Text>
                <Text style={[type.h2, { marginTop: 4 }]}>{fmt1(nextLong.run.miles)} mi</Text>
                <Text style={[type.small, { fontSize: 12 }]}>{short(nextLong.date)}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.cardRaised, borderRadius: radius.sm, padding: 12 }}>
                <Text style={[type.label, { fontSize: 10 }]}>Race day</Text>
                <Text style={[type.h2, { marginTop: 4 }]}>{daysToRace} days</Text>
                <Text style={[type.small, { fontSize: 12 }]}>{race ? short(race) : ''}</Text>
              </View>
            </View>
            <View style={{ gap: 6, marginTop: 14 }}>
              {runs.map(r => <RunRow key={r.partId} run={r.run} date={r.date} done={done(r.date, r.partId)} future={toKey(r.date) > toKey(today)} onPress={() => openRun(r.date)} />)}
            </View>
          </Card>
        );
      })() : null}

      {started && !shownWeek ? (
        <Card><Text style={type.h2}>Plan complete 🎉</Text><Text style={[type.dim, { marginTop: 6 }]}>Race day was {race ? short(race) : ''}. Start a new block below whenever you’re ready.</Text></Card>
      ) : null}

      {started ? (
        <Card>
          <SectionLabel>Settings</SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={[type.body, { fontWeight: '600' }]}>Race day</Text>
              <Text style={[type.small]}>{race ? `${WEEKDAYS_LONG[isoWeekday(race) - 1]}, ${MONTHS[race.getMonth()]} ${race.getDate()}, ${race.getFullYear()}` : ''}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable onPress={() => updateHM({ startDate: toKey(addDays(fromKey(hm.startDate!), -7)) })} style={stepBtn}><Ionicons name="remove" size={18} color={colors.text} /></Pressable>
              <Pressable onPress={() => updateHM({ startDate: toKey(addDays(fromKey(hm.startDate!), 7)) })} style={stepBtn}><Ionicons name="add" size={18} color={colors.text} /></Pressable>
            </View>
          </View>
          <Text style={[type.small, { fontSize: 12, marginTop: 4 }]}>Moves race day a week at a time. The plan shifts with it.</Text>

          <Text style={[type.body, { fontWeight: '600', marginTop: 18, marginBottom: 8 }]}>Easy run day</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[1, 2, 4, 5, 7].map(wd => <Chip key={wd} label={WEEKDAYS_SHORT[wd - 1]} on={hm.easyRunWeekday === wd} onPress={() => updateHM({ easyRunWeekday: wd })} />)}
          </View>

          <Text style={[type.body, { fontWeight: '600', marginTop: 18 }]}>Goal finish time (optional)</Text>
          <Text style={[type.small, { fontSize: 12, marginTop: 2, marginBottom: 8 }]}>Like 2:15:00. Shows target paces for each kind of run.</Text>
          <TextField value={goalText} placeholder="h:mm:ss" inputMode="numeric"
            onChangeText={t => { setGoalText(t); const s = parseDuration(t); updateHM({ goalSeconds: s && s > 3600 ? s : undefined }); }} />
          {paces.length ? (
            <View style={{ marginTop: 12, gap: 6 }}>
              {paces.map(([n, p]) => (
                <View key={n} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[type.dim, { fontSize: 15 }]}>{n}</Text>
                  <Text style={[type.body, { fontWeight: '700', fontVariant: ['tabular-nums'] }]}>{formatPace(p)} /mi</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <SectionLabel>How hard? Effort guide</SectionLabel>
        {EFFORT_GUIDE.map((e, i) => (
          <View key={e.range} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: colors.stroke }}>
            <Text style={[type.num, { fontSize: 16, width: 42, color: colors.accent }]}>{e.range}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[type.body, { fontWeight: '600', fontSize: 15 }]}>{e.name} · <Text style={{ fontWeight: '400', color: colors.textDim }}>{e.talk}</Text></Text>
              <Text style={[type.small, { fontSize: 12 }]}>{e.use}</Text>
            </View>
          </View>
        ))}
      </Card>

      {started ? (
        <View>
          <Text style={[type.label, { marginLeft: 4, marginBottom: 10 }]}>All 12 weeks</Text>
          <View style={{ gap: 8 }}>
            {HALF_MARATHON_PLAN.map(w => {
              const runs = hmRunsForWeek(state, w.week);
              const miles = runs.reduce((a, r) => a + r.run.miles, 0);
              const allDone = runs.every(r => done(r.date, r.partId));
              const isCur = w.week === curWeek;
              const open = openWeek === w.week;
              return (
                <Pressable key={w.week} onPress={() => setOpenWeek(open ? null : w.week)}>
                  <Card style={{ padding: 14, borderWidth: isCur ? 1.5 : 0, borderColor: colors.accent }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: allDone ? colors.accent : colors.cardRaised }}>
                        {allDone ? <Ionicons name="checkmark" size={20} color={colors.accentInk} /> : <Text style={[type.body, { fontWeight: '800' }]}>{w.week}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[type.body, { fontWeight: '700' }]}>Week {w.week} · {w.phase}</Text>
                        <Text style={[type.small, { fontSize: 12 }]}>{range(addDays(fromKey(hm.startDate!), (w.week - 1) * 7))} · {fmt1(miles)} mi · long {fmt1(w.long.miles)}</Text>
                      </View>
                      {isCur ? <Tag text="Now" /> : null}
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textDim} />
                    </View>
                    {open ? (
                      <View style={{ marginTop: 12, gap: 10 }}>
                        <Text style={[type.dim, { fontSize: 14 }]}>{w.focus}</Text>
                        {runs.map(r => (
                          <View key={r.partId} style={{ backgroundColor: colors.cardRaised, borderRadius: radius.sm, padding: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={[type.body, { fontWeight: '700', flex: 1 }]}>{r.run.title}</Text>
                              {done(r.date, r.partId) ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : <Text style={[type.small, { fontSize: 12 }]}>{short(r.date)}</Text>}
                            </View>
                            <Text style={[type.small, { marginTop: 4, lineHeight: 19 }]}>{r.run.detail}</Text>
                            <Text style={[type.small, { marginTop: 4, color: colors.accent }]}>Effort {r.run.effort}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View>
        <Text style={[type.label, { marginLeft: 4, marginBottom: 4 }]}>Workout library</Text>
        <Text style={[type.small, { marginLeft: 4, marginBottom: 10 }]}>Tap one to read how to do it, then log it today.</Text>
        <View style={{ gap: 8 }}>
          {WORKOUT_LIBRARY.map(w => {
            const open = openLib === w.id;
            return (
              <Pressable key={w.id} onPress={() => setOpenLib(open ? null : w.id)}>
                <Card style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name={w.kind === 'cross' ? 'bicycle-outline' : 'walk-outline'} size={22} color={colors.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={[type.body, { fontWeight: '700' }]}>{w.name}</Text>
                      <Text style={[type.small, { fontSize: 12 }]}>{w.minutes} · effort {w.effort}{w.kind === 'cross' ? ' · cross-training' : ''}</Text>
                    </View>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textDim} />
                  </View>
                  {open ? (
                    <View style={{ marginTop: 12, gap: 10 }}>
                      {[['What it is', w.what], ['How to do it', w.how], ['How it should feel', w.feel]].map(([h, t]) => (
                        <View key={h}><Text style={[type.label, { fontSize: 10.5 }]}>{h}</Text><Text style={[type.body, { fontSize: 15, marginTop: 3, lineHeight: 21 }]}>{t}</Text></View>
                      ))}
                      <PrimaryButton title="Log this today" icon="add-circle" onPress={() => onLogExtra(w.id)} />
                    </View>
                  ) : null}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      {started ? (
        <Pressable onPress={() => { if (confirmReset) { updateHM({ startDate: null }); setConfirmReset(false); } else setConfirmReset(true); }} style={{ alignItems: 'center', padding: 12 }}>
          <Text style={[type.small, { color: confirmReset ? colors.accent : colors.textFaint }]}>{confirmReset ? 'Tap again to reset the plan (your logged runs stay)' : 'Reset plan'}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const stepBtn = { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardRaised, alignItems: 'center', justifyContent: 'center' } as const;
export { libraryById };
