import { DayType, Workout } from '@/types';

/**
 * The NFL running back split: 4 days on, 3 days active recovery.
 * Rest lengths follow the intent of each block — full recovery on the CNS
 * work (sprints, jumps, max-effort throws), short rest on the pump work.
 */
export const WORKOUTS: Record<DayType, Workout> = {
  'upper-power': {
    dayType: 'upper-power',
    title: 'Upper Body Power & Armor',
    focus: 'Max effort, explosive push, contact armor',
    warmup: 'Dynamic mobility & explosive athletic warm-up',
    exercises: [
      { id: 'up-medball', name: 'Med Ball Slams / Chest Passes', sets: 4, reps: '5', cue: 'Max effort', rest: 150 },
      { id: 'up-incline', name: 'Incline Dumbbell Bench Press', sets: 4, reps: '6-8', cue: 'Explosive push', rest: 150 },
      { id: 'up-dips', name: 'Heavy Dips', sets: 3, reps: '8-10', rest: 120 },
      { id: 'up-rows', name: 'Heavy DB Rows', sets: 4, reps: '8-10', supersetWith: 'Barbell Shrugs', rest: 120 },
      { id: 'up-curls', name: 'Bicep Curls', sets: 3, reps: '12-15', supersetWith: 'Cable Lateral Raises', rest: 75 },
    ],
  },
  'lower-speed': {
    dayType: 'lower-speed',
    title: 'Lower Body Speed & Ground Drive',
    focus: 'Acceleration, bar speed, ground force',
    warmup: 'Dynamic mobility & explosive athletic warm-up',
    exercises: [
      { id: 'ls-sprints', name: 'Short Hill Sprints / Sled Pushes', sets: 5, reps: '15 yards', cue: 'Full rest between reps', rest: 240 },
      { id: 'ls-trapbar', name: 'Trap Bar Deadlift', sets: 4, reps: '5', cue: 'Max bar speed', rest: 180 },
      { id: 'ls-rdl', name: 'Romanian Deadlifts', sets: 3, reps: '8', cue: 'Eccentric stretch', rest: 120 },
      { id: 'ls-bulgarian', name: 'Bulgarian Split Squats', sets: 3, reps: '8 / leg', rest: 105 },
      { id: 'ls-calves', name: 'Standing Calf Raises', sets: 4, reps: '12', cue: 'Stiff ankle drive', rest: 75 },
    ],
  },
  'upper-hyper': {
    dayType: 'upper-hyper',
    title: 'Upper Body Hypertrophy & Pump',
    focus: 'Overhead power into volume',
    warmup: 'Dynamic mobility & explosive athletic warm-up',
    exercises: [
      { id: 'uh-throws', name: 'Overhead Med Ball Throws', sets: 4, reps: '5', cue: 'Full body extension', rest: 150 },
      { id: 'uh-ohp', name: 'Standing Overhead Barbell Press', sets: 4, reps: '6', rest: 150 },
      { id: 'uh-pullups', name: 'Weighted Pull-ups or Heavy Lat Pulldowns', sets: 4, reps: '8', rest: 120 },
      { id: 'uh-pushdowns', name: 'Rope Pushdowns', sets: 4, reps: '12-15', supersetWith: 'Rear Delt Flyes', rest: 75 },
    ],
  },
  'lower-hyper': {
    dayType: 'lower-hyper',
    title: 'Lower Body Hypertrophy & Acceleration',
    focus: 'Jumps, squat volume, lateral cut prep',
    warmup: 'Dynamic mobility & explosive athletic warm-up',
    exercises: [
      { id: 'lh-jumps', name: 'Box Jumps or Broad Jumps', sets: 4, reps: '3 jumps', cue: 'Soft landings', rest: 180 },
      { id: 'lh-squat', name: 'Barbell Front Squat or Hack Squat', sets: 4, reps: '6-8', rest: 150 },
      { id: 'lh-curls', name: 'Lying Leg Curls', sets: 4, reps: '10-12', rest: 90 },
      { id: 'lh-heiden', name: 'Heiden Lateral Bounding Jumps', sets: 3, reps: '6 / side', cue: 'Stick the landing', rest: 120 },
    ],
  },
  recovery: {
    dayType: 'recovery',
    title: 'Active Recovery & Rest',
    focus: 'Commute, walking, light mobility only',
    exercises: [],
  },
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  'upper-power': 'Upper Power',
  'lower-speed': 'Lower Speed',
  'upper-hyper': 'Upper Hypertrophy',
  'lower-hyper': 'Lower Hypertrophy',
  recovery: 'Recovery',
};

export const DAY_TYPE_SHORT: Record<DayType, string> = {
  'upper-power': 'UP',
  'lower-speed': 'LS',
  'upper-hyper': 'UH',
  'lower-hyper': 'LH',
  recovery: 'REC',
};
