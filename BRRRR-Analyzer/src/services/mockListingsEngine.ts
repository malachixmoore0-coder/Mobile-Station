import { MOCK_PROPERTIES } from '@/data/mockListings';
import { Property, ListingStatus } from '@/services/types';

/**
 * Simulates a "live" MLS/aggregator feed on top of the static sample data:
 * days-on-market ticks up, listings occasionally go pending/sold/back-on-market,
 * and source "last seen" timestamps refresh — so the Discover screen behaves
 * like it's polling a real feed even with no API key configured.
 *
 * Swapped out automatically once a RentCast key is set (see listingsProvider.ts).
 */

type Listener = (properties: Property[]) => void;

const TICK_MS = 25_000;

class MockListingsEngine {
  private properties: Property[] = MOCK_PROPERTIES.map((p) => ({ ...p, units: [...p.units], sources: [...p.sources] }));
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;

  getSnapshot(): Property[] {
    return this.properties;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.properties);
    if (!this.timer) {
      this.timer = setInterval(() => this.tick(), TICK_MS);
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    };
  }

  private tick() {
    const idx = Math.floor(Math.random() * this.properties.length);
    const p = this.properties[idx];
    const next: Property = { ...p, sources: p.sources.map((s) => ({ ...s, lastSeen: Date.now() })) };

    if (next.status === 'Active' || next.status === 'Pending') {
      next.daysOnMarket = next.daysOnMarket + 1;
    }

    const roll = Math.random();
    next.status = nextStatus(next.status, roll);

    this.properties = [...this.properties.slice(0, idx), next, ...this.properties.slice(idx + 1)];
    this.emit();
  }

  private emit() {
    for (const l of this.listeners) l(this.properties);
  }
}

function nextStatus(current: ListingStatus, roll: number): ListingStatus {
  if (current === 'Active' && roll < 0.04) return 'Pending';
  if (current === 'Pending' && roll < 0.06) return 'Sold';
  if (current === 'Pending' && roll < 0.1) return 'Active'; // financing fell through
  if (current === 'Off Market' && roll < 0.03) return 'Active'; // relisted
  return current;
}

export const mockListingsEngine = new MockListingsEngine();
