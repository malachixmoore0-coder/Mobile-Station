// WebGL scene: a noise-displaced "core", orbit rings with app satellites and
// a particle field. Driven by scroll position, the pointer and the Lab
// controls (via window CustomEvents dispatched from ui.js).
import * as THREE from "three";

const canvas = document.getElementById("scene");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (err) {
  document.documentElement.classList.add("no-webgl");
  emit("station:ready");
  throw err;
}

// Write shader colours straight through; all colour values below are sRGB.
THREE.ColorManagement.enabled = false;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setClearColor(0x06060b, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06060b, 0.035);
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
camera.position.set(0, 0, 9);

const isSmall = () => window.innerWidth < 900;

/* ------------------------------------------------------------------ */
/* Core                                                                */
/* ------------------------------------------------------------------ */

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const coreUniforms = {
  uTime: { value: 0 },
  uDistort: { value: 0.35 },
  uFreq: { value: 1.35 },
  uPointer: { value: new THREE.Vector3(0, 0, 1) },
  uHover: { value: 0 },
  uPulseDir: { value: new THREE.Vector3(0, 0, 1) },
  uPulseT: { value: 100 },
  uFlash: { value: 0 },
  uColorA: { value: new THREE.Color("#7c5cff") },
  uColorB: { value: new THREE.Color("#22d3ee") },
};

const coreMaterial = new THREE.ShaderMaterial({
  uniforms: coreUniforms,
  vertexShader: /* glsl */ `
    uniform float uTime, uDistort, uFreq, uHover, uPulseT;
    uniform vec3 uPointer, uPulseDir;
    varying vec3 vNormal;
    varying vec3 vViewPos;
    varying float vDisp;
    ${NOISE}
    float field(vec3 dir){
      float n = snoise(dir * uFreq + vec3(uTime * 0.35));
      n += 0.5 * snoise(dir * uFreq * 2.1 - vec3(uTime * 0.21));
      float d = n * uDistort * 0.38;
      d += smoothstep(0.78, 1.0, dot(dir, uPointer)) * uHover * 0.26;
      float a = acos(clamp(dot(dir, uPulseDir), -1.0, 1.0));
      float front = uPulseT * 3.2;
      d += sin((a - front) * 9.0) * exp(-pow((a - front) * 2.0, 2.0)) * exp(-uPulseT * 1.1) * 0.24;
      return d;
    }
    vec3 displaced(vec3 dir, float r){ return dir * (r + field(dir)); }
    void main(){
      float r = length(position);
      vec3 n = normalize(position);
      vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
      vec3 b = cross(n, t);
      float e = 0.012;
      vec3 p0 = displaced(n, r);
      vec3 p1 = displaced(normalize(n + t * e), r);
      vec3 p2 = displaced(normalize(n + b * e), r);
      vec3 nn = normalize(cross(p1 - p0, p2 - p0));
      if (dot(nn, n) < 0.0) nn = -nn;
      vDisp = length(p0) - r;
      vec4 mv = modelViewMatrix * vec4(p0, 1.0);
      vViewPos = mv.xyz;
      vNormal = normalize(normalMatrix * nn);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA, uColorB;
    uniform float uTime, uFlash;
    varying vec3 vNormal;
    varying vec3 vViewPos;
    varying float vDisp;
    void main(){
      vec3 N = normalize(vNormal);
      vec3 V = normalize(-vViewPos);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
      vec3 L = normalize(vec3(0.5, 0.8, 0.7));
      float diff = max(dot(N, L), 0.0);
      float spec = pow(max(dot(N, normalize(L + V)), 0.0), 70.0);
      float t = clamp(0.5 + vDisp * 2.4 + N.y * 0.3, 0.0, 1.0);
      vec3 base = mix(uColorA, uColorB, t);
      vec3 irid = 0.5 + 0.5 * cos(6.2831 * (fres * 0.8 + vec3(0.0, 0.33, 0.67)) + uTime * 0.25);
      vec3 col = base * (0.16 + 0.78 * diff);
      col += spec * 0.9;
      col += fres * mix(uColorB, irid, 0.35) * 1.25;
      col += base * uFlash * 0.8;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});

const stage = new THREE.Group(); // moved by scroll choreography
scene.add(stage);

const CORE_RADIUS = 1.25;
const coreDetail = window.innerWidth < 700 ? 28 : 56;
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_RADIUS, coreDetail), coreMaterial);
stage.add(core);

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const glowTex = glowTexture();

const halo = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: glowTex, color: coreUniforms.uColorA.value.clone(), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })
);
halo.scale.setScalar(7.5);
halo.renderOrder = -1;
stage.add(halo);

/* ------------------------------------------------------------------ */
/* Orbit rings + satellites (one per app)                              */
/* ------------------------------------------------------------------ */

const orbit = new THREE.Group();
stage.add(orbit);

const APPS = [
  { color: "#8b5cf6", radius: 2.05, tilt: [1.2, 0.2, 0.3], speed: 0.45 },
  { color: "#10b981", radius: 2.6, tilt: [1.75, -0.45, 0], speed: -0.32 },
  { color: "#fb923c", radius: 3.2, tilt: [1.4, 0.55, -0.4], speed: 0.24 },
];

const rings = APPS.map((app, i) => {
  const color = new THREE.Color(app.color);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(app.radius, 0.0065, 8, 240),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ring.rotation.set(...app.tilt);
  orbit.add(ring);

  const sat = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 3), new THREE.MeshBasicMaterial({ color }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(0.7);
  sat.add(body, glow);
  ring.add(sat);

  return { ring, sat, glow, color, radius: app.radius, speed: app.speed, angle: i * 2.1, focus: 0 };
});

/* ------------------------------------------------------------------ */
/* Particle field                                                      */
/* ------------------------------------------------------------------ */

const STAR_COUNT = window.innerWidth < 700 ? 1600 : 3200;
const starGeo = new THREE.BufferGeometry();
{
  const pos = new Float32Array(STAR_COUNT * 3);
  const seed = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 4 + Math.pow(Math.random(), 0.7) * 26;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(ph) - 6;
    seed[i] = Math.random();
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
}
const starUniforms = {
  uTime: { value: 0 },
  uSize: { value: 1 },
  uOpacity: { value: 1 },
  uPR: { value: 1 },
  uColorA: coreUniforms.uColorA,
  uColorB: coreUniforms.uColorB,
};
const stars = new THREE.Points(
  starGeo,
  new THREE.ShaderMaterial({
    uniforms: starUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uSize, uPR;
      attribute float aSeed;
      varying float vSeed;
      varying float vTw;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.3 + aSeed * 40.0) * 0.15;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vSeed = aSeed;
        vTw = 0.55 + 0.45 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 100.0);
        gl_PointSize = uSize * uPR * (0.6 + aSeed * 1.8) * (70.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA, uColorB;
      uniform float uOpacity;
      varying float vSeed;
      varying float vTw;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 c = mix(mix(uColorA, uColorB, vSeed), vec3(1.0), 0.45);
        gl_FragColor = vec4(c, a * a * vTw * uOpacity);
      }
    `,
  })
);
scene.add(stars);

