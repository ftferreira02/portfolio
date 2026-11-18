import { sampleSegment } from "./path.js";
import * as THREE from "three";
import { choreography, tieBreak, commentary } from "./choreography";
import { shotDecisions, scoreAt } from "./decisions.js";

const escapeText = (text) => String(text).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const linkMarkup = (links) => links.length ? `<div class="links">${links.map((link) => `<a href="${escapeText(link.href)}">${escapeText(link.label)}</a>`).join("")}</div>` : "";

/**
 * Mount the approved match scene. The returned cleanup releases WebGL, audio,
 * observers and listeners when React navigates away or remounts in development.
 * @param {HTMLElement} root
 * @param {Record<string, {title: string, body: string, links?: {href: string, label: string}[]}>} content
 * @param {{email: string, cv: string, projectNames?: string[], autoServe?: boolean, onError: () => void}} options `autoServe` plays the first serve shortly after mounting.
 */
export function mountMatch(root, content, {email, cv: CV, projectNames = [], autoServe, onError}) {
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const stackedCaption = window.matchMedia("(max-width: 600px)"); // matches the CSS breakpoint that moves the caption below the court
let motionOverride = null;
try {
  const saved = localStorage.getItem("padel:motion");
  if (saved === "full" || saved === "reduced") motionOverride = saved;
} catch { /* Browser storage is optional. */ }
let reducedMotion = motionOverride ? motionOverride === "reduced" : motionPreference.matches;
let disposed = false, frameId = 0;
const eventsController = new AbortController();
const listen = (target, event, handler, options = {}) => target.addEventListener(event, handler, {...options, signal: eventsController.signal});
const CHAPTERS = ["Hello", "The route", "What I've built", "Match point"];
const SCORE = ["0", "15", "30", "40", "Game"];


// Court is 20 x 10 m, net at x = 10, glass at x = 0 and x = 20, side walls at y = 0 and y = 10.
// Francisco's pair (A) plays on the left.
const HOMES = [
  { A1: [2.6, 7.4], A2: [7.6, 2.8], B1: [17.4, 2.4], B2: [17.2, 7.6] },
  { A1: [2.6, 2.6], A2: [7.6, 7.2], B1: [17.2, 2.4], B2: [17.4, 7.6] },
];
const END_POS = { A1: [5, 4.45], A2: [5, 5.55], B1: [6.6, 2.7], B2: [6.6, 7.3] }; // winners lift the trophy, opponents applaud either side

// Each kind of shot has its own pace, and how long the racket takes to reach the ball (c).
const SHOT = {
  serve: { ms: 1400, c: 0.2 }, drive: { ms: 950, c: 0.05 }, volley: { ms: 850, c: 0.05 }, chiquita: { ms: 1300, c: 0.05 },
  lob: { ms: 1900, c: 0.05 }, bandeja: { ms: 1550, c: 0.06 }, vibora: { ms: 1050, c: 0.06 }, bajada: { ms: 950, c: 0.06 },
  contra: { ms: 2300, c: 0.05 }, smash: { ms: 1000, c: 0.06 },
};

// One beat = one hit. `via` are bounces (z 0) and glass touches (z > 0) on the way to the next
// hitter, `win` is the whole path of a point-winning shot, `bend` curves a leg sideways (spin),
// `chase` sends a defender after a ball they won't reach.
const beats = choreography.map((beat) => {
  const copy = content[beat.contentKey];
  return { ...structuredClone(beat), ...copy, html: linkMarkup(copy.links ?? []) };
});
let N = beats.length;
const firstOfPoint = (k) => k === 0 || beats[k - 1].pt !== beats[k].pt;

function prepareBeat(b, k) {
  const pts = [{ p: b.at, z: b.z }];
  if (b.win) pts.push(...b.win);
  else pts.push(...(b.via || []), { p: beats[k + 1].at, z: beats[k + 1].z, peak: b.peak });
  let total = 0;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i].p[0] - pts[i - 1].p[0], pts[i].p[1] - pts[i - 1].p[1]);
    cum.push(total);
  }
  b.path = { pts, cum, total };
  b.ms = (b.ms || SHOT[b.type].ms) * (b.win ? 1.7 : 1);
  return b;
}
beats.forEach(prepareBeat);

const lerp = (a, b, u) => a + (b - a) * u;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = (u) => u * u * (3 - 2 * u);
const FLY = 0.72; // share of a winning segment spent on the winner itself

function ballAt(k, u) {
  const b = beats[k];
  let f = u, op = 1;
  if (b.win) {
    f = Math.min(u / FLY, 1);
    if (u >= FLY) {
      const next = beats[k + 1];
      if (!next) return { op: 0, x: 0, y: 0, z: 0 };
      return { x: next.at[0], y: next.at[1], z: next.z, op: clamp((u - 0.86) / 0.14), reset: true };
    }
    op = clamp((FLY - u) / 0.08);
  }
  const { pts, cum, total } = b.path;
  const d = f * total;
  let i = 1;
  while (i < pts.length - 1 && cum[i] < d) i++;
  const a = pts[i - 1], c = pts[i];
  const v = clamp((d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1));
  return sampleSegment(a, c, v, op);
}

const OVERHEAD = { bandeja: 1, vibora: 1, bajada: 1, smash: 1 };
const CONTACT_HEIGHT = { bandeja: 2.3, vibora: 2.1, bajada: 2.3, smash: 3.1 };
// Where the hitter stands: the ball on their racket side (or the other side for a backhand), a little in front.
function hitPos(k) {
  const b = beats[k], s = b.who[0] === "A" ? -1 : 1, f = (OVERHEAD[b.type] ? 0.5 : 1) * (b.type === "contra" ? -1 : 1);
  return [b.at[0] + s * 0.45 * f, b.at[1] + s * (OVERHEAD[b.type] ? 0.35 : 0.65) * (b.type === "contra" ? -1 : 1) * (b.bh ? -1 : 1)];
}
function target(name, k) {
  if (k >= N) return END_POS[name];
  const b = beats[k];
  if (b.who === name) return hitPos(k);
  let home = HOMES[b.pt % 2][name];
  if (name === "A1" && !firstOfPoint(k)) home = [6.4, home[1]]; // the server follows the serve to the net
  const nx = beats[k + 1];
  if (nx && nx.pt === b.pt && nx.who === name) {
    const h = hitPos(k + 1);
    return [lerp(home[0], h[0], 0.5), lerp(home[1], h[1], 0.5)];
  }
  return home;
}
function playerAt(name, k, u) {
  const a = target(name, k), c = target(name, k + 1), b = beats[k];
  if (b.win) {
    let p = a;
    const ch = b.chase && b.chase[name];
    if (ch) { const q = smooth(clamp(u / (FLY * 0.9))); p = [lerp(a[0], ch[0], q), lerp(a[1], ch[1], q)]; }
    const w = smooth(clamp((u - 0.5) / 0.45));
    return [lerp(p[0], c[0], w), lerp(p[1], c[1], w)];
  }
  const w = smooth(clamp((u - cOf(k) - 0.08) / (0.8 - cOf(k) - 0.08)));
  const route = b.run?.[name];
  return route ? along([a, ...route, c], w) : [lerp(a[0], c[0], w), lerp(a[1], c[1], w)];
}
// A point a share of the way along a polyline, so a run through the fence gap keeps an even pace.
function along(pts, w) {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = w * lens.reduce((x, y) => x + y, 0), i = 0;
  while (i < lens.length - 1 && d > lens[i]) d -= lens[i++];
  const v = clamp(d / (lens[i] || 1));
  return [lerp(pts[i][0], pts[i + 1][0], v), lerp(pts[i][1], pts[i + 1][1], v)];
}

const COND = getComputedStyle(root).getPropertyValue("--font-padel-display").trim() || '"Barlow Condensed", sans-serif';

// ---------- Renderer ----------
const $ = (id) => root.querySelector(`[data-match="${id}"]`);
const canvas = $("gl");
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
} catch {
  throw new Error("WebGL is unavailable");
}
const V = (x, y, z = 0) => new THREE.Vector3(x - 10, z, y - 5); // court metres to world
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f24);
const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 200);

// ---------- Cartoon materials: three flat tones and an ink outline ----------
const ramp = new THREE.DataTexture(new Uint8Array([125, 125, 125, 255, 195, 195, 195, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra });
const ink = new THREE.MeshBasicMaterial({ color: 0x0b1020, side: THREE.BackSide });
function part(geo, mat, x, y, z, parent, line = 0.028) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.castShadow = true; parent.add(m);
  if (line) {
    geo.computeBoundingSphere();
    const o = new THREE.Mesh(geo, ink);
    o.scale.setScalar(1 + line / geo.boundingSphere.radius);
    m.add(o);
  }
  return m;
}

const ambient = new THREE.HemisphereLight(0xffffff, 0x4a5a8a, 1.5);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 2.3);
sun.position.set(-7, 18, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 9, bottom: -9, near: 1, far: 45 });
sun.shadow.bias = -0.0005; sun.shadow.radius = 2;
scene.add(sun);

// ---------- Arena ----------
const plane = (w, h, mat, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m; };
plane(200, 200, toon(0x141a36), -0.04);
plane(26, 14.6, toon(0x1b49ad), -0.02);
plane(20, 10, toon(0xffffff, { map: canvasTex(2048, 1024, (g, w, h) => {
  const m = w / 20;
  g.fillStyle = "#2f7fe8"; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(255,255,255,.045)";
  for (let i = 0; i < 20; i += 2) g.fillRect(i * m, 0, m, h); // mown stripes
  g.strokeStyle = "#fff"; g.lineWidth = 0.07 * m;
  g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth);
  g.beginPath();
  g.moveTo(3.05 * m, 0); g.lineTo(3.05 * m, h);
  g.moveTo(16.95 * m, 0); g.lineTo(16.95 * m, h);
  g.moveTo(3.05 * m, h / 2); g.lineTo(16.95 * m, h / 2);
  g.stroke();
}) }), 0);

