(() => {
  "use strict";

  const { img, CAST, CATEGORIES, PRODUCTS, CAMPAIGN, DROPS } = window.HALFLIT;
  const Logo = window.HalflitLogo;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => "$" + n.toLocaleString("en-US");
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Image helpers ---------- */
  function wire(root = document) {
    $$("img[data-src]:not([src])", root).forEach((el) => {
      el.addEventListener("load", () => {
        el.classList.add("is-loaded");
        el.closest(".ph")?.classList.add("is-loaded");
      }, { once: true });
      el.src = el.dataset.src;
    });
  }
  const ph = (src, alt, cls = "") => `<div class="ph ${cls}"><img data-src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" /></div>`;

  // Hero
  const heroImg = $("#hero-img img");
  heroImg.addEventListener("load", () => heroImg.classList.add("is-loaded"), { once: true });
  heroImg.src = img(CAMPAIGN.hero);

  /* ---------- Logos around the page ---------- */
  const setLogo = (el, opts) => { el.innerHTML = Logo.render(opts); };
  setLogo($("#header-logo"), { lockup: "horizontal", color: "#eeebe3", phase: 0.5 });
  setLogo($("#hero-word"), { lockup: "split", color: "#eeebe3", phase: 0 });
  setLogo($("#footer-word"), { lockup: "split", color: "#eeebe3", phase: 0.5 });
  setLogo($("#signup-mark"), { lockup: "mark", color: "#ff6a13", phase: 0.5 });

  // The hero mark waxes from new to half on load; the header mark tracks scroll.
  function setPhase(root, phase) {
    const path = $(".hl-mark path", root);
    const c = $(".hl-mark circle", root);
    if (!path || !c) return;
    const r = Number(c.getAttribute("r")) + Number(c.getAttribute("stroke-width")) / 2;
    path.setAttribute("d", Logo.phasePath(Number(c.getAttribute("cx")), Number(c.getAttribute("cy")), r, phase));
  }
  (function wax() {
    const t0 = performance.now();
    const dur = reduce ? 1 : 1800;
    (function step(now) {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setPhase($("#hero-word"), 0.5 * e);
      $("#hero-phase").textContent = Math.round(50 * e);
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  })();

  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setPhase($("#header-logo"), 0.5 + 0.5 * Math.min(1, scrollY / Math.max(1, max)));
      $$(".header-nav a").forEach((a) => {
        const s = $(a.getAttribute("href"));
        const r = s.getBoundingClientRect();
        a.classList.toggle("is-active", r.top < innerHeight * 0.4 && r.bottom > innerHeight * 0.4);
      });
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Shop ---------- */
  const firstShot = (p) => p.shots.front || p.colours[0].flat;
  const hoverShot = (p) => p.shots.back || p.shots.detail || p.colours[0].back || p.colours[0].flat;

  const colourways = PRODUCTS.reduce((n, p) => n + p.colours.length, 0);
  $("#shop .label").textContent = `Drop 03 — ${PRODUCTS.length} pieces, ${colourways} colourways`;

  const chips = $("#chips");
  chips.innerHTML = CATEGORIES.map(([id, label], i) => {
    const n = id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === id).length;
    return `<button class="chip ${i === 0 ? "is-active" : ""}" role="tab" aria-selected="${i === 0}" data-cat="${id}">${label}<sup>${n}</sup></button>`;
  }).join("");

  const grid = $("#grid");
  grid.innerHTML = PRODUCTS.map((p) => `
    <article class="card reveal" data-cat="${p.cat}" data-id="${p.id}">
      <div class="card-media" data-open="${p.id}" role="button" tabindex="0" aria-label="View ${esc(p.name)}">
        ${p.badge ? `<span class="card-badge ${p.badge === "New" ? "" : "b-chalk"}">${p.badge}</span>`: ""}
        ${ph(img(firstShot(p), "min"), `${p.name} on model`, "main")}
        ${ph(img(hoverShot(p), "min"), "", "alt")}
        <button class="card-add" data-open="${p.id}" aria-label="Quick add ${esc(p.name)}">+</button>
      </div>
      <div class="card-info">
        <h3 class="card-name">${p.name}</h3>
        <span class="card-price">${money(p.price)}</span>
        <p class="card-sub">${p.sub}</p>
        <div class="dots">
          ${p.colours.map((c, i) => `<button class="dot" data-colour="${i}" style="background:${c.hex}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join("")}
          <span class="count">${p.colours.length} colours</span>
        </div>
      </div>
    </article>`).join("");
  wire(grid);

  chips.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    $$(".chip", chips).forEach((c) => {
      c.classList.toggle("is-active", c === b);
      c.setAttribute("aria-selected", String(c === b));
    });
    $$(".card", grid).forEach((card) => {
      card.classList.toggle("is-hidden", b.dataset.cat !== "all" && card.dataset.cat !== b.dataset.cat);
    });
  });

  // Colour dots swap the card to that colourway's product shot.
  grid.addEventListener("click", (e) => {
    const dot = e.target.closest(".dot");
    if (!dot) return;
    const card = dot.closest(".card");
    const p = byId[card.dataset.id];
    const i = Number(dot.dataset.colour);
    $$(".dot", card).forEach((d) => d.classList.toggle("is-active", d === dot));
    const main = $(".main img", card);
    main.classList.remove("is-loaded");
    main.src = img(i === 0 && p.shots.front ? p.shots.front : p.colours[i].flat, "min");
    card.dataset.colour = i;
  });

  /* ---------- Product detail ---------- */
  const pdp = $("#pdp");
  let cur = null, colour = 0, size = null, lastFocus = null;

  function galleryFor(p, ci) {
    const c = p.colours[ci];
    const list = [];
    const main = p.colours[0].name;
    if (ci === 0) {
      if (p.shots.front) list.push([p.shots.front, `On model — ${main}`]);
      if (p.shots.back) list.push([p.shots.back, "On model — back"]);
      if (p.shots.detail) list.push([p.shots.detail, "On model — angle"]);
      if (p.shots.close) list.push([p.shots.close, "Close-up"]);
      list.push([c.flat, `Product — ${c.name}`]);
      if (c.back) list.push([c.back, "Product — back"]);
    } else {
      list.push([c.flat, `Product — ${c.name}`]);
      if (p.shots.front) list.push([p.shots.front, `On model — shown in ${main}`]);
      if (p.shots.back) list.push([p.shots.back, `Back — shown in ${main}`]);
      if (p.shots.detail) list.push([p.shots.detail, `Angle — shown in ${main}`]);
      if (p.shots.close) list.push([p.shots.close, `Close-up — shown in ${main}`]);
      if (p.colours[0].back) list.push([p.colours[0].back, `Product back — ${main}`]);
    }
    return list;
  }

  function showView(src, label) {
    const im = $("#pdp-img");
    im.style.opacity = 0.3;
    im.onload = () => { im.style.opacity = 1; };
    im.src = img(src);
    im.alt = `${cur.name}, ${label}`;
    $("#pdp-view").textContent = label;
    $(".pdp-main").classList.remove("is-zoom");
  }

  function renderPdp() {
    const p = cur;
    const c = p.colours[colour];
    const views = galleryFor(p, colour);
    $("#pdp-colour").textContent = c.name;
    $$("#pdp-colours button").forEach((b, i) => b.classList.toggle("is-active", i === colour));
    $("#pdp-thumbs").innerHTML = views.map(([src, label], i) =>
      `<button class="${i === 0 ? "is-active" : ""}" data-src="${src}" data-label="${esc(label)}" aria-label="${esc(label)}"><img src="${img(src, "min")}" alt="" /></button>`).join("");
    showView(views[0][0], views[0][1]);
  }

  function openPdp(id, ci) {
    cur = byId[id];
    if (!cur) return;
    colour = ci || 0;
    size = cur.sizes.length === 1 ? cur.sizes[0] : null;
    lastFocus = document.activeElement;
    const m = CAST[cur.model];
    $("#pdp-cat").textContent = `${CATEGORIES.find((c) => c[0] === cur.cat)[1]} · Drop 03`;
    $("#pdp-name").textContent = cur.name;
    $("#pdp-price").textContent = money(cur.price);
    $("#pdp-desc").textContent = cur.desc;
    $("#pdp-colours").innerHTML = cur.colours.map((c, i) =>
      `<button type="button" data-colour="${i}" style="background:${c.hex}" aria-label="${esc(c.name)}"></button>`).join("");
    $("#pdp-sizes").innerHTML = cur.sizes.map((s) =>
      `<button type="button" data-size="${s}" ${cur.soldOut.includes(s) ? "disabled" : ""} class="${s === size ? "is-active" : ""}">${s}</button>`).join("");
    $("#pdp-specs").innerHTML = `<dt>Fit</dt><dd>${cur.fit}</dd><dt>Fabric</dt><dd>${cur.fabric}</dd><dt>Graphic</dt><dd>${cur.technique}</dd><dt>Ships</dt><dd>Free over $150 · 30-day returns</dd>`;
    $("#pdp-model").textContent = m ? `${m.name} is ${m.height} and wears ${cur.modelSize}` : "";
    updateAdd();
    renderPdp();
    pdp.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => requestAnimationFrame(() => pdp.classList.add("is-open")));
    setTimeout(() => $(".pdp-close").focus(), 60);
  }
  function closePdp() {
    if (pdp.hidden) return;
    pdp.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setTimeout(() => { pdp.hidden = true; }, reduce ? 0 : 400);
    lastFocus?.focus({ preventScroll: true });
  }
  function updateAdd() {
    const b = $("#pdp-add");
    b.disabled = !size;
    b.textContent = size ? `Add to bag — ${money(cur.price)}` : "Select a size";
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".dot")) return;
    const o = e.target.closest("[data-open]");
    if (o) {
      const card = o.closest(".card");
      openPdp(o.dataset.open, card ? Number(card.dataset.colour || 0) : 0);
      return;
    }
    if (e.target.closest("[data-close]")) closePdp();
  });
  grid.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".card-media")) {
      e.preventDefault();
      openPdp(e.target.dataset.open, Number(e.target.closest(".card").dataset.colour || 0));
    }
  });
  $("#pdp-thumbs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("#pdp-thumbs button").forEach((x) => x.classList.toggle("is-active", x === b));
    showView(b.dataset.src, b.dataset.label);
  });
  $("#pdp-colours").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    colour = Number(b.dataset.colour);
    renderPdp();
  });
  $("#pdp-sizes").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    size = b.dataset.size;
    $$("#pdp-sizes button").forEach((x) => x.classList.toggle("is-active", x === b));
    updateAdd();
  });
  const pdpMain = $(".pdp-main");
  pdpMain.addEventListener("click", (e) => {
    const r = pdpMain.getBoundingClientRect();
    $("#pdp-img").style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    pdpMain.classList.toggle("is-zoom");
  });
  pdpMain.addEventListener("pointermove", (e) => {
    if (!pdpMain.classList.contains("is-zoom")) return;
    const r = pdpMain.getBoundingClientRect();
    $("#pdp-img").style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });
  $("#pdp-add").addEventListener("click", () => {
    if (!size) return;
    addToBag(cur.id, colour, size);
    toast(`${cur.name} — ${cur.colours[colour].name}, ${size} added`);
    closePdp();
    setTimeout(openBag, reduce ? 0 : 350);
  });

  /* ---------- Bag ---------- */
  const KEY = "halflit-bag";
  const FREE = 150;
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY)) || []; } catch { bag = []; }
  bag = bag.filter((l) => byId[l.id] && byId[l.id].colours[l.colour]);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch { /* ignore */ } };
  const bagEl = $("#bag");

  function addToBag(id, ci, sz) {
    const l = bag.find((x) => x.id === id && x.colour === ci && x.size === sz);
    if (l) l.qty++;
    else bag.push({ id, colour: ci, size: sz, qty: 1 });
    save();
    renderBag();
    const c = $("#bag-count");
    c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  }
  function renderBag() {
    const count = bag.reduce((n, l) => n + l.qty, 0);
    const total = bag.reduce((n, l) => n + byId[l.id].price * l.qty, 0);
    $("#bag-count").textContent = count;
    bagEl.classList.toggle("is-empty", !count);
    $("#bag-items").innerHTML = bag.map((l, i) => {
      const p = byId[l.id], c = p.colours[l.colour];
      return `<li class="bag-item"><img src="${img(c.flat, "min")}" alt="${esc(p.name)}" />
        <div><h4>${p.name}</h4><p>${c.name} · ${l.size}</p>
          <div class="bag-item-row"><span class="qty"><button data-q="-1" data-i="${i}" aria-label="Fewer">−</button><span>${l.qty}</span><button data-q="1" data-i="${i}" aria-label="More">+</button></span>
          <b class="mono">${money(p.price * l.qty)}</b></div></div></li>`;
    }).join("");
    $("#bag-subtotal").textContent = money(total);
    $("#bag-bar").style.width = `${Math.min(100, (total / FREE) * 100)}%`;
    $("#bag-ship").textContent = total >= FREE ? "You've unlocked free shipping" : `${money(FREE - total)} away from free shipping`;
    $("#checkout-note").textContent = "";
  }
  $("#bag-items").addEventListener("click", (e) => {
    const b = e.target.closest("[data-q]");
    if (!b) return;
    const l = bag[Number(b.dataset.i)];
    l.qty += Number(b.dataset.q);
    if (l.qty < 1) bag.splice(Number(b.dataset.i), 1);
    save(); renderBag();
  });
  function openBag() { bagEl.classList.add("is-open"); bagEl.setAttribute("aria-hidden", "false"); document.body.classList.add("is-locked"); }
  function closeBag() { if (!bagEl.classList.contains("is-open")) return; bagEl.classList.remove("is-open"); bagEl.setAttribute("aria-hidden", "true"); document.body.classList.remove("is-locked"); }
  $("#bag-btn").addEventListener("click", openBag);
  $$("[data-close-bag]").forEach((b) => b.addEventListener("click", closeBag));
  $("#checkout").addEventListener("click", () => { $("#checkout-note").textContent = "Concept store — checkout is switched off."; });
  renderBag();

  addEventListener("keydown", (e) => { if (e.key === "Escape") { closePdp(); closeBag(); } });

  const toastEl = $("#toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  }

  /* ---------- Lookbook rail (drag to scroll) ---------- */
  const rail = $("#rail");
  rail.innerHTML = CAMPAIGN.looks.map((l) => `
    <figure class="shot ${l.wide ? "wide" : ""}">
      ${ph(img(l.id), `${l.title} — ${l.who}`)}
      <figcaption><b>${l.title}</b><span class="mono muted">${l.who}</span></figcaption>
    </figure>`).join("");
  wire(rail);
  let drag = null;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX, left: rail.scrollLeft, moved: false };
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) { drag.moved = true; rail.classList.add("is-dragging"); }
    rail.scrollLeft = drag.left - dx;
  });
  const endDrag = () => { drag = null; rail.classList.remove("is-dragging"); };
  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);

  /* ---------- Cast ---------- */
  const castShot = (key) => CAMPAIGN.portraits[key] || (PRODUCTS.find((p) => p.model === key && p.shots.front) || {}).shots?.front;
  $("#cast-grid").innerHTML = Object.entries(CAST).map(([key, m]) => {
    const wears = PRODUCTS.filter((p) => p.model === key).map((p) => p.name).join(" + ");
    const shot = castShot(key);
    return `<article class="member reveal">
      ${shot ? ph(img(shot), `${m.name}, ${m.age}`) : `<div class="ph"></div>`}
      <div class="member-info">
        <h3>${m.name}, ${m.age}</h3>
        <p>${m.city} — ${m.bio}</p>
        <p class="mono muted" style="margin-top:6px">Wears: ${wears}</p>
        <div class="tags">${m.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      </div>
    </article>`;
  }).join("");
  wire($("#cast-grid"));

  /* ---------- Logo Lab ---------- */
  const INKS = [
    ["Chalk", "#eeebe3"], ["Sodium", "#ff6a13"], ["Asphalt", "#141416"], ["Signal", "#c8ff3d"],
    ["Night Blue", "#2a3766"], ["Maroon", "#6b1f2a"], ["Cream", "#efe3c8"],
  ];
  const FABRICS = [
    ["Ink", "#1c1c1f"], ["Bone", "#e4ddcd"], ["Heather", "#a9a8a4"], ["Sodium", "#ff6a13"],
    ["Forest", "#23402e"], ["Navy", "#232c47"], ["Maroon", "#5a1b24"],
  ];
  const LOCKUP_NAMES = { horizontal: "Wordmark", stacked: "Stacked", split: "Split", mark: "Mark", seal: "Seal", arch: "Varsity", script: "Script", box: "Box" };
  const FINISHES = [["flat", "Screen print"], ["puff", "Puff"], ["stitch", "Embroidery"], ["chenille", "Chenille"], ["reflective", "Reflective"]];
  const GARMENTS = [["hoodie", "Hoodie"], ["tee", "Tee"], ["cap", "Cap"]];
  const PLACES = { hoodie: [["chest", "Left chest"], ["center", "Centre"], ["back", "Back"], ["sleeve", "Sleeve"]], tee: [["chest", "Left chest"], ["center", "Centre"], ["back", "Back"], ["sleeve", "Sleeve"]], cap: [["front", "Front"], ["side", "Side"]] };

  const lab = { lockup: "stacked", phase: 0.5, finish: "stitch", ink: "#ff6a13", garment: "hoodie", fabric: "#1c1c1f", place: "center", text: "" };

  function segButtons(el, items, key, onPick) {
    el.innerHTML = items.map(([v, label]) => `<button type="button" data-v="${v}" aria-pressed="${lab[key] === v}">${label}</button>`).join("");
    el.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      lab[key] = b.dataset.v;
      $$("button", el).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      onPick?.();
      renderLab();
    };
  }
  function swatchButtons(el, items, key) {
    el.innerHTML = items.map(([name, hex]) => `<button type="button" data-v="${hex}" style="background:${hex}" aria-label="${name}" title="${name}" aria-pressed="${lab[key] === hex}"></button>`).join("");
    el.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      lab[key] = b.dataset.v;
      $$("button", el).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      renderLab();
    };
  }
  function initLab() {
    segButtons($("#c-lockup"), Logo.LOCKUPS.map((k) => [k, LOCKUP_NAMES[k] || k]), "lockup");
    segButtons($("#c-finish"), FINISHES, "finish");
    segButtons($("#c-garment"), GARMENTS, "garment", () => {
      const places = PLACES[lab.garment];
      if (!places.some(([v]) => v === lab.place)) lab.place = places[0][0];
      segButtons($("#c-place"), places, "place");
    });
    segButtons($("#c-place"), PLACES[lab.garment], "place");
    swatchButtons($("#c-ink"), INKS, "ink");
    swatchButtons($("#c-fabric"), FABRICS, "fabric");
  }

  const phaseIn = $("#c-phase");
  phaseIn.addEventListener("input", () => {
    lab.phase = phaseIn.value / 100;
    phaseIn.style.setProperty("--p", `${phaseIn.value}%`);
    $("#o-phase").textContent = `${phaseIn.value}%`;
    renderLab();
  });
  $("#c-text").addEventListener("input", (e) => { lab.text = e.target.value; renderLab(); });

  // Garment silhouettes in a 400x400 box.
  const SHAPES = {
    hoodie: {
      front: `<path d="M138 80 Q128 30 172 16 Q200 8 228 16 Q272 30 262 80Z" class="g-base"/>
        <path d="M156 80 Q158 38 200 32 Q242 38 244 80 Q200 100 156 80Z" class="g-dark" style="filter:brightness(.55)"/>
        <path d="M140 72 Q200 96 260 72 L302 86 Q332 102 338 142 L356 300 Q344 312 320 308 L302 196 L292 196 L292 352 Q200 362 108 352 L108 196 L98 196 L80 308 Q56 312 44 300 L62 142 Q68 102 98 86Z" class="g-base"/>
        <path d="M168 76 Q200 128 232 76" class="g-line"/><path d="M186 100 L184 150 M214 100 L216 150" class="g-line"/>
        <path d="M146 268 L254 268 L266 330 L134 330Z" class="g-line"/>
        <path d="M108 336 Q200 346 292 336" class="g-line"/><path d="M46 288 Q62 296 82 294 M318 294 Q338 296 354 288" class="g-line"/>`,
      back: `<path d="M140 72 Q200 96 260 72 L302 86 Q332 102 338 142 L356 300 Q344 312 320 308 L302 196 L292 196 L292 352 Q200 362 108 352 L108 196 L98 196 L80 308 Q56 312 44 300 L62 142 Q68 102 98 86Z" class="g-base"/>
        <path d="M140 74 Q148 24 200 22 Q252 24 260 74 Q236 120 200 124 Q164 120 140 74Z" class="g-base"/><path d="M140 74 Q148 24 200 22 Q252 24 260 74 Q236 120 200 124 Q164 120 140 74Z" class="g-line"/>
        <path d="M108 336 Q200 346 292 336" class="g-line"/>`,
      spots: { chest: [212, 118, 54, 54], center: [128, 128, 144, 118], back: [118, 136, 164, 170], sleeve: [306, 200, 32, 44, -8] },
    },
    tee: {
      front: `<path d="M150 56 Q200 84 250 56 L296 70 L352 122 L318 170 L290 150 L290 352 Q200 360 110 352 L110 150 L82 170 L48 122 L104 70Z" class="g-base"/>
        <path d="M150 56 Q200 92 250 56" class="g-line"/><path d="M160 60 Q200 84 240 60" class="g-line"/>
        <path d="M290 150 L290 110 M110 150 L110 110" class="g-line"/>`,
      back: `<path d="M150 56 Q200 70 250 56 L296 70 L352 122 L318 170 L290 150 L290 352 Q200 360 110 352 L110 150 L82 170 L48 122 L104 70Z" class="g-base"/>
        <path d="M150 56 Q200 70 250 56" class="g-line"/>`,
      spots: { chest: [210, 100, 50, 50], center: [124, 112, 152, 132], back: [118, 100, 164, 180], sleeve: [300, 90, 34, 34, 36] },
    },
    cap: {
      front: `<path d="M86 250 Q92 112 200 104 Q308 112 314 250Z" class="g-base"/>
        <path d="M200 106 L200 248 M140 116 Q120 180 124 250 M260 116 Q280 180 276 250" class="g-line"/>
        <circle cx="200" cy="106" r="7" class="g-dark"/>
        <path d="M76 246 Q200 272 324 246 Q346 282 300 296 Q200 316 100 296 Q54 282 76 246Z" class="g-dark"/>`,
      back: null,
      spots: { front: [140, 150, 120, 84], side: [256, 196, 38, 38, 12] },
    },
  };

  function garmentSVG() {
    const g = SHAPES[lab.garment];
    const back = lab.place === "back" && g.back;
    const [x, y, w, h, rot = 0] = g.spots[lab.place] || Object.values(g.spots)[0];
    const art = Logo.render({ lockup: lab.lockup, phase: lab.phase, color: lab.ink, finish: lab.finish, text: lab.text || undefined, bg: lab.fabric })
      .replace("<svg ", `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" `);
    const light = ["#e4ddcd", "#a9a8a4", "#ff6a13"].includes(lab.fabric);
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${lab.garment} ${back ? "back" : "front"} preview">
      <defs>
        <linearGradient id="gshade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
        <filter id="gtex"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="t"/><feBlend in="SourceGraphic" in2="t" mode="multiply"/></filter>
      </defs>
      <style>
        .g-base{fill:${lab.fabric};filter:url(#gtex)}
        .g-dark{fill:${lab.fabric};filter:brightness(.8)}
        .g-line{fill:none;stroke:${light ? "rgba(0,0,0,.22)" : "rgba(255,255,255,.14)"};stroke-width:2;stroke-linecap:round}
      </style>
      <g>${back ? g.back : g.front}</g>
      <g class="g-art" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${art}</g>
      <rect x="0" y="0" width="400" height="400" fill="url(#gshade)" style="mix-blend-mode:soft-light" pointer-events="none"/>
    </svg>`;
  }

  function renderLab() {
    $("#lab-garment").innerHTML = garmentSVG();
    $("#lab-flat").innerHTML = Logo.render({ lockup: lab.lockup, phase: lab.phase, color: lab.ink, finish: lab.finish, text: lab.text || undefined, bg: lab.fabric });
    $("#lab-flat").style.backgroundColor = lab.fabric;
  }

  $("#c-random").addEventListener("click", () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    lab.lockup = pick(Logo.LOCKUPS);
    lab.finish = pick(FINISHES)[0];
    lab.garment = pick(GARMENTS)[0];
    lab.place = pick(PLACES[lab.garment])[0];
    lab.fabric = pick(FABRICS)[1];
    do { lab.ink = pick(INKS)[1]; } while (lab.ink === lab.fabric);
    lab.phase = Math.round(Math.random() * 20) / 20;
    phaseIn.value = lab.phase * 100;
    phaseIn.dispatchEvent(new Event("input"));
    initLab();
    renderLab();
  });
  $("#c-download").addEventListener("click", () => {
    const svg = Logo.render({ lockup: lab.lockup, phase: lab.phase, color: lab.ink, finish: lab.finish, text: lab.text || undefined, bg: lab.fabric });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    a.download = `halflit-${lab.lockup}-${Math.round(lab.phase * 100)}.svg`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  });
  initLab();
  phaseIn.dispatchEvent(new Event("input"));

  /* ---------- Identity ---------- */
  const TILES = [
    ["horizontal", "#0e0e0f", "#eeebe3", "flat", 0.5],
    ["stacked", "#ff6a13", "#0e0e0f", "flat", 0.5],
    ["seal", "#eeebe3", "#0e0e0f", "flat", 0.5],
    ["arch", "#5a1b24", "#efe3c8", "puff", 0.75],
    ["script", "#1c2440", "#ff6a13", "stitch", 0.5],
    ["box", "#17171a", "#ff6a13", "flat", 0.5],
    ["split", "#c8ff3d", "#0e0e0f", "flat", 0.25],
    ["mark", "#222226", "#eeebe3", "reflective", 0.5],
  ];
  $("#id-lockups").innerHTML = TILES.map(([l, bg, ink, fin, ph]) =>
    `<div class="lockup-tile" style="background:${bg};color:${ink}">${Logo.render({ lockup: l, color: ink, finish: fin, phase: ph, bg })}<span>${LOCKUP_NAMES[l]} / ${FINISHES.find((f) => f[0] === fin)[1]}</span></div>`).join("");
  $("#phases").innerHTML = DROPS.map((d) =>
    `<div class="phase ${d.now ? "is-now" : ""}">${Logo.render({ lockup: "mark", phase: d.phase, color: d.now ? "#ff6a13" : "#eeebe3" })}
      <div><span class="mono">Drop ${d.n}${d.now ? " — now" : ""}</span><br /><b>${d.name}</b><br /><span class="mono muted">${d.date}</span></div></div>`).join("");

  /* ---------- Signup ---------- */
  $("#signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const i = $("#email");
    const n = $("#signup-note");
    if (!i.value || !i.checkValidity()) { n.textContent = "That email doesn't look right."; i.focus(); return; }
    n.textContent = "You're on the list. See you at the next drop.";
    i.value = "";
  });

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Cursor ---------- */
  if (fine && !reduce) {
    document.documentElement.classList.add("has-cursor");
    const cur = $(".cursor"), dot = $("span", cur);
    let x = -100, y = -100, tx = -100, ty = -100;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.25; y += (ty - y) * 0.25;
      cur.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const media = e.target.closest(".card-media, .rail");
      const isRail = !!e.target.closest(".rail");
      cur.classList.toggle("is-view", !!media && !e.target.closest(".card-add"));
      dot.textContent = media && !e.target.closest(".card-add") ? (isRail ? "Drag" : "View") : "";
    });
  }
})();
