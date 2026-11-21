// Big, sweaty-hands-friendly inputs.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, TextInput, View, ViewStyle, StyleProp } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, fontFamily, radius, type } from '../theme';

const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

/** Number field that lets her type "12." without fighting her, and commits a number (or undefined). */
export function NumInput({ value, onChange, placeholder, suffix, style, decimal = true, width = 78 }: {
  value?: number; onChange: (v: number | undefined) => void; placeholder?: string; suffix?: string;
  style?: StyleProp<ViewStyle>; decimal?: boolean; width?: number;
}) {
  const [text, setText] = useState(value != null ? String(value) : '');
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(value != null ? String(value) : ''); }, [value]);
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardRaised, borderRadius: radius.sm, height: 48, width, paddingHorizontal: 10 }, style]}>
      <TextInput
        value={text}
        onFocus={() => (focused.current = true)}
        onBlur={() => { focused.current = false; setText(value != null ? String(value) : ''); }}
        onChangeText={t => {
          const clean = t.replace(',', '.').replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
          setText(clean);
          const n = parseFloat(clean);
          onChange(Number.isFinite(n) ? n : undefined);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
        inputMode={decimal ? 'decimal' : 'numeric'}
        selectTextOnFocus
        style={{ flex: 1, minWidth: 0, color: colors.text, fontFamily, fontSize: 18, fontWeight: '600', textAlign: 'center', outlineStyle: 'none' } as any}
      />
      {suffix ? <Text style={[type.small, { fontSize: 12, marginLeft: 2 }]}>{suffix}</Text> : null}
    </View>
  );
}

/** Free text field (durations, search, goal time). */
export function TextField({ value, onChangeText, placeholder, style, multiline, onBlur, inputMode }: {
  value: string; onChangeText: (t: string) => void; placeholder?: string; style?: StyleProp<ViewStyle>; multiline?: boolean; onBlur?: () => void; inputMode?: any;
}) {
  return (
    <View style={[{ backgroundColor: colors.cardRaised, borderRadius: radius.sm, minHeight: 48, paddingHorizontal: 14, justifyContent: 'center' }, style]}>
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textFaint}
        multiline={multiline} onBlur={onBlur} inputMode={inputMode}
        style={{ color: colors.text, fontFamily, fontSize: 16, paddingVertical: multiline ? 12 : 0, minHeight: multiline ? 96 : undefined, textAlignVertical: multiline ? 'top' : 'center', outlineStyle: 'none' } as any}
      />
    </View>
  );
}

/** Round check button with a little pop when it turns on. */
export function CheckButton({ done, onPress, size = 44, color = colors.accent }: { done: boolean; onPress: () => void; size?: number; color?: string }) {
  const pop = useRef(new Animated.Value(1)).current;
  const press = () => {
    tap();
    if (!done) Animated.sequence([
      Animated.spring(pop, { toValue: 1.25, useNativeDriver: true, speed: 50, bounciness: 12 }),
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onPress();
  };
  return (
    <Pressable onPress={press} hitSlop={8}>
      <Animated.View style={{
        width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center',
        backgroundColor: done ? color : 'transparent', borderWidth: done ? 0 : 2, borderColor: colors.stroke, transform: [{ scale: pop }],
      }}>
        <Ionicons name="checkmark" size={size * 0.55} color={done ? colors.accentInk : colors.textFaint} />
      </Animated.View>
    </Pressable>
  );
}

/** 1–10 effort picker as a row of big tappable segments. */
export function EffortPicker({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
        const on = value != null && n <= value;
        return (
          <Pressable key={n} onPress={() => { tap(); onChange(n); }} style={{ flex: 1 }}>
            <View style={{ height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.accent : colors.cardRaised, opacity: on ? 0.55 + n * 0.045 : 1 }}>
              <Text style={[type.small, { color: on ? colors.accentInk : colors.textDim, fontWeight: '700' }]}>{n}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stars({ value, onChange, size = 40 }: { value?: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: size > 20 ? 10 : 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Pressable key={n} disabled={!onChange} onPress={() => { tap(); onChange?.(n); }} hitSlop={4}>
          <Ionicons name={value && n <= value ? 'star' : 'star-outline'} size={size} color={value && n <= value ? colors.streak : colors.textFaint} />
        </Pressable>
      ))}
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: on ? colors.accent : colors.card, borderWidth: 1, borderColor: on ? colors.accent : colors.stroke }}>
      <Text style={[type.small, { color: on ? colors.accentInk : colors.text, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}
