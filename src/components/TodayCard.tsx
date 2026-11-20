import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../storage/store';
import { planFor, dayStatus } from '../lib/schedule';
import { sameDay, toKey, MONTHS, WEEKDAYS_SHORT, isoWeekday, dayOfYear } from '../lib/dates';
import { RECOVERY_MESSAGES } from '../data/split';
import { colors, radius, type } from '../theme';
import { BodyPair } from './BodyMap';
import { PrimaryButton, Tag } from './ui';
import { WorkoutIcon } from './WorkoutIcon';

/** The openGym-style "Today" card. Shows whichever day is selected on the strip or calendar. */
export function TodayCard({ date, onStart }: { date: Date; onStart: (d: Date) => void }) {
  const { state, today } = useApp();
  const plan = planFor(state, date);
  const { split } = plan;
  const status = dayStatus(state, date, today);
  const isToday = sameDay(date, today);
  const future = toKey(date) > toKey(today);
  const rest = split.kind === 'rest';
  const label = isToday ? 'Today' : `${WEEKDAYS_SHORT[isoWeekday(date) - 1]}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
  const log = state.logs[toKey(date)];
  const showParts = plan.parts.length > 1;

  const cta = future ? null
    : status === 'done' ? { t: 'View results', i: 'checkmark-circle' as const }
    : rest && !plan.hasAbs ? null
    : rest ? { t: 'Start Abs', i: 'play' as const }
    : status === 'missed' ? { t: 'Log it anyway', i: 'create-outline' as const }
    : { t: isToday ? 'Start Workout' : 'Log workout', i: 'play' as const };

  return (
    <View style={{ backgroundColor: colors.cardRaised, borderRadius: 20, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <WorkoutIcon day={split} size={46} muted={rest} />
            <View style={{ flex: 1 }}>
              <Text style={[type.dim, { fontSize: 14 }]}>{label}</Text>
              <Text style={[type.title, { fontSize: 23 }]} numberOfLines={2}>{split.name}</Text>
            </View>
          </View>
          <Text style={[type.dim, { marginTop: 10, fontSize: 14 }]} numberOfLines={2}>
            {rest ? RECOVERY_MESSAGES[dayOfYear(date) % RECOVERY_MESSAGES.length] : split.focus}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {plan.hasAbs ? <Tag text="+ Abs" color={colors.abs} bg={colors.absSoft} /> : null}
            {split.kind === 'run' || split.parts.some(p => p.kind === 'run') ? <Tag text="Cardio" icon="heart" /> : null}
            {status === 'done' ? <Tag text="Done" icon="checkmark" /> : null}
            {status === 'missed' ? <Tag text="Missed" color={colors.missed} bg="rgba(124,129,139,0.16)" /> : null}
          </View>
        </View>
        {!rest || plan.hasAbs ? (
          <View style={{ marginLeft: 8 }}>
            <BodyPair muscles={plan.muscles} height={124} gap={2} />
          </View>
        ) : null}
      </View>

      {showParts ? (
        <View style={{ marginTop: 14, gap: 8 }}>
          {plan.parts.map(p => {
            const done = !!log?.parts[p.id]?.done;
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12 }}>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={done ? (p.kind === 'abs' ? colors.abs : colors.accent) : colors.textFaint} />
                <Text style={[type.body, { flex: 1, fontSize: 15 }]} numberOfLines={1}>{p.title}</Text>
                <Text style={[type.small, { fontSize: 12 }]}>{p.kind === 'run' ? 'Run' : p.kind === 'abs' ? '~12 min' : 'Lift'}</Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {cta ? <View style={{ marginTop: 16 }}><PrimaryButton title={cta.t} icon={cta.i} onPress={() => onStart(date)} /></View> : null}
      {future && (!rest || plan.hasAbs) ? <Text style={[type.small, { marginTop: 14, textAlign: 'center' }]}>Coming up. You can log this once the day arrives.</Text> : null}
    </View>
  );
}
