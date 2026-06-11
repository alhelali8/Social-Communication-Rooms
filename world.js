/* =====================================================================
   Paper Tole Institute — Virtual Campus · LIVE 3D
   A real-time, walkable 3D campus built with Three.js. Walk with WASD,
   turn the camera with Q/E, press F at glowing kiosks for links/forms.
   ===================================================================== */
import * as THREE from "three";
import { GLTFLoader } from "./vendor/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "./vendor/jsm/environments/RoomEnvironment.js";

/* ----------------------------- config -------------------------------- */
const LINKS = {
  website: "https://example.org",
  discord: "https://discord.gg/your-invite",
  classroom: "https://meet.google.com/your-room",
  handbook: "https://example.org/handbook",
  eventForm: "https://docs.google.com/forms/d/e/your-form/viewform?embedded=true",
};

/* ----------------------------- renderer ------------------------------ */
const app = document.getElementById("app");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x121d33, 95, 250);

/* sky gradient background */
(() => {
  const c = document.createElement("canvas"); c.width = 16; c.height = 256;
  const g = c.getContext("2d").createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#5b7fb0"); g.addColorStop(0.5, "#9fb6cf"); g.addColorStop(1, "#dfe6ec");
  const ctx = c.getContext("2d"); ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  scene.background = tex;
})();

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 400);

/* ----------------------------- lighting ------------------------------ */
scene.add(new THREE.HemisphereLight(0xdfeaf5, 0x4a4636, 0.85));
scene.add(new THREE.AmbientLight(0xffffff, 0.18));
const sun = new THREE.DirectionalLight(0xfff1d8, 1.15);
sun.position.set(40, 70, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10; sun.shadow.camera.far = 360;
sun.shadow.camera.left = -120; sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120; sun.shadow.camera.bottom = -120;
sun.shadow.bias = -0.0004;
scene.add(sun);
scene.add(sun.target);

/* PBR environment lighting — soft realistic ambient + reflections on every material */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.06).texture;

/* --------------------------- material cache -------------------------- */
const matCache = {};
function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!matCache[key]) matCache[key] = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.85, metalness: o.m ?? 0.0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: o.t ?? false, opacity: o.o ?? 1 });
  return matCache[key];
}
const COL = {
  wood: 0xc08a4e, woodDark: 0x8a5f30, tile: 0xe4e7ec, grass: 0x6fa64e, sand: 0xe6d291,
  carpet: 0x4f628f, rug: 0xb05a44, wall: 0xe6dcc8, wallTrim: 0xcdbe9f, stone: 0xcdbfa3,
  water: 0x3f93c4, metal: 0x9aa3ad, dark: 0x2a2e38, screen: 0x2b6cb0, leaf: 0x3f8f4f,
  trunk: 0x7a5532, white: 0xf4f1ea, gold: 0xc69749, glass: 0xbfe0ef,
};

/* --------------------------- procedural textures --------------------- */
function makeTex(rep, draw) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  draw(c.getContext("2d"), 128);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.repeat.set(rep, rep); return t;
}
function speckle(x, s, base, n, pick) { x.fillStyle = base; x.fillRect(0, 0, s, s); for (let i = 0; i < n; i++) { x.fillStyle = pick(); x.fillRect(Math.random() * s | 0, Math.random() * s | 0, 2, 2); } }
const TEX = {
  wood: makeTex(1, (x, s) => { x.fillStyle = "#c08a4e"; x.fillRect(0, 0, s, s); for (let i = 0; i < s; i += 16) { x.fillStyle = "rgba(70,45,20,0.35)"; x.fillRect(0, i, s, 1.5); x.fillStyle = "rgba(255,240,210,0.08)"; x.fillRect(0, i + 2, s, 2); } x.strokeStyle = "rgba(120,80,40,0.18)"; for (let i = 0; i < 22; i++) { x.beginPath(); x.moveTo(Math.random() * s, 0); x.bezierCurveTo(Math.random() * s, s / 3, Math.random() * s, 2 * s / 3, Math.random() * s, s); x.stroke(); } }),
  tile: makeTex(1, (x, s) => { x.fillStyle = "#e7eaef"; x.fillRect(0, 0, s, s); x.strokeStyle = "rgba(150,160,175,0.55)"; x.lineWidth = 2; x.strokeRect(1, 1, s - 2, s - 2); x.beginPath(); x.moveTo(s / 2, 0); x.lineTo(s / 2, s); x.moveTo(0, s / 2); x.lineTo(s, s / 2); x.stroke(); x.fillStyle = "rgba(255,255,255,0.22)"; x.fillRect(3, 3, s - 6, 3); }),
  carpet: makeTex(1, (x, s) => speckle(x, s, "#54669a", 1100, () => Math.random() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)")),
  grass: makeTex(1, (x, s) => { speckle(x, s, "#6fa64e", 600, () => ["#67a046", "#79ad57", "#5f9640"][Math.random() * 3 | 0]); x.strokeStyle = "rgba(40,80,30,0.22)"; for (let i = 0; i < 55; i++) { const px = Math.random() * s, py = Math.random() * s; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() * 4 - 2), py - 4); x.stroke(); } }),
  sand: makeTex(1, (x, s) => speckle(x, s, "#e6d291", 700, () => ["#ddc77f", "#ecda9d", "#d8bf76"][Math.random() * 3 | 0])),
  stone: makeTex(1, (x, s) => { x.fillStyle = "#cdbfa3"; x.fillRect(0, 0, s, s); x.strokeStyle = "rgba(0,0,0,0.10)"; x.lineWidth = 2; for (let gx = 0; gx <= s; gx += 32) for (let gy = 0; gy <= s; gy += 32) x.strokeRect(gx, gy, 32, 32); x.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 200; i++) x.fillRect(Math.random() * s | 0, Math.random() * s | 0, 1, 1); }),
  wall: makeTex(1, (x, s) => { x.fillStyle = "#e6dcc8"; x.fillRect(0, 0, s, s); for (let i = 0; i < 700; i++) { x.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)"; x.fillRect(Math.random() * s | 0, Math.random() * s | 0, 2, 2); } }),
};
function texFloorMat(baseTex, w, d) { const t = baseTex.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(d / 3))); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.92 }); }
function texForColor(color) { return ({ [COL.wood]: TEX.wood, [COL.tile]: TEX.tile, [COL.carpet]: TEX.carpet, [COL.stone]: TEX.stone, [COL.grass]: TEX.grass, [COL.sand]: TEX.sand })[color] || TEX.tile; }

/* ------------------------------ helpers ------------------------------ */
const colliders = [];   // {minX,maxX,minZ,maxZ}
function addCollider(cx, cz, w, d) { colliders.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 }); }

function box(w, h, d, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), color instanceof THREE.Material ? color : mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false;
  scene.add(m);
  if (o.collide) addCollider(x, z, w, d);
  return m;
}
function cyl(rt, rb, h, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 16), mat(color, o));
  m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true; scene.add(m);
  return m;
}
function sphere(r, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg || 14, o.seg || 12), mat(color, o));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  return m;
}