/* ------------------------------------------------------------------ */
/* Scroll choreography                                                 */
/* ------------------------------------------------------------------ */

// Stage pose per section: [x, y, z, scale]
const POSES = {
  desktop: { hero: [2.9, -0.1, 0, 0.95], apps: [0, 0, -4.5, 1.35], flow: [3.4, 0.9, -2.5, 0.8], lab: [2.2, 0, 0.4, 1.05], outro: [0, 0.2, -4, 1.25] },
  mobile: { hero: [0, 1.55, -1.5, 0.78], apps: [0, 0, -6, 1.2], flow: [0, 1.7, -3, 0.8], lab: [0, 2.05, -1.5, 0.78], outro: [0, 0.3, -5, 1.2] },
};

let keyframes = [];
function measure() {
  const vh = window.innerHeight;
  const poses = isSmall() ? POSES.mobile : POSES.desktop;
  keyframes = [...document.querySelectorAll("[data-scene]")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const at = el.dataset.scene === "hero" ? 0 : top + r.height / 2 - vh / 2;
      return { at, pose: poses[el.dataset.scene] };
    })
    .sort((a, b) => a.at - b.at);
}

const smooth = (t) => t * t * (3 - 2 * t);
function poseAt(y) {
  if (!keyframes.length) return [0, 0, 0, 1];
  if (y <= keyframes[0].at) return keyframes[0].pose;
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i], b = keyframes[i + 1];
    if (y <= b.at) {
      const t = smooth((y - a.at) / Math.max(1, b.at - a.at));
      return a.pose.map((v, k) => v + (b.pose[k] - v) * t);
    }
  }
  return keyframes[keyframes.length - 1].pose;
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

