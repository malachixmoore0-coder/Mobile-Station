import { useEffect, useMemo, useState } from 'react';
import { applyOverride, DealRecord, Property, SearchFilters } from '@/services/types';
import { mockListingsEngine } from '@/services/mockListingsEngine';
import { liveListingsCache } from '@/services/liveListingsCache';
import { subscribeLiveListings } from '@/services/liveListings';
import { useSettings } from '@/context/SettingsContext';
import { usePortfolio } from '@/context/PortfolioContext';
import { analyzeBrrrr, BrrrrAssumptions, DEFAULT_ASSUMPTIONS } from '@/utils/brrrr';

/** Folds your saved edits (offer price, ARV, rehab scope) back into the base listings. */
export function withOverrides(properties: Property[], deals: Record<string, DealRecord>): Property[] {
  return properties.map((p) => (deals[p.id] ? applyOverride(p, deals[p.id].override) : p));
}

export function applyFilters(
  properties: Property[],
  filters: SearchFilters,
  assumptions: BrrrrAssumptions = DEFAULT_ASSUMPTIONS
): Property[] {
  const filtered = properties.filter((p) => {
    if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
    if (p.unitCount < filters.minUnits || p.unitCount > filters.maxUnits) return false;
    if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(p.neighborhood)) return false;
    if (p.transit.transitScore < filters.minTransitScore) return false;
    if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;
    if (filters.minBrrrrScore > 0 && analyzeBrrrr(p, assumptions).score < filters.minBrrrrScore) return false;
    return true;
  });

  const withScore = filtered.map((p) => ({ property: p, analysis: analyzeBrrrr(p, assumptions) }));
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
  const { rentcastKey, forceDemoMode, preferences, assumptions } = useSettings();
  const { deals } = usePortfolio();
  const [all, setAll] = useState<Property[]>(mockListingsEngine.getSnapshot());
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  const useLive = !!rentcastKey && !forceDemoMode;
  // Search the primary Market city plus every configured "nearby town" — otherwise picking
  // a different town in Filters just re-filters the same single-city result set and never
  // actually finds anything new.
  const cities = [preferences.city, ...preferences.targetNeighborhoods];
  const citiesKey = cities.join('|');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (useLive && rentcastKey) {
      setIsLive(true);
      const unsub = subscribeLiveListings(
        rentcastKey,
        { cities, state: preferences.state, minPrice: filters.minPrice, maxPrice: filters.maxPrice },
        (props) => {
          if (cancelled) return;
          setAll(props);
          liveListingsCache.setAll(props);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLive, rentcastKey, citiesKey, preferences.state, filters.minPrice, filters.maxPrice]);

  const properties = useMemo(
    () => applyFilters(withOverrides(all, deals), filters, assumptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, filters, assumptions, deals]
  );

  return { properties, allCount: all.length, isLive, loading, lastUpdated, error };
}

export function getPropertyById(id: string): Property | undefined {
  return mockListingsEngine.getSnapshot().find((p) => p.id === id) ?? liveListingsCache.getById(id);
}

export function usePropertyById(id: string): Property | undefined {
  const [property, setProperty] = useState<Property | undefined>(() => getPropertyById(id));

  useEffect(() => {
    setProperty(getPropertyById(id));
    const unsubMock = mockListingsEngine.subscribe((props) => {
      const found = props.find((p) => p.id === id);
      if (found) setProperty(found);
    });
    const unsubLive = liveListingsCache.subscribe((props) => {
      const found = props.find((p) => p.id === id);
      if (found) setProperty(found);
    });
    return () => {
      unsubMock();
      unsubLive();
    };
  }, [id]);

  return property;
}
