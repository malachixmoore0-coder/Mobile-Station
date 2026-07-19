import { Tier } from '@/types';

export const TIERS: Tier[] = [
  { id: 'seed', name: 'Seed', min: 0, max: 99.99, color: '#3DFCB0', secondary: '#1FB983', glow: 'rgba(61,252,176,0.55)', detail: 0 },
  { id: 'sprout', name: 'Sprout', min: 100, max: 249.99, color: '#2FE0C0', secondary: '#18B8A6', glow: 'rgba(47,224,192,0.55)', detail: 0 },
  { id: 'sapling', name: 'Sapling', min: 250, max: 499.99, color: '#33D6FF', secondary: '#1E9FCC', glow: 'rgba(51,214,255,0.55)', detail: 1 },
  { id: 'bloom', name: 'Bloom', min: 500, max: 999.99, color: '#4DA8FF', secondary: '#2E74D9', glow: 'rgba(77,168,255,0.55)', detail: 1 },
  { id: 'grove', name: 'Grove', min: 1000, max: 2499.99, color: '#6A8CFF', secondary: '#4457D9', glow: 'rgba(106,140,255,0.55)', detail: 1 },
  { id: 'forge', name: 'Forge', min: 2500, max: 4999.99, color: '#8B5CF6', secondary: '#6D28D9', glow: 'rgba(139,92,246,0.55)', detail: 2 },
  { id: 'vault', name: 'Vault', min: 5000, max: 9999.99, color: '#B266F0', secondary: '#8A2EE0', glow: 'rgba(178,102,240,0.55)', detail: 2 },
  { id: 'bastion', name: 'Bastion', min: 10000, max: 24999.99, color: '#E056C8', secondary: '#B01F9E', glow: 'rgba(224,86,200,0.55)', detail: 2 },
  { id: 'citadel', name: 'Citadel', min: 25000, max: 49999.99, color: '#FF66A3', secondary: '#E0245F', glow: 'rgba(255,102,163,0.55)', detail: 3 },
  { id: 'summit', name: 'Summit', min: 50000, max: 99999.99, color: '#FF8A5B', secondary: '#E0511F', glow: 'rgba(255,138,91,0.55)', detail: 3 },
  { id: 'apex', name: 'Apex', min: 100000, max: null, color: '#FFC24B', secondary: '#E29A1F', glow: 'rgba(255,194,75,0.6)', detail: 4 },
];

export function getTier(balance: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (balance >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export function getTierIndex(balance: number): number {
  return TIERS.findIndex((t) => t.id === getTier(balance).id);
}

export function getNextTier(balance: number): Tier | null {
  const idx = getTierIndex(balance);
  return idx >= 0 && idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

export function tierProgress(balance: number): number {
  const tier = getTier(balance);
  if (tier.max === null) return 1;
  const span = tier.max - tier.min;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (balance - tier.min) / span));
}
