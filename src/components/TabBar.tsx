import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type } from '../theme';

export type Tab = 'home' | 'plan' | 'half' | 'progress' | 'journal';
const TABS: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap; on: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', on: 'home' },
  { id: 'plan', label: 'Plan', icon: 'calendar-outline', on: 'calendar' },
  { id: 'half', label: 'Half Marathon', icon: 'ribbon-outline', on: 'ribbon' },
  { id: 'progress', label: 'Progress', icon: 'stats-chart-outline', on: 'stats-chart' },
  { id: 'journal', label: 'Journal', icon: 'book-outline', on: 'book' },
];

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,11,13,0.97)', borderTopWidth: 1, borderTopColor: colors.stroke, paddingBottom: Math.max(insets.bottom, 12), flexDirection: 'row' }}>
      {TABS.map(t => {
        const active = t.id === tab;
        return (
          <Pressable key={t.id} onPress={() => onTab(t.id)} style={{ flex: 1, alignItems: 'center', paddingTop: 10 }}>
            <Ionicons name={active ? t.on : t.icon} size={25} color={active ? colors.accent : colors.textDim} />
            <Text numberOfLines={1} style={[type.small, { fontSize: 10.5, marginTop: 4, color: active ? colors.accent : colors.textDim, fontWeight: active ? '700' : '500' }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