/* ----------------------------- ground -------------------------------- */
const groundTex = TEX.grass.clone(); groundTex.repeat.set(72, 64); groundTex.needsUpdate = true;
const ground = new THREE.Mesh(new THREE.PlaneGeometry(360, 320), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

/* floor patch for a room (textured) */
function floorPatch(cx, cz, w, d, color) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), texFloorMat(texForColor(color), w, d));
  m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.02, cz); m.receiveShadow = true; scene.add(m);
}
/* one building wall segment: plaster wall + baseboard + cornice + windows */
function wallSeg(cx, cz, w, d, h) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: TEX.wall, roughness: 0.95 }));
  wall.position.set(cx, h / 2, cz); wall.castShadow = wall.receiveShadow = true; scene.add(wall);
  addCollider(cx, cz, w, d);
  box(w + 0.06, 0.28, d + 0.06, COL.woodDark, cx, 0.14, cz, { cast: false });          // baseboard
  box(w + 0.25, 0.32, d + 0.25, COL.wallTrim, cx, h + 0.05, cz, {});                    // cornice
  const horiz = w > d, len = horiz ? w : d, n = Math.max(1, Math.floor(len / 3.2));
  const winMat = new THREE.MeshStandardMaterial({ color: 0x9fc7e0, emissive: 0x5b86b0, emissiveIntensity: 0.25, roughness: 0.1, metalness: 0.25 });
  const frMat = mat(0x8c8175);
  for (let i = 0; i < n; i++) {
    const tpos = (i + 0.5) / n - 0.5;
    const wx = cx + (horiz ? tpos * (len - 1.4) : 0), wz = cz + (horiz ? 0 : tpos * (len - 1.4));
    // dark frame border (slightly recessed), glass pane protruding through it
    const fr = new THREE.Mesh(new THREE.BoxGeometry(horiz ? 1.5 : 0.36, 1.42, horiz ? 0.36 : 1.5), frMat);
    fr.position.set(wx, h * 0.56, wz); scene.add(fr);
    const win = new THREE.Mesh(new THREE.BoxGeometry(horiz ? 1.28 : 0.6, 1.2, horiz ? 0.6 : 1.28), winMat);
    win.position.set(wx, h * 0.56, wz); scene.add(win);
  }
}
/* one side of a room, optionally with a centred doorway gap */
function buildSide(cx, cz, w, d, h, side, hasDoor) {
  const t = 0.4, door = 4.5;
  const horiz = side === "N" || side === "S";
  const len = horiz ? w : d;
  const px = side === "W" ? cx - w / 2 : side === "E" ? cx + w / 2 : cx;
  const pz = side === "N" ? cz - d / 2 : side === "S" ? cz + d / 2 : cz;
  if (!hasDoor || len - door < 0.9) { if (horiz) wallSeg(px, pz, len, t, h); else wallSeg(px, pz, t, len, h); return; }
  const stub = (len - door) / 2, off = (len + door) / 4;
  if (horiz) { wallSeg(px - off, pz, stub, t, h); wallSeg(px + off, pz, stub, t, h); }
  else { wallSeg(px, pz - off, t, stub, h); wallSeg(px, pz + off, t, stub, h); }
}
/* full building shell. entrance = "N"|"S"|"E"|"W"|"NS"|"EW"|"auto" (doorway side[s]) */
function roomWalls(cx, cz, w, d, h = 3.4, entrance = "auto") {
  let ent = entrance;
  if (ent === "auto") ent = Math.abs(cx) < 3 ? "NS" : (cx < 0 ? "E" : "W");
  for (const s of ["N", "S", "E", "W"]) buildSide(cx, cz, w, d, h, s, ent.includes(s));
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    box(0.62, h + 0.4, 0.62, COL.wallTrim, cx + sx * w / 2, (h + 0.4) / 2, cz + sz * d / 2, {});
}

/* ----------------------- furniture builders -------------------------- */
function workstation(x, z, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const add = (mesh) => g.add(mesh);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.1), mat(COL.wood)); desk.position.set(0, 0.95, 0); desk.castShadow = desk.receiveShadow = true; add(desk);
  for (const sx of [-0.95, 0.95]) for (const sz of [-0.45, 0.45]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 0.1), mat(COL.woodDark)); l.position.set(sx, 0.47, sz); l.castShadow = true; add(l); }
  const mon = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.07), mat(COL.dark)); mon.position.set(0, 1.42, -0.3); mon.castShadow = true; add(mon);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshStandardMaterial({ color: COL.screen, emissive: COL.screen, emissiveIntensity: 0.6 })); scr.position.set(0, 1.42, -0.26); add(scr);
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.25), mat(0xd7dbe2)); kb.position.set(0, 1.03, 0.15); add(kb);
  const chair = chairMesh(); chair.position.set(0, 0, 0.7); add(chair);
  addCollider(x, z, 2.4, 1.6);
  return g;
}
function chairMesh(color = 0x2b2f37) {
  const c = new THREE.Group();
  const metal = mat(0x3a3d44, { m: 0.85, r: 0.35 });
  for (let i = 0; i < 5; i++) {           // 5-star caster base
    const a = i / 5 * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.11), metal); leg.position.set(Math.cos(a) * 0.21, 0.08, Math.sin(a) * 0.21); leg.rotation.y = -a; c.add(leg);
    const caster = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat(0x111418)); caster.position.set(Math.cos(a) * 0.4, 0.05, Math.sin(a) * 0.4); c.add(caster);
  }
  const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.4, 10), metal); gas.position.y = 0.3; c.add(gas);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.13, 0.54), mat(color, { r: 0.65 })); seat.position.y = 0.55; seat.castShadow = true; c.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.66, 0.1), mat(color, { r: 0.65 })); back.position.set(0, 0.92, -0.23); back.castShadow = true; c.add(back);
  for (const sx of [-0.32, 0.32]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.36), mat(0x16191f)); arm.position.set(sx, 0.66, 0.02); c.add(arm); const ap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), mat(0x16191f)); ap.position.set(sx, 0.58, 0.05); c.add(ap); }
  return c;
}
function tv(x, z, rot = 0, w = 2.4) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.4), mat(COL.woodDark)); stand.position.y = 0.05; stand.castShadow = true; g.add(stand);
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.1), mat(0x202227)); pole.position.y = 0.45; g.add(pole);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.56, 0.08), mat(0x14161b, { r: 0.35, m: 0.5 })); frame.position.y = 1.15; frame.castShadow = true; g.add(frame);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.16, w * 0.56 - 0.16), new THREE.MeshStandardMaterial({ color: 0x0e1626, emissive: 0x2f6cb0, emissiveIntensity: 0.55, roughness: 0.12, metalness: 0.4 })); screen.position.set(0, 1.15, 0.045); g.add(screen);
  addCollider(x, z, 1.1, 0.5);
  return g;
}
function chair(x, z, rot = 0) { const c = chairMesh(); c.position.set(x, 0, z); c.rotation.y = rot; scene.add(c); }
function tableRound(x, z, r = 1.1) {
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 20), mat(COL.wood)); top.position.set(x, 0.95, z); top.castShadow = top.receiveShadow = true; scene.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.95, 10), mat(COL.woodDark)); leg.position.set(x, 0.47, z); leg.castShadow = true; scene.add(leg);
  addCollider(x, z, r * 2, r * 2);
}
function meetingTable(x, z, w = 3.2, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 1.4), mat(COL.wood)); top.position.y = 0.95; top.castShadow = top.receiveShadow = true; g.add(top);
  for (const sx of [-w / 2 + 0.3, w / 2 - 0.3]) for (const sz of [-0.55, 0.55]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.12), mat(COL.woodDark)); l.position.set(sx, 0.47, sz); g.add(l); }
  const n = Math.max(2, Math.round(w / 1.2));
  for (let i = 0; i < n; i++) { const cx = -w / 2 + 0.6 + i * ((w - 1.2) / (n - 1)); const a = chairMesh(); a.position.set(cx, 0, 1.2); g.add(a); const b = chairMesh(); b.position.set(cx, 0, -1.2); b.rotation.y = Math.PI; g.add(b); }
  addCollider(x, z, w, 1.8);
}
function sofa(x, z, rot = 0, color = 0x7d8db8) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.95), mat(color)); base.position.y = 0.35; base.castShadow = base.receiveShadow = true; g.add(base);
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.25), mat(color)); back.position.set(0, 0.7, -0.35); back.castShadow = true; g.add(back);
  for (const sx of [-1.2, 1.2]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.95), mat(color)); arm.position.set(sx, 0.5, 0); arm.castShadow = true; g.add(arm); }
  addCollider(x, z, 2.6, 1.1);
}
function plant(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.5, 12), mat(0xb9703c)); pot.position.y = 0.25; pot.castShadow = true; g.add(pot);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const lf = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), mat(COL.leaf)); lf.position.set(Math.cos(a) * 0.18, 0.85 + Math.sin(i) * 0.1, Math.sin(a) * 0.18); lf.scale.set(0.7, 1.4, 0.7); lf.castShadow = true; g.add(lf); }
  sphere(0.36, COL.leaf, x, 1.05, z);
  addCollider(x, z, 0.7, 0.7);
}
function tree(x, z, s = 1) {
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.32 * s, 2.4 * s, 10), mat(COL.trunk)); tr.position.set(x, 1.2 * s, z); tr.castShadow = true; scene.add(tr);
  for (const [dx, dy, dz, r] of [[0, 2.8, 0, 1.4], [-0.7, 2.5, 0.2, 1.0], [0.7, 2.6, -0.2, 1.0], [0.1, 3.4, 0.1, 0.9]]) sphere(r * s, COL.leaf, x + dx * s, dy * s, z + dz * s);
  addCollider(x, z, 1.0, 1.0);
}
function bookshelf(x, z, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.5), mat(COL.woodDark)); frame.position.y = 1.2; frame.castShadow = frame.receiveShadow = true; g.add(frame);
  const cols = [0xd35f5f, 0x5f8fd3, 0x5fd38f, 0xd3b65f, 0xa05fd3];
  for (let r = 0; r < 3; r++) for (let b = 0; b < 6; b++) { const bk = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.36), mat(cols[(r + b) % 5])); bk.position.set(-0.7 + b * 0.28, 0.6 + r * 0.7, 0.08); g.add(bk); }
  addCollider(x, z, 1.8, 0.6);
}
function fountain(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.6, 24), mat(COL.stone)); basin.position.y = 0.3; basin.castShadow = basin.receiveShadow = true; g.add(basin);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.2, 24), new THREE.MeshStandardMaterial({ color: COL.water, roughness: 0.2, metalness: 0.1 })); water.position.y = 0.55; g.add(water);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.2, 12), mat(COL.stone)); pillar.position.y = 1.1; pillar.castShadow = true; g.add(pillar);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.18, 18), mat(COL.water, { r: 0.2 })); top.position.y = 1.7; g.add(top);
  addCollider(x, z, 4.2, 4.2);
}
function stage(x, z, w = 4, d = 2.4) {
  box(w, 0.5, d, COL.woodDark, x, 0.25, z, { collide: true, recv: true });
  box(w - 0.3, 0.1, d - 0.3, COL.wood, x, 0.52, z, {});
  // back screen
  box(w - 0.6, 1.8, 0.2, COL.dark, x, 1.65, z - d / 2 + 0.2, {});
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - 1, 1.5), new THREE.MeshStandardMaterial({ color: COL.screen, emissive: COL.screen, emissiveIntensity: 0.5 })); scr.position.set(x, 1.7, z - d / 2 + 0.31); scene.add(scr);
}
function podium(x, z) { box(0.7, 1.1, 0.6, COL.wood, x, 0.55, z, { collide: true }); box(0.85, 0.1, 0.7, COL.woodDark, x, 1.12, z, {}); }
function bench(x, z, rot = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g); box(1.6, 0.12, 0.5, COL.woodDark, 0, 0.45, 0, {}); box(1.6, 0.4, 0.12, COL.woodDark, 0, 0.65, -0.2, {}); g.children.forEach(c => g.add(c)); addCollider(x, z, 1.6, 0.6); }
function lamp(x, z) { cyl(0.08, 0.1, 3, 0x3a3a3a, x, 1.5, z); sphere(0.3, 0xffe7a8, x, 3.1, z, { e: 0xffe7a8, ei: 0.9 }); }
function rugRound(x, z, r, color) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 28), mat(color, { r: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); m.receiveShadow = true; scene.add(m); }
function statue(x, z) {
  box(1, 1, 1, COL.wallTrim, x, 0.5, z, { collide: true });
  cyl(0.4, 0.5, 1.4, 0xb9c0c9, x, 1.7, z); sphere(0.42, 0xc6ccd4, x, 2.6, z);
}
function displayCase(x, z, color = 0xc69749) {
  box(1.4, 0.8, 1.0, COL.woodDark, x, 0.4, z, { collide: true });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 0.9), new THREE.MeshStandardMaterial({ color: COL.glass, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.1 })); glass.position.set(x, 1.35, z); scene.add(glass);
  sphere(0.3, color, x, 1.3, z, { e: color, ei: 0.25 });
}
function pillar(x, z) { box(0.7, 4, 0.7, COL.wallTrim, x, 2, z, { collide: true }); }

