import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../storage/store';
import { DayLog } from '../storage/types';
import { loggedDays, planFor, runsOn } from '../lib/schedule';
import { isoWeekday, MONTHS, toKey, WEEKDAYS_LONG, WEEKDAYS_SHORT } from '../lib/dates';
import { fmt1, formatDuration, formatPace } from '../lib/format';
import { colors, radius, type } from '../theme';
import { Card, PrimaryButton, Tag } from '../components/ui';
import { Chip, Stars, TextField } from '../components/inputs';
import { BodyPair } from '../components/BodyMap';
import { useHideTabBar } from '../components/TabBarVisibility';

const TYPES = ['All', 'Legs', 'Push', 'Pull', 'Arms', 'Run', 'Abs'] as const;
const RATINGS = [['Any', () => true], ['★ 5', (r?: number) => r === 5], ['★ 4+', (r?: number) => (r ?? 0) >= 4], ['★ ≤3', (r?: number) => !!r && r <= 3]] as const;

function typesOf(splitId: string, log: DayLog): string[] {
  const t: string[] = [];
  if (log.parts.main?.done) {
    if (splitId.startsWith('legs')) t.push('Legs');
    if (splitId === 'push') t.push('Push');
    if (splitId.startsWith('pull')) t.push('Pull');
    if (splitId === 'arms') t.push('Arms');
  }
  if (runsOn(log).length || splitId === 'long-run') t.push('Run');
  if (log.parts.abs?.done) t.push('Abs');
  return t;
}

