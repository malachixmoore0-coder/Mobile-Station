export type ListingStatus = 'Active' | 'Pending' | 'Sold' | 'Off Market';

export type ListingSourceSite =
  | 'MLS'
  | 'Zillow'
  | 'Realtor.com'
  | 'Redfin'
  | 'FSBO'
  | 'Auction.com';

export interface ListingSource {
  site: ListingSourceSite;
  url: string;
  listPrice: number;
  lastSeen: number; // epoch ms
}

export type PropertyType = 'Duplex' | 'Triplex' | 'Fourplex' | 'Multi-family 5+';

export interface UnitInfo {
  label: string; // "Unit A"
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  currentRent: number; // 0 if vacant
  marketRentPostRehab: number;
  occupied: boolean;
}

export type TradeCategory =
  | 'General Contractor'
  | 'Roofing'
  | 'Electrical'
  | 'Plumbing'
  | 'HVAC'
  | 'Flooring'
  | 'Kitchen & Bath'
  | 'Painting'
  | 'Foundation'
  | 'Windows & Doors'
  | 'Landscaping';

export type RehabPriority = 'critical' | 'recommended' | 'cosmetic';

export interface RehabItem {
  id: string;
  trade: TradeCategory;
  description: string;
  estCostLow: number;
  estCostHigh: number;
  priority: RehabPriority;
}

export interface TransitInfo {
  walkScore: number; // 0-100
  transitScore: number; // 0-100
  bikeScore: number; // 0-100
  nearestStop: string;
  commuteMinutesDowntown: number;
}

export interface Property {
  id: string;
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string;
  propertyType: PropertyType;
  unitCount: number;
  units: UnitInfo[];
  sqftTotal: number;
  lotSqft: number;
  yearBuilt: number;
  price: number; // current asking price
  originalListPrice: number;
  arvEstimate: number; // after-repair value
  annualTaxes: number;
  conditionRating: 'Turnkey' | 'Light rehab' | 'Moderate rehab' | 'Heavy rehab';
  rehabItems: RehabItem[];
  rehabTimelineMonths: number;
  photos: string[];
  status: ListingStatus;
  listedDate: number; // epoch ms
  daysOnMarket: number;
  sources: ListingSource[];
  transit: TransitInfo;
  description: string;
  latitude: number;
  longitude: number;
}

export type PriceTier = 1 | 2 | 3;

export interface Contractor {
  id: string;
  name: string;
  trades: TradeCategory[];
  rating: number; // 0-5
  reviewCount: number;
  priceTier: PriceTier;
  yearsInBusiness: number;
  licensed: boolean;
  insured: boolean;
  licenseNumber: string;
  neighborhoodsServed: string[];
  phone: string;
  website: string;
  responseTimeHours: number;
  bio: string;
}

export interface SearchFilters {
  minPrice: number;
  maxPrice: number;
  neighborhoods: string[]; // empty = all
  minUnits: number;
  maxUnits: number;
  minTransitScore: number;
  minBrrrrScore: number;
  status: ListingStatus[]; // empty = all
  sortBy: 'brrrrScore' | 'price' | 'daysOnMarket' | 'cashFlow';
}

export const DEFAULT_FILTERS: SearchFilters = {
  minPrice: 0,
  maxPrice: 2_000_000,
  neighborhoods: [],
  minUnits: 2,
  maxUnits: 20,
  minTransitScore: 0,
  minBrrrrScore: 0,
  status: ['Active', 'Pending'],
  sortBy: 'brrrrScore',
};
