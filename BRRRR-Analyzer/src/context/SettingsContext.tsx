import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiKey, setApiKey } from '@/services/apiKeys';
import { NEIGHBORHOODS } from '@/data/mockListings';

const STORAGE_KEY = 'brrrr-scout.preferences.v1';

export interface Preferences {
  city: string;
  state: string;
  minBudget: number;
  maxBudget: number;
  targetNeighborhoods: string[]; // empty = all
  minUnits: number;
  minTransitScore: number;
  onboarded: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  city: 'Columbus',
  state: 'OH',
  minBudget: 75_000,
  maxBudget: 350_000,
  targetNeighborhoods: [],
  minUnits: 2,
  minTransitScore: 0,
  onboarded: false,
};

interface SettingsState {
  preferences: Preferences;
  updatePreferences: (patch: Partial<Preferences>) => void;
  loaded: boolean;

  rentcastKey: string | null;
  googlePlacesKey: string | null;
  setRentcastKey: (key: string) => Promise<void>;
  setGooglePlacesKey: (key: string) => Promise<void>;

  forceDemoMode: boolean;
  setForceDemoMode: (v: boolean) => void;

  allNeighborhoods: string[];
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const [rentcastKey, setRentcastKeyState] = useState<string | null>(null);
  const [googlePlacesKey, setGooglePlacesKeyState] = useState<string | null>(null);
  const [forceDemoMode, setForceDemoMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
      } catch {
        // fall back to defaults
      }
      const [rc, gp] = await Promise.all([getApiKey('rentcast'), getApiKey('googlePlaces')]);
      setRentcastKeyState(rc);
      setGooglePlacesKeyState(gp);
      setLoaded(true);
    })();
  }, []);

  const updatePreferences = (patch: Partial<Preferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setRentcastKey = async (key: string) => {
    await setApiKey('rentcast', key);
    setRentcastKeyState(key || null);
  };

  const setGooglePlacesKey = async (key: string) => {
    await setApiKey('googlePlaces', key);
    setGooglePlacesKeyState(key || null);
  };

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        updatePreferences,
        loaded,
        rentcastKey,
        googlePlacesKey,
        setRentcastKey,
        setGooglePlacesKey,
        forceDemoMode,
        setForceDemoMode,
        allNeighborhoods: [...NEIGHBORHOODS],
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