/* glowing interaction kiosk (one per space) */
const interactables = [];
function kiosk(x, z, data) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.3, 16), mat(COL.dark)); base.position.y = 0.15; base.castShadow = true; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.3, 12), mat(COL.metal)); post.position.y = 0.95; g.add(post);
  const panelMat = new THREE.MeshStandardMaterial({ color: data.color || COL.gold, emissive: data.color || COL.gold, emissiveIntensity: 0.55 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.12), panelMat); panel.position.set(0, 1.9, 0); panel.castShadow = true; g.add(panel);
  g.userData.glow = panelMat;
  addCollider(x, z, 1.0, 1.0);
  interactables.push({ x, z, r: 2.6, data, group: g });
  // floating label
  g.add(makeLabel(data.title, 0, 2.95, 0, 0.62));
}

/* canvas-texture text label (billboarded) */
function makeLabel(text, x, y, z, scale = 1) {
  const m = text.match(/^(\S+)\s\s(.*)$/);          // "1  Main Spawn" → num + label
  const num = m ? m[1] : null, label = m ? m[2] : text;
  const fs = 42, padX = 26, padY = 16, gap = 14;
  let c = document.createElement("canvas"); let ctx = c.getContext("2d");
  ctx.font = `700 ${fs}px Poppins, sans-serif`;
  const tw = ctx.measureText(label).width;
  const h = fs + padY * 2, numD = h - 16, numW = num ? numD + gap : 0;
  c.width = Math.ceil(padX * 2 + numW + tw); c.height = h;
  ctx = c.getContext("2d"); ctx.textBaseline = "middle";
  ctx.fillStyle = "#14233f"; roundRect(ctx, 0, 0, c.width, c.height, h / 2); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = "rgba(198,151,73,0.9)"; roundRect(ctx, 1.5, 1.5, c.width - 3, c.height - 3, (c.height - 3) / 2); ctx.stroke();
  let tx = padX;
  if (num) {
    const cyc = c.height / 2;
    ctx.fillStyle = "#c69749"; ctx.beginPath(); ctx.arc(padX + numD / 2, cyc, numD / 2, 0, 7); ctx.fill();
    ctx.fillStyle = "#14233f"; ctx.textAlign = "center"; ctx.font = `800 ${Math.round(fs * 0.8)}px Poppins, sans-serif`;
    ctx.fillText(num, padX + numD / 2, cyc + 1); ctx.textAlign = "left"; tx = padX + numW;
  }
  ctx.fillStyle = "#fff"; ctx.font = `700 ${fs}px Poppins, sans-serif`; ctx.fillText(label, tx, c.height / 2 + 1);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true }));
  sp.position.set(x, y, z); sp.scale.set((c.width / c.height) * scale * 1.5, scale * 1.5, 1);
  return sp;
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

const roomLabels = [];
function roomLabel(text, cx, cz) { const sp = makeLabel(text, cx, 4.9, cz, 1.0); sp.material.depthTest = false; scene.add(sp); roomLabels.push(sp); }

/* --------------------------- beach builders -------------------------- */
function palm(x, z) {
  const lean = 0.22;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 3.2, 8), mat(0xa9763f, { r: 0.9 }));
  trunk.position.set(x, 1.6, z); trunk.rotation.z = lean; trunk.castShadow = true; scene.add(trunk);
  const tx = x + Math.sin(lean) * 1.6, ty = 3.0;
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const fr = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 6), mat(0x3f9a54)); fr.scale.set(1, 0.16, 0.5); fr.position.set(tx + Math.cos(a) * 0.7, ty - 0.1, z + Math.sin(a) * 0.7); fr.rotation.y = a; fr.rotation.z = -0.35; fr.castShadow = true; scene.add(fr); }
  sphere(0.18, 0x8a6b2f, tx, ty, z);
  addCollider(x, z, 0.8, 0.8);
}
function umbrella(x, z, color = 0xd9534f) {
  cyl(0.05, 0.05, 2, 0x9a9a9a, x, 1, z);
  const top = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.75, 14), mat(color, { r: 0.7 })); top.position.set(x, 2.1, z); top.castShadow = true; scene.add(top);
  const trim = new THREE.Mesh(new THREE.ConeGeometry(1.42, 0.18, 14, 1, true), mat(0xf4f1ea, { r: 0.7 })); trim.position.set(x, 1.78, z); scene.add(trim);
}
function sea(cx, cz, w, d) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: COL.water, roughness: 0.12, metalness: 0.25, transparent: true, opacity: 0.92 }));
  m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.05, cz); m.receiveShadow = true; scene.add(m);
}

/* ------------------------------ fence -------------------------------- */
const POST = mat(0xb0814a, { r: 0.8 }), RAIL = mat(0xc79a5f, { r: 0.8 });
function fenceRun(x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz), ang = Math.atan2(dz, dx);
  const n = Math.max(2, Math.round(len / 2.2));
  for (let i = 0; i <= n; i++) {
    const tpos = i / n, px = x1 + dx * tpos, pz = z1 + dz * tpos;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.25, 0.16), POST);
    post.position.set(px, 0.62, pz); post.castShadow = true; post.receiveShadow = true; scene.add(post);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.22), RAIL); cap.position.set(px, 1.28, pz); scene.add(cap);
  }
  for (const ry of [0.45, 0.92]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.09, 0.07), RAIL);
    rail.position.set((x1 + x2) / 2, ry, (z1 + z2) / 2); rail.rotation.y = -ang; rail.castShadow = true; scene.add(rail);
  }
  addCollider((x1 + x2) / 2, (z1 + z2) / 2, Math.max(0.3, Math.abs(dx)), Math.max(0.3, Math.abs(dz)));
}
/* low fence on the outer sides of an outdoor space (open toward the centre) */
function roomFence(cx, cz, w, d) {
  const west = cx < -2, east = cx > 2, north = cz < -2, south = cz > 6;
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
  if (west) fenceRun(x0, z0, x0, z1);
  if (east) fenceRun(x1, z0, x1, z1);
  if (north) fenceRun(x0, z0, x1, z0);
  if (south) fenceRun(x0, z1, x1, z1);
}

