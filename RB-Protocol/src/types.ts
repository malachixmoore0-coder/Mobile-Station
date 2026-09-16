import { BlockKind } from '@/theme';

/** 0 = Sunday ... 6 = Saturday (matches Date.getDay()). */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayType = 'upper-power' | 'lower-speed' | 'upper-hyper' | 'lower-hyper' | 'recovery';

/** One checkable line inside a protocol block (a food, a dose, a supplement). */
export interface BlockItem {
  id: string;
  label: string;
  /** Quantity/dose shown to the right of the label. */
  detail?: string;
  /** Optional per-item note (why it's here, how to take it). */
  note?: string;
  /** Items the schedule only calls for on training days. */
  trainingOnly?: boolean;
}

/** A scheduled block on the daily timeline. */
export interface Block {
  id: string;
  /** Minutes from midnight — the single source of truth for ordering. */
  time: number;
  title: string;
  kind: BlockKind;
  items: BlockItem[];
  /** "Stack pairing" rationale from the protocol. */
  pairing?: string;
  /** Skipped entirely on recovery days (IGF-1 LR3, post-workout shake). */
  trainingOnly?: boolean;
  /** Shown on recovery days but flagged as optional/reduced. */
  recoveryNote?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  /** Rep prescription as written in the protocol ("6-8", "5", "15 yards"). */
  reps: string;
  /** Intent cue — max effort, explosive push, soft landings. */
  cue?: string;
  /** Superset partner, rendered as one grouped card. */
  supersetWith?: string;
  /** Prescribed rest between sets, in seconds. */
  rest: number;
}

export interface Workout {
  dayType: DayType;
  /** The weekday this session belongs to in the split. */
  weekday: string;
  title: string;
  /** Short subtitle: "High power & hypertrophy" etc. */
  focus: string;
  warmup?: string;
  exercises: Exercise[];
}

/** A single logged working set. */
export interface SetLog {
  weight: string;
  reps: string;
}

/** Everything recorded for one calendar day, keyed by YYYY-MM-DD. */
export interface DayLog {
  /** Ids of completed blocks and block items. */
  done: string[];
  /** exerciseId -> per-set entries. */
  sets: Record<string, SetLog[]>;
  /** Injection site used per syringe, so sub-q sites can be rotated. */
  sites: Record<string, string>;
  /** Glasses of water, counted in 8 oz units. */
  water: number;
  weight?: string;
  notes?: string;
}

export function emptyDayLog(): DayLog {
  return { done: [], sets: {}, sites: {}, water: 0 };
}
