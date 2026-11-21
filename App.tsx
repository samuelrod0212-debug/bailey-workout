import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/storage/store';
import { ToastProvider } from './src/components/Toast';
import { TabBar, Tab } from './src/components/TabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { HalfMarathonScreen } from './src/screens/HalfMarathonScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { JournalScreen } from './src/screens/JournalScreen';
import { LogScreen, newExtra } from './src/screens/LogScreen';
import { libraryById } from './src/data/halfMarathon';
import { colors } from './src/theme';
import { HideTabBarCtx } from './src/components/TabBarVisibility';

const TAB_IDS: Tab[] = ['home', 'plan', 'half', 'progress', 'journal'];
const urlParam = (name: string) =>
  Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.search.match(new RegExp(`[?&]${name}=([\\w-]+)`))?.[1] : undefined;

function Root() {
  const { ready, today, updateDay } = useApp();
  const [hideTabs, setHideTabs] = useState(false);
  const [tab, setTab] = useState<Tab>(() => (TAB_IDS.includes(urlParam('tab') as Tab) ? (urlParam('tab') as Tab) : 'home'));
  const [logDate, setLogDate] = useState<Date | null>(() => {
    const l = urlParam('log');
    return l === 'today' ? new Date() : l && /^\d{4}-\d{2}-\d{2}$/.test(l) ? new Date(l + 'T00:00') : null;
  });

  const logExtra = (libraryId: string) => {
    const w = libraryById(libraryId);
    if (!w) return;
    updateDay(today, l => ({ ...l, extras: [...(l.extras ?? []), newExtra(w.id, w.name, w.kind)] }));
    setLogDate(today);
  };

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <HideTabBarCtx.Provider value={setHideTabs}>
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {tab === 'home' && <HomeScreen onLog={setLogDate} />}
      {tab === 'plan' && <PlanScreen onLog={setLogDate} />}
      {tab === 'half' && <HalfMarathonScreen onLog={setLogDate} onLogExtra={logExtra} />}
      {tab === 'progress' && <ProgressScreen />}
      {tab === 'journal' && <JournalScreen onEdit={setLogDate} />}
      {!hideTabs ? <TabBar tab={tab} onTab={setTab} /> : null}
      {logDate ? <LogScreen key={logDate.toDateString()} date={logDate} onClose={() => setLogDate(null)} /> : null}
    </View>
    </HideTabBarCtx.Provider>
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
