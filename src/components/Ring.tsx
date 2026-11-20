import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, type } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** WHOOP-style circular gauge. `progress` is 0…1 and animates in on mount and on change. */
export function Ring({ progress, color, size = 76, stroke = 7, children }: {
  progress: number; color: string; size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: Math.max(0, Math.min(1, progress)), duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress]);
  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [c, 0] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.stroke} strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={offset as any} strokeLinecap="round" />
      </Svg>
      {children}
    </View>
  );
}

export function RingStat({ label, value, sub, progress, color }: { label: string; value: string; sub?: string; progress: number; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Ring progress={progress} color={color}>
        <Text style={[type.num, { fontSize: 20 }]}>{value}</Text>
        {sub ? <Text style={[type.small, { fontSize: 11, marginTop: -2 }]}>{sub}</Text> : null}
      </Ring>
      <Text style={[type.label, { fontSize: 10.5, marginTop: 10, color: colors.text }]}>{label}</Text>
    </View>
  );
}