const frameMat = toon(0x232b52);
const glassTex = canvasTex(256, 256, (g) => {
  g.fillStyle = "rgba(190,226,255,.10)"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(255,255,255,.20)";
  for (const x of [40, 86]) { g.beginPath(); g.moveTo(x, 256); g.lineTo(x + 26 - (x > 60 ? 14 : 0), 256); g.lineTo(x + 150, 0); g.lineTo(x + 124 + (x > 60 ? 14 : 0), 0); g.fill(); }
});
const glassMat = new THREE.MeshBasicMaterial({ map: glassTex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
const gridTex = (cells, alpha) => canvasTex(64, 64, (g) => {
  g.clearRect(0, 0, 64, 64);
  g.strokeStyle = `rgba(255,255,255,${alpha})`; g.lineWidth = 2.5;
  const s = 64 / cells;
  for (let i = 0; i <= cells; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 64); g.moveTo(0, i * s); g.lineTo(64, i * s); g.stroke(); }
});
function panel(w, h, x, y0, z, rotY, fence) {
  let mat = glassMat;
  if (fence) {
    const tex = gridTex(3, 0.6);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(w * 1.5, h * 1.5);
    mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.3 });
  }
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y0 + h / 2, z); mesh.rotation.y = rotY;
  scene.add(mesh);
  return mesh;
}
const box = (w, h, d, x, y, z, mat = frameMat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); scene.add(m); return m; };
const nearWall = []; // the wall between the main camera and the court, hidden from that camera
for (const sx of [-1, 1]) {
  const wall = [];
  for (let z = -3.75; z <= 3.75; z += 2.5) wall.push(panel(2.5, 3, sx * 10, 0, z, Math.PI / 2));
  wall.push(panel(10, 1, sx * 10, 3, 0, Math.PI / 2, true));
  wall.push(box(0.07, 0.07, 10, sx * 10, 3, 0), box(0.07, 0.07, 10, sx * 10, 4, 0));
  for (let z = -5; z <= 5; z += 2.5) wall.push(box(0.07, 4, 0.07, sx * 10, 2, z));
  if (sx < 0) nearWall.push(...wall);
  for (const sz of [-1, 1]) {
    panel(2, 3, sx * 9, 0, sz * 5, 0); panel(2, 3, sx * 7, 0, sz * 5, 0);
    box(0.07, 3, 0.07, sx * 8, 1.5, sz * 5); box(0.07, 3, 0.07, sx * 6, 1.5, sz * 5);
  }
}
// The side fence has a gap in each half, the way out for a ball smashed over the side wall.
for (const sz of [-1, 1]) {
  for (const [x0, x1] of [[-6, -4.8], [-3.6, 3.6], [4.8, 6]]) panel(x1 - x0, 3, (x0 + x1) / 2, 0, sz * 5, 0, true);
  box(20, 0.07, 0.07, 0, 3, sz * 5);
  for (const x of [-4.8, -3.6, -2, 0, 2, 3.6, 4.8]) box(0.07, 3, 0.07, x, 1.5, sz * 5);
}

// LED boards along both sides and a banner over the far stand
const boardTex = canvasTex(2048, 96, (g, w, h) => {
  g.fillStyle = "#0b1230"; g.fillRect(0, 0, w, h);
  g.font = `800 62px ${COND}`; g.textBaseline = "middle";
  const words = [["FRANCISCO FERREIRA", "#ffffff"], ["SOFTWARE ENGINEER", "#ffd60a"], ["AVEIRO, PORTUGAL", "#ffffff"], ["FF SPORTS", "#ff3b30"]];
  let x = 24, i = 0;
  while (x < w) { const [text, color] = words[i++ % words.length]; g.fillStyle = color; g.fillText(text, x, h / 2 + 4); x += g.measureText(text).width + 70; }
});
for (const sz of [-1, 1]) {
  // Boards stop short of the fence gaps; the texture is cropped rather than squashed.
  const board = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 0.56), new THREE.MeshBasicMaterial({ map: boardTex }));
  board.position.set(0, 0.3, sz * 4.95); boardTex.repeat.x = 0.6; board.rotation.y = sz > 0 ? Math.PI : 0;
  scene.add(board);
}
const banner = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.7), new THREE.MeshBasicMaterial({ map: canvasTex(2048, 218, (g, w, h) => {
  g.fillStyle = "#ffd60a"; g.fillRect(0, 0, w, h);
  g.font = `800 150px ${COND}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#0b1020";
  g.fillText("THE PORTFOLIO OPEN", w / 2, h / 2 + 10);
}) }));
banner.position.set(20.2, 7.4, 0); banner.rotation.y = -Math.PI / 2;
scene.add(banner);
for (let x = -9; x <= 9; x += 6) for (const z of [-4, 4]) box(2.4, 0.12, 0.9, x, 13, z, new THREE.MeshBasicMaterial({ color: 0xffffff }));

const arenaMaterials = new Map();
scene.traverse((o) => { if (o.material?.isMeshToonMaterial) arenaMaterials.set(o.material, o.material.color.clone()); });

// Theme changes affect the arena only, including when animation is disabled.
const floodlights = new THREE.Group(); scene.add(floodlights);
for (const x of [-8, 8]) for (const z of [-3.6, 3.6]) {
  const light = new THREE.PointLight(0xc4ddff, 45, 32, 2);
  light.position.set(x, 4.8, z); floodlights.add(light);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4.8, 32, 1, true), new THREE.MeshBasicMaterial({color: 0xbad7ff, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide}));
  beam.position.set(x, 2.4, z); floodlights.add(beam);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.5), new THREE.MeshBasicMaterial({color: 0xe6f2ff}));
  glow.position.copy(light.position); floodlights.add(glow);
  const poolTex = canvasTex(128, 128, (g) => {
    const gradient = g.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0, "rgba(180,215,255,.22)"); gradient.addColorStop(1,"rgba(180,215,255,0)");
    g.fillStyle = gradient; g.fillRect(0,0,128,128);
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshBasicMaterial({map:poolTex, transparent:true, depthWrite:false}));
  const bloom = new THREE.Sprite(new THREE.SpriteMaterial({map: poolTex, transparent: true, opacity: 0.8, depthWrite: false}));
  bloom.position.copy(light.position); bloom.scale.set(2.4, 1.2, 1); floodlights.add(bloom);
  pool.rotation.x = -Math.PI / 2; pool.position.set(x * 0.7, 0.015, z * 0.6); floodlights.add(pool);
}
const colorPreference = matchMedia("(prefers-color-scheme: dark)");
function syncTheme() {
  const theme = document.documentElement.dataset.theme;
  const night = theme === "dark" || (theme !== "light" && colorPreference.matches);
  root.dataset.sceneTime = night ? "night" : "day";
  scene.background.set(night ? 0x020617 : 0x0a0f24);
  arenaMaterials.forEach((color, mat) => mat.color.copy(color).multiplyScalar(night ? 0.12 : 1));
  if (scene.userData.crowdMat) scene.userData.crowdMat.color.set(night ? 0x4f5a78 : 0xffffff);
  glassMat.color.set(night ? 0x36567d : 0xffffff);
  ambient.intensity = night ? 0.22 : 1.5;
  sun.shadow.radius = night ? 0.7 : 2;
  sun.intensity = night ? 2.8 : 2.3;
  sun.position.set(-7, night ? 8 : 18, 8);
  floodlights.visible = night;
  if (renderer) renderer.render(scene, camera);
}
const themeObserver = new MutationObserver(syncTheme);
themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
listen(colorPreference, "change", syncTheme);
listen(window, "storage", (event) => {
  if (event.key === "theme") {
    if (event.newValue) document.documentElement.dataset.theme = event.newValue;
    else delete document.documentElement.dataset.theme;
    syncTheme();
  }
});
syncTheme();

// net
const netTex = gridTex(6, 0.9);
netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping; netTex.repeat.set(20, 2);
const net = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.88), new THREE.MeshBasicMaterial({ map: netTex, color: 0x101835, transparent: true, side: THREE.DoubleSide, opacity: 0.75, depthWrite: false }));
net.position.set(0, 0.44, 0); net.rotation.y = Math.PI / 2;
scene.add(net);
box(0.07, 0.04, 10, 0, 0.86, 0, toon(0xffffff)).castShadow = true;
box(0.1, 0.98, 0.1, 0, 0.49, -5.06); box(0.1, 0.98, 0.1, 0, 0.49, 5.06);

// stands with a crowd on all four sides
const crowd = [];
const standMat = toon(0x1b2350), crowdMat = toon(0xffffff), armMat = toon(0xd9a57e);
arenaMaterials.set(armMat, armMat.color.clone());
arenaMaterials.set(standMat, standMat.color.clone());
scene.userData.crowdMat = crowdMat;
const shirtCols = [0xff4d4d, 0xffd60a, 0x4dabf7, 0xffffff, 0x51cf66, 0xff922b, 0xcc5de8, 0x2b3a75].map((c) => new THREE.Color(c));
const skinCols = [0xf1c9a5, 0xd9a57e, 0xa8744f, 0x7a4f33].map((c) => new THREE.Color(c));
const seatGeo = new THREE.CapsuleGeometry(0.25, 0.3, 3, 8), faceGeo = new THREE.SphereGeometry(0.2, 10, 8);
function stand(cx, cz, len, alongX, dir) {
  for (let i = 0; i < 5; i++) {
    const depth = 1.15, h = 0.7 + i * 0.7;
    const tx = cx + (alongX ? 0 : dir * i * depth), tz = cz + (alongX ? dir * i * depth : 0);
    const tier = box(alongX ? len : depth, h, alongX ? depth : len, tx, h / 2, tz, standMat);
    tier.receiveShadow = true;
    const n = Math.floor(len / 0.72), g = new THREE.Group(), m = new THREE.Matrix4();
    const seats = [];
    const arms = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.07, 0.48, 3, 6), armMat, n * 2);
    const bodies = new THREE.InstancedMesh(seatGeo, crowdMat, n), heads = new THREE.InstancedMesh(faceGeo, crowdMat, n);
    for (let j = 0; j < n; j++) {
      const a = ((j + 0.5) / n) * len - len / 2 + rand(-0.08, 0.08), s = Math.random() < 0.12 ? 0 : rand(0.9, 1.08);
      const px = tx + (alongX ? a : 0), pz = tz + (alongX ? 0 : a);
      seats.push({px, pz, h, s, alongX, phase: (Math.atan2(pz, px) + Math.PI) / (2 * Math.PI)});
      m.makeScale(s, s, s).setPosition(px, h + 0.36 * s, pz); bodies.setMatrixAt(j, m); bodies.setColorAt(j, pick(shirtCols));
      m.makeScale(s, s, s).setPosition(px, h + 0.9 * s, pz); heads.setMatrixAt(j, m); heads.setColorAt(j, pick(skinCols));
    }
    bodies.frustumCulled = heads.frustumCulled = false;
    arms.frustumCulled = false; g.add(bodies, heads, arms); scene.add(g);
    crowd.push({ g, bodies, heads, arms, seats });
  }
}
stand(0, 7.9, 30, true, 1); stand(0, -7.9, 30, true, -1); stand(13.9, 0, 14, false, 1); stand(-13.9, 0, 14, false, -1);

// Fixed, similarly sized cards attached to occupied seats, never inside the court.
const placards = [];
projectNames.forEach((name, i) => {
  for (const side of [-1, 1]) {
    const row = crowd[side === 1 ? 3 : 8];
    const seat = row.seats[6 + i * 7];
    if (!seat) continue;
    seat.s = 1; seat.holdsSign = true;
    const sign = new THREE.Group();
    const card = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.6), new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: canvasTex(512, 180, (g,w,h) => {
      g.fillStyle = ["#fff8e9", "#ffd60a", "#ff594e"][i % 3]; g.fillRect(0,0,w,h);
      g.fillStyle = "#101835"; g.font = `800 70px ${COND}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(name,w/2,h/2,w-32);
    })}));
    card.position.y = 0.55; sign.add(card);
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.9, 0.045), toon(0xcaa778)); sign.add(stick);
    sign.position.set(seat.px, seat.h + 1.25, seat.pz);
    sign.rotation.set(0, side > 0 ? Math.PI : 0, (i % 3 - 1) * 0.09);
    scene.add(sign); placards.push({sign, seat});
  }
});
const trophy = new THREE.Group(); scene.add(trophy); trophy.position.set(-4.13, 0.82, -0.1); trophy.rotation.y = Math.PI / 2; // handle meets Francisco’s raised hand
const gold = toon(0xffd60a);
part(new THREE.CylinderGeometry(0.6, 0.24, 0.65, 16), gold, 0, 1.7, 0, trophy);
part(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 12), gold, 0, 1.1, 0, trophy);
part(new THREE.BoxGeometry(0.85, 0.18, 0.65), gold, 0, 0.75, 0, trophy);
for (const side of [-1, 1]) part(new THREE.TorusGeometry(0.3, 0.07, 8, 16), gold, side * 0.5, 1.65, 0, trophy);
const confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.09, 0.18), new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), 90);
const confettiSeeds = Array.from({length: 90}, () => [rand(-3, 3), rand(0, 5), rand(-3, 3)]);
confettiSeeds.forEach((_, i) => confetti.setColorAt(i, shirtCols[i % shirtCols.length]));
confetti.frustumCulled = false; scene.add(confetti);
const instanceMatrix = new THREE.Matrix4(), armScale = new THREE.Vector3();
let ceremonyStart = null;