const pointer = new THREE.Vector2(0, 0); // NDC
const pointerSmooth = new THREE.Vector2(0, 0);
let pointerActive = false;
let hoverCore = false;
let dragging = null;
const spin = { x: 0, y: 0 };

const raycaster = new THREE.Raycaster();
const hit = new THREE.Vector3();
const sphere = new THREE.Sphere();

function coreHit(ndc) {
  raycaster.setFromCamera(ndc, camera);
  core.getWorldPosition(sphere.center);
  sphere.radius = CORE_RADIUS * stage.scale.x * 1.08;
  return raycaster.ray.intersectSphere(sphere, hit) ? hit : null;
}

const isInteractive = (el) => !!el.closest("a, button, input, label, .card, .lab-panel, .nav");

window.addEventListener("pointermove", (e) => {
  pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  pointerActive = true;
  if (dragging) {
    spin.y += (e.clientX - dragging.x) * 0.0009;
    spin.x += (e.clientY - dragging.y) * 0.0009;
    dragging.x = e.clientX;
    dragging.y = e.clientY;
  }
}, { passive: true });

document.addEventListener("pointerleave", () => { pointerActive = false; });

window.addEventListener("pointerdown", (e) => {
  if (isInteractive(e.target)) return;
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  const p = coreHit(ndc);
  if (!p) return;
  pulse(core.worldToLocal(p.clone()).normalize());
  if (e.pointerType === "mouse") {
    dragging = { x: e.clientX, y: e.clientY };
    document.documentElement.classList.add("is-dragging");
  }
});
window.addEventListener("pointerup", () => {
  dragging = null;
  document.documentElement.classList.remove("is-dragging");
});

function pulse(dir) {
  if (!dir) {
    // Front-facing point of the core, in its local space.
    const front = camera.position.clone();
    dir = core.worldToLocal(front).normalize();
  }
  coreUniforms.uPulseDir.value.copy(dir);
  coreUniforms.uPulseT.value = 0;
  coreUniforms.uFlash.value = 1;
  spin.y += 0.04;
}

/* ------------------------------------------------------------------ */
/* UI events                                                           */
/* ------------------------------------------------------------------ */

const target = {
  distort: 0.35,
  speed: 0.4,
  stars: 1,
  colorA: new THREE.Color("#7c5cff"),
  colorB: new THREE.Color("#22d3ee"),
  focus: -1,
};
let wire = false;

window.addEventListener("station:ctl", (e) => Object.assign(target, e.detail));
window.addEventListener("station:palette", (e) => {
  target.colorA.set(e.detail.a);
  target.colorB.set(e.detail.b);
});
window.addEventListener("station:pulse", () => pulse());
window.addEventListener("station:wire", (e) => {
  wire = !!e.detail;
  coreMaterial.wireframe = wire;
});
window.addEventListener("station:focus", (e) => { target.focus = e.detail; });

/* ------------------------------------------------------------------ */
/* Resize + loop                                                       */
/* ------------------------------------------------------------------ */

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  const pr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Keep the scene framed on tall/narrow screens.
  camera.fov = w / h < 0.8 ? 48 : 35;
  camera.updateProjectionMatrix();
  starUniforms.uPR.value = pr;
  measure();
}
window.addEventListener("resize", resize);
window.addEventListener("load", measure);
if (document.fonts) document.fonts.ready.then(measure);
resize();

