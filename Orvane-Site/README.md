# ORVANE — luxury fashion storefront (demo)

A fictional high-end fashion house ("ORVANE", Florence) with an editorial,
motion-rich storefront. Plain HTML/CSS/JS with no build step or dependencies.

- Intro curtain, slow-zoom hero with parallax and a masked headline reveal
- A brand statement whose words light up as you scroll
- Filterable product grid: hover swaps to an on-model shot, 3D tilt, "View" cursor
- Quick-view modal (gallery, sizes with sold-out states) and a bag drawer
  saved in `localStorage`
- A pinned lookbook that scrolls sideways (swipe carousel on phones)
- Atelier story with a clip-path reveal and counters, services, journal sign-up
- Responsive, keyboard accessible (Esc closes overlays), honours reduced motion

It's a demo: checkout is disabled and the newsletter form sends nothing.

## Images

Photos live in `images/`. Until a file exists, its frame shows a styled
placeholder, so the page never looks broken. Expected files:

| File | Shot | Ratio |
| --- | --- | --- |
| `hero.jpg` | Campaign: model in long camel coat, stone courtyard, golden hour | 16:9 |
| `p-<id>.jpg` | Studio product shot on warm stone backdrop | 3:4 |
| `p-<id>-2.jpg` | On-model shot (shown on hover and in quick view) | 3:4 |
| `look-1.jpg` … `look-3.jpg` | Lookbook editorials | 4:5 / 2:3 / 4:5 |
| `atelier.jpg` | Tailor's hands stitching a lapel | 4:5 |

Product ids: `aurelio`, `sera`, `linea`, `nove`, `vela`, `ardesia`.

## Run locally

```bash
cd Orvane-Site && python3 -m http.server 8080
```