/* --------------------------- phase 3 builders ------------------------ */
let seasonState = { fall: [], winter: [] };
function pumpkin(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.45 * s, 12, 10), mat(0xd9742a, { r: 0.7 })); b.scale.y = 0.82; b.position.y = 0.37 * s; b.castShadow = true; g.add(b);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.22, 6), mat(0x4f7d3a)); st.position.y = 0.66 * s; g.add(st);
  addCollider(x, z, 0.9 * s, 0.9 * s); return g;
}
function snowman(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const w = mat(0xf4f7fb, { r: 0.9 });
  for (const [r, y] of [[0.5, 0.5], [0.36, 1.15], [0.26, 1.62]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), w); m.position.y = y; m.castShadow = true; g.add(m); }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), mat(0xe0822a)); nose.position.set(0, 1.62, 0.26); nose.rotation.x = Math.PI / 2; g.add(nose);
  addCollider(x, z, 1.0, 1.0); return g;
}
function xmasTree(x, z, s = 1.6) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * s, 0.42 * s, 1 * s, 8), mat(COL.trunk)); trunk.position.y = 0.5 * s; trunk.castShadow = true; g.add(trunk);
  for (let i = 0; i < 4; i++) { const r = (1.8 - i * 0.38) * s, y = (1 + i * 1.05) * s; const cone = new THREE.Mesh(new THREE.ConeGeometry(r, 1.4 * s, 12), mat(0x2f6b3f, { r: 0.85 })); cone.position.y = y; cone.castShadow = true; g.add(cone); }
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.34 * s), mat(0xf2cf4a, { e: 0xf2cf4a, ei: 0.6 })); star.position.y = (1 + 4 * 1.05) * s; g.add(star);
  const cols = [0xff5b5b, 0xffd45b, 0x5bff9a, 0x5bd0ff];
  for (let i = 0; i < 22; i++) { const a = i * 0.95, yy = (1.2 + (i / 22) * 3.8) * s, rr = (1.6 - (i / 22) * 1.4) * s; const b = new THREE.Mesh(new THREE.SphereGeometry(0.1 * s, 6, 6), mat(cols[i % 4], { e: cols[i % 4], ei: 0.8 })); b.position.set(Math.cos(a) * rr, yy, Math.sin(a) * rr); g.add(b); }
  addCollider(x, z, 2.2 * s, 2.2 * s); return g;
}
function football(x, z) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), mat(0x7a4a28)); b.scale.z = 1.5; b.position.set(x, 0.34, z); b.castShadow = true; scene.add(b); }
function footballField(cx, cz, w, d) {
  const field = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(0x4f9a44, { r: 1 })); field.rotation.x = -Math.PI / 2; field.position.set(cx, 0.05, cz); field.receiveShadow = true; scene.add(field);
  const line = mat(0xf4f7fb, { r: 0.9 });
  for (let i = 0; i <= 10; i++) { const lz = cz - d / 2 + (i / 10) * d; const l = new THREE.Mesh(new THREE.PlaneGeometry(w - 2, 0.2), line); l.rotation.x = -Math.PI / 2; l.position.set(cx, 0.07, lz); scene.add(l); }
  for (const gz of [cz - d / 2 + 0.8, cz + d / 2 - 0.8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), mat(0xf0d24a)); p.position.set(cx, 1.5, gz); p.castShadow = true; scene.add(p); const bar = new THREE.Mesh(new THREE.BoxGeometry(3, 0.13, 0.13), mat(0xf0d24a)); bar.position.set(cx, 2.4, gz); scene.add(bar); }
}
function marker(x, z, color) { cyl(0.13, 0.13, 2.5, 0x8a8f98, x, 1.25, z); const s = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 0.14), mat(color || 0x14233f)); s.position.set(x, 2.5, z); s.castShadow = true; scene.add(s); addCollider(x, z, 0.6, 0.6); }
function cone(x, z, color = 0xe0822a) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 10), mat(color)); c.position.set(x, 0.5, z); c.castShadow = true; scene.add(c); }

/* ----------------------------- campus -------------------------------- */
/* def: name,n,x,z,w,d,floor, furnish(cx,cz), kioskColor */
const SP = {
  main: { sub: "Primary Arrival · Orientation", blurb: "Welcome — take your time. This is where you arrive: a calm, low-pressure place to get your bearings before heading through to the Connection Hub. No rush.", links: [{ label: "Getting started", url: LINKS.website }] },
  hub: { sub: "Transport · Navigation · Expansion Gateway", blurb: "The transport and navigation center. Every space connects here, with a universe directory for wayfinding and gateways reserved for future universe expansions.", links: [{ label: "Universe directory", url: LINKS.website }] },
  commons: { sub: "Common Ground · Heart of the Universe", blurb: "Gather, connect, and belong. A relaxed, central-park-style space for informal networking and conversation — the welcoming heart of the universe.", links: [{ label: "Join the community", url: LINKS.discord }], form: true },
  hq: { sub: "Administration · Leadership · Operations", blurb: "The organizational home base — administrative space, a leadership boardroom and day-to-day operations.", links: [{ label: "Request a meeting", url: LINKS.discord }] },
  hasu: { sub: "Founder Recognition · Mission & Legacy", blurb: "Honoring the founders, mission and legacy of the Have a Seat Universe. We preserve the past, enrich the present, and inspire the future — together.", links: [{ label: "Our mission & story", url: LINKS.website }] },
  pti: { sub: "Paper Tole Institute · Legacy", blurb: "A distinct legacy and recognition space for the Paper Tole Institute (PTI) — its mission, craft and history.", links: [{ label: "PTI's story", url: LINKS.website }] },
  outdoor: { sub: "Walking Paths · Landscaping · Gathering", blurb: "Open community grounds — winding walking paths, landscaping and gathering spaces to roam, relax and connect.", links: [{ label: "Events & gatherings", url: LINKS.website }] },
  beach: { sub: "Beach · Park · Community Zones", blurb: "A relaxed, central-park-style shoreline and park — pull up a seat, take in the view, and enjoy the calm.", links: [{ label: "Plan a visit", url: LINKS.website }] },
};

