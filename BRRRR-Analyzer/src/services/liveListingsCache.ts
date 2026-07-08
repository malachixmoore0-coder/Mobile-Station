import { Property } from '@/services/types';

/**
 * Holds the most recent live (RentCast) result set so any screen — not just
 * whichever one issued the fetch — can look a property up by id. Without
 * this, navigating from Discover into a property detail while on live data
 * fails, because the two screens would otherwise have no shared state.
 */

type Listener = (all: Property[]) => void;

class LiveListingsCache {
  private byId = new Map<string, Property>();
  private listeners = new Set<Listener>();

  setAll(props: Property[]) {
    this.byId = new Map(props.map((p) => [p.id, p]));
    this.emit();
  }

  getAll(): Property[] {
    return Array.from(this.byId.values());
  }

  getById(id: string): Property | undefined {
    return this.byId.get(id);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => this.listeners.delete(listener);
  }

  private emit() {
    const all = this.getAll();
    for (const l of this.listeners) l(all);
  }
}

export const liveListingsCache = new LiveListingsCache();
