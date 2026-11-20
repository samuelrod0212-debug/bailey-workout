import React, { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useApp } from '../storage/store';
import { VERSES, VERSE_TRANSLATION } from '../data/verses';
import { dayOfYear } from '../lib/dates';
import { Card, SectionLabel } from './ui';
import { colors, type } from '../theme';

/** Verse picked by day of year, so it changes at local midnight and never repeats within a year. */
export function verseFor(d: Date) {
  return VERSES[(dayOfYear(d) - 1) % VERSES.length];
}

export function VerseCard() {
  const { today, state, toggleFavorite } = useApp();
  const v = verseFor(today);
  const fav = state.favorites.includes(v.ref);
  const pop = useRef(new Animated.Value(1)).current;
  const onHeart = () => {
    toggleFavorite(v.ref);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.sequence([
      Animated.spring(pop, { toValue: 1.35, useNativeDriver: true, speed: 40 }),
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };
  return (
    <Card>
      <SectionLabel right={
        <Pressable onPress={onHeart} hitSlop={14}>
          <Animated.View style={{ transform: [{ scale: pop }] }}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? colors.accent : colors.textDim} />
          </Animated.View>
        </Pressable>
      }>Verse of the day</SectionLabel>
      <Text style={[type.body, { fontSize: 19, lineHeight: 28, fontWeight: '500', letterSpacing: -0.1 }]}>“{v.text}”</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 }}>
        <View style={{ width: 18, height: 2, borderRadius: 1, backgroundColor: colors.accent }} />
        <Text style={[type.body, { color: colors.accent, fontWeight: '700', fontSize: 15 }]}>{v.ref}</Text>
        <Text style={[type.small, { fontSize: 12 }]}>{VERSE_TRANSLATION}</Text>
      </View>
    </Card>
  );
}