function defineCampus() {
  const R = (name, n, x, z, w, d, floor, furnish, color, entrance = "auto", info = null, group = "Phase 1 · Core") => {
    floorPatch(x, z, w, d, floor);
    if (floor !== COL.grass && floor !== COL.sand && floor !== COL.stone) roomWalls(x, z, w, d, 3.4, entrance);
    else roomFence(x, z, w, d);
    roomLabel(`${n ? n + "  " : ""}${name}`, x, z - 0.5);
    if (furnish) furnish(x, z);
    const data = info || SP[labelKey(name)];
    if (data) kiosk(x, z + d / 2 - 2.6, Object.assign({ id: labelKey(name) || name, n, title: name, color, group }, data));
  };
  defineCampus.R = R;

  /* — central-park heart: Main Spawn → Connection Hub → Common Ground (south→north) — */
  R("Main Spawn", "1", 0, 24, 16, 12, COL.stone, (x, z) => {
    rugRound(x, z, 3, COL.gold);
    tree(x - 6, z - 3); tree(x + 6, z - 3); tree(x - 6, z + 3); tree(x + 6, z + 3);
    bench(x - 4, z + 1, Math.PI / 2); bench(x + 4, z + 1, -Math.PI / 2);
    plant(x - 2, z - 4); plant(x + 2, z - 4); lamp(x - 5, z); lamp(x + 5, z);
  }, 0xc69749);

  R("Connection Hub", "2", 0, 6, 18, 14, COL.tile, (x, z) => {
    rugRound(x, z, 5, 0x2f4d7d); fountain(x, z);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; lamp(x + Math.cos(a) * 7, z + Math.sin(a) * 5.5); }
    for (const [gx, gz] of [[-6, -5], [6, -5], [-6, 5], [6, 5]]) {  // future-expansion gateway pads
      cyl(0.5, 0.6, 0.3, COL.dark, x + gx, 0.15, z + gz);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 18), new THREE.MeshStandardMaterial({ color: 0x2f6e7a, emissive: 0x2f6e7a, emissiveIntensity: 0.45 }));
      pad.position.set(x + gx, 0.33, z + gz); scene.add(pad);
    }
  }, 0x2f6e7a);

  R("Common Ground", "3", 0, -14, 20, 14, COL.grass, (x, z) => {
    fountain(x, z - 2); stage(x - 6, z + 3, 4, 2.4);
    for (const [bx, bz] of [[-6, -3], [6, -3], [-3, 4], [3, 4]]) bench(x + bx, z + bz);
    tree(x - 8, z - 4); tree(x + 8, z - 4); tree(x - 8, z + 4); tree(x + 8, z + 4);
    plant(x - 4, z); plant(x + 4, z); lamp(x, z + 5);
  }, 0x6fa64e);

  /* — flanking the hub — */
  R("Community Headquarters", "4", -26, 6, 16, 12, COL.wood, (x, z) => {
    rugRound(x, z - 2, 3.4, COL.carpet); meetingTable(x, z - 2, 4, 0);   // boardroom
    for (let i = -1; i <= 1; i++) workstation(x + i * 3, z + 3.5, 0);
    bookshelf(x - 6, z - 3, Math.PI / 2); tv(x + 6, z - 3, -Math.PI / 2, 2.2); plant(x + 6, z + 3.5);
  }, 0x6f9bd1);

  R("Have a Seat Legacy Hall", "5", 26, 6, 16, 12, COL.tile, (x, z) => {
    pillar(x - 6, z - 4); pillar(x + 6, z - 4); tv(x, z - 5.2, 0, 2.8);
    statue(x - 3, z - 1); statue(x + 3, z - 1);
    for (let i = -1; i <= 1; i++) displayCase(x + i * 3, z + 3, [0xc69749, 0x3b6fb0, 0xb5654a][i + 1]);
    bench(x - 5, z + 1); bench(x + 5, z + 1);
  }, 0xc69749);

  /* — flanking common ground — */
  R("PTI Legacy Hall", "6", 26, -14, 16, 12, COL.tile, (x, z) => {
    pillar(x - 6, z - 4); pillar(x + 6, z - 4);
    for (let i = -2; i <= 2; i++) displayCase(x + i * 2.6, z - 3.5, [0xb5654a, 0x3b6fb0, 0x6fb87a, 0xc69749, 0x8e7bd1][i + 2]);
    statue(x, z + 1); tv(x + 6, z + 2, -Math.PI / 2, 2.0); bench(x - 4, z + 3); bench(x + 3, z + 3.5);
  }, 0xb5654a);

  R("Outdoor Community Areas", "7", -26, -14, 18, 14, COL.grass, (x, z) => {
    fountain(x - 4, z - 3);
    for (const [tx, tz] of [[-7, -5], [7, -5], [-7, 5], [7, 5], [0, -5]]) tree(x + tx, z + tz);
    for (const [bx, bz] of [[-5, 2], [5, 2], [0, 4]]) bench(x + bx, z + bz);
    plant(x - 2, z - 1); plant(x + 2, z - 1); plant(x + 5, z + 5); lamp(x, z); lamp(x - 6, z + 3);
  }, 0x6fa64e);

  /* — Beach & Park (north, beyond the green) — */
  R("Beach & Park", "8", 0, -34, 28, 14, COL.sand, (x, z) => {
    sea(x, z - 8, 30, 9);
    palm(x - 9, z + 2); palm(x + 9, z + 2); palm(x - 4, z - 2); palm(x + 4, z - 2);
    umbrella(x - 6, z + 3); umbrella(x + 6, z + 3, 0x3f9ac9); umbrella(x, z, 0xe0a24a);
    bench(x - 9, z + 4); bench(x + 9, z + 4);
  }, 0x3f9ac9);

  /* ==================== PHASE 2 — FACILITIES ==================== */
  const enquire = [{ label: "Enquire / book", url: LINKS.website }];
  const seat = (x, z) => { box(0.5, 0.45, 0.5, 0x33373f, x, 0.42, z, {}); box(0.5, 0.5, 0.12, 0x33373f, x, 0.72, z - 0.2, {}); };
  const deskUnit = (x, z) => { box(1.5, 0.1, 0.7, COL.wood, x, 0.82, z, {}); box(1.4, 0.66, 0.1, COL.woodDark, x, 0.4, z + 0.3, { cast: false }); addCollider(x, z, 1.5, 0.7); };
  const counter = (x, z, w2 = 2.4) => { box(w2, 0.95, 0.7, COL.woodDark, x, 0.48, z, { collide: true }); box(w2 + 0.1, 0.12, 0.8, COL.wood, x, 0.99, z, {}); };

  const fClassroom = (x, z) => { tv(x, z - 4, 0, 2.8); podium(x - 3, z - 2.6); for (let r = 0; r < 2; r++) for (let c = -1; c <= 1; c++) seat(x + c * 1.8, z + 0.5 + r * 1.8); deskUnit(x + 3.6, z - 2.4); plant(x + 4.6, z + 3.4); };
  const fTraining = (x, z) => { tv(x, z - 4, 0, 2.8); podium(x - 3.6, z - 2.6); tableRound(x + 2.6, z - 2, 1.0); for (let r = 0; r < 2; r++) for (let c = -1; c <= 1; c++) seat(x + c * 1.8, z + 1 + r * 1.8); plant(x - 4.6, z + 3.4); };
  const fMeeting = (x, z) => { meetingTable(x, z, 3.2, 0); tv(x, z - 4, 0, 2.4); plant(x + 4, z + 3); plant(x - 4, z - 3); };
  const fOffice = (x, z) => { workstation(x - 1.6, z - 1.4, Math.PI); workstation(x + 1.6, z - 1.4, Math.PI); sofa(x, z + 2.4, Math.PI, 0x7d8db8); plant(x + 3.4, z + 2.4); };
  const fUnit = (x, z) => { counter(x - 2.6, z - 3); bookshelf(x + 3, z - 3, -Math.PI / 2); sofa(x - 2, z + 2.4, 0); tableRound(x - 2, z + 0.4, 0.8); plant(x + 3.4, z + 3); };
  const fStudioFlat = (x, z) => { sofa(x - 3, z + 1, Math.PI / 2); tableRound(x - 1, z + 1, 0.8); tv(x - 5.4, z + 1, Math.PI / 2, 2.0); box(2.6, 0.5, 1.8, 0x8d9bbf, x + 3.5, 0.3, z - 2, { collide: true }); box(2.6, 0.22, 1.8, 0xcdd6e6, x + 3.5, 0.62, z - 2, {}); counter(x + 3.4, z + 3, 3); plant(x - 5, z - 3); };
  const fStage = (x, z) => { stage(x, z - 5, 10, 4); podium(x + 4.5, z - 3.4); for (let r = 0; r < 4; r++) for (let c = -3; c <= 3; c++) seat(x + c * 1.7, z + 0.5 + r * 1.8); plant(x - 11, z - 4); plant(x + 11, z - 4); };

  const wing = (prefix, baseX, baseZ, cols, rows, cw, cd, dx, dz, floor, color, entrance, furnish, group, sub, blurb) => {
    let i = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      i++; const x = baseX + c * dx, z = baseZ + r * dz;
      R(`${prefix} ${i}`, "", x, z, cw, cd, floor, (cx, cz) => furnish(cx, cz), color, entrance, { sub, blurb, links: enquire }, group);
    }
  };

  wing("Skool Classroom", 52, -6, 3, 2, 13, 10, 18, 16, COL.wood, 0x6f9bd1, "W", fClassroom, "Skool Classroom Wing",
    "Skool Classroom", "A Skool-hosted classroom — presentation area, screen-sharing space, seating layout and an avatar interaction zone. Ready for demo, trial and sales.");
  wing("Meeting Room", 52, -32, 3, 2, 12, 10, 18, 16, COL.carpet, 0x8e7bd1, "W", fMeeting, "Meeting Room Wing",
    "Meeting Room", "A private meeting room — meeting table, collaboration space and presentation capability, screened from general traffic. For staff, leadership, committees and overflow rentals.");
  wing("Training Classroom", -52, -6, 3, 2, 13, 10, -18, 16, COL.wood, 0xc87f3a, "E", fTraining, "Training Classroom Wing",
    "Training Classroom", "An instructor-led training room — presentation area, student seating, a demonstration space and group-learning capability for hands-on workshops.");
  wing("Office Rental", -52, -31, 3, 2, 11, 9, -16, 15, COL.wood, 0x2f6e7a, "E", fOffice, "Office Rental / Co-Space Wing",
    "Co-Working Office", "A flexible co-working office for solo work, remote work, coaching and consultation — membership-based access with limited personalization.");

  R("The Stage", "", 0, 50, 26, 18, COL.tile, fStage, 0xb5654a, "N",
    { sub: "Community Performance & Event Stage", blurb: "A raised main stage with a visible presenter zone, audience seating and screen-sharing — for community gatherings, organized events, seasonal programming and football watch-parties.", links: enquire }, "Phase 2 · Events");
  R("Studio Flat", "", 24, 30, 13, 10, COL.wood, fStudioFlat, 0xc69749, "W",
    { sub: "Touring & Showcase Unit", blurb: "A fully-designed studio showcase, accessible from Main Spawn — used for onboarding tours, sponsor walk-throughs and orientation, with limited personalization / upgrade options.", links: enquire }, "Phase 2 · Showcase");
  for (const [nm, ux] of [["Rent Unit A", 24], ["Rent Unit B", 40], ["Rent Unit C", 56]])
    R(nm, "", ux, 46, 13, 10, COL.tile, fUnit, 0x6fb87a, "N",
      { sub: "Ready for Purchase / Lease", blurb: "A visually-distinct, professionally-designed unit ready for purchase or lease — a rentable shop, overflow classroom/meeting room, flat, studio or office, with approved limited customization.", links: enquire }, "Phase 2 · For Sale / Rent");

  /* ============ PHASE 3 — community, seasonal, shopping, football ============ */
  const info3 = (sub, blurb) => ({ sub, blurb, links: enquire });

  // ---- furnish helpers ----
  const fClubhouse = (x, z) => { tv(x, z - 4, 0, 3.0); sofa(x - 3, z + 2, 0.3); sofa(x + 3, z + 2, -0.3); tableRound(x, z + 1, 0.9); bookshelf(x - 5.5, z - 3, Math.PI / 2); football(x + 2, z + 3.5); plant(x + 5.5, z + 3.5); };
  const fFanLounge = (x, z) => { sofa(x - 3, z + 1, Math.PI / 2); sofa(x + 3, z + 1, -Math.PI / 2); tableRound(x, z + 1, 0.8); tv(x, z - 4, 0, 2.6); football(x, z + 3.5); plant(x - 5.5, z + 3.5); };
  const fFantasy = (x, z) => { tv(x, z - 4, 0, 3.0); workstation(x - 2, z - 1, Math.PI); workstation(x + 2, z - 1, Math.PI); tableRound(x, z + 2.5, 1.0); plant(x + 5.5, z + 3.5); };
  const fWatchParty = (x, z) => { tv(x, z - 5, 0, 5.0); for (let r = 0; r < 3; r++) for (let c = -2; c <= 2; c++) seat(x + c * 1.8, z + 0.5 + r * 1.8); plant(x - 6.5, z + 3.5); plant(x + 6.5, z + 3.5); };
  const fSportsEd = (x, z) => { tv(x, z - 4, 0, 2.8); podium(x - 3, z - 2.4); for (let c = -1; c <= 1; c++) seat(x + c * 1.8, z + 1.5); bookshelf(x + 5.5, z - 3, -Math.PI / 2); displayCase(x - 5, z + 3, 0x7a4a28); };
  const fSponsor = (x, z) => { for (let i = -2; i <= 2; i++) displayCase(x + i * 2.6, z - 3.5, [0xc69749, 0x3b6fb0, 0x6fb87a, 0xb5654a, 0x8e7bd1][i + 2]); sofa(x, z + 2.5, Math.PI); plant(x - 6, z + 3.5); plant(x + 6, z + 3.5); };
  const fHuddle = (x, z) => { tableRound(x, z, 1.5); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; chair(x + Math.cos(a) * 2.2, z + Math.sin(a) * 2.2, -a + Math.PI / 2); cyl(0.04, 0.04, 0.5, 0x222, x + Math.cos(a) * 1.2, 1.2, z + Math.sin(a) * 1.2); } tv(x, z - 4.5, 0, 2.0); };
  const fStats = (x, z) => { tv(x - 3, z - 4, 0, 2.0); tv(x + 3, z - 4, 0, 2.0); tv(x, z - 4, 0, 2.0); bench(x - 3, z + 1); bench(x + 3, z + 1); plant(x + 5.5, z + 3.5); };
  const fField = (x, z) => { footballField(x, z, 26, 14); football(x, z); football(x - 3, z + 2); football(x + 4, z - 2); };
  const fStadium = (x, z) => { marker(x, z - 2, 0xb5654a); for (const [cx, cz] of [[-7, -4], [7, -4], [-7, 5], [7, 5]]) cone(x + cx, z + cz); plant(x - 9, z); plant(x + 9, z); };

  const fEventCenter = (x, z) => { stage(x, z - 4.5, 8, 3); podium(x + 3.5, z - 3); for (let r = 0; r < 2; r++) for (let c = -1; c <= 1; c++) seat(x + c * 1.9, z + 1 + r * 1.8); tv(x - 5.5, z - 3, Math.PI / 2, 1.8); plant(x + 5.5, z + 3.5); };
  const fShop = (x, z) => { counter(x - 2.5, z + 3, 2.6); bookshelf(x - 4, z - 3, 0); bookshelf(x, z - 3, 0); displayCase(x + 3.5, z - 2.5, 0xc69749); sofa(x + 2.5, z + 2.5, Math.PI); plant(x - 5.5, z + 3.5); };
  const fActivity = (x, z) => { for (let i = 0; i < 5; i++) { const c = [0xe0608a, 0x4fb0d8, 0x6fc06f, 0xf0c050, 0xe06a4a][i]; const m = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), mat(c, { r: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(x - 4 + i * 2, 0.06, z - 1); scene.add(m); } football(x + 4, z + 2); football(x - 4, z + 2); bench(x - 6, z + 4); bench(x + 6, z + 4); tree(x - 8, z - 4); tree(x + 8, z - 4); };
  const fVillage = (x, z) => {
    tree(x - 10, z - 5); tree(x + 10, z - 5); bench(x - 7, z + 5); bench(x + 7, z + 5); lamp(x, z - 1);
    seasonState.fall.push(pumpkin(x - 5, z + 2, 1.3), pumpkin(x + 5, z + 2, 1.1), pumpkin(x, z + 4, 1.5), pumpkin(x - 2, z - 3), pumpkin(x + 3, z - 2, 1.2), pumpkin(x + 6, z + 1));
    seasonState.winter.push(snowman(x - 5, z + 2), snowman(x + 5, z + 2), xmasTree(x, z - 1, 1.2));
    seasonState.winter.forEach((m) => (m.visible = false));
  };
  const fXmasPlaza = (x, z) => { xmasTree(x, z - 1, 2.4); for (const [bx, bz] of [[-5, 4], [5, 4], [-7, -1], [7, -1]]) bench(x + bx, z + bz); lamp(x - 8, z); lamp(x + 8, z); snowman(x - 4, z + 3); snowman(x + 4, z + 3); };

  // ---- First Down Football Club (south) ----
  const FB = "Phase 3 · First Down Football Club";
  R("First Down Clubhouse", "", -11, 74, 18, 13, COL.wood, fClubhouse, 0xb5654a, "N", info3("Flagship Gathering & Identity", "The football-themed flagship gathering space and primary identity area — the community arrival and social hub of the First Down Football Club."), FB);
  R("Fan Lounge", "", -33, 74, 18, 13, COL.carpet, fFanLounge, 0x6f9bd1, "N", info3("Casual Fan Social Space", "A casual social space for football fans and community members."), FB);
  R("Fantasy Football Center", "", 11, 74, 18, 13, COL.wood, fFantasy, 0x2f6e7a, "N", info3("Draft · Trades · Season Planning", "Draft discussions, trades, season-long planning and fantasy programming support."), FB);
  R("Watch Party Hall", "", 33, 74, 18, 13, COL.tile, fWatchParty, 0x8e7bd1, "N", info3("Game-Day Watch Party", "A game-day watch-party environment with seating and a large screen for scores and score-related displays, plus polls and audience engagement where platform-supported."), FB);
  R("Sports Education Room", "", -33, 90, 18, 13, COL.wood, fSportsEd, 0xc87f3a, "N", info3("Rules · History · Education", "Football rules, history and sports-education content."), FB);
  R("Sponsor & Affiliate Showcase", "", -11, 90, 18, 13, COL.tile, fSponsor, 0xc69749, "N", info3("Sponsor & Partner Integration", "Sponsor recognition and partner integration, with affiliate and partner opportunity locations."), FB);
  R("The Huddle", "", 11, 90, 18, 13, COL.carpet, fHuddle, 0x6fb87a, "N", info3("Podcast / Conversation Space", "A dedicated podcast and conversation space — 'The Huddle'."), FB);
  R("Stats & Leaderboards", "", 33, 90, 18, 13, COL.tile, fStats, 0x2f6e7a, "N", info3("Stats · Standings · Leaderboards", "Football-themed stats, standings and leaderboard displays where platform-supported."), FB);
  R("Football Field", "", 0, 110, 30, 16, COL.grass, fField, 0x4f9a44, "N", info3("Football Play / Field Feature", "A football-field-style area for avatar-based football-style play and football-themed movement where platform-supported."), FB);
  R("Future Stadium Expansion Zone", "", 0, 130, 26, 14, COL.grass, fStadium, 0x9c6b3f, "N", info3("Reserved · Future Expansion", "Reserved area for a future stadium-level build and future expansion connection."), FB);

  // ---- Seasonal & Shopping (west-south) ----
  const SS = "Phase 3 · Seasonal & Shopping";
  R("Seasonal Village", "", -110, 70, 26, 18, COL.grass, fVillage, 0xd9742a, "N", info3("Theme-Changing Seasonal Village", "A seasonal village that re-themes over time — a fall pumpkin patch, or a Christmas village with seasonal lighting and holiday decor. Use the Season toggle (top bar) to switch."), SS);
  R("Christmas Tree Plaza", "", -110, 98, 24, 16, COL.stone, fXmasPlaza, 0xc0392b, "N", info3("Holiday Tree & Gathering Plaza", "A central holiday plaza with a community tree, lighting, gathering space and an event presentation area — saved and re-used each season."), SS);
  R("Seasonal Event Center", "", -82, 70, 18, 14, COL.tile, fEventCenter, 0x8e7bd1, "E", info3("Seasonal Programming & Events", "A presentation area with community seating, seasonal programming space, a community-announcements area and event-hosting functionality."), SS);
  R("Activity Social Space", "", -82, 98, 18, 14, COL.grass, fActivity, 0x6fb87a, "N", info3("Activity-Based Social Space", "A community-oriented social space with playful ground interactions, sport-inspired placements and gathering features."), SS);
  wing("Shop", -148, 44, 3, 2, 13, 10, 16, 14, COL.tile, 0x6fb87a, "E", fShop, "Phase 3 · Shared Shopping District",
    "Shop Rental", "A rentable storefront in the Shared Shopping District — vendor space and browsing environment, with limited renter/purchaser personalization and future affiliate / partner opportunities.");

  // perimeter landscaping
  for (const tz of [-30, -10, 10, 30]) { tree(-96, tz, 1.4); tree(96, tz, 1.4); }
  for (const tx of [-60, -20, 20, 60]) tree(tx, 64, 1.4);
}
function labelKey(name) {
  const map = { "Main Spawn": "main", "Connection Hub": "hub", "Common Ground": "commons", "Community Headquarters": "hq", "Have a Seat Legacy Hall": "hasu", "PTI Legacy Hall": "pti", "Outdoor Community Areas": "outdoor", "Beach & Park": "beach" };
  return map[name];
}
defineCampus();