const clock = new THREE.Clock();
const fpsEl = document.getElementById("fps");
let fpsFrames = 0, fpsTime = 0;
let lastScroll = window.scrollY, scrollVel = 0;
let time = 0;
let firstFrame = true;
const colorTmpA = new THREE.Color();
const WHITE = new THREE.Color(1, 1, 1);
const ORIGIN2 = new THREE.Vector2(0, 0);
const lerp = (a, b, t) => a + (b - a) * t;

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const k = 1 - Math.pow(0.001, dt); // frame-rate independent easing

  // FPS readout
  fpsFrames++; fpsTime += dt;
  if (fpsTime > 0.5 && fpsEl) {
    fpsEl.textContent = Math.round(fpsFrames / fpsTime);
    fpsFrames = 0; fpsTime = 0;
  }

  // Scroll velocity drives a little warp.
  const sy = window.scrollY;
  scrollVel = lerp(scrollVel, (sy - lastScroll) / Math.max(dt, 0.001), 0.15);
  lastScroll = sy;
  const warp = Math.max(-1, Math.min(1, scrollVel / 3000));

  // Params
  const motion = reduceMotion ? 0.25 : 1;
  const speedNow = target.speed * 2.5 * motion;
  time += dt * speedNow;
  coreUniforms.uTime.value = time;
  starUniforms.uTime.value += dt * motion;
  coreUniforms.uDistort.value = lerp(coreUniforms.uDistort.value, target.distort + Math.abs(warp) * 0.35, k * 0.6);

  coreUniforms.uPulseT.value += dt;
  coreUniforms.uFlash.value *= Math.pow(0.02, dt);

  // Colours (focused app tints colour A)
  colorTmpA.copy(target.focus >= 0 ? rings[target.focus].color : target.colorA);
  coreUniforms.uColorA.value.lerp(colorTmpA, k * 0.35);
  coreUniforms.uColorB.value.lerp(target.colorB, k * 0.35);
  halo.material.color.copy(coreUniforms.uColorA.value);

  // Stars
  const s = target.stars;
  starGeo.setDrawRange(0, Math.floor(STAR_COUNT * Math.min(1, s)));
  starUniforms.uSize.value = lerp(starUniforms.uSize.value, 1 + Math.max(0, s - 1) * 1.3, k);
  starUniforms.uOpacity.value = lerp(starUniforms.uOpacity.value, Math.min(1, s * 1.5), k);
  stars.rotation.y += dt * (0.012 + warp * 0.25) * motion;
  stars.rotation.x = lerp(stars.rotation.x, warp * 0.15, k);

  // Stage pose from scroll
  const [px, py, pz, ps] = poseAt(sy);
  stage.position.x = lerp(stage.position.x, px, k * 0.5);
  stage.position.y = lerp(stage.position.y, py, k * 0.5);
  stage.position.z = lerp(stage.position.z, pz, k * 0.5);
  stage.scale.setScalar(lerp(stage.scale.x, ps, k * 0.5));

  // Camera parallax
  pointerSmooth.lerp(pointerActive ? pointer : ORIGIN2, k * 0.4);
  camera.position.x = pointerSmooth.x * 0.45;
  camera.position.y = pointerSmooth.y * 0.3;
  camera.lookAt(0, 0, -2);

  // Core rotation + drag spin with inertia
  core.rotation.y += (0.12 * dt * motion) + spin.y;
  core.rotation.x += spin.x;
  spin.x *= Math.pow(0.08, dt);
  spin.y *= Math.pow(0.08, dt);
  orbit.rotation.y = lerp(orbit.rotation.y, pointerSmooth.x * 0.35, k * 0.5);
  orbit.rotation.x = lerp(orbit.rotation.x, -pointerSmooth.y * 0.25, k * 0.5);

  // Pointer bump on the core surface
  core.updateMatrixWorld();
  const p = pointerActive && !dragging ? coreHit(pointer) : null;
  if (p) coreUniforms.uPointer.value.lerp(core.worldToLocal(p.clone()).normalize(), k).normalize();
  coreUniforms.uHover.value = lerp(coreUniforms.uHover.value, p ? 1 : 0, k * 0.4);
  if (!!p !== hoverCore) {
    hoverCore = !!p;
    emit("station:corehover", hoverCore);
  }

  // Rings + satellites
  rings.forEach((r, i) => {
    const focused = target.focus === i;
    r.focus = lerp(r.focus, focused ? 1 : 0, k * 0.5);
    r.angle += dt * r.speed * (1 + r.focus * 1.5) * motion;
    r.sat.position.set(Math.cos(r.angle) * r.radius, Math.sin(r.angle) * r.radius, 0);
    r.sat.scale.setScalar(1 + r.focus * 1.4);
    r.glow.material.opacity = 0.75 + r.focus * 0.25;
    r.ring.material.opacity = 0.14 + r.focus * 0.5;
    r.ring.material.color.copy(r.color).lerp(WHITE, 1 - r.focus);
  });

  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    emit("station:ready");
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
