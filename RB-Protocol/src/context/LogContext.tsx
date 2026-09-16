import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayLog, SetLog, emptyDayLog } from '@/types';
import { dateKey, addDays } from '@/utils/date';

const LOGS_KEY = 'rb-protocol.logs.v1';
const DOSES_KEY = 'rb-protocol.doses.v1';

type Logs = Record<string, DayLog>;

interface LogState {
  loaded: boolean;
  /** The day being viewed — Today defaults to the real date but can be scrubbed. */
  activeDate: Date;
  setActiveDate: (d: Date) => void;

  log: DayLog;
  logFor: (key: string) => DayLog;

  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  /** Check or clear a whole block at once. */
  setMany: (ids: string[], done: boolean) => void;

  getSets: (exerciseId: string) => SetLog[];
  updateSet: (exerciseId: string, index: number, patch: Partial<SetLog>) => void;
  clearSets: (exerciseId: string) => void;

  getSite: (syringeId: string) => string | undefined;
  setSite: (syringeId: string, site: string) => void;
  /** Most recent site used for a syringe across all past days, for rotation. */
  lastSite: (syringeId: string) => { site: string; daysAgo: number } | undefined;

  water: number;
  addWater: (n: number) => void;

  bodyWeight: string | undefined;
  setBodyWeight: (w: string) => void;
  /** Body weight entries, newest first. */
  weightHistory: { key: string; weight: string }[];

  notes: string;
  setNotes: (n: string) => void;

  /** User-entered injectable doses, keyed by stack entry id. */
  doses: Record<string, string>;
  setDose: (id: string, dose: string) => void;

  /** Fraction 0-1 of the supplied ids completed on the active day. */
  completion: (ids: string[]) => number;
  completionOn: (key: string, ids: string[]) => number;
  resetDay: () => void;
  clearAll: () => void;
}

const Ctx = createContext<LogState | null>(null);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<Logs>({});
  const [doses, setDoses] = useState<Record<string, string>>({});
  const [activeDate, setActiveDate] = useState(new Date());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawLogs, rawDoses] = await Promise.all([
          AsyncStorage.getItem(LOGS_KEY),
          AsyncStorage.getItem(DOSES_KEY),
        ]);
        if (rawLogs) setLogs(migrate(JSON.parse(rawLogs)));
        if (rawDoses) setDoses(JSON.parse(rawDoses));
      } catch {
        // Corrupt or missing storage just starts a fresh log.
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs)).catch(() => {});
  }, [logs, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(DOSES_KEY, JSON.stringify(doses)).catch(() => {});
  }, [doses, loaded]);

  const key = dateKey(activeDate);
  const log = logs[key] ?? emptyDayLog();

  const patchDay = useCallback(
    (k: string, patch: (d: DayLog) => DayLog) => {
      setLogs((prev) => ({ ...prev, [k]: patch(prev[k] ?? emptyDayLog()) }));
    },
    []
  );

  const value = useMemo<LogState>(() => {
    const logFor = (k: string) => logs[k] ?? emptyDayLog();
    const completionOn = (k: string, ids: string[]) => {
      if (ids.length === 0) return 0;
      const done = logFor(k).done;
      return ids.filter((id) => done.includes(id)).length / ids.length;
    };

    return {
      loaded,
      activeDate,
      setActiveDate,
      log,
      logFor,

      isDone: (id) => log.done.includes(id),
      toggle: (id) =>
        patchDay(key, (d) => ({
          ...d,
          done: d.done.includes(id) ? d.done.filter((x) => x !== id) : [...d.done, id],
        })),
      setMany: (ids, done) =>
        patchDay(key, (d) => ({
          ...d,
          done: done
            ? Array.from(new Set([...d.done, ...ids]))
            : d.done.filter((x) => !ids.includes(x)),
        })),

      getSets: (exerciseId) => log.sets[exerciseId] ?? [],
      updateSet: (exerciseId, index, patch) =>
        patchDay(key, (d) => {
          const existing = d.sets[exerciseId] ?? [];
          const next = [...existing];
          while (next.length <= index) next.push({ weight: '', reps: '' });
          next[index] = { ...next[index], ...patch };
          return { ...d, sets: { ...d.sets, [exerciseId]: next } };
        }),
      clearSets: (exerciseId) =>
        patchDay(key, (d) => {
          const next = { ...d.sets };
          delete next[exerciseId];
          return { ...d, sets: next };
        }),

      getSite: (syringeId) => log.sites[syringeId],
      setSite: (syringeId, site) =>
        patchDay(key, (d) => ({ ...d, sites: { ...d.sites, [syringeId]: site } })),
      lastSite: (syringeId) => {
        for (let back = 1; back <= 30; back++) {
          const k = dateKey(addDays(activeDate, -back));
          const site = logs[k]?.sites?.[syringeId];
          if (site) return { site, daysAgo: back };
        }
        return undefined;
      },

      water: log.water,
      addWater: (n) => patchDay(key, (d) => ({ ...d, water: Math.max(0, d.water + n) })),

      bodyWeight: log.weight,
      setBodyWeight: (w) => patchDay(key, (d) => ({ ...d, weight: w })),
      weightHistory: Object.entries(logs)
        .filter(([, d]) => !!d.weight)
        .map(([k, d]) => ({ key: k, weight: d.weight as string }))
        .sort((a, b) => (a.key < b.key ? 1 : -1)),

      notes: log.notes ?? '',
      setNotes: (n) => patchDay(key, (d) => ({ ...d, notes: n })),

      doses,
      setDose: (id, dose) => setDoses((prev) => ({ ...prev, [id]: dose })),

      completion: (ids) => completionOn(key, ids),
      completionOn,
      resetDay: () => setLogs((prev) => ({ ...prev, [key]: emptyDayLog() })),
      clearAll: () => {
        setLogs({});
        setDoses({});
      },
    };
  }, [loaded, activeDate, log, logs, doses, key, patchDay]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLog(): LogState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLog must be used inside LogProvider');
  return ctx;
}

/** Older day logs may predate fields added later; fill them in on load. */
function migrate(raw: Record<string, Partial<DayLog>>): Logs {
  const out: Logs = {};
  for (const [k, d] of Object.entries(raw)) {
    if (!d) continue;
    out[k] = {
      done: d.done ?? [],
      sets: d.sets ?? {},
      sites: d.sites ?? {},
      water: d.water ?? 0,
      weight: d.weight,
      notes: d.notes,
    };
  }
  return out;
}