/* ----------------------------- avatar (humanoid) --------------------- */
const avatar = new THREE.Group();
const C_skin = 0xf0c4a0, C_shirt = 0x2f6e7a, C_pants = 0x34415e, C_hair = 0x35261a, C_shoe = 0x241c16;
// a limb that pivots from its top joint (so rotation.x swings it naturally)
function limb(r, len, color, foot) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 5, 10), mat(color));
  m.position.y = -(len / 2 + r); m.castShadow = true; g.add(m);
  if (foot) { const f = new THREE.Mesh(new THREE.BoxGeometry(r * 2.2, 0.12, r * 3.4), mat(C_shoe)); f.position.set(0, -(len + r * 2), r * 0.9); f.castShadow = true; g.add(f); }
  return g;
}
const hips = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.26), mat(C_pants)); hips.position.y = 0.92; hips.castShadow = true; avatar.add(hips);
const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.46, 6, 12), mat(C_shirt)); torso.position.y = 1.28; torso.castShadow = true; avatar.add(torso);
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 8), mat(C_skin)); neck.position.y = 1.6; avatar.add(neck);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 20, 16), mat(C_skin)); head.position.y = 1.78; head.scale.set(1, 1.12, 1); head.castShadow = true; avatar.add(head);
const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.245, 20, 14, 0, Math.PI * 2, 0, Math.PI / 1.55), mat(C_hair)); hairM.position.y = 1.82; avatar.add(hairM);
for (const ex of [-0.085, 0.085]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), mat(0x241a12)); e.position.set(ex, 1.78, 0.2); avatar.add(e); }
const armL = limb(0.075, 0.46, C_shirt); armL.position.set(-0.33, 1.5, 0); avatar.add(armL);
const armR = limb(0.075, 0.46, C_shirt); armR.position.set(0.33, 1.5, 0); avatar.add(armR);
const legL = limb(0.105, 0.46, C_pants, true); legL.position.set(-0.13, 0.86, 0); avatar.add(legL);
const legR = limb(0.105, 0.46, C_pants, true); legR.position.set(0.13, 0.86, 0); avatar.add(legR);
avatar.position.set(0, 0, 26);  // spawn in Main Spawn
scene.add(avatar);
const avShadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.24 }));
avShadow.rotation.x = -Math.PI / 2; scene.add(avShadow);

