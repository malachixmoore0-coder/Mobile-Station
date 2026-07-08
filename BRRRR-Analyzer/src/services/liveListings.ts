import { Property, ListingStatus, PropertyType, UnitInfo } from '@/services/types';

/**
 * Live listings client for RentCast (https://www.rentcast.io/api).
 * Not exercised in this build — no API key was available when this app was
 * generated. Wire it up in Settings once you have a key; field mapping below
 * is best-effort against RentCast's public docs and may need small
 * adjustments once you see real payloads (check response shapes in their
 * API reference before relying on this in production).
 *
 * Docs: https://developers.rentcast.io/reference/introduction
 */

const BASE_URL = 'https://api.rentcast.io/v1';
const POLL_MS = 5 * 60_000; // RentCast free/starter tiers have tight monthly call caps — poll slowly.

export interface LiveSearchParams {
  city: string;
  state: string;
  minPrice?: number;
  maxPrice?: number;
}

async function rentcastFetch(path: string, apiKey: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}${path}?${query}`, {
    headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`RentCast request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Maps a RentCast sale-listing record to our internal Property shape. */
function mapListing(raw: any): Property | null {
  const unitCount: number = raw.unitCount ?? raw.units?.length ?? 2;
  if (unitCount < 2) return null; // this app is scoped to multi-family (2+ units)

  const units: UnitInfo[] = (raw.units ?? []).map((u: any, i: number) => ({
    label: u.unitNumber ? `Unit ${u.unitNumber}` : `Unit ${i + 1}`,
    bedrooms: u.bedrooms ?? raw.bedrooms ?? 2,
    bathrooms: u.bathrooms ?? raw.bathrooms ?? 1,
    sqft: u.squareFootage ?? Math.round((raw.squareFootage ?? 1600) / unitCount),
    currentRent: u.rent ?? 0,
    marketRentPostRehab: u.rentEstimate ?? u.rent ?? 0,
    occupied: u.occupied ?? true,
  }));

  const propertyType: PropertyType =
    unitCount >= 5 ? 'Multi-family 5+' : unitCount === 4 ? 'Fourplex' : unitCount === 3 ? 'Triplex' : 'Duplex';

  const status: ListingStatus =
    raw.status === 'Active'
      ? 'Active'
      : raw.status === 'Pending' || raw.status === 'Under Contract'
      ? 'Pending'
      : raw.status === 'Sold' || raw.status === 'Closed'
      ? 'Sold'
      : 'Off Market';

  return {
    id: String(raw.id ?? raw.formattedAddress ?? `${raw.addressLine1}-${raw.zipCode}`),
    address: raw.addressLine1 ?? raw.formattedAddress ?? 'Unknown address',
    city: raw.city ?? '',
    state: raw.state ?? '',
    zip: raw.zipCode ?? '',
    neighborhood: raw.neighborhood ?? raw.subdivision ?? raw.city ?? '',
    propertyType,
    unitCount,
    units: units.length > 0 ? units : [],
    sqftTotal: raw.squareFootage ?? 0,
    lotSqft: raw.lotSize ?? 0,
    yearBuilt: raw.yearBuilt ?? 0,
    price: raw.price ?? raw.listPrice ?? 0,
    originalListPrice: raw.originalListPrice ?? raw.price ?? 0,
    // RentCast doesn't return a post-rehab ARV — approximate from their AVM
    // (raw.valuation / raw.avm) if present, else fall back to list price.
    arvEstimate: raw.avm ?? raw.valuation ?? raw.price ?? 0,
    annualTaxes: raw.propertyTaxes?.[String(new Date().getFullYear() - 1)]?.total ?? raw.taxAssessedValue ?? 0,
    conditionRating: 'Moderate rehab',
    rehabItems: [], // no rehab-scope data from RentCast — user/GC input required
    rehabTimelineMonths: 3,
    photos: raw.photos ?? [],
    status,
    listedDate: raw.listedDate ? Date.parse(raw.listedDate) : Date.now(),
    daysOnMarket: raw.daysOnMarket ?? 0,
    sources: [{ site: 'MLS', url: raw.listingUrl ?? '', listPrice: raw.price ?? 0, lastSeen: Date.now() }],
    transit: { walkScore: 0, transitScore: 0, bikeScore: 0, nearestStop: '', commuteMinutesDowntown: 0 },
    description: raw.description ?? '',
    latitude: raw.latitude ?? 0,
    longitude: raw.longitude ?? 0,
  };
}

export async function fetchLiveListings(apiKey: string, params: LiveSearchParams): Promise<Property[]> {
  const query: Record<string, string> = {
    city: params.city,
    state: params.state,
    status: 'Active',
    propertyType: 'Multi-Family',
    limit: '50',
  };
  // RentCast filters server-side on list price — keeps the payload (and your monthly call quota) tight
  // instead of pulling every multi-family listing in the metro and discarding most of it client-side.
  if (params.minPrice) query.minPrice = String(params.minPrice);
  if (params.maxPrice) query.maxPrice = String(params.maxPrice);
  const raw = await rentcastFetch('/listings/sale', apiKey, query);
  const list: any[] = Array.isArray(raw) ? raw : raw.listings ?? [];
  return list.map(mapListing).filter((p): p is Property => p !== null);
}

export function subscribeLiveListings(
  apiKey: string,
  params: LiveSearchParams,
  onUpdate: (properties: Property[]) => void,
  onError?: (err: Error) => void
): () => void {
  let cancelled = false;

  const poll = async () => {
    try {
      const props = await fetchLiveListings(apiKey, params);
      if (!cancelled) onUpdate(props);
    } catch (err) {
      if (!cancelled) onError?.(err as Error);
    }
  };

  poll();
  const interval = setInterval(poll, POLL_MS);
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}
