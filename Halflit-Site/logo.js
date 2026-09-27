// HALFLIT logo system.
//
// Everything is built from one idea: the "phase" mark, a moon that is partly
// lit. At phase 0.5 it is the signature half-lit disc; each drop can ship
// with its own phase. The mark combines with the wordmark into lockups
// (horizontal, stacked, split, seal, arch, script, box) and can be rendered
// in several finishes (flat print, puff, embroidery, chenille, reflective).
(function (global) {
  "use strict";

  let uid = 0;
  const WORD = "HALFLIT";
  const FONT = "'Archivo', 'Arial Black', sans-serif";
  const SCRIPT = "'Yellowtail', 'Brush Script MT', cursive";

  // Lit region of a disc of radius r centred on (cx, cy) at a given phase
  // (0 = new, 0.5 = half, 1 = full). Lit side is the left.
  function phasePath(cx, cy, r, phase) {
    const p = Math.min(1, Math.max(0, phase));
    if (p <= 0.001) return "";
    if (p >= 0.999) return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    const top = `${cx} ${cy - r}`;
    const bottom = `${cx} ${cy + r}`;
    const rx = Math.abs(1 - 2 * p) * r;
    const sweep = p < 0.5 ? 1 : 0;
    return `M${top}A${r} ${r} 0 0 0 ${bottom}A${rx.toFixed(2)} ${r} 0 0 ${sweep} ${top}Z`;
  }

  // Width a line of text should occupy, so lockups hold their shape in any font.
  const fit = (text, perChar, max) => Math.min(max, text.length * perChar);
  const len = (text, perChar, max) => `textLength="${fit(text, perChar, max)}" lengthAdjust="spacingAndGlyphs"`;

  function mark(cx, cy, r, phase, color, stroke) {
    const sw = stroke || Math.max(1.2, r * 0.09);
    return `<g class="hl-mark">
      <circle cx="${cx}" cy="${cy}" r="${r - sw / 2}" fill="none" stroke="${color}" stroke-width="${sw}"/>
      <path d="${phasePath(cx, cy, r, phase)}" fill="${color}"/>
    </g>`;
  }

  // SVG filter per finish. Returns [defs, filterAttr].
  function finishDefs(finish, id, color) {
    switch (finish) {
      case "puff":
        return [`<filter id="${id}" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/>
          <feSpecularLighting in="b" surfaceScale="4" specularConstant="0.9" specularExponent="18" lighting-color="#fff" result="s">
            <fePointLight x="-60" y="-120" z="140"/>
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
          <feOffset in="SourceAlpha" dx="0" dy="2.2" result="o"/>
          <feGaussianBlur in="o" stdDeviation="1.8" result="ob"/>
          <feColorMatrix in="ob" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .45 0" result="sh"/>
          <feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/><feMergeNode in="s2"/></feMerge>
        </filter>`, `filter="url(#${id})"`];
      case "stitch":
        return [`<filter id="${id}" x="-5%" y="-5%" width="110%" height="115%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4 0.25" numOctaves="2" seed="4" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="1.6" result="d"/>
          <feTurbulence type="turbulence" baseFrequency="0.9 0.08" numOctaves="1" seed="9" result="lines"/>
          <feColorMatrix in="lines" type="saturate" values="0" result="lg"/>
          <feComposite in="lg" in2="d" operator="in" result="tex"/>
          <feBlend in="d" in2="tex" mode="multiply" result="m"/>
          <feOffset in="SourceAlpha" dy="1" result="o"/>
          <feGaussianBlur in="o" stdDeviation=".8" result="ob"/>
          <feColorMatrix in="ob" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0" result="sh"/>
          <feMerge><feMergeNode in="sh"/><feMergeNode in="m"/></feMerge>
        </filter>`, `filter="url(#${id})"`];
      case "chenille":
        return [`<filter id="${id}" x="-10%" y="-10%" width="120%" height="125%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="2" result="t"/>
          <feDisplacementMap in="SourceGraphic" in2="t" scale="4.5" result="d"/>
          <feComposite in="t" in2="d" operator="in" result="tt"/>
          <feColorMatrix in="tt" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .18 0" result="fuzz"/>
          <feOffset in="SourceAlpha" dy="2" result="o"/>
          <feGaussianBlur in="o" stdDeviation="1.5" result="ob"/>
          <feColorMatrix in="ob" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0" result="sh"/>
          <feMerge><feMergeNode in="sh"/><feMergeNode in="d"/><feMergeNode in="fuzz"/></feMerge>
        </filter>`, `filter="url(#${id})"`];
      case "reflective":
        return [`<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#8f9398"/><stop offset=".35" stop-color="#f4f6f8"/>
            <stop offset=".5" stop-color="#a7abb0"/><stop offset=".7" stop-color="#e9ecef"/><stop offset="1" stop-color="#7d8186"/>
          </linearGradient>
          <filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .25 0" result="sp"/>
            <feComposite in="sp" in2="SourceAlpha" operator="in" result="spk"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="spk"/></feMerge></filter>`, `filter="url(#${id})"`];
      default:
        return ["", ""];
    }
  }

  // Lockup builders. Each returns { w, h, body } in its own coordinate space.
  const LOCKUPS = {
    mark: (o) => ({ w: 100, h: 100, body: mark(50, 50, 46, o.phase, o.color) }),

    horizontal: (o) => ({
      w: 420, h: 100,
      body: `${mark(50, 50, 40, o.phase, o.color)}
        <text x="112" y="72" ${len(o.text, 44, 300)} font-family="${FONT}" font-weight="900" font-stretch="125%" font-size="64" fill="${o.color}">${o.text}</text>`,
    }),

    stacked: (o) => ({
      w: 300, h: 260,
      body: `${mark(150, 62, 54, o.phase, o.color)}
        <text x="150" y="196" text-anchor="middle" ${len(o.text, 42, 280)} font-family="${FONT}" font-weight="900" font-stretch="125%" font-size="62" fill="${o.color}">${o.text}</text>
        <text x="150" y="236" text-anchor="middle" textLength="280" lengthAdjust="spacing" font-family="'JetBrains Mono', monospace" font-weight="500" font-size="13" fill="${o.color}">${o.tagline}</text>`,
    }),

    split: (o) => {
      const cut = o.text === WORD ? 4 : Math.ceil(o.text.length / 2);
      const a = o.text.slice(0, cut);
      const b = o.text.slice(cut);
      return {
        w: 460, h: 100,
        body: `<text x="200" y="74" text-anchor="end" ${len(a, 48, 196)} font-family="${FONT}" font-weight="900" font-stretch="125%" font-size="70" fill="${o.color}">${a}</text>
          ${mark(232, 50, 28, o.phase, o.color)}
          <text x="266" y="74" ${len(b, 48, 196)} font-family="${FONT}" font-weight="900" font-stretch="125%" font-size="70" fill="${o.color}">${b}</text>`,
      };
    },

    seal: (o) => {
      const id = `hlc${++uid}`;
      const ring = `${o.text} · ${o.tagline} · EST. 2026 · `;
      return {
        w: 300, h: 300,
        body: `<defs><path id="${id}" d="M150 150m-112 0a112 112 0 1 1 224 0a112 112 0 1 1 -224 0"/></defs>
          <circle cx="150" cy="150" r="140" fill="none" stroke="${o.color}" stroke-width="4"/>
          <circle cx="150" cy="150" r="88" fill="none" stroke="${o.color}" stroke-width="2"/>
          <text font-family="'JetBrains Mono', monospace" font-weight="700" font-size="20" letter-spacing="3.2" fill="${o.color}">
            <textPath href="#${id}" textLength="690">${ring}</textPath></text>
          ${mark(150, 150, 60, o.phase, o.color)}`,
      };
    },

    arch: (o) => {
      const id = `hla${++uid}`;
      return {
        w: 420, h: 250,
        body: `<defs><path id="${id}" d="M40 190 Q210 30 380 190"/></defs>
          <text font-family="${FONT}" font-weight="900" font-stretch="112%" font-size="66" fill="${o.color}" text-anchor="middle">
            <textPath href="#${id}" startOffset="50%">${o.text}</textPath></text>
          ${mark(210, 196, 36, o.phase, o.color)}`,
      };
    },

    script: (o) => {
      const t = o.text.charAt(0) + o.text.slice(1).toLowerCase();
      return {
        w: 420, h: 170,
        body: `<text x="196" y="118" text-anchor="middle" font-family="${SCRIPT}" font-size="120" fill="${o.color}" transform="rotate(-6 210 90)">${t}</text>
          <path d="M60 148 C150 132 280 132 356 142" fill="none" stroke="${o.color}" stroke-width="6" stroke-linecap="round" transform="rotate(-6 210 90)"/>
          ${mark(372, 128, 20, o.phase, o.color, 3)}`,
      };
    },

    box: (o) => ({
      w: 440, h: 130,
      body: `<rect x="4" y="4" width="432" height="122" fill="${o.color}"/>
        ${mark(70, 65, 36, o.phase, o.bg || "#0e0e0f")}
        <text x="124" y="88" ${len(o.text, 42, 294)} font-family="${FONT}" font-weight="900" font-stretch="125%" font-size="64" fill="${o.bg || "#0e0e0f"}">${o.text}</text>`,
    }),
  };

  /**
   * Render a lockup to an SVG string.
   * opts: { lockup, phase, color, finish, text, tagline, bg, title }
   */
  function render(opts = {}) {
    const o = Object.assign({
      lockup: "horizontal", phase: 0.5, color: "#eeebe3", finish: "flat",
      text: WORD, tagline: "MADE FOR THE HOUR BETWEEN",
    }, opts);
    o.text = String(o.text || WORD).toUpperCase().replace(/[<>&"]/g, "").slice(0, 12) || WORD;
    const build = LOCKUPS[o.lockup] || LOCKUPS.horizontal;
    const id = `hlf${++uid}`;
    const [defs, filterAttr] = finishDefs(o.finish, id, o.color);
    const colour = o.finish === "reflective" ? `url(#${id}g)` : o.color;
    const { w, h, body } = build(Object.assign({}, o, { color: colour }));
    const pad = 8;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}" role="img" aria-label="${o.title || "HALFLIT logo"}">
      <defs>${defs}</defs><g ${filterAttr}>${body}</g></svg>`;
  }

  global.HalflitLogo = { render, phasePath, LOCKUPS: Object.keys(LOCKUPS) };
})(window);