/* load a rigged, animated human character — a regular person (replaces the primitive) */
let mixer = null, actions = {}, current = null, useModel = false, hasIdle = false;
const primitiveParts = [hips, torso, neck, head, hairM, armL, armR, legL, legR];
let MODEL_YAW = 0;   // align model front with corrected movement/facing
new GLTFLoader().load("./vendor/models/CesiumMan.glb", (gltf) => {
  const model = gltf.scene;
  const bb = new THREE.Box3().setFromObject(model);
  const HUMAN_H = 0.55;   // height in world units (very small, per request)
  model.scale.setScalar(HUMAN_H / (bb.max.y - bb.min.y));
  model.rotation.y = MODEL_YAW;
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
  avatar.add(model);
  primitiveParts.forEach((p) => (p.visible = false));
  mixer = new THREE.AnimationMixer(model);
  const cl = gltf.animations || [], find = (re) => cl.find((c) => re.test(c.name));
  const walkClip = find(/walk|locomo/i) || cl[0], runClip = find(/run/i) || walkClip, idleClip = find(/idle|stand/i);
  if (walkClip) actions.walk = mixer.clipAction(walkClip);
  if (runClip) actions.run = mixer.clipAction(runClip);
  if (idleClip) { actions.idle = mixer.clipAction(idleClip); hasIdle = true; }
  for (const a of Object.values(actions)) { a.enabled = true; a.setEffectiveWeight(0); a.play(); }
  if (hasIdle) { current = actions.idle; current.setEffectiveWeight(1); }
  else if (actions.walk) { current = actions.walk; current.setEffectiveWeight(1); current.time = 0; current.paused = true; }
  useModel = true;
}, undefined, (err) => console.warn("model load failed, using primitive avatar", err));
function setAction(next) {
  if (!next || next === current) return;
  next.reset().setEffectiveWeight(1).fadeIn(0.18).play();
  if (current) current.fadeOut(0.18);
  current = next;
}
function locomote(moving, run) {
  if (!mixer) return;
  if (hasIdle) { setAction(moving ? (run && actions.run ? actions.run : actions.walk) : actions.idle); }
  else if (actions.walk) {
    const a = actions.walk;
    if (moving) { a.paused = false; a.setEffectiveTimeScale(run ? 1.7 : 1.1); if (current !== a) { a.reset().setEffectiveWeight(1).play(); current = a; } }
    else { a.paused = true; }
  }
}

/* ----------------------------- controls ------------------------------ */
const keys = {};
let running = false;
addEventListener("keydown", (e) => { keys[e.key.toLowerCase()] = true; if ((e.key === "f" || e.key === "F")) tryInteract(); if (e.key === "Escape") { closeCard(); closeDir(); } });
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
let camYaw = 0;

/* touch joystick */
let joyVec = { x: 0, y: 0 };
const joy = document.getElementById("joy"), knob = document.getElementById("joy-knob");
let joyId = null;
joy.addEventListener("pointerdown", (e) => { joyId = e.pointerId; joy.setPointerCapture(e.pointerId); });
joy.addEventListener("pointermove", (e) => { if (joyId !== e.pointerId) return; const r = joy.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const m = Math.hypot(dx, dy), max = 42; if (m > max) { dx *= max / m; dy *= max / m; } knob.style.transform = `translate(${dx}px,${dy}px)`; joyVec = { x: dx / max, y: dy / max }; });
const joyEnd = () => { joyId = null; joyVec = { x: 0, y: 0 }; knob.style.transform = "translate(0,0)"; };
joy.addEventListener("pointerup", joyEnd); joy.addEventListener("pointercancel", joyEnd);
document.getElementById("touch-f").addEventListener("click", tryInteract);

/* ---------------------------- collision ------------------------------ */
const PR = 0.5;
function collide(nx, nz) {
  let x = nx, z = nz;
  for (const c of colliders) {
    if (x > c.minX - PR && x < c.maxX + PR && z > c.minZ - PR && z < c.maxZ + PR) {
      // push out along the smallest overlap axis
      const dl = Math.abs(x - (c.minX - PR)), dr = Math.abs((c.maxX + PR) - x);
      const dt = Math.abs(z - (c.minZ - PR)), db = Math.abs((c.maxZ + PR) - z);
      const m = Math.min(dl, dr, dt, db);
      if (m === dl) x = c.minX - PR; else if (m === dr) x = c.maxX + PR; else if (m === dt) z = c.minZ - PR; else z = c.maxZ + PR;
    }
  }
  return [x, z];
}

