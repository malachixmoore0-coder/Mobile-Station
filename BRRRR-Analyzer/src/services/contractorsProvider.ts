import { useEffect, useState } from 'react';
import { Contractor, TradeCategory } from '@/services/types';
import { MOCK_CONTRACTORS } from '@/data/mockContractors';
import { fetchLiveContractors } from '@/services/liveContractors';
import { useSettings } from '@/context/SettingsContext';

/** Higher is better: rewards strong ratings at a lower price tier. */
export function costEfficiencyScore(c: Contractor): number {
  return Math.round((c.rating / c.priceTier) * 20);
}

export function contractorsForTrade(all: Contractor[], trade: TradeCategory, neighborhood?: string): Contractor[] {
  const matches = all.filter((c) => c.trades.includes(trade));
  const scoped = neighborhood
    ? matches.filter((c) => c.neighborhoodsServed.length === 0 || c.neighborhoodsServed.includes(neighborhood))
    : matches;
  const pool = scoped.length > 0 ? scoped : matches;
  return [...pool].sort((a, b) => costEfficiencyScore(b) - costEfficiencyScore(a));
}

interface UseContractorsResult {
  contractors: Contractor[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
}

export function useContractors(tradesNeeded: TradeCategory[]): UseContractorsResult {
  const { googlePlacesKey, forceDemoMode, preferences } = useSettings();
  const [contractors, setContractors] = useState<Contractor[]>(MOCK_CONTRACTORS);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useLive = !!googlePlacesKey && !forceDemoMode && tradesNeeded.length > 0;
  const tradesKey = tradesNeeded.join(',');

  useEffect(() => {
    if (!useLive || !googlePlacesKey) {
      setIsLive(false);
      setContractors(MOCK_CONTRACTORS);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchLiveContractors(googlePlacesKey, tradesNeeded, `${preferences.city}, ${preferences.state}`)
      .then((results) => {
        if (cancelled) return;
        setIsLive(true);
        setContractors(results);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setIsLive(false);
        setContractors(MOCK_CONTRACTORS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLive, googlePlacesKey, tradesKey, preferences.city, preferences.state]);

  return { contractors, isLive, loading, error };
}
