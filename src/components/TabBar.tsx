import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type } from '../theme';

export type Tab = 'home' | 'plan' | 'progress' | 'journal';
const TABS: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap; on: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', on: 'home' },
  { id: 'plan', label: 'Plan', icon: 'calendar-outline', on: 'calendar' },
  { id: 'progress', label: 'Progress', icon: 'stats-chart-outline', on: 'stats-chart' },
  { id: 'journal', label: 'Journal', icon: 'book-outline', on: 'book' },
];

export function TabBar({ tab, onTab, onStart }: { tab: Tab; onTab: (t: Tab) => void; onStart: () => void }) {
  const insets = useSafeAreaInsets();
  const item = (t: typeof TABS[number]) => {
    const active = t.id === tab;
    return (
      <Pressable key={t.id} onPress={() => onTab(t.id)} style={{ flex: 1, alignItems: 'center', paddingTop: 10 }}>
        <Ionicons name={active ? t.on : t.icon} size={25} color={active ? colors.accent : colors.textDim} />
        <Text style={[type.small, { fontSize: 11.5, marginTop: 4, color: active ? colors.accent : colors.textDim }]}>{t.label}</Text>
      </Pressable>
    );
  };
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,11,13,0.97)', borderTopWidth: 1, borderTopColor: colors.stroke, paddingBottom: Math.max(insets.bottom, 12), flexDirection: 'row' }}>
      {TABS.slice(0, 2).map(item)}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Pressable onPress={onStart} style={({ pressed }) => ({
          marginTop: -24, width: 68, height: 68, borderRadius: 34, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
          shadowColor: colors.accent, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
          borderWidth: 4, borderColor: colors.bg, transform: [{ scale: pressed ? 0.94 : 1 }],
        })}>
          <Ionicons name="play" size={28} color={colors.accentInk} style={{ marginLeft: 3 }} />
        </Pressable>
        <Text style={[type.small, { fontSize: 11.5, marginTop: 4, color: colors.accent, fontWeight: '700' }]}>Start</Text>
      </View>
      {TABS.slice(2).map(item)}
    </View>
  );
}