/* --------------------------- interaction ----------------------------- */
let near = null;
const promptEl = document.getElementById("prompt"), promptLabel = document.getElementById("prompt-label");
function updateInteract() {
  let best = null, bd = 1e9;
  for (const it of interactables) { const d = Math.hypot(it.x - avatar.position.x, it.z - avatar.position.z); if (d < it.r && d < bd) { bd = d; best = it; } }
  near = best;
  if (best) { promptEl.classList.add("show"); promptLabel.textContent = best.data.title; } else promptEl.classList.remove("show");
}
function tryInteract() { if (!running || !near) return; openCard(near.data); }

/* info card */
const card = document.getElementById("card");
function openCard(d) {
  document.getElementById("card-num").textContent = d.n || "•";
  document.getElementById("card-sub").textContent = d.sub || "";
  document.getElementById("card-title").textContent = d.title;
  document.getElementById("card-blurb").textContent = d.blurb || "";
  const ul = document.getElementById("card-bullets"); ul.innerHTML = (d.bullets || []).map(t => `<li>${esc(t)}</li>`).join(""); ul.style.display = d.bullets ? "grid" : "none";
  const f = document.getElementById("card-form"); f.innerHTML = d.form ? formHtml() : ""; if (d.form) f.querySelector(".embed-submit").addEventListener("click", () => f.querySelector(".embed-fields").innerHTML = "<p class='ok'>✅ Thanks! Your response was recorded (demo).</p>");
  document.getElementById("card-links").innerHTML = (d.links || []).map(l => `<a class="m-link" href="${l.url}" target="_blank" rel="noopener">🔗 ${esc(l.label)}</a>`).join("");
  card.classList.add("show");
}
function closeCard() { card.classList.remove("show"); }
function formHtml() { return `<div class="embed-mock"><div class="embed-bar"><span>🔗 Embedded sign-up</span><span class="embed-url">${esc(LINKS.eventForm)}</span></div><div class="embed-fields"><label>Your name<input placeholder="Type here…"></label><label>Email<input placeholder="you@example.com"></label><button class="embed-submit">Submit</button></div><p class="embed-note">In the live Gather build this is your real Google Form / Airtable, embedded inline.</p></div>`; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
document.getElementById("card-close").addEventListener("click", closeCard);

/* ----------------------- room name in the HUD ------------------------ */
const ROOMS_FOR_HUD = [];
for (const sp of interactables) ROOMS_FOR_HUD.push({ x: sp.group.position.x, z: sp.group.position.z - 0, name: sp.data.title });
const hudRoom = document.getElementById("hud-room");
let curRoom = "";

/* ------------------------------ loop --------------------------------- */
const clock = new THREE.Clock();
let walkPhase = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());

  if (running) {
    if (keys.q) camYaw -= dt * 1.6;
    if (keys.e) camYaw += dt * 1.6;
    // W = forward (away from camera), S = back, A = left, D = right
    let strafe = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    let fwd = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0);
    strafe += joyVec.x; fwd += -joyVec.y;        // joystick: push up = forward
    let mag = Math.hypot(strafe, fwd);
    if (mag > 1) { strafe /= mag; fwd /= mag; mag = 1; }
    const moving = mag > 0.06, run = !!keys.shift;
    if (moving) {
      // camera-relative basis
      const fwdX = -Math.sin(camYaw), fwdZ = -Math.cos(camYaw);
      const rightX = Math.cos(camYaw), rightZ = -Math.sin(camYaw);
      const mx = fwdX * fwd + rightX * strafe, mz = fwdZ * fwd + rightZ * strafe;
      const speed = (run ? 13 : 7.5) * mag;
      let nx = avatar.position.x + mx * speed * dt;
      let nz = avatar.position.z + mz * speed * dt;
      [nx, nz] = collide(nx, nz);
      nx = Math.max(-162, Math.min(100, nx)); nz = Math.max(-46, Math.min(140, nz));
      avatar.position.x = nx; avatar.position.z = nz;
      avatar.rotation.y += (Math.atan2(mx, mz) - avatar.rotation.y) * 0.25; // smooth turn
      if (!useModel) {
        walkPhase += dt * 11 * (run ? 1.5 : 1);
        const sw = Math.sin(walkPhase);
        legL.rotation.x = sw * 0.7; legR.rotation.x = -sw * 0.7;
        armL.rotation.x = -sw * 0.55; armR.rotation.x = sw * 0.55;
        avatar.position.y = Math.abs(Math.cos(walkPhase)) * 0.045;
      }
    } else if (!useModel) {
      legL.rotation.x *= 0.75; legR.rotation.x *= 0.75; armL.rotation.x *= 0.75; armR.rotation.x *= 0.75;
      avatar.position.y *= 0.8;
    }
    if (useModel && mixer) { locomote(moving, run); mixer.update(dt); }
  }

  // camera follow
  const dist = 18, height = 17;
  const cx = avatar.position.x + Math.sin(camYaw) * dist;
  const cz = avatar.position.z + Math.cos(camYaw) * dist;
  camera.position.lerp(new THREE.Vector3(cx, height, cz), 0.18);
  camera.lookAt(avatar.position.x, 1.4, avatar.position.z);
  avShadow.position.set(avatar.position.x, 0.04, avatar.position.z);
  sun.target.position.copy(avatar.position);

  // billboard labels + fade with distance so far ones don't clutter
  for (const sp of roomLabels) {
    sp.quaternion.copy(camera.quaternion);
    const dd = Math.hypot(sp.position.x - avatar.position.x, sp.position.z - avatar.position.z);
    const op = Math.max(0, Math.min(1, (34 - dd) / 13));
    sp.material.opacity = op; sp.visible = op > 0.03;
  }
  for (const it of interactables) { it.group.children.forEach(c => { if (c.isSprite) c.quaternion.copy(camera.quaternion); }); it.group.userData.glow.emissiveIntensity = 0.45 + Math.sin(clock.elapsedTime * 3 + it.x) * 0.2; }

  if (running) updateInteract();

  // HUD room name (nearest space)
  let bn = "", bd = 1e9;
  for (const r of ROOMS_FOR_HUD) { const d = Math.hypot(r.x - avatar.position.x, r.z - avatar.position.z); if (d < bd) { bd = d; bn = r.name; } }
  if (bn !== curRoom) { curRoom = bn; hudRoom.textContent = bn; }

  renderer.render(scene, camera);
}
animate();

/* -------------------- navigation / facilities directory -------------- */
const dirEl = document.getElementById("directory"), dirList = document.getElementById("dir-list");
function buildDirectory() {
  const groups = {};
  for (const it of interactables) { const g = it.data.group || "Other"; (groups[g] = groups[g] || []).push(it); }
  const order = ["Phase 1 · Core", "Skool Classroom Wing", "Meeting Room Wing", "Training Classroom Wing", "Office Rental / Co-Space Wing", "Phase 2 · Events", "Phase 2 · Showcase", "Phase 2 · For Sale / Rent", "Phase 3 · Seasonal & Shopping", "Phase 3 · Shared Shopping District", "Phase 3 · First Down Football Club"];
  const keys = Object.keys(groups).sort((a, b) => { const ia = order.indexOf(a), ib = order.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
  dirList.innerHTML = keys.map((g) =>
    `<div class="dir-group"><h4>${esc(g)} <span>${groups[g].length}</span></h4><div class="dir-grid">${groups[g].map((it) => `<button data-x="${it.x.toFixed(2)}" data-z="${it.z.toFixed(2)}">${esc(it.data.title)}</button>`).join("")}</div></div>`
  ).join("");
  dirList.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    avatar.position.x = +b.dataset.x; avatar.position.z = +b.dataset.z - 2; avatar.position.y = 0; camYaw = 0; closeDir();
  }));
}
function toggleDir() { if (dirEl.classList.contains("show")) closeDir(); else { buildDirectory(); dirEl.classList.add("show"); } }
function closeDir() { dirEl.classList.remove("show"); }
document.getElementById("btn-dir").addEventListener("click", toggleDir);
document.getElementById("dir-close").addEventListener("click", closeDir);
dirEl.addEventListener("click", (e) => { if (e.target === dirEl) closeDir(); });

/* ---- seasonal re-theming (Seasonal Village) ---- */
let season = "fall";
function applySeason() {
  seasonState.fall.forEach((m) => (m.visible = season === "fall"));
  seasonState.winter.forEach((m) => (m.visible = season === "winter"));
  document.getElementById("btn-season").textContent = season === "fall" ? "🍂 Fall" : "❄️ Winter";
}
document.getElementById("btn-season").addEventListener("click", () => { season = season === "fall" ? "winter" : "fall"; applySeason(); });
applySeason();

/* ------------------------------ boot --------------------------------- */
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
document.getElementById("loading").style.display = "none";
document.getElementById("intro-start").addEventListener("click", () => { document.getElementById("intro").classList.remove("show"); running = true; });
// expose for headless verification
window.__world = { avatar, camera, interactables, setPos: (x, z) => { avatar.position.x = x; avatar.position.z = z; }, start: () => { document.getElementById("intro").classList.remove("show"); running = true; } };