const longDate = (d: Date) => `${WEEKDAYS_LONG[isoWeekday(d) - 1]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

export function JournalScreen({ onEdit }: { onEdit: (d: Date) => void }) {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const [q, setQ] = useState('');
  const [typ, setTyp] = useState<(typeof TYPES)[number]>('All');
  const [rating, setRating] = useState(0);
  const [open, setOpen] = useState<Date | null>(null);
  useHideTabBar(!!open);

  const entries = useMemo(() => loggedDays(state).map(d => {
    const log = state.logs[toKey(d)];
    const plan = planFor(state, d);
    const runs = runsOn(log);
    const miles = runs.reduce((a, r) => a + (r.miles ?? 0), 0);
    const name = plan.split.kind === 'rest' && log.extras?.length ? log.extras.map(e => e.title).join(' + ') : plan.split.name;
    return { d, log, plan, name, miles, types: typesOf(plan.split.id, log) };
  }), [state]);

  const query = q.trim().toLowerCase();
  const filtered = entries.filter(e =>
    (typ === 'All' || e.types.includes(typ)) &&
    RATINGS[rating][1](e.log.rating) &&
    (!query || e.name.toLowerCase().includes(query) || (e.log.journal ?? '').toLowerCase().includes(query)));

  const sel = open ? entries.find(e => toKey(e.d) === toKey(open)) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 140, gap: 12 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 4, marginTop: 6 }}>
          <Text style={type.hero}>Journal</Text>
          <Text style={[type.dim, { marginTop: 4 }]}>{entries.length} {entries.length === 1 ? 'day' : 'days'} logged</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.pill, paddingLeft: 16 }}>
          <Ionicons name="search" size={18} color={colors.textDim} />
          <TextField value={q} onChangeText={setQ} placeholder="Search workouts and notes" style={{ flex: 1, backgroundColor: 'transparent' }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {TYPES.map(t => <Chip key={t} label={t} on={typ === t} onPress={() => setTyp(t)} />)}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {RATINGS.map(([l], i) => <Chip key={l} label={l} on={rating === i} onPress={() => setRating(i)} />)}
        </ScrollView>

        {filtered.map(e => (
          <Pressable key={toKey(e.d)} onPress={() => setOpen(e.d)}>
            <Card style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 48, alignItems: 'center', paddingTop: 2 }}>
                  <Text style={[type.label, { fontSize: 10.5 }]}>{WEEKDAYS_SHORT[isoWeekday(e.d) - 1]}</Text>
                  <Text style={[type.title, { fontSize: 24 }]}>{e.d.getDate()}</Text>
                  <Text style={[type.small, { fontSize: 11 }]}>{MONTHS[e.d.getMonth()].slice(0, 3)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[type.h2, { fontSize: 18 }]} numberOfLines={1}>{e.name}</Text>
                  <View style={{ marginTop: 4 }}><Stars value={e.log.rating} size={15} /></View>
                  {e.log.journal ? <Text style={[type.dim, { fontSize: 14, marginTop: 6, lineHeight: 20 }]} numberOfLines={2}>{e.log.journal}</Text> : null}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {e.log.parts.abs?.done ? <Tag text="+ Abs" color={colors.abs} bg={colors.absSoft} /> : null}
                    {e.miles ? <Tag text={`${fmt1(e.miles)} mi`} icon="walk" /> : null}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} style={{ marginTop: 22 }} />
              </View>
            </Card>
          </Pressable>
        ))}
        {!filtered.length ? (
          <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Ionicons name="book-outline" size={32} color={colors.textFaint} />
            <Text style={[type.dim, { marginTop: 10, textAlign: 'center' }]}>{entries.length ? 'Nothing matches those filters.' : 'Logged workouts show up here.\nTap Log workout on Home to add your first.'}</Text>
          </Card>
        ) : null}
      </ScrollView>

      {sel ? (
        <View style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: colors.bg } as any}>
          <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.stroke }}>
            <Pressable onPress={() => setOpen(null)} hitSlop={12} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chevron-back" size={28} color={colors.text} />
            </Pressable>
            <Text style={[type.label, { flex: 1, textAlign: 'center' }]}>{longDate(sel.d)}</Text>
            <View style={{ width: 44 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40, gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[type.hero, { textAlign: 'center' }]}>{sel.name}</Text>
              <View style={{ marginTop: 8 }}><Stars value={sel.log.rating} size={22} /></View>
              {sel.log.effort ? <Text style={[type.small, { marginTop: 6 }]}>Effort {sel.log.effort}/10</Text> : null}
              <View style={{ marginTop: 14 }}><BodyPair muscles={sel.plan.muscles} height={140} gap={8} /></View>
            </View>
            {sel.log.journal ? (
              <Card><Text style={type.label}>Notes</Text><Text style={[type.body, { marginTop: 8, lineHeight: 23 }]}>{sel.log.journal}</Text></Card>
            ) : null}
            {sel.plan.parts.map(p => {
              const pl = sel.log.parts[p.id];
              if (!pl) return null;
              return (
                <Card key={p.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Ionicons name={pl.done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={pl.done ? (p.kind === 'abs' ? colors.abs : colors.accent) : colors.textFaint} />
                    <Text style={[type.h2, { fontSize: 18, flex: 1 }]}>{p.kind === 'abs' ? 'Abs' : p.title}</Text>
                  </View>
                  {pl.run ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[['Distance', pl.run.miles ? `${fmt1(pl.run.miles)} mi` : '–'], ['Time', formatDuration(pl.run.seconds) || '–'], ['Pace', pl.run.miles && pl.run.seconds ? `${formatPace(pl.run.seconds / pl.run.miles)}/mi` : '–'], ['Effort', pl.run.effort ? `${pl.run.effort}/10` : '–']].map(([l, v]) => (
                        <View key={l} style={{ flex: 1 }}><Text style={[type.label, { fontSize: 10 }]}>{l}</Text><Text style={[type.body, { fontWeight: '700', marginTop: 3 }]}>{v}</Text></View>
                      ))}
                    </View>
                  ) : null}
                  {(pl.exercises ?? []).map(ex => (
                    <View key={ex.name} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.stroke }}>
                      <Text style={[type.body, { fontWeight: '600' }]}>{ex.name}</Text>
                      <Text style={[type.small, { marginTop: 3 }]}>
                        {ex.sets.filter(s => s.done || s.reps || s.weight || s.secs).map(s => s.secs ? `${s.secs}s` : `${s.weight ? s.weight + ' lb × ' : ''}${s.reps ?? '–'}`).join('   ·   ') || 'No sets logged'}
                      </Text>
                    </View>
                  ))}
                </Card>
              );
            })}
            {(sel.log.extras ?? []).map(e => (
              <Card key={e.id}>
                <Text style={[type.h2, { fontSize: 18 }]}>{e.title}</Text>
                <Text style={[type.small, { marginTop: 6 }]}>{[e.run?.miles ? `${fmt1(e.run.miles)} mi` : '', formatDuration(e.run?.seconds), e.run?.effort ? `effort ${e.run.effort}/10` : ''].filter(Boolean).join(' · ') || 'Logged'}</Text>
              </Card>
            ))}
            <PrimaryButton title="Edit this day" icon="create-outline" onPress={() => { const d = sel.d; setOpen(null); onEdit(d); }} />
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
