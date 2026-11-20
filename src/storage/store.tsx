import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState as RNAppState, Platform } from 'react-native';
import { AppState } from './types';
import { freshState, loadState, saveState } from './persist';
import { demoState } from './demo';
import { addDays, isoWeekday, startOfDay, toKey, weekKey } from '../lib/dates';
import { absWeekdays } from '../lib/schedule';
import { ABS_PER_WEEK } from '../data/split';

type Ctx = {
  ready: boolean;
  state: AppState;
  today: Date; // local midnight of the current day; flips at midnight
  toggleAbs: (date: Date) => 'added' | 'removed' | 'full';
  toggleFavorite: (ref: string) => void;
  setPartDone: (date: Date, partId: string, done: boolean) => void;
};
const AppCtx = createContext<Ctx>(null as any);

const demoMode = Platform.OS === 'web' && typeof window !== 'undefined' && /[?&]demo=1/.test(window.location.search);

/** Re-renders at local midnight and when the app comes back to the foreground. */
function useToday() {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  useEffect(() => {
    const check = () => setToday(t => (toKey(t) === toKey(new Date()) ? t : startOfDay(new Date())));
    const msToMidnight = addDays(startOfDay(new Date()), 1).getTime() - Date.now() + 500;
    const timer = setTimeout(check, msToMidnight);
    const sub = RNAppState.addEventListener('change', st => st === 'active' && check());
    return () => { clearTimeout(timer); sub.remove(); };
  }, [today]);
  return today;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const today = useToday();
  const [state, setState] = useState<AppState>(() => (demoMode ? demoState(new Date()) : freshState()));
  const [ready, setReady] = useState(demoMode);
  const loaded = useRef(demoMode);

  useEffect(() => {
    if (demoMode) return;
    loadState().then(s => { setState(s); setReady(true); loaded.current = true; });
  }, []);
  useEffect(() => { if (loaded.current && !demoMode) saveState(state); }, [state]);

  const value = useMemo<Ctx>(() => ({
    ready, state, today,
    toggleAbs: (date) => {
      const wk = weekKey(date), wd = isoWeekday(date);
      const cur = absWeekdays(state, date);
      if (cur.includes(wd)) {
        setState(s => ({ ...s, absWeeks: { ...s.absWeeks, [wk]: cur.filter(x => x !== wd) } }));
        return 'removed';
      }
      if (cur.length >= ABS_PER_WEEK) return 'full';
      setState(s => ({ ...s, absWeeks: { ...s.absWeeks, [wk]: [...cur, wd].sort() } }));
      return 'added';
    },
    toggleFavorite: (ref) => setState(s => ({
      ...s, favorites: s.favorites.includes(ref) ? s.favorites.filter(r => r !== ref) : [...s.favorites, ref],
    })),
    setPartDone: (date, partId, done) => {
      if (toKey(date) > toKey(today)) return; // can't complete future days
      const k = toKey(date);
      setState(s => {
        const log = s.logs[k] ?? { parts: {} };
        return { ...s, logs: { ...s.logs, [k]: { ...log, parts: { ...log.parts, [partId]: { done, at: Date.now() } } } } };
      });
    },
  }), [ready, state, today]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
