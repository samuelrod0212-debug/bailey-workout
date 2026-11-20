import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, type } from '../theme';

export function ComingSoon({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Ionicons name={icon} size={44} color={colors.textFaint} />
      <Text style={[type.title, { marginTop: 14 }]}>{title}</Text>
      <Text style={[type.dim, { marginTop: 6, textAlign: 'center' }]}>Coming in the next build, once the look is approved.</Text>
    </View>
  );
}
