import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiKey, setApiKey } from '@/services/apiKeys';
import { NEIGHBORHOODS } from '@/data/mockListings';
import { BrrrrAssumptions, DEFAULT_ASSUMPTIONS } from '@/utils/brrrr';

const STORAGE_KEY = 'brrrr-scout.preferences.v1';
const ASSUMPTIONS_KEY = 'brrrr-scout.assumptions.v1';

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

  assumptions: BrrrrAssumptions;
  updateAssumptions: (patch: Partial<BrrrrAssumptions>) => void;
  resetAssumptions: () => void;

  allNeighborhoods: string[];

  /** The towns actively driving the feed — the "Nearby towns" list, or the
   * primary Market city when none are set. */
  activeTowns: string[];
  /** True when a listing belongs to the region currently selected in Settings.
   * This is the single source of truth for region filtering, so changing the
   * city or towns in Settings immediately re-scopes Discover. */
  matchesActiveRegion: (p: { city: string; neighborhood: string; state: string }) => boolean;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const [rentcastKey, setRentcastKeyState] = useState<string | null>(null);
  const [googlePlacesKey, setGooglePlacesKeyState] = useState<string | null>(null);
  const [forceDemoMode, setForceDemoMode] = useState(false);
  const [assumptions, setAssumptions] = useState<BrrrrAssumptions>(DEFAULT_ASSUMPTIONS);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(raw) });
      } catch {
        // fall back to defaults
      }
      try {
        const rawA = await AsyncStorage.getItem(ASSUMPTIONS_KEY);
        if (rawA) setAssumptions({ ...DEFAULT_ASSUMPTIONS, ...JSON.parse(rawA) });
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

  const updateAssumptions = (patch: Partial<BrrrrAssumptions>) => {
    setAssumptions((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(ASSUMPTIONS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const resetAssumptions = () => {
    setAssumptions(DEFAULT_ASSUMPTIONS);
    AsyncStorage.removeItem(ASSUMPTIONS_KEY).catch(() => {});
  };

  const activeTowns = preferences.targetNeighborhoods;

  const matchesActiveRegion = (p: { city: string; neighborhood: string; state: string }): boolean => {
    const norm = (s: string) => s.trim().toLowerCase();
    const hay = `${norm(p.city)} ${norm(p.neighborhood)}`;

    // When specific towns are chosen, the feed is strictly scoped to them.
    if (activeTowns.length > 0) {
      return activeTowns.some((t) => {
        const town = norm(t);
        return town.length > 0 && (hay.includes(town) || norm(p.neighborhood).includes(town));
      });
    }

    // Otherwise scope to the primary Market city (empty city = no restriction).
    const city = norm(preferences.city);
    if (!city) return true;
    return norm(p.city).includes(city) || city.includes(norm(p.city)) || norm(p.neighborhood).includes(city);
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
        assumptions,
        updateAssumptions,
        resetAssumptions,
        allNeighborhoods: [...NEIGHBORHOODS],
        activeTowns,
        matchesActiveRegion,
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
