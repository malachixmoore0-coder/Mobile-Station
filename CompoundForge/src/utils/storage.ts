import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '@/types';

const KEY = '@compoundforge/state/v1';

export async function loadState(): Promise<Partial<AppState> | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveState(state: Partial<AppState>): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // best-effort persistence; ignore write failures
  }
}
