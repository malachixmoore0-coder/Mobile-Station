import { useEffect, useMemo, useState } from 'react';
import { Property, SearchFilters } from '@/services/types';
import { mockListingsEngine } from '@/services/mockListingsEngine';
import { subscribeLiveListings } from '@/services/liveListings';
import { useSettings } from '@/context/SettingsContext';
import { analyzeBrrrr } from '@/utils/brrrr';

export function applyFilters(properties: Property[], filters: SearchFilters): Property[] {
  const filtered = properties.filter((p) => {
    if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
    if (p.unitCount < filters.minUnits || p.unitCount > filters.maxUnits) return false;
    if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(p.neighborhood)) return false;
    if (p.transit.transitScore < filters.minTransitScore) return false;
    if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;
    if (filters.minBrrrrScore > 0 && analyzeBrrrr(p).score < filters.minBrrrrScore) return false;
    return true;
  });

  const withScore = filtered.map((p) => ({ property: p, analysis: analyzeBrrrr(p) }));
  withScore.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price':
        return a.property.price - b.property.price;
      case 'daysOnMarket':
        return b.property.daysOnMarket - a.property.daysOnMarket;
      case 'cashFlow':
        return b.analysis.monthlyCashFlow - a.analysis.monthlyCashFlow;
      case 'brrrrScore':
      default:
        return b.analysis.score - a.analysis.score;
    }
  });
  return withScore.map((w) => w.property);
}

interface UseListingsResult {
  properties: Property[];
  allCount: number;
  isLive: boolean;
  loading: boolean;
  lastUpdated: number;
  error: string | null;
}

export function useListings(filters: SearchFilters): UseListingsResult {
  const { rentcastKey, forceDemoMode, preferences } = useSettings();
  const [all, setAll] = useState<Property[]>(mockListingsEngine.getSnapshot());
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  const useLive = !!rentcastKey && !forceDemoMode;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (useLive && rentcastKey) {
      setIsLive(true);
      const unsub = subscribeLiveListings(
        rentcastKey,
        { city: preferences.city, state: preferences.state },
        (props) => {
          if (cancelled) return;
          setAll(props);
          setLastUpdated(Date.now());
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          setError(err.message);
          setLoading(false);
        }
      );
      return () => {
        cancelled = true;
        unsub();
      };
    }

    setIsLive(false);
    const unsub = mockListingsEngine.subscribe((props) => {
      if (cancelled) return;
      setAll(props);
      setLastUpdated(Date.now());
      setLoading(false);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [useLive, rentcastKey, preferences.city, preferences.state]);

  const properties = useMemo(() => applyFilters(all, filters), [all, filters]);

  return { properties, allCount: all.length, isLive, loading, lastUpdated, error };
}

export function getPropertyById(id: string): Property | undefined {
  return mockListingsEngine.getSnapshot().find((p) => p.id === id);
}

export function usePropertyById(id: string): Property | undefined {
  const [property, setProperty] = useState<Property | undefined>(() => getPropertyById(id));

  useEffect(() => {
    const unsub = mockListingsEngine.subscribe((props) => {
      setProperty(props.find((p) => p.id === id));
    });
    return unsub;
  }, [id]);

  return property;
}
