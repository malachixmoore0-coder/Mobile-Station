# Gridiron AI — visual directions

Ten design directions for **Gridiron AI** (NFL) and **CFB Gridiron AI** (college).
Palette, typography and layout only — no implementation.

Open `concepts.html` in a browser for the full board: every direction is rendered
live in its own fonts and colours on the same Result screen, so they can be
compared honestly.

All figures in the mockups are placeholder design data, not model output.

---

## The constraint

Both apps ship the same surface today, so a direction has to survive all of it:

| Surface | Screens |
| --- | --- |
| Tabs | Matchup, Slate, Record, Teams, Model |
| Overlays | Result, Team detail, Player profile |
| Result sections | Win probability, advantage matrix, weighted nodes, three-act script, sleepers, injuries, margin distribution |

Current draft theme: `#0B1220` navy, `#F5B700` gold, `#2ED47A` home / `#FF7A45` away.
Direction 01 is the closest relative to it.

---

## 01 — Saturday Night Broadcast

Names: **Primetime**, **Kickoff**

The graphics package, not the game. Hard diagonal cuts, condensed italics, a gold
rail under the headline number.

| Role | Hex |
| --- | --- |
| Field | `#070B14` |
| Panel | `#101A2E` |
| Gold | `#FFC233` |
| Home | `#38E08A` |
| Away | `#FF6B3D` |

Midnight navy under a single stadium gold. Green and orange are the home and away
sides and appear nowhere else, so a glance at any chart tells you whose number it is.

**Type** Saira Condensed 800 (skewed 7°) · Barlow 400/600
**Layout** Five bottom tabs stay. A scorebug pins to the top of every screen once a
matchup is loaded. Result opens full-bleed. 3px radius everywhere.
**Signature** The persistent scorebug — browse a roster or tune the model and the
projected score updates live above you.

---

## 02 — The Quant Desk

Names: **Snapcount**, **The Desk**, **Vig**

A simulation terminal that happens to be pointed at football. Density over comfort.

| Role | Hex |
| --- | --- |
| Void | `#0A0A0A` |
| Row | `#131313` |
| Phosphor | `#E8E4D9` |
| Amber | `#FFB000` |
| Long | `#3DD68C` |
| Short | `#FF4D4D` |

Black terminal, warm phosphor white, amber for anything the model produced itself.
Green and red mean direction only. Six colours and not a seventh.

**Type** IBM Plex Mono 400/500/600/700 — one family, no display face
**Layout** Tab bar deleted for a command bar. One continuous readout, no cards.
Roughly twice the information per screen. Zero radius.
**Signature** The command bar — `UGA BAMA -neutral -wind` runs ten thousand games,
turning context chips into something you type once.

---

## 03 — Coach's Chalkboard

Names: **Chalk**, **Install**, **Whiteboard**

Slate board, a stick of chalk, a room with no windows. The only handmade direction.

| Role | Hex |
| --- | --- |
| Slate | `#1C2621` |
| Dust | `#3A4A41` |
| Chalk | `#F2EFE4` |
| Yellow | `#F2D06B` |
| Home | `#7FD4A8` |

Board green, chalk white, one stick of yellow for the line that matters. Nothing is
fully saturated and nothing is pure white.

**Type** Caveat 700 (headlines and annotations only) · Barlow Condensed 500/600
**Layout** Tabs move to the top, folder-style. The matchup builder is a board you drag
team magnets onto. Result sections are index cards, slightly rotated.
**Signature** The advantage matrix drawn as a play — the four categories sit at their
real positions on a formation instead of as four bar rows.

---

## 04 — Field Level

Names: **Hashmark**, **Field Level**, **Under the Lights**

Nine at night, standing on the grass, looking up into the lights. The most premium.

| Role | Hex |
| --- | --- |
| Night | `#0B1410` |
| Glass | `#132018` |
| Halogen | `#FFE9AE` |
| Turf | `#39C97E` |
| Away | `#E8B44C` |

Grass so dark it reads black, with one warm halogen white that behaves like a light
source rather than a colour.

**Type** Outfit 300/400/600/800 — one family, weight-driven hierarchy
**Layout** A floating pill dock that dims while you scroll. Frosted glass over blurred
field imagery. Large radii, generous padding.
**Signature** The swipeable result story — seven full-screen panels instead of one long
scroll, with a progress rail down the side.

---

## 05 — Gameday Program

Names: **The Program**, **Folio**, **Saturday Edition**

The four-dollar program you buy walking in. The only light direction, and the only one
that treats the game script as writing.

| Role | Hex |
| --- | --- |
| Stock | `#F2EDE1` |
| Inset | `#FBF8F1` |
| Ink | `#1F1A15` |
| Oxblood | `#8C2A2A` |
| Navy | `#1B2C4A` |

Program stock and two inks the way a two-colour press job works. No fills, no shadows,
no third colour — structure comes from rules and white space.

**Type** Playfair Display 900 · Lora 400/600 and italic. Old-style figures in running
text, lining figures in tables.
**Layout** Running heads and a folio instead of a tab bar. Paged, not scrolled.
**Signature** The printed game script — three acts set as a real column with a drop cap,
every number in the prose linking back to its table.

---

## 06 — The Book

Names: **Moneyline**, **The Book**, **Edge**

The app already computes edge against the market. This stops burying it.

| Role | Hex |
| --- | --- |
| Felt | `#080A0C` |
| Rail | `#12161A` |
| Model | `#22E5D6` |
| Market | `#FF3D8A` |
| Ink | `#F2F6F8` |

