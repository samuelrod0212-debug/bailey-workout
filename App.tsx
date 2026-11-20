import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/storage/store';
import { ToastProvider, useToast } from './src/components/Toast';
import { TabBar, Tab } from './src/components/TabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { ComingSoon } from './src/screens/ComingSoon';
import { colors } from './src/theme';

const initialTab = (): Tab => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const m = window.location.search.match(/[?&]tab=(\w+)/);
    if (m && ['home', 'plan', 'progress', 'journal'].includes(m[1])) return m[1] as Tab;
  }
  return 'home';
};

function Root() {
  const { ready } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>(initialTab);
  const start = () => toast('The workout screen is next, once you approve this look.');
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {tab === 'home' && <HomeScreen onStart={start} />}
      {tab === 'plan' && <PlanScreen />}
      {tab === 'progress' && <ComingSoon title="Progress" icon="stats-chart-outline" />}
      {tab === 'journal' && <ComingSoon title="Journal" icon="book-outline" />}
      <TabBar tab={tab} onTab={setTab} onStart={start} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <AppProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <Root />
        </ToastProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
