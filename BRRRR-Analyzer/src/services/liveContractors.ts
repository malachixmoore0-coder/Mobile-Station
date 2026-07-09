import { Contractor, PriceTier, TradeCategory } from '@/services/types';

/**
 * Live contractor directory client for the Places API (New) —
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 * Not exercised in this build — no API key was available when this app was
 * generated. Wire it up in Settings once you have one. Google Places has no
 * concept of "trade" or "license/insurance," so each trade is queried as a
 * separate text search and the licensing fields are left for the user/GC to
 * verify manually — treat `licensed`/`insured` here as unverified defaults.
 */

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

const FIELD_MASK = [
  'places.displayName',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.id',
].join(',');

function priceLevelToTier(level: string | undefined): PriceTier {
  switch (level) {
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 1;
    case 'PRICE_LEVEL_MODERATE':
      return 2;
    case 'PRICE_LEVEL_EXPENSIVE':
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 3;
    default:
      return 2;
  }
}

async function searchTrade(apiKey: string, trade: TradeCategory, cityState: string): Promise<Contractor[]> {
  const res = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: `${trade} contractor near ${cityState}` }),
  });
  if (!res.ok) {
    throw new Error(`Google Places request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const places = data.places ?? [];
  return places.map(
    (p: any): Contractor => ({
      id: p.id,
      name: p.displayName?.text ?? 'Unknown contractor',
      trades: [trade],
      rating: p.rating ?? 0,
      reviewCount: p.userRatingCount ?? 0,
      priceTier: priceLevelToTier(p.priceLevel),
      yearsInBusiness: 0, // not available from Places
      licensed: false, // unverified — confirm directly before hiring
      insured: false, // unverified — confirm directly before hiring
      licenseNumber: 'Unverified — confirm with contractor',
      neighborhoodsServed: [],
      phone: p.nationalPhoneNumber ?? '',
      website: p.websiteUri ?? '',
      responseTimeHours: 0,
      bio: '',
    })
  );
}

export async function fetchLiveContractors(
  apiKey: string,
  trades: TradeCategory[],
  cityState: string
): Promise<Contractor[]> {
  const results = await Promise.all(trades.map((t) => searchTrade(apiKey, t, cityState)));
  return results.flat();
}

/** Fetches one raw, unmapped Places result for the Settings debug tool — see fetchRawSample in liveListings.ts. */
export async function fetchRawContractorSample(apiKey: string, trade: TradeCategory, cityState: string): Promise<any> {
  const res = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      // Request every field for the debug view, not just the trimmed mask used for real fetches.
      'X-Goog-FieldMask': '*',
    },
    body: JSON.stringify({ textQuery: `${trade} contractor near ${cityState}` }),
  });
  if (!res.ok) {
    throw new Error(`Google Places request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.places?.[0] ?? data;
}
