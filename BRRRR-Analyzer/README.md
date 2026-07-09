# BRRRR Scout 📈

A mobile app for finding, saving, and analyzing multi-family properties for
the **BRRRR method** (Buy, Rehab, Rent, Refinance, Repeat) — with a
contractor directory matched to each property's actual rehab scope.

## What it does

- **Discover** — browse multi-family listings (duplex → 5+ units) filtered by
  budget, neighborhood, unit count, transit score, and listing status. Every
  card shows a 0–100 **BRRRR fit score**, projected monthly cash flow,
  cash-on-cash return, and ARV at a glance. A live indicator shows whether
  you're on sample data or a real feed, and when it last refreshed.
- **Aggregated sources** — each listing shows every site it's posted on (MLS,
  Zillow, Realtor.com, Redfin, FSBO, auction sites) with its own price and
  "last seen" timestamp, so you're not missing a listing because it's only on
  one site.
- **Real-time-feeling updates** — days-on-market ticks up, and listings flip
  between Active / Pending / Sold / Off Market on their own, so the feed
  behaves like it's watching the market instead of a static snapshot.
- **Pipeline** — tap the heart on any listing to start tracking it, then move
  it through real deal stages: Watching → Offer Made → Under Contract →
  Rehabbing → Refinanced → Stabilized. The Pipeline tab groups your
  properties by stage instead of a flat list. Persisted on device.
- **Edit deal numbers** — once you've actually walked a property or gotten an
  offer accepted, correct the listing's numbers: your real offer price, your
  own ARV estimate, and a fully editable rehab line-item list (add/edit/
  delete by trade, cost range, and priority). Every score, the action plan,
  and the contractor/lender matches everywhere else in the app immediately
  use your numbers instead of the listing's — critical once you're on live
  data, since RentCast doesn't return a rehab scope at all.
- **Property detail & analysis** — for any property: photos, unit-by-unit
  rent breakdown (current vs. post-rehab market rent), transit/walk/bike
  scores, and a full **BRRRR analysis card** — purchase price, rehab budget,
  ARV, refinance loan at 75% LTV, cash left in the deal, monthly cash flow,
  cap rate, cash-on-cash return, DSCR, and 1%/50% rule checks. A breakdown
  panel shows exactly which factors are driving the score.
- **Investment assumptions you control** — refinance LTV/rate/term, closing
  costs, vacancy/management/maintenance reserves, insurance, and holding
  costs are all editable in Settings and apply to every property's analysis —
  match them to your actual lender's terms instead of a generic default.
- **Step-by-step action plan** — a generated, property-specific checklist
  across all five BRRRR phases (Buy → Rehab → Rent → Refinance → Repeat),
  with real numbers pulled from that property's analysis — not generic
  advice. Checked-off steps persist per property, so progress survives
  closing the app.
- **Rehab scope → contractor recommendations** — the rehab items on a
  property are grouped by trade (roofing, electrical, plumbing, HVAC,
  kitchen & bath, etc.) with a cost range and priority (critical / recommended
  / cosmetic), each paired with the top cost-efficient contractors for that
  trade and neighborhood — rating, price tier, license/insurance status,
  response time, and a tap-to-call number.
- **Financing → lender recommendations** — each property's detail screen also
  surfaces top hard-money/bridge lenders (for the purchase + rehab) and DSCR
  refinance lenders (for the cash-out), ranked by rate/points/close speed.
- **Team tab** — browse the full contractor directory by trade, or toggle to
  the lender directory by category, independent of any one property.

## It ships on sample data — on purpose

No real-estate or contractor API key was available when this app was built,
so it runs on a realistic **sample dataset** (10 multi-family properties
across 6 Columbus, OH neighborhoods, 16 contractors across every trade) that
updates itself in the background to feel live. Every screen, filter, save,
and analysis works fully today with zero setup.

The moment you add your own API key in **Settings**, that category switches
to live data automatically — no code changes needed.

## Add real data sources

### Listings — RentCast

1. Get a key at [rentcast.io](https://www.rentcast.io/api) (free tier
   available) — see `src/services/liveListings.ts` for the request/response
   mapping.
2. In the app: **Settings → Live data sources → RentCast** → paste your key
   → Save.
3. Discover now polls RentCast for your configured city/state every 5
   minutes instead of the simulated feed.
4. Add towns in **Settings → Nearby towns** to widen the search — each town
   is queried separately (RentCast has no multi-city search) and merged, up
   to 6 towns per search. More towns means more API calls per poll, so keep
   an eye on your plan's monthly quota.

> RentCast's sale-listing payload doesn't include a rehab scope or an ARV —
> the client currently falls back to their AVM/valuation for ARV and leaves
> `rehabItems` empty. You'll want a walkthrough or a GC bid to fill in real
> rehab line items per property before trusting the BRRRR score on live data.
> It also usually has no per-unit rent data, so rent is estimated (flagged
> in the UI) until you fill in real numbers via "Edit deal numbers."
>
> Real listing photos are used when RentCast returns them; otherwise (and
> always for the sample data) a local placeholder graphic is shown instead
> of a broken image.

### Contractors — Google Places