// Two-bone limbs solve in their parent's coordinates. The pole gives knees and
// elbows a consistent bend direction, including while the player turns around.
function makeLimb(parent, material, upperLength, lowerLength, radius) {
  const upper = new THREE.Group(), lower = new THREE.Group();
  parent.add(upper, lower);
  part(new THREE.CapsuleGeometry(radius, upperLength - radius * 2, 4, 10), material, 0, upperLength / 2, 0, upper);
  part(new THREE.SphereGeometry(radius, 12, 10), material, 0, 0, 0, lower, 0.02);
  part(new THREE.CapsuleGeometry(radius * 0.85, lowerLength - radius * 1.7, 4, 10), material, 0, lowerLength / 2, 0, lower);
  return { upper, lower, upperLength, lowerLength };
}
const limbAxis = new THREE.Vector3(0, 1, 0);
const limbDir = new THREE.Vector3(), limbBend = new THREE.Vector3();
const limbJoint = new THREE.Vector3(), limbEnd = new THREE.Vector3(), limbSegment = new THREE.Vector3();
function solveLimb(limb, start, target, pole) {
  const { upper, lower, upperLength: a, lowerLength: b } = limb;
  limbDir.subVectors(target, start);
  const distance = THREE.MathUtils.clamp(limbDir.length(), Math.abs(a - b) + 0.001, a + b - 0.001);
  limbDir.normalize();
  limbEnd.copy(start).addScaledVector(limbDir, distance);
  limbBend.copy(pole).addScaledVector(limbDir, -pole.dot(limbDir)).normalize();
  const along = (a * a - b * b + distance * distance) / (2 * distance);
  limbJoint.copy(start).addScaledVector(limbDir, along).addScaledVector(limbBend, Math.sqrt(Math.max(0, a * a - along * along)));
  upper.position.copy(start);
  upper.quaternion.setFromUnitVectors(limbAxis, limbSegment.subVectors(limbJoint, start).normalize());
  lower.position.copy(limbJoint);
  lower.quaternion.setFromUnitVectors(limbAxis, limbSegment.subVectors(limbEnd, limbJoint).normalize());
  return limbEnd;
}

