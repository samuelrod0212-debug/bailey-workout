// On-device persistence. Everything is a single JSON blob in AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from './types';
import { toKey } from '../lib/dates';
import { DEFAULT_EASY_RUN_WEEKDAY } from '../data/halfMarathon';

const KEY = 'core-workout/state/v1';

export const freshState = (): AppState => ({
  version: 1, startDate: toKey(new Date()), logs: {}, absWeeks: {}, favorites: [], weighIns: [], unit: 'lb',
  hm: { startDate: null, easyRunWeekday: DEFAULT_EASY_RUN_WEEKDAY },
});

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return freshState();
    const fresh = freshState();
    const saved = JSON.parse(raw);
    return { ...fresh, ...saved, hm: { ...fresh.hm, ...(saved.hm ?? {}) } };
  } catch {
    return freshState();
  }
}

export async function saveState(s: AppState) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
