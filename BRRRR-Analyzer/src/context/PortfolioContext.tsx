import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AssignedContact, ContactType, DealRecord, DealStage, PropertyOverride } from '@/services/types';
import { MOCK_CONTRACTORS } from '@/data/mockContractors';
import { MOCK_LENDERS } from '@/data/mockLenders';

const STORAGE_KEY = 'brrrr-scout.deals.v2';

function newDeal(stage: DealStage = 'watching'): DealRecord {
  return { stage, stageHistory: [{ stage, at: Date.now() }], checkedSteps: [], override: {}, contacts: [] };
}

/**
 * Older persisted records predate a couple of fields (contacts, and in the
 * earliest builds checkedSteps). Normalize every deal on load so the rest of
 * the app can assume the full shape without defensive `?? []` everywhere.
 */
function migrate(raw: Record<string, Partial<DealRecord>>): Record<string, DealRecord> {
  const out: Record<string, DealRecord> = {};
  for (const [id, d] of Object.entries(raw)) {
    if (!d) continue;
    out[id] = {
      stage: d.stage ?? 'watching',
      stageHistory: d.stageHistory ?? [{ stage: d.stage ?? 'watching', at: Date.now() }],
      checkedSteps: d.checkedSteps ?? [],
      override: d.override ?? {},
      contacts: d.contacts ?? [],
    };
  }
  return out;
}

/** Resolve a contractor/lender id to a displayable contact from the directories. */
function resolveDirectoryContact(contactId: string, type: ContactType): AssignedContact | null {
  if (type === 'contractor') {
    const c = MOCK_CONTRACTORS.find((x) => x.id === contactId);
    if (c) return { id: c.id, type, name: c.name, phone: c.phone, role: c.trades[0], assignedAt: Date.now() };
  }
  if (type === 'lender') {
    const l = MOCK_LENDERS.find((x) => x.id === contactId);
    if (l) return { id: l.id, type, name: l.name, phone: l.phone, role: l.categories[0], assignedAt: Date.now() };
  }
  return null;
}

interface PortfolioState {
  deals: Record<string, DealRecord>;
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;

  getStage: (id: string) => DealStage | undefined;
  setStage: (id: string, stage: DealStage) => void;

  // --- Per-property BRRRR checklist (each property is fully independent) ---
  /** Toggle a single checklist item for one property. `stage` is the plan phase
   * (Buy/Rehab/Rent/Refinance/Repeat) the item belongs to — accepted for clarity
   * and future grouping; item ids are already globally unique so completion is
   * keyed by `itemId`. Changing Property A never touches Property B. */
  toggleChecklistItem: (propertyId: string, stage: string, itemId: string) => void;
  isChecklistItemDone: (propertyId: string, itemId: string) => boolean;
  /** Back-compat aliases for the older step API. */
  toggleStep: (id: string, stepId: string) => void;
  isStepChecked: (id: string, stepId: string) => boolean;

  // --- Per-property contacts (owners, contractors, lenders) ---
  getContacts: (propertyId: string) => AssignedContact[];
  isContactAssigned: (propertyId: string, contactId: string) => boolean;
  /** Assign a contact to a specific property. Pass `details` to supply the
   * name/phone/role directly (required for owners and for live-API contractors
   * that aren't in the local directory); otherwise it's resolved from the
   * contractor/lender directories by id. Lazily creates the deal record. */
  assignContactToProperty: (
    propertyId: string,
    contactId: string,
    contactType: ContactType,
    details?: { name?: string; phone?: string; role?: string }
  ) => void;
  /** Convenience for freeform owner/seller/agent contacts (not in any directory). */
  addOwnerContact: (propertyId: string, name: string, phone?: string, role?: string) => void;
  unassignContact: (propertyId: string, contactId: string) => void;

  getOverride: (id: string) => PropertyOverride;
  setOverride: (id: string, patch: PropertyOverride) => void;

