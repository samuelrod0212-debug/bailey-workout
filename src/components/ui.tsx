import React from 'react';
import { Pressable, Text, View, ViewStyle, StyleProp } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, type } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: colors.card, borderRadius: radius.card, padding: 18 }, style]}>{children}</View>;
}

export function SectionLabel({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={type.label}>{children}</Text>
      {right}
    </View>
  );
}

export function Tag({ text, color = colors.accent, bg = colors.accentSoft, icon }: { text: string; color?: string; bg?: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill }}>
      {icon ? <Ionicons name={icon} size={12} color={color} /> : null}
      <Text style={[type.small, { color, fontWeight: '700', fontSize: 12 }]}>{text}</Text>
    </View>
  );
}

export function IconButton({ icon, onPress, size = 20 }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; size?: number }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.cardRaised : 'transparent' })}>
      <Ionicons name={icon} size={size} color={colors.textDim} />
    </Pressable>
  );
}

export function PrimaryButton({ title, onPress, icon = 'play' }: { title: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 22,
      transform: [{ scale: pressed ? 0.97 : 1 }],
    })}>
      <Ionicons name={icon} size={18} color={colors.accentInk} />
      <Text style={[type.body, { color: colors.accentInk, fontWeight: '800', fontSize: 17 }]}>{title}</Text>
    </Pressable>
  );
}
