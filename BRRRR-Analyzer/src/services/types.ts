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
  /** True when unit rent couldn't be pulled from the data source and was estimated instead. */
  rentEstimated?: boolean;
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

/** Per-property corrections you make once you've actually looked at the deal —
 * overrides the listing's own numbers wherever set. */
export interface PropertyOverride {
  offerPrice?: number;
  arvOverride?: number;
  customRehabItems?: RehabItem[];
  notes?: string;
}

export type DealStage =
  | 'watching'
  | 'offer_made'
  | 'under_contract'
  | 'rehabbing'
  | 'refinanced'
  | 'stabilized';

export const DEAL_STAGES: DealStage[] = [
  'watching',
  'offer_made',
  'under_contract',
  'rehabbing',
  'refinanced',
  'stabilized',
];

export const DEAL_STAGE_LABEL: Record<DealStage, string> = {
  watching: 'Watching',
  offer_made: 'Offer made',
  under_contract: 'Under contract',
  rehabbing: 'Rehabbing',
  refinanced: 'Refinanced',
  stabilized: 'Stabilized',
};

/** Who a contact is on a given deal. Owners are freeform (seller/agent), while
 * contractors and lenders are resolved from their respective directories. */
export type ContactType = 'owner' | 'contractor' | 'lender';

/** A contact uniquely linked to a single property/deal. The same underlying
 * contractor or lender can be assigned to many deals, but each deal keeps its
 * own independent list — nothing is shared across properties. */
export interface AssignedContact {
  id: string; // contractor.id / lender.id / generated id for owners
  type: ContactType;
  name: string;
  phone?: string;
  role?: string; // trade for a contractor, category for a lender, freeform for an owner
  assignedAt: number;
}

export interface DealRecord {
  stage: DealStage;
  stageHistory: { stage: DealStage; at: number }[];
  checkedSteps: string[];
  override: PropertyOverride;
  /** Owners, contractors, and lenders assigned specifically to THIS property. */
  contacts: AssignedContact[];
}

export type LenderCategory = 'Hard Money / Bridge' | 'DSCR Refinance' | 'Conventional / Bank' | 'Portfolio Lender';

export interface Lender {
  id: string;
  name: string;
  categories: LenderCategory[];
  rating: number;
  reviewCount: number;
  ratesFromPct: number;
  maxLtvPct: number;
  pointsFrom: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  closingTimelineDays: number;
  statesServed: string[];
  phone: string;
  website: string;
  bio: string;
}

/** Applies your overrides on top of a listing's own numbers for analysis purposes. */
export function applyOverride(property: Property, override: PropertyOverride | undefined): Property {
  if (!override) return property;
  return {
    ...property,
    price: override.offerPrice ?? property.price,
    arvEstimate: override.arvOverride ?? property.arvEstimate,
    rehabItems: override.customRehabItems ?? property.rehabItems,
  };
}
