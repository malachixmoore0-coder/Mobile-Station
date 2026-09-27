// DOM-side interactions: loader, text splitting, reveals, custom cursor,
// magnetic buttons, 3D tilt cards, counters and the Lab controls. Talks to
// scene.js through window CustomEvents.
const root = document.documentElement;
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lerp = (a, b, t) => a + (b - a) * t;

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Split hero title into animated characters ---------- */
let charIndex = 0;
document.querySelectorAll(".hero-title .split").forEach((el) => {
  const text = el.textContent;
  el.textContent = "";
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "char";
    span.style.setProperty("--i", charIndex++);
    span.textContent = ch === " " ? " " : ch;
    el.appendChild(span);
  }
});

/* ---------- Loader ---------- */
document.body.classList.add("is-loading");
const loader = document.getElementById("loader");
const loaderNum = document.getElementById("loader-num");
let sceneReady = false;
let shown = 0;
window.addEventListener("station:ready", () => { sceneReady = true; }, { once: true });
setTimeout(() => { sceneReady = true; }, 4000); // never block the page on WebGL

(function countUp() {
  const cap = sceneReady ? 100 : 90;
  shown = Math.min(cap, shown + (sceneReady ? 4 : 1.6));
  loaderNum.textContent = Math.floor(shown);
  if (shown < 100) return requestAnimationFrame(countUp);
  loader.classList.add("is-done");
  document.body.classList.remove("is-loading");
  requestAnimationFrame(() => root.classList.add("is-ready"));
})();

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Counters ---------- */
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      const el = entry.target;
      const end = Number(el.dataset.count);
      const prefix = el.dataset.prefix || "";
      const start = performance.now();
      const dur = reduceMotion ? 1 : 1600;
      (function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = prefix + Math.round(end * eased);
        if (t < 1) requestAnimationFrame(step);
      })(start);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

/* ---------- Nav: hide on scroll down, highlight section ---------- */
const nav = document.getElementById("nav");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const flowSection = document.getElementById("flow");
const flowBar = document.getElementById("flow-progress");
let lastY = window.scrollY;

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("is-hidden", y > lastY && y > 160);
  lastY = y;

  const mid = window.innerHeight / 2;
  navLinks.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    const r = sec.getBoundingClientRect();
    a.classList.toggle("is-active", r.top <= mid && r.bottom >= mid);
  });

  const r = flowSection.getBoundingClientRect();
  const p = (window.innerHeight * 0.8 - r.top) / (r.height * 0.6);
  flowBar.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Custom cursor ---------- */
if (finePointer) {
  root.classList.add("has-cursor");
  const cursor = document.querySelector(".cursor");
  const dot = cursor.querySelector(".cursor-dot");
  const ring = cursor.querySelector(".cursor-ring");
  let mx = -100, my = -100, rx = -100, ry = -100;
  let overUi = false, overCore = false;
  const sync = () => cursor.classList.toggle("is-hover", overUi || overCore);

  window.addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  }, { passive: true });
  window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
  document.addEventListener("pointerover", (e) => {
    overUi = !!e.target.closest("a, button, input, .swatch");
    sync();
  });
  window.addEventListener("station:corehover", (e) => { overCore = e.detail; sync(); });

  (function follow() {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(follow);
  })();
}

/* ---------- Magnetic buttons ---------- */
if (finePointer && !reduceMotion) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = el.classList.contains("card-link") ? 0.2 : 0.35;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.15s linear";
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";
    });
  });
}

/* ---------- 3D tilt cards ---------- */
document.querySelectorAll("[data-tilt]").forEach((el) => {
  const max = el.hasAttribute("data-tilt-soft") ? 5 : 12;
  const sat = el.dataset.sat;

  if (el.dataset.accent) el.style.setProperty("--accent", el.dataset.accent);

  el.addEventListener("pointerenter", () => {
    if (sat !== undefined) emit("station:focus", Number(sat));
  });
  el.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || reduceMotion) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.classList.add("is-tilting");
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  });
  el.addEventListener("pointerleave", () => {
    el.classList.remove("is-tilting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    if (sat !== undefined) emit("station:focus", -1);
  });
});

// On touch screens, focus whichever app card is centred in the viewport.
if (!finePointer) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) emit("station:focus", Number(entry.target.dataset.sat));
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  document.querySelectorAll(".card[data-sat]").forEach((el) => cardObserver.observe(el));
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) emit("station:focus", -1);
  }).observe(document.querySelector(".cards"));
}

/* ---------- Lab controls ---------- */
const params = {};
function bindSlider(id, key, out) {
  const input = document.getElementById(id);
  const output = document.getElementById(out);
  const update = () => {
    const v = Number(input.value);
    params[key] = v;
    output.textContent = v.toFixed(2);
    input.style.setProperty("--p", `${((v - input.min) / (input.max - input.min)) * 100}%`);
    emit("station:ctl", { [key]: v });
  };
  input.addEventListener("input", update);
  update();
}
bindSlider("c-distort", "distort", "o-distort");
bindSlider("c-speed", "speed", "o-speed");
bindSlider("c-stars", "stars", "o-stars");

const PALETTES = {
  aurora: ["#7c5cff", "#22d3ee"],
  ember: ["#f43f5e", "#fb923c"],
  mint: ["#10b981", "#a3e635"],
  mono: ["#e5e7eb", "#64748b"],
};
document.querySelectorAll(".swatch").forEach((btn) => {
  btn.addEventListener("click", () => {
    const [a, b] = PALETTES[btn.dataset.palette];
    document.querySelectorAll(".swatch").forEach((s) => {
      const on = s === btn;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-checked", String(on));
    });
    root.style.setProperty("--a", a);
    root.style.setProperty("--b", b);
    emit("station:palette", { a, b });
  });
});

document.getElementById("c-pulse").addEventListener("click", () => emit("station:pulse"));
const wireBtn = document.getElementById("c-wire");
wireBtn.addEventListener("click", () => {
  const on = wireBtn.getAttribute("aria-pressed") !== "true";
  wireBtn.setAttribute("aria-pressed", String(on));
  emit("station:wire", on);
});
