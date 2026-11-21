// Log a day: sets for lifting, distance/time/effort for runs, reps or holds for abs, then a short finish step.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../storage/store';
import { DayLog, ExerciseLog, ExtraLog, PartLog, RunLog } from '../storage/types';
import { planFor, PlanPart, templateExercises } from '../lib/schedule';
import { exercisesFor } from '../data/exercises';
import { libraryById } from '../data/halfMarathon';
import { isoWeekday, MONTHS, sameDay, toKey, WEEKDAYS_LONG } from '../lib/dates';
import { formatDuration, formatPace, parseDuration } from '../lib/format';
import { colors, radius, type } from '../theme';
import { BodyPair } from '../components/BodyMap';
import { Card, Tag } from '../components/ui';
import { CheckButton, EffortPicker, NumInput, Stars, TextField } from '../components/inputs';

// ── Rest timer ───────────────────────────────────────────────
function useRestTimer() {
  const [end, setEnd] = useState<number | null>(null);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!end) return;
    const t = setInterval(() => { if (Date.now() >= end) setEnd(null); tick(x => x + 1); }, 250);
    return () => clearInterval(t);
  }, [end]);
  return { left: end ? Math.max(0, Math.ceil((end - Date.now()) / 1000)) : 0, start: (s: number) => setEnd(Date.now() + s * 1000), stop: () => setEnd(null) };
}

// ── Pieces ───────────────────────────────────────────────────
function SectionHead({ title, sub, done, onToggle, color = colors.accent }: { title: string; sub?: string; done: boolean; onToggle: () => void; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 10, paddingHorizontal: 4 }}>
      <View style={{ flex: 1 }}>
        <Text style={[type.title, { fontSize: 21 }]}>{title}</Text>
        {sub ? <Text style={[type.dim, { fontSize: 14, marginTop: 2 }]}>{sub}</Text> : null}
      </View>
      <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: done ? color : colors.card }}>
        <Ionicons name={done ? 'checkmark-done' : 'checkmark'} size={16} color={done ? colors.accentInk : colors.textDim} />
        <Text style={[type.small, { color: done ? colors.accentInk : colors.textDim, fontWeight: '700' }]}>{done ? 'Done' : 'Mark done'}</Text>
      </Pressable>
    </View>
  );
}

