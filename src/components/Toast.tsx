import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { colors, type } from '../theme';

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const a = useRef(new Animated.Value(0)).current;
  const timer = useRef<any>(null);
  const show = (m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 18 }).start();
    timer.current = setTimeout(() => Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start(), 2600);
  };
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <Animated.View pointerEvents="none" style={{
        position: 'absolute', left: 20, right: 20, bottom: 120, opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        backgroundColor: colors.cardRaised, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.stroke,
      }}>
        <Text style={[type.body, { fontSize: 15, textAlign: 'center' }]}>{msg}</Text>
      </Animated.View>
    </ToastCtx.Provider>
  );
}