1. Enable the **Places API (New)** in Google Cloud Console and get a key —
   see `src/services/liveContractors.ts`.
2. In the app: **Settings → Live data sources → Google Places** → paste your
   key → Save.
3. The Contractors tab and each property's rehab section now pull real
   businesses per trade near your configured market.

> Google Places has no concept of license/insurance status — those fields
> come back unverified from a live search. Confirm directly with any
> contractor before hiring.

Both integrations are additive: adding one key doesn't require the other,
and a **"Force demo data"** switch in Settings lets you preview the sample
data again even with live keys configured.

## Run it

```bash
cd BRRRR-Analyzer
npm install
npx expo start
```

Press `i` for the iOS simulator, `a` for Android, or `w` for web — or scan
the QR code with the Expo Go app on your phone.

### Build the web bundle yourself

```bash
cd BRRRR-Analyzer
npm install
npx expo export --platform web      # outputs to ./dist
npx serve dist                      # preview locally
```

If hosting under a sub-path, set the base first, e.g.
`EXPO_BASE_URL=/my-path npx expo export --platform web`.

## Add it to your phone's home screen

This repo includes a GitHub Actions workflow (`.github/workflows/deploy-web.yml`)
that builds this app as a static web app with a proper manifest and home-screen
icon, and publishes it to **GitHub Pages** alongside the other app in this repo.

**One-time setup (in the GitHub repo):**

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

The workflow runs automatically on pushes that touch `BRRRR-Analyzer/` (or run
it manually from the **Actions** tab → *Deploy web apps (Phantom + BRRRR
Scout)* → *Run workflow*). Once it finishes, your link is:

```
https://<your-github-username>.github.io/<repo-name>/brrrr-scout/
```

Then, on your phone:

- **iPhone (Safari):** open the link → tap the **Share** icon → **Add to Home
  Screen**. It installs with its own icon and opens full-screen, no browser
  bar.
- **Android (Chrome):** open the link → tap the **⋮** menu → **Add to Home
  screen** (or **Install app** if Chrome offers it directly).

Data (saved deals, your edited numbers, preferences, API keys) is stored
locally in that browser's storage on your phone — it isn't synced anywhere,
so it stays put across app opens but is specific to that one device/browser.

> Note: GitHub Pages may restrict deployments to the default branch. If the
> deploy step is skipped from a feature branch, either merge into `main`, or
> add the branch under **Settings → Environments → github-pages → Deployment
> branches**.

## How the BRRRR score works

`src/utils/brrrr.ts` runs the same analysis on every property:

1. **Cash invested** = purchase price + closing costs + rehab budget +
   holding costs during the rehab window.
2. **Refinance** at 75% of ARV (configurable), minus refi closing costs, to
   get cash pulled back out.
3. **Cash left in deal** = cash invested − cash out at refi. The whole point
   of BRRRR is driving this toward zero (or negative — pulling out more than
   you put in).
4. **Monthly cash flow** = post-rehab market rent − vacancy/management/
   maintenance reserves − insurance − taxes − the new mortgage payment.
5. The **0–100 score** is a weighted blend of: cash recycled at refi (30%),
   cash-on-cash return (25%), cash flow per unit (20%), cap rate (15%), and
   debt-service coverage ratio (10%).

All assumptions (LTV, rates, reserve percentages) live in
`DEFAULT_ASSUMPTIONS` in that same file if you want to tune them for your
market or lender.

## Structure

```
BRRRR-Analyzer/
├── App.tsx
├── src/
│   ├── theme.ts                      # design tokens
│   ├── services/
│   │   ├── types.ts                  # Property, Contractor, RehabItem, ...
│   │   ├── listingsProvider.ts       # filtering/sorting + useListings/withOverrides
│   │   ├── contractorsProvider.ts    # trade matching + useContractors hook
│   │   ├── lendersProvider.ts        # lender category matching + scoring
│   │   ├── mockListingsEngine.ts     # simulated live feed over sample data
│   │   ├── liveListings.ts           # RentCast client (bring your own key)
│   │   ├── liveContractors.ts        # Google Places client (bring your own key)
│   │   ├── apiKeys.ts / secureStorage.ts
│   ├── utils/
│   │   ├── brrrr.ts                  # the analysis engine + scoring (assumptions passed in)
│   │   ├── actionPlan.ts             # step-by-step plan (stable step ids) + rehab/trade grouping
│   │   └── format.ts
│   ├── data/
│   │   ├── mockListings.ts           # sample property inventory
│   │   ├── mockContractors.ts        # sample contractor directory
│   │   └── mockLenders.ts            # sample lender directory
│   ├── context/
│   │   ├── SettingsContext.tsx       # preferences, API keys, editable BRRRR assumptions
│   │   └── PortfolioContext.tsx      # per-property deal store: stage, checklist, overrides
│   ├── components/                   # PropertyCard, ScoreBadge, FiltersModal,
│   │                                 #   EditDealModal, DealStageStepper, LenderCard, ...
│   ├── screens/                      # Discover, PropertyDetail, Saved (Pipeline),
│   │                                 #   Contractors (Team), Settings, Onboarding
│   └── navigation/RootNavigator.tsx
└── ...
```

Built with Expo + React Native + TypeScript.