// ---------- Players: chunky cartoon proportions, matching team kits ----------
function makePlayer(name, i) {
  const mine = name === "A1", teamA = name[0] === "A";
  const shirt = toon(teamA ? 0xffd60a : 0xff4438), shorts = toon(teamA ? 0x14204d : 0xffffff);
  const skin = toon([0xe9b48c, 0xc98f68, 0xf0c39f, 0x9c6a48][i]), hair = toon([0x2a1c12, 0x141414, 0x6b4423, 0x1a1a1a][i]);
  const white = toon(0xffffff), dark = toon(0x161d3d), eye = new THREE.MeshBasicMaterial({ color: 0x0b1020 });
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body); root.scale.setScalar(1.2);
  const torso = new THREE.Group(); torso.position.y = 0.62; body.add(torso);
  part(new THREE.CapsuleGeometry(0.23, 0.26, 6, 16), shirt, 0, 0.36, 0, torso).scale.set(0.82, 1, 1.12);
  part(new THREE.CylinderGeometry(0.21, 0.23, 0.2, 16), shorts, 0, 0.06, 0, torso).scale.set(0.84, 1, 1.12);
  part(new THREE.SphereGeometry(0.235, 22, 18), skin, 0.01, 0.9, 0, torso);
  part(new THREE.SphereGeometry(0.248, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, -0.02, 0.92, 0, torso, 0).rotation.z = 0.25;
  if (mine) part(new THREE.TorusGeometry(0.238, 0.028, 8, 28), white, 0, 0.97, 0, torso, 0).rotation.set(Math.PI / 2, 0.12, 0);
  for (const s of [-1, 1]) part(new THREE.SphereGeometry(0.034, 10, 8), eye, 0.215, 0.91, s * 0.085, torso, 0).scale.set(0.6, 1.25, 1);
  const legs = [-1, 1].map((side) => {
    const limb = makeLimb(body, skin, 0.28, 0.29, 0.085);
    const shoe = part(new THREE.SphereGeometry(0.115, 14, 10), white, 0, 0, 0, body);
    shoe.scale.set(1.6, 0.72, 1);
    return { ...limb, shoe, side };
  });
  // Free arm uses the same two-bone rig. Targets stay in front of the shirt,
  // and the elbow bends outwards instead of sweeping through the torso.
  const off = makeLimb(torso, skin, 0.24, 0.23, 0.06);
  const offHand = part(new THREE.SphereGeometry(0.08, 12, 10), skin, 0, 0, 0, torso);
  // racket arm with a shoulder, an elbow and a wrist; it points straight up when unrotated
  const arm = new THREE.Group(); arm.position.set(0, 0.52, 0.27); torso.add(arm);
  part(new THREE.CapsuleGeometry(0.062, 0.14, 4, 8), skin, 0, 0.12, 0, arm);
  const fore = new THREE.Group(); fore.position.y = 0.24; arm.add(fore);
  part(new THREE.SphereGeometry(0.066, 10, 8), skin, 0, 0, 0, fore, 0.02);
  part(new THREE.CapsuleGeometry(0.056, 0.12, 4, 8), skin, 0, 0.11, 0, fore);
  const wrist = new THREE.Group(); wrist.position.y = 0.22; fore.add(wrist);
  part(new THREE.SphereGeometry(0.085, 12, 10), skin, 0, 0, 0, wrist);
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), dark, 0, 0.13, 0, wrist, 0.015);
  const face = part(new THREE.CylinderGeometry(0.185, 0.185, 0.055, 28), teamA ? dark : toon(0x2a2a2a), 0, 0.42, 0, wrist, 0.03);
  face.rotation.x = Math.PI / 2; face.scale.set(1, 1, 1.25);
  part(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24), teamA ? toon(0xffd60a) : toon(0xff4438), 0, 0.42, 0, wrist, 0).rotation.x = Math.PI / 2;
  if (mine) {
    const tex = canvasTex(256, 96, (g) => {
      g.fillStyle = "#ffd60a"; g.fillRect(28, 6, 200, 50);
      g.beginPath(); g.moveTo(112, 55); g.lineTo(144, 55); g.lineTo(128, 82); g.fill();
      g.font = `800 40px ${COND}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#0b1020";
      g.fillText("FERREIRA", 128, 33);
    });
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    label.scale.set(1.2, 0.45, 1); label.position.y = 2.1;
    root.add(label); root.userData.label = label;
  }
  root.rotation.y = teamA ? 0 : Math.PI;
  scene.add(root);
  return { root, body, torso, arm, fore, wrist, off, offHand, yaw: teamA ? 0 : Math.PI, legs, last: null, walk: 0, stride: 0, seed: i * 1.7 };
}
const players = {};
["A1", "A2", "B1", "B2"].forEach((name, i) => { players[name] = makePlayer(name, i); });

// ---------- Ball and effects ----------
const glowTex = canvasTex(64, 64, (g) => {
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(0.35, "rgba(255,255,255,.45)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
});
const glowSprite = (color) => new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));

const ball = new THREE.Mesh(new THREE.SphereGeometry(0.085, 22, 16), new THREE.MeshStandardMaterial({ color: 0xe6f545, emissive: 0xc8dc20, emissiveIntensity: 1.4, transparent: true }));
ball.castShadow = true;
scene.add(ball);
const halo = glowSprite(0xdff23f); halo.scale.setScalar(0.7); scene.add(halo);

const GHOSTS = 16;
const ghosts = Array.from({ length: GHOSTS }, () => { const s = glowSprite(0xdff23f); scene.add(s); return s; });
let trailPts = [];

const flash = glowSprite(0xffffff); scene.add(flash);
const shock = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
scene.add(shock);
const dust = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
dust.rotation.x = -Math.PI / 2;
scene.add(dust);

const sparks = Array.from({ length: 40 }, () => { const s = glowSprite(0xffffff); scene.add(s); return { s, v: new THREE.Vector3(), life: 0, max: 1, size: 0.1 }; });
function burst(pos, n, speed, dir, color, up = 0.5) {
  let made = 0;
  for (const p of sparks) {
    if (p.life > 0) continue;
    p.s.position.copy(pos); p.s.material.color.set(color);
    p.v.set(dir.x + rand(-0.8, 0.8), dir.y + rand(-0.3, 0.9) + up, dir.z + rand(-0.8, 0.8)).normalize().multiplyScalar(speed * rand(0.35, 1));
    p.max = p.life = rand(0.25, 0.6); p.size = rand(0.07, 0.2);
    if (++made >= n) break;
  }
}

const fx = { shake: 0, kick: 0, t0: -1e9, flashT: -1e9, flashS: 1, dustT: -1e9, freeze: 0 };
const punch = $("punch");

// ---------- Sound, synthesised so there is nothing to download ----------
let ac = null, muted = true, noise = null;
function audio() {
  if (muted || disposed) return null;
  try {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      noise = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === "suspended") ac.resume();
  } catch { ac = null; }
  return ac;
}
function tone(f0, f1, dur, vol, type = "sine") {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), n = a.currentTime;
  o.type = type; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f1, n + dur);
  g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(0.001, n + dur);
  o.connect(g).connect(a.destination); o.start(n); o.stop(n + dur + 0.02);
}
function hiss(freq, q, dur, vol, type = "bandpass", delay = 0) {
  const a = audio(); if (!a) return;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), n = a.currentTime + delay;
  s.buffer = noise; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(0.001, n + dur);
  s.connect(f).connect(g).connect(a.destination); s.start(n, Math.random() * 0.2, dur + 0.05);
}
const sfx = {
  hit(str) { tone(240, 55, 0.16 + 0.05 * str, 0.55 * str); tone(900, 220, 0.05, 0.25 * str, "triangle"); hiss(2100, 0.7, 0.07, 0.5 * str); if (str > 1.5) hiss(300, 0.5, 0.35, 0.5, "lowpass"); },
  bounce() { tone(170, 80, 0.07, 0.22); hiss(700, 0.6, 0.05, 0.16, "lowpass"); },
  glass() { hiss(3400, 4, 0.09, 0.3); hiss(2600, 5, 0.12, 0.2, "bandpass", 0.05); tone(420, 190, 0.14, 0.22, "triangle"); },
  point() { tone(660, 660, 0.12, 0.12, "triangle"); setTimeout(() => tone(990, 990, 0.2, 0.12, "triangle"), 110); },
};
listen(root, "pointerdown", audio);
listen(root, "keydown", audio);
listen($("sound"), "click", (e) => {
  muted = !muted;
  e.currentTarget.textContent = muted ? "Sound off" : "Sound on";
  e.currentTarget.setAttribute("aria-pressed", !muted);
  if (muted) ac?.suspend(); else audio();
});

// ---------- Ball timing ----------
const cOf = (k) => SHOT[beats[k].type].c;
const POWER = { smash: 1.9, bajada: 1.6, vibora: 1.55, drive: 1.2, bandeja: 1.15, volley: 1.1, contra: 1.0, serve: 0.95, lob: 0.8, chiquita: 0.6 };
const power = (b) => POWER[b.type];
const SOFT = { lob: 1, contra: 1, chiquita: 1, bandeja: 1 };
// The racket takes the first sliver of each segment to reach the ball, then the ball leaves fast.
function flightU(k, u) {
  const b = beats[k];
  if (b.win && u >= FLY) return u;
  const end = b.win ? FLY : 1, c = cOf(k);
  const v = clamp((u - c) / (end - c));
  const w = SOFT[b.type] ? v : power(b) > 1.45 ? 0.4 * v + 0.6 * (1 - Math.pow(1 - v, 3)) : 0.6 * v + 0.4 * (1 - Math.pow(1 - v, 2.5));
  return w * end;
}
const pathF = (k, u) => { const w = flightU(k, u); return beats[k].win ? Math.min(w / FLY, 1) : w; };

function impact(k, now, freeze) {
  const b = beats[k], str = power(b), away = (b.who[0] === "A" ? 1 : -1) * (b.type === "contra" ? -1 : 1);
  fx.shake = 0.2 * str; fx.kick = 5.5 * str; fx.t0 = now; fx.flashT = now; fx.flashS = str;
  if (freeze) fx.freeze = now + (str > 1.45 ? 160 : str < 0.9 ? 40 : 75);
  flash.position.copy(ball.position); shock.position.copy(ball.position);
  burst(ball.position, str > 1.45 ? 20 : 10, 7 * str, new THREE.Vector3(away, 0, 0), str > 1.45 ? 0xffffff : 0xf2ff9a, 0.2);
  sfx.hit(str); onImpact(b, str);
  if (punch.animate) punch.animate([{ opacity: 0.2 * str }, { opacity: 0 }], { duration: 280, easing: "ease-out" });
}
function touch(pt, now) {
  if (pt.net) { sfx.bounce(); return; }
  const pos = V(pt.p[0], pt.p[1], pt.z);
  if (pt.z === 0) {
    dust.position.copy(pos).setY(0.02); fx.dustT = now;
    burst(pos.setY(0.05), 6, 2.2, new THREE.Vector3(0, 0.6, 0), 0xcfe6ff, 0.6);
    sfx.bounce();
  } else {
    flash.position.copy(pos); fx.flashT = now; fx.flashS = 0.8;
    fx.shake = Math.max(fx.shake * Math.exp(-(now - fx.t0) / 150), 0.09); fx.t0 = now;
    burst(pos, 8, 3, new THREE.Vector3(pos.x > 9 ? -1 : pos.x < -9 ? 1 : 0, 0.2, pos.z > 4 ? -1 : pos.z < -4 ? 1 : 0), 0xbfe3ff, 0.2);
    sfx.glass();
  }
}
// Fire the effects for everything the ball passed through between two moments.
function events(a, c, now, freeze) {
  if (Math.floor(c) > Math.floor(a)) { const boundary = Math.floor(a) + 1; events(a, boundary - 1e-8, now, freeze); if (c > boundary && boundary < N) events(boundary, c, now, freeze); return; }
  const k = Math.min(Math.floor(a), N - 1);
  if (Math.floor(c) > k && c - Math.floor(c) > 0) c = k + 1;
  const ua = a - k, uc = c - k, b = beats[k], ct = cOf(k);
  if (b.type === "serve" && ua < ct * 0.5 && uc >= ct * 0.5) sfx.bounce(); // the server bounces the ball first
  if (ua < ct && uc >= ct) impact(k, now, freeze);
  const fa = pathF(k, ua), fc = pathF(k, uc), { pts, cum, total } = b.path;
  for (let i = 1; i < pts.length - (b.win ? 0 : 1); i++) {
    const f = cum[i] / total;
    if (fa < f && fc >= f) touch(pts[i], now);
  }
  if (b.win && ua < FLY && uc >= FLY) { sfx.point(); onPoint(b); }
}

// cartoon ball: flat colour with an ink outline
ball.geometry.dispose(); ball.material.dispose();
ball.geometry = new THREE.SphereGeometry(0.105, 20, 14);
ball.material = new THREE.MeshBasicMaterial({ color: 0xeaff3d, transparent: true });
ball.geometry.computeBoundingSphere();
const ballInk = new THREE.Mesh(ball.geometry, ink); ballInk.scale.setScalar(1.22); ball.add(ballInk);

// crowd noise
let murmur = null;
fx.cheerT = -1e9; fx.cheerS = 0;
function cheer(vol, dur) {
  const a = audio(); if (!a) return;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), n = a.currentTime;
  s.buffer = noise; s.loop = true; f.type = "bandpass"; f.frequency.value = 2300; f.Q.value = 0.5;
  g.gain.setValueAtTime(0.001, n); g.gain.exponentialRampToValueAtTime(vol, n + 0.22); g.gain.exponentialRampToValueAtTime(0.001, n + dur);
  s.connect(f).connect(g).connect(a.destination); s.start(n); s.stop(n + dur + 0.1);
}
function onPoint(b) { fx.cheerT = performance.now(); fx.cheerS = 1; fx.cheerTeam = b.winner ?? "A"; if (fx.cheerTeam === "A") cheer(0.3, 3.2);
  else { tone(220, 85, 1.4, 0.15, "sawtooth"); tone(165, 65, 1.7, 0.1); }
}
const speedEl = $("speed");
function onImpact(b, str) {
  if (!murmur && ac && !muted) {
    murmur = ac.createBufferSource(); const f = ac.createBiquadFilter(), g = ac.createGain();
    murmur.buffer = noise; murmur.loop = true; f.type = "lowpass"; f.frequency.value = 420; g.gain.value = 0.035;
    murmur.connect(f).connect(g).connect(ac.destination); murmur.start();
  }
  const serve = firstOfPoint(beats.indexOf(b));
  
  if ((str > 1.5 || serve) && speedEl.animate) {
    $("speedL").textContent = serve ? "Serve" : (selections.get(beats.indexOf(b))?.label ?? b.shot);
    $("speedV").textContent = Math.round(serve ? rand(92, 118) : rand(148, 186)) + " km/h";
    speedEl.animate([{ opacity: 0, translate: "20px 0" }, { opacity: 1, translate: "0 0", offset: 0.12 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1900, easing: "ease-out" });
  }
}

// ---------- Cameras: a fixed broadcast camera plus cut-aways, like TV ----------
const MAIN = new THREE.Vector3(-18.5, 7.2, 0);
const offCourt = (k) => beats[k].at[1] > 10 || beats[k].at[1] < 0;
const isSpecial = (k) => k < N && (firstOfPoint(k) || beats[k].type === "smash" || offCourt(k));
function closeUp(k) {
  const b = beats[k], h = V(b.at[0], b.at[1]), side = h.z >= 0 ? 1 : -1;
  if (offCourt(k)) return { pos: V(b.at[0] + 4.6, b.at[1] - 4.4, 2.1), look: V(b.at[0] - 0.3, b.at[1], 1.0), fov: 50 }; // from inside the court, through the glass
  const behind = b.who[0] === "A" ? -1 : 1; // the hitter's own side, so a partner at the net can't block the lens
  if (b.type === "smash") return { pos: new THREE.Vector3(h.x + behind * 4.2, 0.8, clamp(h.z + side * 3.2, -4.4, 4.4)), look: new THREE.Vector3(h.x - behind * 0.4, 2.0, h.z), fov: 46 }; // low angle under the smash
  return { pos: new THREE.Vector3(-9.4, 1.9, h.z - side * 5.4), look: new THREE.Vector3(h.x + 0.9, 1.0, h.z), fov: 42 }; // the server, from the back corner
}
function shot(k, u, s) {
  const b = beats[k];
  if (t >= N || (k === N - 1 && u >= FLY + 0.02)) { // the winners, circled
    // Portrait frames the five figures tighter, so the ceremony doesn't float in an empty court.
    if (camera.aspect < 0.8) return { pos: new THREE.Vector3(-12.6, 3.4, 0), look: new THREE.Vector3(-4.6, 1.15, 0), fov: 44, hand: 0 };
    return { pos: new THREE.Vector3(-12, 4.6, 0), look: new THREE.Vector3(-4, 1.4, 0), fov: 44, hand: 0 };
  }
  if (b.win && u >= FLY + 0.02) {
    if (u >= 0.93) return { ...closeUp(k + 1), hand: 1 };
    const team = b.winner === "B" ? "B" : "A";
    const pair = [playerAt(team + "1", k, u), playerAt(team + "2", k, u)];
    const f = V((pair[0][0] + pair[1][0]) / 2, (pair[0][1] + pair[1][1]) / 2, 1.1);
    return { pos: new THREE.Vector3(f.x + (team === "A" ? 1 : -1) * (camera.aspect < 0.8 ? 10 : 7.5), 3.4, f.z + 0.8), look: f, fov: 52, hand: 1 };
  }
  if (b.win && u > cOf(k) + 0.15 && u < FLY) {
    const landing = b.win[0].p, f = V(...landing);
    // A ball leaving the arena is followed from higher up, over the heads of the defenders.
    const leaves = b.win.some(({p}) => p[0] > 20.5 || p[0] < -0.5 || p[1] > 10.5 || p[1] < -0.5);
    return { pos: new THREE.Vector3(clamp(f.x - 4, -8, 8), leaves ? 5.2 : 3.2, clamp(f.z + 3, -4, 4)), look: new THREE.Vector3(s.x - 10, s.z, s.y - 5), fov: 48, hand: 1 };
  }
  if (isSpecial(k)) { const close = closeUp(k), w = smooth(clamp((u - cOf(k) - 0.1) / 0.3)); return { pos: close.pos.lerp(MAIN, w), look: close.look.lerp(new THREE.Vector3(-1.2, 0, 0), w), fov: close.fov + (38 - close.fov) * w, hand: 1 - w * 0.88 }; }
  // main camera: pans a little with the ball and pushes in on whoever is about to hit
  const look = new THREE.Vector3(-1.2, 0, 0);
  if (s.op > 0.5 && !s.reset) { look.x += (s.x - 10) * 0.1; look.z += (s.y - 5) * 0.24; }
  let zoom = 1 - smooth(clamp((u - cOf(k) - 0.1) / 0.2)), focus = b.at;
  const nx = beats[k + 1];
  if (!b.win && nx && u > 0.5) { if (isSpecial(k + 1)) { const close = closeUp(k + 1), w = smooth(clamp((u - 0.7) / 0.3)); return { pos: MAIN.clone().lerp(close.pos, w), look: look.lerp(close.look, w), fov: 38 + (close.fov - 38) * w, hand: w }; } zoom = smooth(clamp((u - 0.72) / 0.28)); focus = nx.at; }

  const f = V(focus[0], focus[1]);
  // Near-side hitters are framed high so the caption doesn't sit on them; far-side ones get a long zoom.
  const far = f.x > 0;
  look.lerp(far ? new THREE.Vector3(f.x - 1.5, 0.9, f.z * 0.9) : new THREE.Vector3(f.x - 2.2, 0.8, f.z * 0.8), 0.88 * zoom);
  if (OVERHEAD[b.type] && focus === b.at) look.lerp(new THREE.Vector3(f.x - 0.4, 1.6, f.z * 0.9), zoom);
  return { pos: MAIN.clone(), look, fov: 38 - (far ? 20 : 12) * zoom, hand: 0.12 };
}
const beyondPoint = (k, u) => beats[k].win && u >= FLY;
function placeCamera(k, u, s, now) {
  const c = shot(k, u, s);
  // The arena banner is visible only when fully framed; edge-on it looked like a stray yellow line.
  banner.visible = false;
  if (reducedMotion) { c.hand = 0; fx.shake = 0; fx.kick = 0; }
  if (camera.aspect < 0.8 && t < N && !(beyondPoint(k, u))) {
    // A portrait broadcast follows the active player/ball rather than shrinking the entire court.
    const f = u < cOf(k) + 0.12 ? V(...beats[k].at, 1.2) : V(s.x, s.y, Math.max(0.8, s.z));
    const side = beats[k].who[0] === "A" ? -1 : 1;
    c.pos = new THREE.Vector3(clamp(f.x + side * 6, -9.2, 9.2), 4.4, clamp(f.z + 4, -3.8, 3.8));
    c.look = f; c.fov = 48; c.hand = 0;
  }
  camera.position.copy(c.pos);
  camera.position.x += Math.sin(now * 0.00041) * 0.22 * c.hand;
  camera.position.y += Math.sin(now * 0.00033 + 1) * 0.1 * c.hand;
  camera.position.z += Math.cos(now * 0.00037) * 0.24 * c.hand;
  const age = now - fx.t0, amp = fx.shake * Math.exp(-age / 150) * (c.hand < 1 ? 2.2 : 1);
  if (amp > 0.002) { camera.position.x += rand(-amp, amp); camera.position.y += rand(-amp, amp); camera.position.z += rand(-amp, amp); }
  camera.lookAt(c.look);
  const outside = camera.position.x < -10;
  for (const m of nearWall) m.visible = !outside;
  if (amp > 0.002) camera.rotation.z += rand(-amp, amp) * 0.06;
  camera.fov = (c.fov - fx.kick * Math.exp(-age / 190) * 0.8) * (camera.aspect < 1.5 ? 1.18 : 1);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  // Cull whole handheld cards when the camera would clip their edges.
  for (const {sign} of placards) {
    sign.updateMatrixWorld(true);
    sign.visible = [-0.8, 0.8].every((x) => {
      const edge = sign.localToWorld(new THREE.Vector3(x, 0.85, 0)).project(camera);
      return Math.abs(edge.x) < 0.96 && Math.abs(edge.y) < 0.94 && edge.z < 1;
    });
  }
}

// ---------- UI ----------
const card = $("card"), callout = $("callout"), nextBtn = $("next"), backBtn = $("back"), hint = $("hint");
const bonusBar = document.createElement("i"); bonusBar.innerHTML = "<b></b>"; bonusBar.hidden = true;
$("progress").append(bonusBar);
const bars = [...root.querySelectorAll("[data-match=progress] b")];
let t = 0, goal = 0, mode = "click", shownCard = -1, shownCall = -1, autoStart = 0, autoMs = 0;

function renderCard(k) {
  if (k === shownCard) return;
  shownCard = k;
  root.dataset.beat = String(k);
  if (k >= N) {
    card.className = "l3 end";
    root.dataset.cardSide = "left";
    const score = scoreAt(beats, N);
    const result = score.a === score.b ? `We drew ${score.a}–${score.b}.` : score.a > score.b ? `We won ${score.a}–${score.b}.` : `We lost ${score.a}–${score.b}.`;
    card.innerHTML = `<div class="l3-tag">${N > 16 ? "Five points played · Bonus complete" : "Four points played"}</div><div class="l3-main"><h2>Thanks for playing</h2><p>${result} Good game, partner. Let's talk.</p><div class="links"><a href="/">Open the portfolio</a><a href="mailto:${email}">Email me</a><a href="${CV}">CV</a></div></div>`;
    return;
  }
  const b = beats[k];
  const onLeft = b.who[0] === "A" && b.at[1] < 5 && !isSpecial(k); // keep the caption off the hitter
  card.className = "l3" + (onLeft ? " right" : "");
  root.dataset.cardSide = onLeft ? "right" : "left"; // the "Why?" note opens on the other side
  speedEl.style.left = onLeft ? "3%" : "auto"; speedEl.style.right = onLeft ? "auto" : "3%";
  card.innerHTML = `<div class="l3-tag">${escapeText(selections.get(k)?.label ?? (shotDecisions[b.contentKey] ? "Choose your shot" : b.shot))}</div><div class="l3-main"><h2>${escapeText(b.title)}</h2>${b.body ? `<p>${escapeText(b.body)}</p>` : ""}${b.html || ""}<div class="timer" data-match="timer"></div></div>`;
}

// A pose is [shoulder x, y, z, body turn, lean, crouch, jump, free arm raised, elbow x, elbow z, wrist x, wrist z].
// Each shot goes ready -> wound up (w) -> contact (c) -> follow-through (f) -> ready.
// The arm points straight up when unrotated. On the elbow and wrist, z folds the racket back
// (behind the head on an overhead, upwards on a low arm) and x folds it across the body.
const READY = [0, 0.4, -2.3, 0, 0.12, 0.05, 0, 0, 0, 0.8, 0, 0.3]; // elbow bent, racket up in front
const SWING = {
  serve:     { w: [0, -1.7, -2.55, -0.5, 0.18, 0.1, 0, 0.3, 0, 0.5, 0, 0.3],    c: [0, -0.2, -2.45, -0.2, 0.2, 0.1, 0, 0, 0, 0.25, 0, 0],       f: [0, 1.1, -1.3, 0.2, 0.1, 0, 0, 0, 0, 0.9, 0, 0.3] },
  // racket head up behind on the take-back, arm long at contact, finish wrapped over the far shoulder
  drive:     { w: [0, -2.0, -2.1, -0.9, 0.15, 0.12, 0, 0.3, 0, 1.1, 0, 0.4],    c: [0, -0.3, -2.1, -0.2, 0.2, 0.12, 0, 0, 0, 0.25, 0, -0.1],    f: [0, 1.5, -1.2, 0.5, 0.1, 0, 0, 0, -0.9, 0.6, 0, 0.2] },
  // compact: the elbow stays in front and the forearm punches
  volley:    { w: [0, -0.7, -2.2, -0.4, 0.1, 0.1, 0, 0.4, 0, 1.5, 0, 0.5],      c: [0, -0.2, -2.1, -0.1, 0.2, 0.14, 0, 0.2, 0, 1.0, 0, 0.1],    f: [0, 0.3, -2.0, 0, 0.22, 0.12, 0, 0, 0, 0.6, 0, -0.2] },
  chiquita:  { w: [0, -1.5, -2.4, -0.6, 0.2, 0.15, 0, 0.2, 0, 0.8, 0, 0.4],     c: [0, -0.3, -2.4, -0.2, 0.22, 0.15, 0, 0, 0, 0.3, 0, 0],       f: [0, 0.7, -1.8, 0.1, 0.15, 0.05, 0, 0, 0, 0.7, 0, 0.3] },
  // low and open underneath, finishing high
  lob:       { w: [0, -1.8, -2.7, -0.8, 0.2, 0.2, 0, 0.2, 0, 0.5, 0, 0.5],      c: [0, -0.4, -2.4, -0.3, 0.1, 0.15, 0, 0, 0, 0.3, 0, 0.2],      f: [0, 0.4, -0.9, 0, -0.12, 0, 0, 0, 0, 0.9, 0, 0.4] },
  contra:    { w: [0, -1.8, -2.7, -0.8, 0.2, 0.2, 0, 0.2, 0, 0.5, 0, 0.5],      c: [0, -0.4, -2.4, -0.3, 0.1, 0.15, 0, 0, 0, 0.3, 0, 0.2],      f: [0, 0.4, -0.9, 0, -0.12, 0, 0, 0, 0, 0.9, 0, 0.4] },
  // backhands: the body turns the other way and the racket wraps round the free-arm side
  drive_bh:  { w: [0, 1.25, -2.0, 1.5, 0.15, 0.12, 0, 0, -0.9, 0.3, 0, 0],      c: [0, 0.9, -2.0, 0.5, 0.2, 0.12, 0, 0, -0.2, 0.2, 0, 0],       f: [0, -0.9, -1.3, -0.2, 0.1, 0, 0, 0.3, 0.3, 0.5, 0, 0.2] },
  volley_bh: { w: [0, 1.1, -2.1, 0.7, 0.1, 0.2, 0, 0, -0.5, 1.0, 0, 0.3],       c: [0, 0.9, -2.2, 0.3, 0.2, 0.22, 0, 0, -0.1, 0.6, 0, 0],       f: [0, 0.4, -2.2, 0.1, 0.22, 0.2, 0, 0.2, 0.2, 0.4, 0, 0] },
  lob_bh:    { w: [0, 1.25, -2.7, 1.4, 0.2, 0.2, 0, 0, -0.8, 0.3, 0, 0.4],      c: [0, 0.9, -2.4, 0.5, 0.1, 0.15, 0, 0, -0.2, 0.3, 0, 0.2],     f: [0, -0.2, -0.9, 0, -0.12, 0, 0, 0.2, 0.2, 0.8, 0, 0.4] },
  // side-on, elbow up and the racket held like a tray beside the head, a flat cut that finishes low
  bandeja:   { w: [1.45, 0, 0.2, -1.35, -0.1, 0.05, 0, 1, -1.4, 0.1, 0, 0.4],    c: [-0.25, 0, -0.2, -0.9, 0.05, 0, 0.12, 0.5, 0, 0.25, 0, -0.1], f: [-1.75, 0, -0.3, -0.35, 0.2, 0.05, 0, 0, 0, 0.5, 0, 0.3] },
  // racket deep behind the head, forearm whipped through late, the whole body turning with it
  vibora:    { w: [1.4, 0, 0.3, -1.5, -0.15, 0.08, 0, 1, -1.3, 0.2, 0, 0.6],   c: [-0.55, 0, -0.35, -0.7, 0.1, 0.05, 0.1, 0.4, 0, 0.4, 0, 0.2], f: [-2.3, 0, -0.5, 0.45, 0.28, 0.1, 0, 0, 0, 0.8, 0, 0.5] },
  bajada:    { w: [1.4, 0, 0.3, -1.2, -0.15, 0, 0, 1, -1.3, 0.1, 0, 0.5],         c: [-0.2, 0, -0.45, -0.5, 0.15, 0, 0.1, 0.3, 0, 0.2, 0, -0.3],  f: [-0.9, 0, -1.9, 0.2, 0.4, 0.1, 0, 0, 0, 0.3, 0, -0.5] },
  // racket dropped down the back, full stretch at contact, wrist snapped over
  smash:     { w: [1.3, 0, 0.4, -1.1, -0.28, 0, 0.45, 1, -1.2, 0.3, 0, 1.2],      c: [-0.15, 0, -0.2, -0.35, 0.1, 0, 0.6, 0.3, 0, 0.05, 0, -0.25], f: [-0.6, 0, -2.1, 0.3, 0.5, 0, 0.25, 0, 0, 0.2, 0, -0.9] },
};
const mix = (a, b, w) => a.map((v, i) => lerp(v, b[i], w));
function poseAt(type, ph, c) {
  const S = SWING[type];
  if (ph <= 0) return mix(READY, S.w, smooth(clamp((ph + 0.42) / 0.3)));
  if (ph < c) { const hold = type === "serve" ? 0.55 : 0; return mix(S.w, S.c, Math.pow(clamp((ph / c - hold) / (1 - hold)), 2)); }
  if (ph < c + 0.1) return mix(S.c, S.f, 1 - Math.pow(1 - (ph - c) / 0.1, 2));
  return mix(S.f, READY, smooth(clamp((ph - c - 0.1) / 0.25)));
}
function swing(name) {
  for (const k of [Math.floor(t), Math.floor(t) + 1]) {
    const b = beats[k];
    if (!b || b.who !== name) continue;
    const ph = t - k;
    if (ph > -0.42 && ph < cOf(k) + 0.36) return { b, ph, k };
  }
  return null;
}
const shortest = (d) => Math.atan2(Math.sin(d), Math.cos(d));
const angLerp = (a, b, w) => a + shortest(b - a) * w;

// Athletic ready stance, a small split-step as the opponent strikes, then
// loading the back leg and stepping into contact. Feet stay at court height
// while the pelvis lowers; only a recovery step or an actual jump lifts them.
function lowerBodyAt(P, sw, time, beatIndex, walk, stride) {
  const contact = cOf(beatIndex);
  const split = sw || beats[beatIndex].win ? 0 : Math.max(0, 1 - Math.abs(time - beatIndex - contact) / 0.16);
  const active = sw ? 1 - smooth(clamp((sw.ph - cOf(sw.k) - 0.1) / 0.25)) : 0;
  const transfer = sw ? smooth(clamp((sw.ph + 0.12) / (cOf(sw.k) + 0.12))) : 0;
  const backhand = sw?.b.bh ? -1 : 1;
  const lunge = sw && (sw.b.type === "volley" || sw.b.type === "chiquita") ? 1 : 0;
  return {
    crouch: Math.min(0.26, 0.035 + P[5] * 0.8 + split * 0.035 + stride * 0.018),
    hipX: active * lerp(-0.035, 0.065, transfer),
    spread: 0.19 + split * 0.045 + active * 0.025,
    stagger: active * (0.065 + transfer * (0.06 + lunge * 0.035)),
    lead: backhand, phase: walk * 6, stride: stride * (1 - active * 0.8),
    airborne: clamp(P[6] / 0.45),
  };
}
function footAt(side, mechanics) {
  const cycle = mechanics.phase + (side < 0 ? Math.PI : 0);
  return {
    x: Math.sin(cycle) * 0.19 * mechanics.stride + side * mechanics.lead * mechanics.stagger,
    y: 0.09 + Math.max(0, Math.cos(cycle)) * 0.12 * mechanics.stride + (side < 0 ? 0.045 : 0) * mechanics.airborne,
    z: side * mechanics.spread,
  };
}
const freeShoulder = new THREE.Vector3(0, 0.52, -0.27), freeTarget = new THREE.Vector3();
const freePole = new THREE.Vector3(0.3, 0, -1), kneePole = new THREE.Vector3(1, 0, 0);
const hipTarget = new THREE.Vector3(), ankleTarget = new THREE.Vector3();

const prevBall = new THREE.Vector3(), vel = new THREE.Vector3(), tmp = new THREE.Vector3();
let lastNow = performance.now();
function render(now) {
  const dts = Math.min(0.064, (now - lastNow) / 1000); lastNow = now;
  const k = Math.min(Math.floor(t), N - 1), u = t - k, b = beats[k];
  const s = ballAt(k, flightU(k, u));
  if (b.type === "serve" && u < cOf(k)) { // drop the ball, let it bounce, then hit it below the waist
    const v = u / cOf(k);
    s.z = v < 0.5 ? lerp(1.0, 0.1, Math.pow(v / 0.5, 2)) : lerp(0.1, b.z, Math.sin(((v - 0.5) / 0.5) * Math.PI / 2));
  }

  prevBall.copy(ball.position);
  ball.position.copy(V(s.x, s.y, Math.max(s.z, 0.11)));
  ball.material.opacity = s.op; ball.visible = s.op > 0.3;
  vel.subVectors(ball.position, prevBall);
  const speed = dts > 0 ? vel.length() / dts : 0;
  if (speed > 1 && speed < 200) {
    ball.lookAt(tmp.copy(ball.position).add(vel));
    ball.scale.set(1, 1, 1 + Math.min(speed * 0.05, 2.4)); // squash and stretch
  } else if (speed <= 1) ball.scale.set(1, 1, 1);
  halo.position.copy(ball.position); halo.material.opacity = 0.22 * s.op;
  if (s.op < 0.5 || s.reset) trailPts = [];
  else {
    const last = trailPts[trailPts.length - 1];
    if (last && last.distanceTo(ball.position) > 5) trailPts = [];
    if (!last || last.distanceTo(ball.position) > 0.06) trailPts.push(ball.position.clone());
    if (trailPts.length > GHOSTS) trailPts.shift();
  }
  ghosts.forEach((g, i) => {
    const p = trailPts[trailPts.length - 1 - i];
    if (!p || trailPts.length < 3) { g.material.opacity = 0; return; }
    const f = 1 - i / GHOSTS;
    g.position.copy(p); g.scale.setScalar(0.14 + 0.4 * f); g.material.opacity = 0.55 * f * f * s.op;
  });

  const fa = (now - fx.flashT) / 1000;
  flash.material.opacity = fa < 0.2 ? (1 - fa / 0.2) * 0.95 : 0;
  flash.scale.setScalar((0.6 + fa * 15) * fx.flashS);
  shock.material.opacity = fa < 0.3 && fx.flashS > 0.85 ? (1 - fa / 0.3) * 0.85 : 0;
  shock.scale.setScalar((0.15 + fa * 6.5) * fx.flashS); shock.lookAt(camera.position);
  const da = (now - fx.dustT) / 1000;
  dust.material.opacity = da < 0.35 ? (1 - da / 0.35) * 0.5 : 0;
  dust.scale.setScalar(0.15 + da * 2.4);
  for (const p of sparks) {
    if (p.life <= 0) { p.s.material.opacity = 0; continue; }
    p.life -= dts; p.v.y -= 7 * dts;
    p.s.position.addScaledVector(p.v, dts);
    const f = Math.max(p.life / p.max, 0);
    p.s.material.opacity = f; p.s.scale.setScalar(p.size * (0.5 + f) * 1.3);
  }

  const ca = (now - fx.cheerT) / 1000;
  const cheerAmp = !reducedMotion && ca < 4 ? fx.cheerS * Math.exp(-ca / 2) : 0;
  root.dataset.crowdReaction = cheerAmp > 0.01 ? (fx.cheerTeam === "B" ? "groan" : "wave") : "idle";
  for (const row of crowd) {
    row.seats.forEach(({px, pz, h, s, alongX, phase, holdsSign}, i) => {
      const travel = ca - phase * 3.2;
      const lift = cheerAmp && fx.cheerTeam !== "B" && travel > 0 && travel < 1.1 ? Math.sin(travel / 1.1 * Math.PI) * 1.0 : 0;
      const slump = fx.cheerTeam === "B" ? cheerAmp * 0.3 : 0;
      instanceMatrix.makeScale(s, s * (1 - slump), s).setPosition(px, h + 0.36 * s + lift, pz);
      row.bodies.setMatrixAt(i, instanceMatrix);
      instanceMatrix.makeScale(s, s, s).setPosition(px, h + 0.9 * s + lift - slump, pz + slump * 0.4);
      row.heads.setMatrixAt(i, instanceMatrix);
      // Arms only appear while a fan is up in the wave, raised in a V along the row.
      row.seats[i].lift = lift;
      const up = s > 0 && (lift > 0.15 || holdsSign);
      for (const side of [-1, 1]) {
        if (alongX) instanceMatrix.makeRotationZ(side * -0.45); else instanceMatrix.makeRotationX(side * 0.45);
        instanceMatrix.scale(up ? armScale.setScalar(s) : armScale.setScalar(0));
        instanceMatrix.setPosition(px + (alongX ? side * 0.3 * s : 0), h + 1.1 * s + lift, pz + (alongX ? 0 : side * 0.3 * s));
        row.arms.setMatrixAt(i * 2 + (side + 1) / 2, instanceMatrix);
      }
    });
    row.arms.instanceMatrix.needsUpdate = row.bodies.instanceMatrix.needsUpdate = row.heads.instanceMatrix.needsUpdate = true;
  }
  for (const {sign, seat} of placards) sign.position.y = seat.h + 1.25 + (seat.lift || 0) + (cheerAmp ? Math.sin(now * 0.004 + seat.px) * 0.1 : 0);
  if (t >= N) ceremonyStart ??= now;
  else ceremonyStart = null;
  const ceremonyAge = reducedMotion ? 4 : ceremonyStart === null ? 0 : (now - ceremonyStart) / 1000;
  root.dataset.ceremony = t < N ? "" : ceremonyAge < 1 ? "meeting" : ceremonyAge < 2.8 ? "presentation" : "complete";
  trophy.visible = t >= N && ceremonyAge >= 1;
  trophy.scale.setScalar(0.65 * (reducedMotion ? 1 : smooth(clamp((ceremonyAge - 1) / 0.6))));
  confetti.visible = t >= N && !reducedMotion && ceremonyAge > 1 && ceremonyAge < 4;
  if (confetti.visible) {
    confettiSeeds.forEach(([x, y, z], i) => {
      instanceMatrix.makeRotationY(ceremonyAge * 3 + i).setPosition(x, 5 - ((ceremonyAge - 1) * 1.5 + y) % 5, z);
      confetti.setMatrixAt(i, instanceMatrix);
    });
    confetti.instanceMatrix.needsUpdate = true;
  }
  const ticker = $("commentary");
  const line = b.win && u >= FLY ? commentary[b.winner === "B" ? "lost" : "won"][b.pt] : b.pt === 4 ? commentary.bonus[k - choreography.length] : commentary.beats[b.contentKey] ?? commentary[b.type];
  if (ticker.textContent !== line) {
    ticker.textContent = line;
    if (!reducedMotion) ticker.animate([{transform: "translateX(24px)", opacity: 0}, {transform: "translateX(0)", opacity: 1}], {duration: 250});
  }
  ticker.hidden = t >= N || Boolean($("choice").open);

  for (const name in players) {
    const p = players[name], [x, y] = playerAt(name, k, u);
    const pos = V(x, y);
    const moved = p.last ? p.last.distanceTo(pos) : 0;
    p.walk += moved; p.last = pos;
    p.stride = lerp(p.stride, clamp(dts > 0 ? moved / dts / 3 : 0), 0.2);
    p.root.position.copy(pos);

    // Players watch the ball: whoever hits next turns to follow it, even round to the glass behind them.
    let base = name[0] === "A" ? 0 : Math.PI, P = READY, yaw;
    const toBall = s.op > 0.5 && !s.reset ? Math.atan2(-(ball.position.z - pos.z), ball.position.x - pos.x) : base;
    const sw = swing(name);
    if (sw) {
      if (sw.b.type === "contra") base += Math.PI; // hit against their own back glass
      P = poseAt(sw.b.type + (sw.b.bh ? "_bh" : ""), sw.ph, cOf(sw.k));
      yaw = angLerp(base + P[3], toBall, sw.ph < 0 ? 1 - smooth(clamp((sw.ph + 0.25) / 0.2)) : 0);
    } else {
      const nx = beats[k + 1], mineNext = nx && !b.win && nx.who === name;
      yaw = angLerp(base, toBall, mineNext ? smooth(clamp((u - 0.1) / 0.3)) : 0.2);
    }
    if ((b.win && u >= FLY) || t >= N) {
      const score = scoreAt(beats, t), team = t >= N ? (score.a === score.b ? null : score.a > score.b ? "A" : "B") : (b.winner ?? "A");
      P = [...READY];
      if (!team || name[0] === team) { P[2] = -0.35; P[7] = 1; P[9] = 1.6; P[6] = 0.06 * Math.abs(Math.sin(now * 0.008 + p.seed)); }
      else { P[4] = 0.4; P[5] = 0.18; P[2] = -2.9; P[9] = 0.1; }
    }
    if (t >= N) {
      yaw = Math.PI; p.yaw = yaw;
      P = [...READY]; P[2] = -3; P[4] = P[5] = P[6] = 0; P[7] = name[0] === "A" ? 1 : 0;
    }
    p.wrist.visible = t < N;
    if (sw && OVERHEAD[sw.b.type]) {
      // An option can replace a smash with a shoulder-height overhead (or vice versa).
      // Adapt elevation to that branch's ball height while keeping the authored swing.
      const lift = (sw.b.z - CONTACT_HEIGHT[sw.b.type]) / 1.2;
      const envelope = smooth(clamp((sw.ph + 0.28) / (0.28 + cOf(sw.k)))) * (1 - smooth(clamp((sw.ph - cOf(sw.k) - 0.04) / 0.25)));
      P = [...P]; P[6] = Math.max(0, P[6] + lift * envelope);
    }
    p.yaw += shortest(yaw - p.yaw) * Math.min(1, dts * 12);
    p.root.rotation.y = p.yaw;
    p.arm.rotation.set(P[0], P[1], P[2]);
    p.fore.rotation.set(P[8], 0, P[9]);
    p.wrist.rotation.set(P[10], 0, P[11]);
    p.torso.rotation.set(0, 0, -P[4]);
    const mechanics = lowerBodyAt(P, sw, t, k, p.walk, p.stride);
    p.torso.position.y = 0.62 - mechanics.crouch;
    const happy = name[0] === (fx.cheerTeam ?? "A") ? cheerAmp * Math.abs(Math.sin(now * 0.012 + p.seed)) * 0.25 : 0;
    p.body.position.y = P[6] + happy;

    // Raise the free hand to sight an overhead; otherwise keep it forward for
    // balance. Both targets are relative to the torso, so turning cannot drag
    // the arm through the player's back.
    if (sw && (!OVERHEAD[sw.b.type] || Math.abs(sw.b.z - CONTACT_HEIGHT[sw.b.type]) > 0.01)) {
      const weight = smooth(clamp(1 - Math.abs(sw.ph - cOf(sw.k)) / 0.09));
      if (weight > 0) {
        p.root.updateMatrixWorld(true);
        const target = p.torso.worldToLocal(V(...sw.b.at, sw.b.z)).sub(p.arm.position);
        const dir = target.clone().normalize(), pole = new THREE.Vector3(0, 0, sw.b.bh ? -1 : 1);
        pole.addScaledVector(dir, -pole.dot(dir)).normalize();
        const wristQ = OVERHEAD[sw.b.type] ? p.wrist.quaternion.clone() : new THREE.Quaternion();
        const foreVector = new THREE.Vector3(0, 0.42, 0).applyQuaternion(wristQ).add(new THREE.Vector3(0, 0.22, 0));
        const length = foreVector.length();
        const d = clamp(target.length(), length - 0.239, length + 0.239), along = (0.24 ** 2 - length ** 2 + d * d) / (2 * d);
        const joint = dir.clone().multiplyScalar(along).addScaledVector(pole, Math.sqrt(Math.max(0, 0.24 ** 2 - along ** 2)));
        const q = new THREE.Quaternion().setFromUnitVectors(limbAxis, joint.clone().normalize());
        const endQ = new THREE.Quaternion().setFromUnitVectors(foreVector.normalize(), target.clone().sub(joint).normalize());
        p.arm.quaternion.slerp(q, weight);
        p.fore.quaternion.slerp(q.clone().invert().multiply(endQ), weight);
        p.wrist.quaternion.slerp(wristQ, weight);
      }
    }
    const raised = clamp(P[7]);
    // Travel around the shoulder on an arc. Blending hand positions in a
    // straight line pulled the wrist towards the shoulder halfway up, folding
    // the elbow into a sharp right angle. Keep a gentle bend throughout.
    const freeElevation = lerp(0.22, 2.72, smooth(raised));
    freeTarget.set(0.445 * Math.sin(freeElevation), 0.52 - 0.445 * Math.cos(freeElevation), -0.36);
    if (t >= N) {
      const applause = reducedMotion ? 0 : Math.sin(now * 0.012) * 0.04;
      freeTarget.set(name[0] === "A" ? 0.22 : 0.4, name[0] === "A" ? 1.2 : 0.45, name[0] === "A" ? -0.36 : applause);
      if (name[0] === "B") { p.arm.rotation.set(0,-0.8,-2); p.fore.rotation.z = 1.8 + applause; }
    }
    p.offHand.position.copy(solveLimb(p.off, freeShoulder, freeTarget, freePole));
    for (const leg of p.legs) {
      const foot = footAt(leg.side, mechanics);
      hipTarget.set(mechanics.hipX, 0.62 - mechanics.crouch, leg.side * 0.115);
      ankleTarget.set(foot.x, foot.y, foot.z);
      const ankle = solveLimb(leg, hipTarget, ankleTarget, kneePole);
      // Shoes stay level while the shins rotate around the ankle.
      leg.shoe.position.copy(ankle); leg.shoe.position.x += 0.045;
      leg.shoe.rotation.y = leg.side * -0.08;
    }
  }

  placeCamera(k, u, s, now);
  const lab = players.A1.root.userData.label, dist = camera.position.distanceTo(players.A1.root.position);
  lab.material.opacity = (swing("A1") || t >= N) ? 0 : clamp((dist - 9) / 4); lab.scale.set(1.2, 0.45, 1).multiplyScalar(clamp(dist / 16, 0.8, 1.6));

  const kc = Math.round(t);
  renderCard(kc);
  const co = t >= N && ceremonyAge < 2.8 ? 0 : reducedMotion ? 1 : clamp(1 - Math.abs(t - kc) / 0.14);
  card.inert = co === 0;
  card.setAttribute("aria-hidden", co === 0 ? "true" : "false");
  if (stackedCaption.matches) {
    // On phones the caption has its own row under the court, where a sideways wipe reads as something covering it.
    card.style.opacity = String(co);
    card.style.clipPath = "none";
  } else {
    card.style.opacity = co > 0 ? 1 : 0;
    card.style.clipPath = co >= 1 ? "none" : `inset(0 ${(1 - co) * 100}% 0 0)`; // wipes on and off like a TV caption
  }
  card.style.pointerEvents = co > 0.6 ? "auto" : "none";

  const score = scoreAt(beats, t);
  // At full time the bug shows points won, so it agrees with the result line on the closing card.
  $("ptsA").textContent = (t >= N || b.pt === 4) ? String(score.a) : (b.pt === 4 ? String(score.a) : SCORE[score.a] ?? String(score.a));
  $("ptsB").textContent = (t >= N || b.pt === 4) ? String(score.b) : (b.pt === 4 ? String(score.b) : SCORE[score.b] ?? String(score.b));
  $("chName").textContent = t >= N ? "Full time" : b.pt === 4 ? "Bonus tie-break" : `${b.pt + 1}/4 · ${CHAPTERS[b.pt]}`;
  if (b.win && t < N) {
    const signature = `${b.pt}:${b.winner ?? "A"}`;
    if (shownCall !== signature) {
      shownCall = signature;
      callout.innerHTML = `<div><span>Point ${b.winner === "B" ? "Opponents" : "Ferreira"}</span><b>${(b.pt === 4 ? String(score.a) : SCORE[score.a] ?? String(score.a))}–${(b.pt === 4 ? String(score.b) : SCORE[score.b] ?? String(score.b))}</b></div>`;
    }
    // Update the numbers at the point-ending bounce, not at the take-back.
    callout.querySelector("b").textContent = `${(b.pt === 4 ? String(score.a) : SCORE[score.a] ?? String(score.a))}–${(b.pt === 4 ? String(score.b) : SCORE[score.b] ?? String(score.b))}`;
    const c2 = clamp(1 - Math.abs(u - 0.82) / 0.13);
    callout.style.opacity = u < FLY ? 0 : clamp(c2 * 3);
    callout.style.clipPath = `inset(0 ${(1 - clamp(c2 * 2)) * 50}% 0 ${(1 - clamp(c2 * 2)) * 50}%)`;
  } else callout.style.opacity = 0;
  syncDecisionUI(score);

  for (let p = 0; p < bars.length; p++) {
    const ks = beats.map((x, i) => (x.pt === p ? i : -1)).filter((i) => i >= 0);
    bars[p].parentElement.hidden = ks.length === 0;
    bars[p].style.width = ks.length ? clamp((t - ks[0]) / ks.length) * 100 + "%" : "0%";
  }
  backBtn.disabled = t <= 0.001;
  const at = Math.round(goal);
  nextBtn.disabled = false;
  const waitingForChoice = choicePending(at) && Math.abs(t - at) < 0.0015;
  nextBtn.textContent = waitingForChoice ? "Choose your shot" : at >= N ? "Play again" : firstOfPoint(at) ? "Serve" : beats[at].win ? "Finish the point" : "Next shot";

  if (renderer) renderer.render(scene, camera);
}

function resize() {
  if (!renderer) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (reducedMotion) renderer.render(scene, camera);
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(canvas);
resize();

const selections = new Map();
// Decisions in the active timeline; the bonus point adds its own once unlocked.
const decisionIndexes = () => beats.flatMap((beat, index) => shotDecisions[beat.contentKey] ? [index] : []);
const mainDecisions = decisionIndexes();
const baseBeat = (index) => index < choreography.length ? choreography[index] : tieBreak[index - choreography.length];
let shownDecision = null, shownFeedback = null;
const choicePending = (index) => Boolean(beats[index] && shotDecisions[beats[index].contentKey] && !selections.has(index));
function limitGoal(requested) {
  const destination = clamp(requested, 0, N);
  return decisionIndexes().find((index) => index < destination && !selections.has(index)) ?? destination;
}
function restoreChoices(from) {
  if (from < choreography.length) {
    beats.splice(choreography.length); N = beats.length;
    root.dataset.tieBreak = "false";
  }
  ceremonyStart = null;
  for (const index of decisionIndexes()) {
    if (index < from) continue;
    selections.delete(index);
    const base = structuredClone(baseBeat(index)), copy = index < choreography.length ? content[base.contentKey] : content.bonus;
    beats[index] = prepareBeat({ ...base, ...copy, html: linkMarkup(copy.links ?? []) }, index);
  }
  shownCard = shownCall = -1;
  shownDecision = shownFeedback = null;
  delete root.dataset.selectedShot;
}
function chooseShot(id) {
  const index = Math.round(t), beat = beats[index];
  if (!beat || Math.abs(t - index) > 0.0015 || Math.abs(goal - t) > 0.0015) return;
  const option = shotDecisions[beat.contentKey]?.options.find((option) => option.id === id);
  if (!option) return;
  restoreChoices(index);
  selections.set(index, option);
  Object.assign(beats[index], structuredClone(option.patch), { winner: option.winner });
  // prepareBeat consumes raw milliseconds, so restore them before rebuilding.
  beats[index].ms = option.patch.ms ?? baseBeat(index).ms ?? SHOT[beats[index].type].ms;
  prepareBeat(beats[index], index);
  if (index < choreography.length && mainDecisions.every((i) => selections.get(i)?.winner === "A")) {
    beats.push(...tieBreak.map((beat) => ({...structuredClone(beat), ...content.bonus, html: ""})));
    N = beats.length;
    for (let i = choreography.length; i < N; i++) prepareBeat(beats[i], i);
    root.dataset.tieBreak = "true";
  }
  root.dataset.selectedShot = option.id;
  trailPts = [];
  goal = limitGoal(index + 1);
  autoStart = 0;
  $("choice").close();
  $("choice").hidden = true;
  // Keep keyboard users on a stable control when the option buttons disappear.
  root.focus({ preventScroll: true });
  render(performance.now());
}
function syncDecisionUI(score) {
  const index = Math.round(t);
  const decision = beats[index] && shotDecisions[beats[index].contentKey];
  const visible = decision && Math.abs(t - index) < 0.0015 && Math.abs(goal - t) < 0.0015;
  const panel = $("choice");
  if (!visible && panel.open) panel.close();
  panel.hidden = !visible;
  if (!visible) shownDecision = null;
  root.dataset.pendingChoice = visible && choicePending(index) ? beats[index].contentKey : "";
  if (visible) {
    const signature = `${index}:${selections.get(index)?.id ?? "pending"}`;
    if (signature !== shownDecision) {
      shownDecision = signature;
      $("choice-title").textContent = decision.title;
      $("choice-situation").textContent = decision.situation;
      $("choice-options").innerHTML = decision.options.map((option) => `<button type="button" data-shot="${option.id}" aria-pressed="${selections.get(index)?.id === option.id}"><strong>${escapeText(option.label)}</strong><span>${escapeText(option.hint)}</span></button>`).join("");
      panel.showModal();
    }
  }
  const feedback = $("choice-feedback");
  const option = selections.get(score.last);
  const signature = option ? `${score.last}:${option.id}` : "";
  feedback.hidden = !option || Boolean(visible);
  if (signature !== shownFeedback) {
    shownFeedback = signature;
    const resultDetails = feedback.closest("details");
    resultDetails.open = false;
    $("result-summary").textContent = option ? `${option.winner === "A" ? "Point Ferreira" : "Point opponents"} · Why?` : "Last point · Why?";
    feedback.textContent = option ? `${beats[score.last].shot}. ${option.winner === "A" ? "Point Ferreira." : "Point opponents."} ${option.explanation}` : "";
  }
}
function next() {
  if (goal >= N) {
    restoreChoices(0); t = goal = 0; trailPts = []; autoStart = 0;
    render(performance.now()); return;
  }
  if (choicePending(Math.round(t)) && Math.abs(t - Math.round(t)) < 0.0015) {
    $("choice").showModal();
    $("choice-options").querySelector("button")?.focus(); return;
  }
  goal = limitGoal(Math.floor(goal + 1e-6) + 1);
  autoStart = 0;
}
function back() { goal = Math.max(0, Math.ceil(goal - 1e-6) - 1); autoStart = 0; }
listen($("choice-close"), "click", () => {
  $("choice").close();
  nextBtn.focus({ preventScroll: true });
});
listen($("choice"), "cancel", () => { nextBtn.focus({ preventScroll: true }); });
listen($("choice-options"), "click", (event) => {
  const button = event.target.closest("[data-shot]");
  if (button) chooseShot(button.dataset.shot);
});

let prev = performance.now();
function frame(now) {
  if (disposed) return;
  if (document.hidden) { prev = now; frameId = requestAnimationFrame(frame); return; }
  const dt = Math.min(64, now - prev); prev = now;
  const before = t;
  if (reducedMotion) {
    t = goal;
  } else if (now < fx.freeze) {
    // hit-stop: the world holds for a few frames at contact
  } else if (t !== goal) {
    const fwd = goal > t;
    const seg = fwd ? Math.min(Math.floor(t + 1e-6), N - 1) : Math.max(Math.ceil(t - 1e-6) - 1, 0);
    const step = dt / (fwd ? beats[seg].ms * (beats[seg].win ? 1.5 : 1.2) : 420);
    t = fwd ? Math.min(goal, t + step) : Math.max(goal, t - step);
  } else if (mode === "auto" && t < N && !choicePending(Math.round(t))) {
    if (!autoStart) {
      autoStart = now;
      autoMs = 1600 + 42 * (beats[t].title.length + beats[t].body.length) + (beats[t].html ? 2500 : 0);
    }
    const p = (now - autoStart) / autoMs;
    const bar = $("timer");
    if (bar) bar.style.width = clamp(p) * 100 + "%";
    if (p >= 1) next();
  }
  if (!reducedMotion && t > before && t - before < 0.5) events(before, t, now, true);
  if (!reducedMotion || t !== before || shownCard !== Math.round(t)) render(now);
  frameId = requestAnimationFrame(frame);
}

listen(nextBtn, "click", next);
listen(backBtn, "click", back);
listen(root, "keydown", (e) => {
  if (e.target.closest("a, input, textarea, select")) return;
  if (e.key === "ArrowRight" || (e.key === " " && !e.target.closest("button"))) { e.preventDefault(); next(); }
  if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
});

const HINTS = {
  click: "Next, Space or → plays the next shot.",
  auto: "The match waits for you to choose each point-ending shot. Choose Click to pause autoplay.",
};
root.querySelectorAll(".modes button").forEach((btn) => listen(btn, "click", () => {
  mode = btn.dataset.mode;
  root.dataset.mode = mode;
  root.querySelectorAll(".modes button").forEach((x) => x.setAttribute("aria-pressed", x === btn));
  hint.textContent = HINTS[mode];
  goal = limitGoal(Math.round(goal)); autoStart = 0;
  const bar = $("timer"); if (bar) bar.style.width = 0;
}));

// Context loss keeps the readable story and navigation available.
listen(canvas, "webglcontextlost", (event) => {
  event.preventDefault();
  dispose();
  onError();
});
function syncMotionControls() {
  root.dataset.motion = reducedMotion ? "reduced" : "full";
  const motionButton = $("motion");
  $("motion-summary").textContent = reducedMotion ? "Animation off" : "Animation on";
  motionButton.textContent = reducedMotion ? "Enable match animation" : "Disable match animation";
  motionButton.setAttribute("aria-pressed", String(!reducedMotion));
  $("motion-note").textContent = reducedMotion
    ? "Animation is off. You can enable it just for this portfolio."
    : "Match animation is on. You can turn it off at any time.";
  root.querySelectorAll('[data-mode="auto"]').forEach((button) => {
    button.disabled = reducedMotion;
    button.title = reducedMotion ? "Enable match animation to use this mode." : "";
  });
  root.querySelectorAll(".modes button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
  root.dataset.mode = mode;
  hint.textContent = reducedMotion ? "Reduced motion: Next and Back move directly between captions." : HINTS[mode];
}
function setMotion(reduce) {
  reducedMotion = reduce;
  if (reduce) {
    // Stop autoplay and settle on a caption when opting out mid-rally.
    mode = "click";
    t = goal = Math.round(t);
    trailPts = [];
    fx.shake = fx.kick = fx.freeze = 0;
    root.querySelectorAll("*").forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
  }
  autoStart = 0;
  syncMotionControls();
  render(performance.now());
}
listen($("motion"), "click", () => {
  motionOverride = reducedMotion ? "full" : "reduced";
  try { localStorage.setItem("padel:motion", motionOverride); } catch { /* Keep the choice for this visit. */ }
  setMotion(motionOverride === "reduced");
  const settings = $("motion").closest("details");
  settings.open = false;
  settings.querySelector("summary").focus({ preventScroll: true });
});
listen(motionPreference, "change", (event) => {
  if (motionOverride === null) setMotion(event.matches);
});
syncMotionControls();
listen(document, "visibilitychange", () => {
  autoStart = 0;
  if (document.hidden) ac?.suspend().catch(() => {});
  else if (!muted) ac?.resume().catch(() => {});
});
root.dataset.mode = "click";
root.dataset.ready = "true";
syncTheme();
render(performance.now());
frameId = requestAnimationFrame(frame);
// A visitor who pressed Serve on the home page gets the serve, after a moment to take in the court.
const serveTimer = autoServe && !reducedMotion ? setTimeout(() => { if (!disposed && t === 0 && goal === 0) next(); }, 900) : 0;
return dispose;

function dispose() {
  if (disposed) return;
  disposed = true;
  clearTimeout(serveTimer);
  cancelAnimationFrame(frameId);
  if ($("choice").open) $("choice").close();
  eventsController.abort();
  resizeObserver.disconnect();
  themeObserver.disconnect();
  root.querySelectorAll("*").forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
  if (ac) { ac.close().catch(() => {}); ac = null; }
  const geometries = new Set(), materials = new Set(), textures = new Set();
  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) for (const material of [object.material].flat()) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
  renderer.dispose();
  delete root.dataset.ready;
}

}