function ExerciseCard({ ex, target, rest, timed, accent, onChange, onSetChecked }: {
  ex: ExerciseLog; target: string; rest?: number; timed?: boolean; accent: string;
  onChange: (ex: ExerciseLog) => void; onSetChecked: (rest?: number) => void;
}) {
  const allDone = ex.sets.length > 0 && ex.sets.every(s => s.done);
  const setSet = (i: number, patch: Partial<ExerciseLog['sets'][number]>) => onChange({ ...ex, sets: ex.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const firstReps = parseInt(target, 10);
  return (
    <Card style={{ padding: 16, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={[type.h2, { fontSize: 18 }]}>{ex.name}</Text>
          <Text style={[type.small, { marginTop: 2 }]}>{ex.sets.length} × {target}{rest ? ` · rest ${formatDuration(rest)}` : ''}</Text>
        </View>
        <CheckButton done={allDone} color={accent} size={40} onPress={() => onChange({ ...ex, sets: ex.sets.map(s => ({ ...s, done: !allDone })) })} />
      </View>
      {ex.sets.map((s, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: i ? 8 : 0 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.cardRaised, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[type.small, { color: colors.text, fontWeight: '700' }]}>{i + 1}</Text>
          </View>
          {timed ? (
            <NumInput value={s.secs} onChange={v => setSet(i, { secs: v })} placeholder={target.replace(/\D/g, '') || '30'} suffix="sec" decimal={false} width={120} />
          ) : (
            <>
              {accent === colors.accent ? <NumInput value={s.weight} onChange={v => setSet(i, { weight: v })} placeholder="—" suffix="lb" width={96} /> : null}
              <Text style={[type.dim]}>{accent === colors.accent ? '×' : ''}</Text>
              <NumInput value={s.reps} onChange={v => setSet(i, { reps: v })} placeholder={Number.isFinite(firstReps) ? String(firstReps) : '—'} suffix="reps" decimal={false} width={96} />
            </>
          )}
          <View style={{ flex: 1 }} />
          <CheckButton done={s.done} color={accent} onPress={() => { setSet(i, { done: !s.done }); if (!s.done) onSetChecked(rest); }} />
        </View>
      ))}
    </Card>
  );
}

function RunCard({ title, target, effortHint, run, done, onRun, onDone }: {
  title?: string; target?: string; effortHint?: string; run: RunLog; done: boolean; onRun: (r: RunLog) => void; onDone: () => void;
}) {
  const [timeText, setTimeText] = useState(formatDuration(run.seconds));
  const pace = run.miles && run.seconds ? run.seconds / run.miles : undefined;
  return (
    <Card style={{ padding: 16, marginBottom: 10 }}>
      {title ? <Text style={[type.h2, { fontSize: 18 }]}>{title}</Text> : null}
      {target ? <Text style={[type.dim, { fontSize: 14, marginTop: 4, lineHeight: 20 }]}>{target}</Text> : null}
      {effortHint ? <View style={{ flexDirection: 'row', marginTop: 8 }}><Tag text={`Effort ${effortHint}`} icon="pulse" /></View> : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={[type.label, { fontSize: 10.5, marginBottom: 6 }]}>Distance</Text>
          <NumInput value={run.miles} onChange={v => onRun({ ...run, miles: v })} placeholder="0.0" suffix="mi" width={undefined as any} style={{ width: '100%' }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[type.label, { fontSize: 10.5, marginBottom: 6 }]}>Time</Text>
          <TextField value={timeText} inputMode="numeric" placeholder="mm:ss" onChangeText={t => { setTimeText(t); onRun({ ...run, seconds: parseDuration(t) }); }} />
        </View>
        <View style={{ width: 84 }}>
          <Text style={[type.label, { fontSize: 10.5, marginBottom: 6 }]}>Pace</Text>
          <View style={{ height: 48, justifyContent: 'center' }}>
            <Text style={[type.num, { fontSize: 20, color: pace ? colors.text : colors.textFaint }]}>{formatPace(pace)}</Text>
            <Text style={[type.small, { fontSize: 11 }]}>per mile</Text>
          </View>
        </View>
      </View>
      <Text style={[type.label, { fontSize: 10.5, marginTop: 14, marginBottom: 6 }]}>Effort (1–10)</Text>
      <EffortPicker value={run.effort} onChange={v => onRun({ ...run, effort: v })} />
      <Pressable onPress={onDone} style={{ marginTop: 14, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: done ? colors.accent : colors.cardRaised }}>
        <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? colors.accentInk : colors.textDim} />
        <Text style={[type.body, { fontWeight: '700', color: done ? colors.accentInk : colors.text }]}>{done ? 'Run done' : 'Mark run done'}</Text>
      </Pressable>
    </Card>
  );
}

// ── Celebration ──────────────────────────────────────────────
function Celebration({ onDone }: { onDone: () => void }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 14 }),
      Animated.delay(650),
      Animated.timing(a, { toValue: 2, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(onDone);
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,8,10,0.86)', opacity: a.interpolate({ inputRange: [0, 0.3, 1, 2], outputRange: [0, 1, 1, 0] }) } as any}>
      <Animated.View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', transform: [{ scale: a.interpolate({ inputRange: [0, 1, 2], outputRange: [0.3, 1, 1.1] }) }] }}>
        <Ionicons name="checkmark" size={72} color={colors.accentInk} />
      </Animated.View>
      <Text style={[type.title, { marginTop: 22 }]}>Workout saved</Text>
      <Text style={[type.dim, { marginTop: 6 }]}>Nice work, Bailey.</Text>
    </Animated.View>
  );
}

// ── Screen ───────────────────────────────────────────────────
export function LogScreen({ date, onClose }: { date: Date; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { state, today, updateDay } = useApp();
  const plan = planFor(state, date);
  const k = toKey(date);
  const log: DayLog = state.logs[k] ?? { parts: {} };
  const rest = useRestTimer();
  const [celebrate, setCelebrate] = useState(false);
  const slide = useRef(new Animated.Value(1)).current;
  useEffect(() => { Animated.timing(slide, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  const close = () => Animated.timing(slide, { toValue: 1, duration: 220, useNativeDriver: true }).start(onClose);

  const setPart = (id: string, fn: (p: PartLog) => PartLog) =>
    updateDay(date, l => ({ ...l, parts: { ...l.parts, [id]: fn(l.parts[id] ?? { done: false }) } }));
  const setExtra = (id: string, fn: (e: ExtraLog) => ExtraLog) =>
    updateDay(date, l => ({ ...l, extras: (l.extras ?? []).map(e => (e.id === id ? fn(e) : e)) }));
  const exercisesOf = (p: PlanPart) => log.parts[p.id]?.exercises ?? templateExercises(plan, p.id);

  const allDone = plan.parts.every(p => log.parts[p.id]?.done) && (log.extras ?? []).every(e => e.done);
  const markAll = () => updateDay(date, l => {
    const parts = { ...l.parts };
    for (const p of plan.parts) {
      const cur = parts[p.id] ?? { done: false };
      const exercises = p.kind === 'run' ? undefined : (cur.exercises ?? templateExercises(plan, p.id)).map(e => ({ ...e, sets: e.sets.map(s => ({ ...s, done: !allDone })) }));
      parts[p.id] = { ...cur, done: !allDone, at: Date.now(), ...(exercises ? { exercises } : {}) };
    }
    return { ...l, parts, extras: (l.extras ?? []).map(e => ({ ...e, done: !allDone })) };
  });

  const title = plan.split.kind === 'rest' && !plan.hasAbs && (log.extras ?? []).length ? 'Extra workout' : plan.split.name;
  const dateLabel = sameDay(date, today) ? 'Today' : `${WEEKDAYS_LONG[isoWeekday(date) - 1]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
  const extrasMuscles = (log.extras ?? []).some(e => e.kind === 'run') ? (['quads', 'hamstrings', 'glutes', 'calves'] as const) : [];
  const muscles = Array.from(new Set([...plan.muscles, ...extrasMuscles]));

  return (
    <Animated.View style={{ position: 'absolute', inset: 0, backgroundColor: colors.bg, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 900] }) }] } as any}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.stroke }}>
        <Pressable onPress={close} hitSlop={12} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={type.label}>{dateLabel}</Text>
        </View>
        <Pressable onPress={markAll} hitSlop={8} style={{ paddingHorizontal: 12, height: 36, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: allDone ? colors.accent : colors.card }}>
          <Text style={[type.small, { color: allDone ? colors.accentInk : colors.text, fontWeight: '700' }]}>{allDone ? 'All done ✓' : 'Mark all done'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <Text style={[type.hero, { textAlign: 'center' }]}>{title}</Text>
          <Text style={[type.dim, { marginTop: 4, textAlign: 'center' }]}>{plan.split.focus}</Text>
          <View style={{ marginTop: 16, marginBottom: 8 }}><BodyPair muscles={muscles as any} height={190} gap={10} /></View>
        </View>

        {plan.parts.map(p => {
          const pl = log.parts[p.id];
          const done = !!pl?.done;
          if (p.kind === 'run') {
            return (
              <View key={p.id}>
                <Text style={[type.label, { marginTop: 10, marginBottom: 8, marginLeft: 4 }]}>{p.id === 'easyrun' ? 'Easy run' : p.id === 'runclub' ? 'Run Club' : 'Run'}{p.hm ? ' · Half marathon plan' : ''}</Text>
                <RunCard title={p.hm?.title ?? p.title} target={p.target} effortHint={p.hm?.effort} run={pl?.run ?? {}} done={done}
                  onRun={r => setPart(p.id, x => ({ ...x, run: r }))} onDone={() => setPart(p.id, x => ({ ...x, done: !x.done, at: Date.now() }))} />
              </View>
            );
          }
          const isAbs = p.kind === 'abs';
          const accent = isAbs ? colors.abs : colors.accent;
          const exs = exercisesOf(p);
          const tmplLift = exercisesFor(plan.split.id, p.id);
          const tmplAbs = plan.absRoutine?.exercises ?? [];
          const placeholder = isAbs ? tmplAbs.some(e => e.placeholder) : tmplLift.some(e => e.placeholder);
          const updateEx = (i: number, ex: ExerciseLog) => setPart(p.id, x => {
            const list = (x.exercises ?? templateExercises(plan, p.id)).map((e, j) => (j === i ? ex : e));
            return { ...x, exercises: list, done: list.every(e => e.sets.every(s => s.done)), at: Date.now() };
          });
          return (
            <View key={p.id}>
              <SectionHead title={isAbs ? 'Abs' : p.title} sub={isAbs ? p.target : `${exs.length} exercises`} done={done} color={accent}
                onToggle={() => setPart(p.id, x => ({ ...x, done: !x.done, at: Date.now(), exercises: (x.exercises ?? exs).map(e => ({ ...e, sets: e.sets.map(s => ({ ...s, done: !x.done })) })) }))} />
              {placeholder ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 4 }}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textDim} />
                  <Text style={[type.small, { fontSize: 12 }]}>Sample exercises until Bailey’s real plan is added</Text>
                </View>
              ) : null}
              {exs.map((ex, i) => {
                const t = isAbs ? tmplAbs.find(a => a.name === ex.name) : undefined;
                const l = !isAbs ? tmplLift.find(a => a.name === ex.name) : undefined;
                const target = isAbs ? (t?.holdSeconds ? `${t.holdSeconds} sec hold` : `${t?.reps ?? ''} reps`) : `${l?.reps ?? ''} reps`;
                return <ExerciseCard key={ex.name + i} ex={ex} target={target} rest={isAbs ? 30 : l?.rest} timed={!!t?.holdSeconds} accent={accent}
                  onChange={e => updateEx(i, e)} onSetChecked={r => r && rest.start(r)} />;
              })}
            </View>
          );
        })}

        {(log.extras ?? []).map(e => {
          const lib = libraryById(e.libraryId);
          return (
            <View key={e.id}>
              <SectionHead title={e.title} sub={lib ? `${lib.minutes} · effort ${lib.effort}` : undefined} done={e.done} onToggle={() => setExtra(e.id, x => ({ ...x, done: !x.done }))} />
              <RunCard target={lib?.how} run={e.run ?? {}} done={e.done}
                onRun={r => setExtra(e.id, x => ({ ...x, run: r }))} onDone={() => setExtra(e.id, x => ({ ...x, done: !x.done }))} />
            </View>
          );
        })}

        {plan.parts.length === 0 && !(log.extras ?? []).length ? (
          <Card><Text style={type.dim}>Rest day. Nothing to log. Add a run from the Half Marathon tab’s workout library if you’re feeling it.</Text></Card>
        ) : null}

        <Card style={{ marginTop: 18 }}>
          <Text style={type.label}>How did it go?</Text>
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <Stars value={log.rating} onChange={v => updateDay(date, l => ({ ...l, rating: v }))} />
          </View>
          <Text style={[type.label, { fontSize: 10.5, marginBottom: 6 }]}>Overall effort (1–10)</Text>
          <EffortPicker value={log.effort} onChange={v => updateDay(date, l => ({ ...l, effort: v }))} />
          <Text style={[type.label, { fontSize: 10.5, marginTop: 16, marginBottom: 6 }]}>Notes</Text>
          <TextField multiline value={log.journal ?? ''} placeholder="How did it feel? Wins, struggles, notes" onChangeText={t => updateDay(date, l => ({ ...l, journal: t }))} />
          <Pressable onPress={() => { updateDay(date, l => ({ ...l, savedAt: Date.now() })); rest.stop(); setCelebrate(true); }}
            style={({ pressed }) => ({ marginTop: 18, height: 56, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <Ionicons name="checkmark-circle" size={22} color={colors.accentInk} />
            <Text style={[type.body, { color: colors.accentInk, fontWeight: '800', fontSize: 17 }]}>Save workout</Text>
          </Pressable>
        </Card>
      </ScrollView>

      {rest.left > 0 ? (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 18, backgroundColor: colors.cardRaised, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.stroke, paddingVertical: 10, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="timer-outline" size={22} color={colors.accent} />
          <Text style={[type.body, { flex: 1 }]}>Rest</Text>
          <Text style={[type.num, { fontSize: 24 }]}>{formatDuration(rest.left)}</Text>
          <Pressable onPress={rest.stop} hitSlop={10} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.card }}>
            <Text style={[type.small, { color: colors.text, fontWeight: '700' }]}>Skip</Text>
          </Pressable>
        </View>
      ) : null}

      {celebrate ? <Celebration onDone={() => { setCelebrate(false); close(); }} /> : null}
    </Animated.View>
  );
}

/** Adds a library workout to a day's log and returns its id. */
export function newExtra(libraryId: string, title: string, kind: 'run' | 'cross'): ExtraLog {
  return { id: `${libraryId}-${Date.now()}`, libraryId, title, kind, done: false, run: {} };
}