  loaded: boolean;
}

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Record<string, DealRecord>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDeals(migrate(JSON.parse(raw)));
      } catch {
        // fall back to empty pipeline
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Single source of truth for writes: update state AND persist together so the
  // pipeline, checklists, and contacts survive a reload with no extra effects.
  const persist = (next: Record<string, DealRecord>) => {
    setDeals(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const isSaved = (id: string) => !!deals[id];

  const toggleSaved = (id: string) => {
    const next = { ...deals };
    if (next[id]) {
      delete next[id];
    } else {
      next[id] = newDeal();
    }
    persist(next);
  };

  const getStage = (id: string) => deals[id]?.stage;

  const setStage = (id: string, stage: DealStage) => {
    const current = deals[id] ?? newDeal(stage);
    if (current.stage === stage && deals[id]) return;
    persist({
      ...deals,
      [id]: { ...current, stage, stageHistory: [...current.stageHistory, { stage, at: Date.now() }] },
    });
  };

  // ---- Checklist ----
  const isChecklistItemDone = (propertyId: string, itemId: string) =>
    !!deals[propertyId]?.checkedSteps.includes(itemId);

  const toggleChecklistItem = (propertyId: string, _stage: string, itemId: string) => {
    const current = deals[propertyId] ?? newDeal();
    const checked = current.checkedSteps.includes(itemId)
      ? current.checkedSteps.filter((s) => s !== itemId)
      : [...current.checkedSteps, itemId];
    persist({ ...deals, [propertyId]: { ...current, checkedSteps: checked } });
  };

  // Back-compat aliases (older callers passed only id + stepId).
  const isStepChecked = (id: string, stepId: string) => isChecklistItemDone(id, stepId);
  const toggleStep = (id: string, stepId: string) => toggleChecklistItem(id, '', stepId);

  // ---- Contacts ----
  const getContacts = (propertyId: string) => deals[propertyId]?.contacts ?? [];

  const isContactAssigned = (propertyId: string, contactId: string) =>
    !!deals[propertyId]?.contacts.some((c) => c.id === contactId);

  const assignContactToProperty = (
    propertyId: string,
    contactId: string,
    contactType: ContactType,
    details?: { name?: string; phone?: string; role?: string }
  ) => {
    const current = deals[propertyId] ?? newDeal();
    if (current.contacts.some((c) => c.id === contactId)) return; // already on this deal

    const resolved = resolveDirectoryContact(contactId, contactType);
    const contact: AssignedContact = {
      id: contactId,
      type: contactType,
      name: details?.name ?? resolved?.name ?? contactId,
      phone: details?.phone ?? resolved?.phone,
      role: details?.role ?? resolved?.role,
      assignedAt: Date.now(),
    };
    persist({ ...deals, [propertyId]: { ...current, contacts: [...current.contacts, contact] } });
  };

  const addOwnerContact = (propertyId: string, name: string, phone?: string, role?: string) => {
    const id = `owner-${Date.now()}`;
    assignContactToProperty(propertyId, id, 'owner', { name, phone, role: role ?? 'Owner / seller' });
  };

  const unassignContact = (propertyId: string, contactId: string) => {
    const current = deals[propertyId];
    if (!current) return;
    persist({
      ...deals,
      [propertyId]: { ...current, contacts: current.contacts.filter((c) => c.id !== contactId) },
    });
  };

  const getOverride = (id: string): PropertyOverride => deals[id]?.override ?? {};

  const setOverride = (id: string, patch: PropertyOverride) => {
    const current = deals[id] ?? newDeal();
    persist({ ...deals, [id]: { ...current, override: patch } });
  };

  const value = useMemo<PortfolioState>(
    () => ({
      deals,
      savedIds: Object.keys(deals),
      isSaved,
      toggleSaved,
      getStage,
      setStage,
      toggleChecklistItem,
      isChecklistItemDone,
      toggleStep,
      isStepChecked,
      getContacts,
      isContactAssigned,
      assignContactToProperty,
      addOwnerContact,
      unassignContact,
      getOverride,
      setOverride,
      loaded,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deals, loaded]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioState {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
