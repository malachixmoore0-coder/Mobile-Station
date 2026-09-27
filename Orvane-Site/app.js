(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const html = document.documentElement;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => "$" + n.toLocaleString("en-US");

  const PRODUCTS = [
    {
      id: "aurelio", name: "Aurelio Overcoat", cat: "outerwear", tag: "New",
      sub: "Double-faced cashmere", price: 3450, colour: ["Camel", "#b08a5f"],
      sizes: ["44", "46", "48", "50", "52", "54"], soldOut: ["54"],
      material: "100% cashmere, woven in Biella",
      desc: "Our signature coat, cut from a single double-faced cashmere cloth with every seam hand-closed. Dropped shoulders, a softly rolled lapel and a length that falls just below the knee.",
    },
    {
      id: "sera", name: "Sera Knit", cat: "knitwear",
      sub: "Cashmere-silk crewneck", price: 1180, colour: ["Ivory", "#ece4d4"],
      sizes: ["XS", "S", "M", "L", "XL"], soldOut: [],
      material: "85% cashmere, 15% mulberry silk",
      desc: "A fine-gauge crewneck with a gentle sheen from spun silk. Fully fashioned on vintage Italian frames and linked by hand at the collar.",
    },
    {
      id: "linea", name: "Linea Trouser", cat: "tailoring",
      sub: "Pleated wool flannel", price: 890, colour: ["Charcoal", "#3d3b3a"],
      sizes: ["44", "46", "48", "50", "52"], soldOut: ["44"],
      material: "100% Biella wool flannel",
      desc: "A high-rise trouser with double forward pleats, side adjusters and a wide, fluid leg. Left unhemmed so our tailors can finish it to your length.",
    },
    {
      id: "nove", name: "Nove Tote", cat: "leather", tag: "Atelier",
      sub: "Vegetable-tanned calfskin", price: 2650, colour: ["Cognac", "#8b5a33"],
      sizes: ["One size"], soldOut: [],
      material: "Bark-tanned calfskin from Santa Croce",
      desc: "An unlined, hand-stitched tote in leather that darkens and softens with use. Saddle-stitched handles, a single interior pocket and raw, burnished edges.",
    },
    {
      id: "vela", name: "Vela Shirt", cat: "tailoring",
      sub: "Washed silk charmeuse", price: 780, colour: ["Champagne", "#d9c6a5"],
      sizes: ["XS", "S", "M", "L", "XL"], soldOut: ["XS"],
      material: "100% mulberry silk",
      desc: "A relaxed camp-collar shirt in sand-washed silk with mother-of-pearl buttons. Light enough to layer beneath tailoring from September to May.",
    },
    {
      id: "ardesia", name: "Ardesia Blazer", cat: "tailoring",
      sub: "Unstructured wool-cashmere", price: 2890, colour: ["Slate", "#5d646b"],
      sizes: ["44", "46", "48", "50", "52", "54"], soldOut: [],
      material: "90% wool, 10% cashmere",
      desc: "A single-breasted jacket with no canvas and no padding — only a hand-rolled lapel and patch pockets. It moves like a cardigan and holds its line like tailoring.",
    },
  ];
  PRODUCTS.forEach((p) => {
    p.img = `images/p-${p.id}.jpg`;
    p.alt = `images/p-${p.id}-2.jpg`;
  });
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Images: fade in, fall back to styled placeholder ---------- */
  function watchImg(img) {
    const ok = () => img.classList.add("is-loaded");
    const bad = () => img.classList.add("is-missing");
    if (img.complete && img.getAttribute("src")) {
      img.naturalWidth ? ok() : bad();
    }
    img.addEventListener("load", ok);
    img.addEventListener("error", bad);
  }

  /* ---------- Product grid ---------- */
  const grid = $("#grid");
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <article class="card reveal" style="--d:${i % 3}" data-cat="${p.cat}">
      <a class="card-media" href="#${p.id}" data-open="${p.id}" aria-label="View ${p.name}">
        ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ""}
        <div class="frame" data-label="${p.name}">
          <img src="${p.img}" alt="${p.name} in ${p.colour[0].toLowerCase()}, ${p.sub.toLowerCase()}" loading="lazy" />
          <img class="alt" src="${p.alt}" alt="" loading="lazy" />
        </div>
        <button class="card-quick" type="button" data-open="${p.id}">Quick view</button>
      </a>
      <div class="card-info">
        <div>
          <h3 class="card-name">${p.name}</h3>
          <p class="card-sub">${p.sub}</p>
          <div class="card-dots"><i style="background:${p.colour[1]}" title="${p.colour[0]}"></i></div>
        </div>
        <span class="card-price">${money(p.price)}</span>
      </div>
    </article>`).join("");

  $$(".frame img").forEach(watchImg);

  // Filters
  $$(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      $$(".filter").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      const cards = $$(".card", grid);
      cards.forEach((c) => c.classList.add("is-fading"));
      setTimeout(() => {
        cards.forEach((c) => {
          c.classList.toggle("is-out", f !== "all" && c.dataset.cat !== f);
        });
        requestAnimationFrame(() => cards.forEach((c) => c.classList.remove("is-fading")));
      }, reduce ? 0 : 350);
    });
  });

  /* ---------- Curtain / ready ---------- */
  const start = performance.now();
  function ready() {
    const wait = Math.max(0, (reduce ? 200 : 1700) - (performance.now() - start));
    setTimeout(() => {
      $("#curtain").classList.add("is-done");
      document.body.classList.remove("is-loading");
      html.classList.add("is-ready");
    }, wait);
  }
  if (document.readyState === "complete") ready();
  else {
    let done = false;
    const once = () => { if (!done) { done = true; ready(); } };
    addEventListener("load", once);
    setTimeout(once, 3500);
  }

  /* ---------- Reveals & counters ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
      if (e.target.dataset.count !== undefined) countUp(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .atelier-media .frame").forEach((el) => io.observe(el));
  $$("[data-count]").forEach((el) => io.observe(el));

  function countUp(el) {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const t0 = performance.now();
    const dur = reduce ? 1 : 1800;
    (function step(now) {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 4))) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Statement: words light up as you read ---------- */
  const statement = $("#statement");
  statement.innerHTML = statement.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  const words = $$(".w", statement);

  /* ---------- Scroll-driven effects ---------- */
  const header = $("#header");
  const hero = $(".hero");
  const lookbook = $("#lookbook");
  const lbTrack = $("#lb-track");
  const lbProgress = $("#lb-progress");
  const lbImgs = $$(".look img", lbTrack);
  const parallax = $$("[data-parallax]");
  let lastY = scrollY;
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const vh = innerHeight;

    // Header: transparent over hero, solid after; hides while scrolling down.
    header.classList.toggle("is-solid", y > hero.offsetHeight - 120);
    header.classList.toggle("is-hidden", y > lastY && y > vh * 0.8 && !document.body.classList.contains("is-locked"));
    lastY = y;

    // Statement words
    const sr = statement.getBoundingClientRect();
    const sp = Math.min(1, Math.max(0, (vh * 0.85 - sr.top) / (sr.height + vh * 0.35)));
    const lit = Math.round(sp * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));

    if (!reduce) {
      parallax.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const offset = (r.top + r.height / 2 - vh / 2) * Number(img.dataset.parallax);
        img.style.translate = `0 ${-offset}px`;
      });
    }

    // Lookbook: vertical scroll drives the horizontal track (desktop only).
    if (innerWidth > 760) {
      const lr = lookbook.getBoundingClientRect();
      const travel = lookbook.offsetHeight - vh;
      const p = Math.min(1, Math.max(0, -lr.top / travel));
      const shift = Math.max(0, lbTrack.scrollWidth - (innerWidth - lbTrack.offsetLeft));
      lbTrack.style.transform = `translate3d(${-p * shift}px,0,0)`;
      lbProgress.style.transform = `scaleX(${p})`;
      if (!reduce) lbImgs.forEach((img, i) => { img.style.translate = `${(p * 60 - i * 20) * -1}px 0`; });
    }
    ticking = false;
  }
  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Cursor, tilt, magnetic (mouse only) ---------- */
  if (fine && !reduce) {
    const cursor = $(".cursor");
    let cx = -200, cy = -200, tx = -200, ty = -200, scale = 0, shown = false;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      scale += ((shown ? 1 : 0) - scale) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(${scale})`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const onMedia = !!e.target.closest(".card-media, .look-end") && !e.target.closest(".card-quick");
      shown = onMedia;
    });

    grid.addEventListener("pointermove", (e) => {
      const m = e.target.closest(".card-media");
      if (!m) return;
      const r = m.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      m.classList.add("is-tilting");
      m.style.setProperty("--ry", `${px * 7}deg`);
      m.style.setProperty("--rx", `${-py * 7}deg`);
    });
    grid.addEventListener("pointerout", (e) => {
      const m = e.target.closest(".card-media");
      if (!m || m.contains(e.relatedTarget)) return;
      m.classList.remove("is-tilting");
      m.style.setProperty("--rx", "0deg");
      m.style.setProperty("--ry", "0deg");
    });

    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menu-btn");
  const menu = $("#mobile-menu");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    header.classList.toggle("is-solid", open || scrollY > hero.offsetHeight - 120);
    document.body.classList.toggle("is-locked", open);
  }
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Quick view ---------- */
  const modal = $("#modal");
  const qv = {
    img: $("#qv-img"), thumbs: $("#qv-thumbs"), cat: $("#qv-cat"), name: $("#qv-name"),
    price: $("#qv-price"), desc: $("#qv-desc"), colour: $("#qv-colour"), colours: $("#qv-colours"),
    sizes: $("#qv-sizes"), add: $("#qv-add"), material: $("#qv-material"),
  };
  watchImg(qv.img);
  let current = null, size = null, lastFocus = null;

  function setMain(src, alt) {
    qv.img.classList.remove("is-loaded", "is-missing");
    qv.img.alt = alt;
    qv.img.src = src;
    qv.img.parentElement.dataset.label = current.name;
  }

  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    current = p;
    size = p.sizes.length === 1 ? p.sizes[0] : null;
    lastFocus = document.activeElement;

    qv.cat.textContent = `${p.cat} · ${p.sub}`;
    qv.name.textContent = p.name;
    qv.price.textContent = money(p.price);
    qv.desc.textContent = p.desc;
    qv.material.textContent = p.material;
    qv.colour.textContent = p.colour[0];
    qv.colours.innerHTML = `<button class="is-active" style="background:${p.colour[1]}" aria-label="${p.colour[0]}"></button>`;
    setMain(p.img, `${p.name} in ${p.colour[0].toLowerCase()}`);

    qv.thumbs.innerHTML = [p.img, p.alt].map((src, i) => `
      <button class="${i === 0 ? "is-active" : ""}" data-src="${src}" aria-label="Image ${i + 1}">
        <span class="frame"><img src="${src}" alt="" /></span>
      </button>`).join("");
    $$("img", qv.thumbs).forEach(watchImg);

    qv.sizes.innerHTML = p.sizes.map((s) => `
      <button type="button" data-size="${s}" ${p.soldOut.includes(s) ? "disabled aria-label='" + s + ", sold out'" : ""} class="${s === size ? "is-active" : ""}">${s}</button>`).join("");
    updateAdd();

    modal.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-open")));
    setTimeout(() => $(".modal-close", modal).focus(), 50);
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setTimeout(() => { modal.hidden = true; }, reduce ? 0 : 500);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function updateAdd() {
    qv.add.disabled = !size;
    qv.add.textContent = size ? `Add to bag — ${money(current.price)}` : "Select a size";
  }

  qv.thumbs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("button", qv.thumbs).forEach((x) => x.classList.toggle("is-active", x === b));
    setMain(b.dataset.src, current.name);
  });
  qv.sizes.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    size = b.dataset.size;
    $$("button", qv.sizes).forEach((x) => x.classList.toggle("is-active", x === b));
    updateAdd();
  });
  qv.add.addEventListener("click", () => {
    if (!size) return;
    addToBag(current.id, size);
    closeModal();
    toast(`${current.name} added to your bag`);
    setTimeout(openBag, reduce ? 0 : 450);
  });

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) {
      e.preventDefault();
      openProduct(opener.dataset.open);
      return;
    }
    if (e.target.closest("[data-close]")) closeModal();
  });

  /* ---------- Bag ---------- */
  const STORE_KEY = "orvane-bag";
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { bag = []; }
  bag = bag.filter((l) => byId[l.id]);

  const drawer = $("#drawer");
  const bagItems = $("#bag-items");
  const bagCount = $("#bag-count");

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(bag)); } catch { /* storage unavailable */ }
  }

  function addToBag(id, sz) {
    const line = bag.find((l) => l.id === id && l.size === sz);
    if (line) line.qty += 1;
    else bag.push({ id, size: sz, qty: 1 });
    save();
    renderBag();
    bagCount.classList.remove("bump");
    void bagCount.offsetWidth;
    bagCount.classList.add("bump");
  }

  function renderBag() {
    const count = bag.reduce((n, l) => n + l.qty, 0);
    bagCount.textContent = count;
    drawer.classList.toggle("is-empty", count === 0);
    bagItems.innerHTML = bag.map((l, i) => {
      const p = byId[l.id];
      return `
        <li class="bag-item">
          <div class="frame"><img src="${p.img}" alt="${p.name}" /></div>
          <div>
            <h4>${p.name}</h4>
            <p>${p.colour[0]} · Size ${l.size}</p>
            <div class="bag-item-row">
              <span class="qty">
                <button type="button" data-qty="-1" data-i="${i}" aria-label="Decrease quantity">−</button>
                <span>${l.qty}</span>
                <button type="button" data-qty="1" data-i="${i}" aria-label="Increase quantity">+</button>
              </span>
              <b>${money(p.price * l.qty)}</b>
            </div>
            <button type="button" class="bag-remove" data-remove="${i}">Remove</button>
          </div>
        </li>`;
    }).join("");
    $$("img", bagItems).forEach(watchImg);
    $("#bag-subtotal").textContent = money(bag.reduce((n, l) => n + byId[l.id].price * l.qty, 0));
    $("#checkout-note").textContent = "";
  }

  bagItems.addEventListener("click", (e) => {
    const q = e.target.closest("[data-qty]");
    const r = e.target.closest("[data-remove]");
    if (q) {
      const l = bag[Number(q.dataset.i)];
      l.qty += Number(q.dataset.qty);
      if (l.qty < 1) bag.splice(Number(q.dataset.i), 1);
    } else if (r) {
      bag.splice(Number(r.dataset.remove), 1);
    } else return;
    save();
    renderBag();
  });

  function openBag() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    setTimeout(() => $(".drawer-head .icon-btn").focus(), 50);
  }
  function closeBag() {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }
  $("#bag-btn").addEventListener("click", openBag);
  $$("[data-close-bag]").forEach((el) => el.addEventListener("click", closeBag));
  $("#checkout").addEventListener("click", () => {
    $("#checkout-note").textContent = "This is a demonstration storefront — checkout is disabled.";
  });
  renderBag();

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal();
    closeBag();
    if (menu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  }

  /* ---------- Newsletter (no data leaves the page) ---------- */
  $("#letter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#email");
    const note = $("#letter-note");
    if (!input.checkValidity() || !input.value) {
      note.textContent = "Please enter a valid email address.";
      input.focus();
      return;
    }
    note.textContent = "Thank you — the next letter from Via Maggio is on its way to you.";
    input.value = "";
  });
})();
