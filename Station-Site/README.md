# Mobile Station — 3D site

An interactive WebGL landing page for the Mobile Station apps (Phantom, BRRRR
Scout, ShortsForge). Plain HTML/CSS/JS, no build step; Three.js is vendored in
`vendor/` so it works offline and on GitHub Pages without a CDN.

## Features

- **Live 3D core**: a simplex-noise-displaced sphere with iridescent fresnel
  shading, orbit rings with one satellite per app, and a twinkling particle field.
- **Scroll choreography**: the scene glides to a new pose for each section, and
  scroll speed feeds a warp into the particles and the distortion.
- **Pointer interaction**: camera parallax, a surface bulge under the cursor,
  click the core for a shockwave, drag it to spin it (with inertia).
- **3D UI**: perspective tilt cards with glare and layered depth, magnetic
  buttons, a custom cursor, split-letter hero reveal, scroll reveals, counters.
- **Lab panel**: sliders, palettes and wireframe mode drive the shader live;
  palettes recolour the whole UI too.
- Handles phone screens (separate scene poses; touch focuses cards as you scroll),
  honours `prefers-reduced-motion`, and falls back to a gradient without WebGL.

## Run locally

```bash
cd Station-Site
python3 -m http.server 8080   # then open http://localhost:8080
```

(ES modules need to be served over HTTP; opening `index.html` from disk won't work.)

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup and content |
| `styles.css` | Layout, glass UI, tilt/reveal styles, responsive rules |
| `scene.js` | Three.js scene, shaders, scroll choreography, pointer input |
| `ui.js` | Loader, cursor, magnetic buttons, tilt cards, Lab controls |
| `vendor/three.module.min.js` | Three.js r160 (MIT, see `vendor/three.LICENSE`) |

The site is deployed with the other web builds to `/<repo>/station/` by
`.github/workflows/deploy-web.yml`. The app cards link to `../` (Phantom) and
`../brrrr-scout/` (BRRRR Scout).