Two neons with one job each and no overlap: cyan is always the model, magenta is always
the market. The gap between them is the whole product.

**Type** Chakra Petch 600/700 · Barlow 400/500
**Layout** A live odds ticker replaces the header. Edge leads the Result screen; win
probability is second. Slate sorts the week by disagreement.
**Signature** The disagreement rail — one axis per game, market as a magenta tick, model
as a cyan one. Thirty games become thirty rails.

> Note: leading with betting edge invites app-store gambling review. Worth checking
> before committing.

---

## 07 — Field Manual

Names: **Down & Distance**, **Manual**, **Third & Long**

No cards, no radius, no shadow, no gradient. The type is the interface.

| Role | Hex |
| --- | --- |
| Stock | `#E8E8E4` |
| Inset | `#FFFFFF` |
| Rule | `#0A0A0A` |
| Safety | `#FF4A00` |

Four values, and the fourth does all the talking. Orange marks exactly one thing per
screen — the model's answer.

**Type** Archivo Black · Archivo 500/700
**Layout** No tab bar; a sticky numbered index rail down the right edge. One continuous
type sheet with 2px rules as section breaks. Headline figures at 60pt+.
**Signature** The numbers are the layout — no card holds the win probability, the figure
itself is the section.

---

## 08 — Letterman

Names: **Varsity**, **Pennant**, **Letterman**

Wool navy, felt cream, chenille gold. The one direction that is unmistakably college.

| Role | Hex |
| --- | --- |
| Wool | `#182339` |
| Panel | `#202C46` |
| Felt | `#F5EFE0` |
| Chenille | `#D4A537` |
| Oxblood | `#9C3B33` |

Wool navy and felt cream with a gold varsity stripe. Oxblood appears only on the losing
side of a number, so the palette keeps score.

**Type** Graduate 400 (a real collegiate block face) · Oswald 400/500/600
**Layout** Tabs are stitched patches. Record becomes a trophy case where correct calls
earn dated patches.
**Signature** The pennant wall — the Teams tab becomes 130 pennants in each programme's
real colours. Only possible for college football.

---

## 09 — Node Graph

Names: **Havoc**, **Node**, **Fourth Node**

The engine has four weighted nodes feeding one margin. This draws it.

| Role | Hex |
| --- | --- |
| Void | `#08060F` |
| Node | `#120E22` |
| Edge | `#241C40` |
| Signal | `#B4FF39` |
| Weight | `#7B5CFF` |

A violet void with one electric lime that appears only where the model produced
something itself. Violet carries structure, lime carries conclusions, never both.

**Type** Syne 700/800 · Space Mono 400/700
**Layout** The four-node graph is the home screen — node size is its weight, drag to
retune and the margin moves. Tapping a node expands its contribution.
**Signature** The graph is the settings screen. Scheme, personnel, environment and
X-factor become nodes you resize, collapsing two screens into one.

---

## 10 — Home Colors

Names: **Sideline**, **Two-Deep**, **Colors**

A near-white shell with no accent of its own that borrows the matchup's instead.

| Role | Hex |
| --- | --- |
| Shell | `#F6F7F9` |
| Card | `#FFFFFF` |
| Ink | `#0F1417` |
| Home | dynamic (per team) |
| Away | dynamic (per team) |

Three fixed neutrals and two slots pulled from the two programmes on screen,
auto-corrected for contrast.

**Type** Plus Jakarta Sans 500/600/800
**Layout** Standard five tabs with generous targets. Result is a reorderable card feed.
Run button sits above the tab bar, always one-handed.
**Signature** The app repaints itself per matchup. Team colours already live in
`src/data/teams.ts` — read them, contrast-fix them, and one build gives 130 identities.

---

## Choosing

| # | Direction | Fits | Density | Reads as | Risk |
| --- | --- | --- | --- | --- | --- |
| 01 | Saturday Night Broadcast | Both | Medium | Television | Low — closest to today's draft |
| 02 | The Quant Desk | Pro | Very high | Instrument | High — alienates casual users on sight |
| 03 | Coach's Chalkboard | Both | Medium | Handmade | Medium — script face must stay in its lane |
| 04 | Field Level | Both | Low | Premium | Medium — low density fights a dense product |
| 05 | Gameday Program | College | Medium | Editorial | Medium — serifs at 11px need care |
| 06 | The Book | Both | High | Sportsbook | Medium — gambling review exposure |
| 07 | Field Manual | Pro | High | Publication | High — no decoration to hide behind |
| 08 | Letterman | College | Medium | Traditional | Low — 130 pennants is real asset work |
| 09 | Node Graph | Both | High | Machine | High — graph must be genuinely interactive |
| 10 | Home Colors | Both | Medium | Modern app | Low — contrast correction is fiddly |

The two apps do not have to land in the same place. The college app has 130 programmes
and a pageantry problem; the pro app has 32 and a credibility problem. A split is a
legitimate outcome.

---

## Naming the pair

Two apps sharing one engine should share one naming logic, so the college app never
reads as the afterthought.

| Family | College | Pro | Why |
| --- | --- | --- | --- |
| **Saturday & Sunday** | Saturday | Sunday | Strongest of the four. Two words, no explanation needed. |
| **Chalk** | Chalk College | Chalk Pro | Chalk is the betting favourite and the thing a coordinator writes with. |
| **Snapcount** | Snapcount CFB | Snapcount NFL | Sounds like the analytics tool it is; snap counts are a real engine input. |
| **Hashmark** | Hashmark | Hashmark Pro | Neutral and ownable if the brand needs to outlive the football framing. |
