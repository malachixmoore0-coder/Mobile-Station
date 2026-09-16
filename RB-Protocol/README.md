# RB Protocol 🏈

A personal daily-execution app for one specific protocol: the 7:30 AM → 11:45 PM
schedule, the peptide/supplement stack, the five meals, and the NFL running back
training split — with the Pepsi shift in the middle of it.

Everything is logged on-device. No account, no server, nothing leaves the phone.

## What it does

- **Today** — the master timeline as a checkable day: wake/hydration, syringe 1,
  syringe 2, meal 1, pre-workout supplements, the gym session, IGF-1 LR3 + the
  post-workout shake, meals 2–5, both commutes, nighttime supplements, and
  lights out at 11:45 PM. Each block shows the clock time, how long until it's
  due, and a **"Why this, here"** toggle carrying the stack-pairing reasoning
  (why L-Citrulline sits 15 minutes before the session, why the fast carbs
  follow IGF-1 LR3 immediately, why zinc runs at night against GHK-Cu).
- **Training days vs. recovery days are different days.** Mon/Tue/Thu/Fri run
  the split; Wed/Sat/Sun drop the gym block, the post-workout shake and
  **IGF-1 LR3 entirely**, swap in the active-recovery block, and cut the
  pre-workout stack back to creatine only. 43 checks on a training day, 38 on
  a recovery day — the adherence ring counts what that day actually calls for.
- **Injection site rotation** — each syringe logs where it was pinned, and the
  card tells you where the last one went ("Last pinned Abdomen L · yesterday"),
  with previously-used sites dimmed in the picker.
- **Train** — the split is separated by weekday (Monday upper power, Tuesday
  lower speed, Wednesday recovery, Thursday upper hypertrophy, Friday lower
  hypertrophy, Sat/Sun recovery), and each day loads its own session — labeled
  with the weekday it belongs to. Every lift with set count, rep prescription and
  intent cue, plus a **weight × reps grid for each prescribed set**. Logging a
  set starts a **rest timer** matched to that lift (4:00 on hill sprints, 3:00
  on trap bar, 1:15 on the curl superset) that counts up past zero once rest is
  done. Each exercise shows what you lifted the last time that session came
  around. A "Split" toggle shows the whole week.
- **Fuel — Today** — the day's five meals with their target calories and macros,
  banked as each meal is fully checked off (~3,110 kcal / 220 P / 330 C / 99 F
  across the five meals, plus ~370 kcal from the post-workout shake on training
  days), and water tracking in 8 oz units against an 88 oz target.
- **Fuel — Meals & prep** — the full build for every meal: ingredient list with
  exact amounts, batch cooking steps for the cook-once-eat-four meals (2 lbs
  beef + 2 cups dry rice for the bowls; 2 lbs chicken + 4 sweet potatoes for the
  shift meals), and the **tare-and-weigh order at the food scale**, step by step
  — tare, 200 g rice, tare, 170 g beef, 1 cup greens. Plus a combined prep
  session card for running both batches at once on a recovery day. The same
  build steps expand inline on any meal block on the Today timeline.
- **Fuel — Shopping** — a weekly list by aisle sized to the real portions,
  showing both the per-week total and the batch quantity it's cooked in.
- **Stack** — every injectable and oral in one place: route, timing, the role it
  plays in the protocol, whether it's on or off today, and an editable dose
  field per compound (injectable doses are yours to enter — the app doesn't
  prescribe). Orals are grouped the way the day runs them: **morning fasted**
  (vitamin C, B12, biotin, green tea extract), **pre-workout** (creatine,
  citrulline, beta-alanine), and **night with meal 5** (omega-3, zinc,
  magnesium glycinate).
  Also carries the handling rules: syringe 1 and syringe 2 stay separate for pH
  stability, IGF-1 LR3 is training-days-only with carbs immediately after, zinc
  holds ~10:1 against GHK-Cu.
- **Progress** — 7-day adherence average, day streak, sessions completed this
  week (out of 4), morning pins hit (out of 7), a 14-day adherence bar chart
  you can tap to open any past day, plus body-weight and daily-notes logs.

Any day can be scrubbed from the date rail at the top of Today, Train and Fuel —
back-fill yesterday, or look ahead at what Thursday wants from you.

## Run it

```bash
npm install
npx expo start --ios      # or --android, or --web
```

Install it on your own phone with EAS:

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
```

## Not medical advice

This is a log for a protocol you already run — it prescribes nothing. Research
peptides aren't FDA-approved drugs. Keep a provider in the loop, get bloodwork,
and stop anything that stops feeling right.
