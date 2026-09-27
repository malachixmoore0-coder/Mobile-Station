# HALFLIT — streetwear concept store

A fictional streetwear label for 16–25s, named for the streetlight hour:
when the day's done but the night hasn't decided what it is yet.
Plain HTML/CSS/JS with no build step.

## Brand

- **Name:** HALFLIT. **Tagline:** *Made for the hour between.*
- **Mark:** a moon caught mid-phase (left side lit). At 50% it is the signature
  half-lit disc; every drop ships with its own phase (Drop 01 New Moon → Drop 05 Full Beam).
- **Lockups** (`logo.js`): wordmark, stacked, split (`HALF◐LIT`), mark, seal,
  varsity arch, chain-stitch script and box. Each can be rendered at any phase,
  in any colour, with custom text, and in five finishes: screen print, puff,
  embroidery, chenille and reflective.
- **Palette:** Asphalt `#0E0E0F`, Chalk `#EEEBE3`, Sodium `#FF6A13`,
  Night Blue `#1C2440`, Concrete `#8B8A85`, Signal `#C8FF3D`.
- **Type:** Archivo Expanded Black (display), JetBrains Mono (labels),
  Yellowtail (chain-stitch script).

## Shop structure

- **Men / Women / All** departments, each with its own subsections
  (e.g. Women: Hoodies & Knits, Tops & Baby Tees, Jackets & Coats, Denim & Skirts…).
  Unisex pieces appear in both.
- **Fall Hour** is a limited-time promotion: 25% off an 8-piece fall capsule until
  Oct 31, 2026 (the viewer's local time). It includes a live countdown and For Him / For Her
  tiles, and sale prices carry through to the product view and the bag.
  When it ends, the section hides and prices revert. Configure it with
  `PROMO` in `data.js`.
- Search, sort, saved items (hearts), animated filtering.

## Drop 03 — Night Shift

29 pieces with 65 colourways. The original 12 are listed here; 17 more were added
across every category, including fall pieces: Dusk Hoodie (graphic), Chainstitch Crew
(embroidered), Open Late Tee, Varsity Arch Tee (puff print), Nightshift Puffer,
Afterhours Varsity, Loose Carpenter Jean, Worker Denim Jacket, Run Club Track Set,
Motion Set, Lounge Fleece Set and Phase Beanie.

Every piece has a studio product shot per colourway, plus on-model shots
taken in real locations (Brooklyn, East LA, Queens, an outdoor court, Manchester,
a Toronto rooftop, autumn parks, apartments)
(front, back and/or a second angle) on a cast of six with visible tattoos,
freckles, vitiligo, scars and piercings. Campaign images are in the
"After Dark" lookbook.

## Site features

- Filterable shop: hover swaps to a second angle, and colour dots swap to that colourway
- Product view: angle gallery with click-to-zoom, colourway switching, sizes with
  sold-out states, fit/fabric/graphic specs, and the model's height and size
- Bag drawer saved in `localStorage` with a free-shipping progress bar
- Drag-to-scroll lookbook, cast profiles
- **Logo Lab:** pick the lockup, phase, finish, ink, garment (hoodie/tee/cap),
  fabric colour, placement (chest/centre/back/sleeve) and custom text. Preview it on a
  garment, then download the SVG
- Identity section: lockup gallery, palette, type specimen, drop calendar
- The header mark waxes from half to full as you scroll

## Images

All photos are AI-generated with Higgsfield (GPT Image 2.5 for product and
on-model shots, Soul 2 for campaign images). They are loaded from
Higgsfield's CDN. `data.js` maps each generation's job id to its URL.

## Run locally

```bash
cd Halflit-Site && python3 -m http.server 8080
```
