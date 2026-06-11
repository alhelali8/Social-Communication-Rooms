/* =====================================================================
   Virtual Community Campus — Interactive Demo
   A Gather.town-style walkable virtual space (vanilla JS + Canvas).
   No dependencies, no build step. Open index.html in a browser.
   ===================================================================== */

"use strict";

/* ----------------------------- CONFIG -------------------------------- */
const CONFIG = {
  campusName: "Have a Seat Universe",         // rebrand here
  tagline: "Pull up a seat — you belong here.",
  // Replace these with the client's real links / Google Forms / Sheets, etc.
  links: {
    discord: "https://discord.gg/your-invite",
    website: "https://example.org",
    classroom: "https://meet.google.com/your-room",
    eventForm: "https://docs.google.com/forms/d/e/your-form/viewform?embedded=true",
    holidayForm: "https://docs.google.com/forms/d/e/your-holiday-form/viewform?embedded=true",
    handbook: "https://example.org/handbook",
  },
};

const TS = 48;            // tile size in px
const PLAYER_SPEED = 200; // px / second

/* --------------------------- PALETTE --------------------------------- */
const C = {
  grass: "#7bab57", grass2: "#74a451",        // outdoor lawn
  path: "#cdba95", path2: "#c5b189",          // stone walkway
  wood: "#c79356", wood2: "#bf8a4d", woodLine: "#a06f38",   // plank floor (offices/HQ)
  floor: "#c79356", floor2: "#bf8a4d", lavLine: "#a06f38",  // alias → wood (existing rooms)
  tile: "#e6e9ef", tile2: "#dadee6", tileLine: "#c3c9d4",   // marble lobby / legacy halls
  carpet: "#566aa0", carpet2: "#4e6196",      // office blue carpet
  rug: "#b1614a", rug2: "#a55844",            // warm lounge rug
  sand: "#e8d59b", sand2: "#e0cb89",          // beach sand
  water: "#4f9fc9", water2: "#458fbb",        // sea / pond
  snow: "#eef3f8", snow2: "#e6edf4",
  ice: "#d6e6f0",
  wall: "#cdb89a", wallTop: "#b29a78", wallShade: "#bba788", // warm office wall + trim
  void: "#16233f",
  outline: "rgba(34,28,20,0.45)",             // soft dark object outline
};

/* --------------------------- CANVAS ---------------------------------- */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let VW = 0, VH = 0;
function resize() {
  VW = canvas.width = window.innerWidth;
  VH = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* --------------------------- HELPERS --------------------------------- */
function rr(x, y, w, h, r) {
  // round-rect path
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function shadow(cx, cy, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
// fill the current path, then trace a soft dark outline (illustrated look)
function fillStroke(color, lw) {
  ctx.fillStyle = color; ctx.fill();
  ctx.lineJoin = "round"; ctx.lineWidth = lw || 2; ctx.strokeStyle = C.outline; ctx.stroke();
}

/* ===================================================================== */
/*                         ROOM CONSTRUCTION                             */
/* ===================================================================== */
function makeGrid(w, h, fill) {
  const g = [];
  for (let y = 0; y < h; y++) g.push(new Array(w).fill(fill));
  return g;
}
function fillRect(g, x, y, w, h, ch) {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++)
      if (g[j] && g[j][i] !== undefined) g[j][i] = ch;
}
function border(g, ch) {
  const h = g.length, w = g[0].length;
  for (let i = 0; i < w; i++) { g[0][i] = ch; g[h - 1][i] = ch; }
  for (let j = 0; j < h; j++) { g[j][0] = ch; g[j][w - 1] = ch; }
}

const SOLID_GROUND = new Set(["#", "w"]);

const rooms = {};

/* ----- helper to register an interactive / decorative object --------- */
function obj(type, tx, ty, props = {}) {
  return Object.assign({ type, tx, ty, fw: 1, fh: 1 }, props);
}

/* =====================================================================
   PHASE 1 — FOUNDATIONAL UNIVERSE CORE (Have a Seat Universe)
   Main Spawn → Connection Hub (transport center) → Common Ground, plus
   Community HQ, HASU & PTI Legacy Halls, and the Outdoor + Beach/Park
   community zones. A central-park-style heart that feels open and warm.
   ===================================================================== */

/* ----- indoor room (walled), entered from the Connection Hub --------- */
function indoorRoom(key, name, bannerText, opts, build) {
  const W = opts.W || 16, H = opts.H || 11;
  const g = makeGrid(W, H, opts.floor || "f");
  border(g, "#");
  (opts.carpet || []).forEach((c) => fillRect(g, c[0], c[1], c[2], c[3], "c"));
  (opts.rug || []).forEach((c) => fillRect(g, c[0], c[1], c[2], c[3], "r"));
  const objs = [
    obj("banner", 3, 0, { fw: Math.min(W - 1, 10), text: bannerText, small: true }),
    obj("portalDoor", 1, 5, { target: "hub", spawn: [9, 9], label: "← Connection Hub", color: "#b8b8b8" }),
  ];
  build(objs, W, H);
  rooms[key] = { name, g, objs, spawn: [2, 5], snow: false };
}

/* --------------------------- MAIN SPAWN AREA ------------------------- */
(() => {
  const W = 17, H = 12;
  const g = makeGrid(W, H, "g");
  fillRect(g, 7, 2, 3, 9, "p");      // path to the arch
  fillRect(g, 4, 6, 9, 2, "p");
  const objs = [
    obj("banner", 6, 1, { fw: 5, text: "WELCOME" }),
    obj("flag", 2, 3, { color: "#3b6fb0" }), obj("flag", 14, 3, { color: "#c98a3a" }),
    obj("signpost", 5, 8, { title: "Welcome — take your time", text: "No rush, no pressure. Use WASD / arrows to walk and press E near glowing objects. When you're ready, step through the archway into the universe." }),
    obj("noticeboard", 11, 8, { title: "Getting Started", body: "• Walk into portals (✦) to travel between spaces.\n• Glowing objects are interactive — press E.\n• Press M anytime to open the universe directory and jump anywhere.", links: [{ label: "Visit our website", url: CONFIG.links.website }] }),
    obj("tree", 3, 2), obj("tree", 14, 2), obj("tree", 2, 10), obj("tree", 15, 10),
    obj("flower", 6, 4), obj("flower", 10, 4), obj("flower", 5, 6), obj("flower", 11, 6),
    obj("lamp", 6, 7), obj("lamp", 10, 7), obj("bush", 3, 5), obj("bush", 13, 5),
    obj("portalArch", 7, 1, { fw: 3, target: "hub", spawn: [9, 9], label: "Enter the Universe" }),
  ];
  rooms.spawn = { name: "Main Spawn", g, objs, spawn: [8, 9], snow: false };
})();

/* ------------------- CONNECTION HUB (transport center) -------------- */
(() => {
  const W = 19, H = 13;
  const g = makeGrid(W, H, "t");
  border(g, "#");
  fillRect(g, 7, 4, 5, 5, "r");      // central gateway rug
  const objs = [
    obj("banner", 6, 0, { fw: 8, text: "CONNECTION HUB" }),
    obj("fountain", 8, 5, { fw: 3, fh: 3 }),
    obj("portalDoor", 9, 1, { target: "spawn", spawn: [8, 8], label: "Main Spawn", color: "#b8b8b8" }),
    obj("portalDoor", 1, 4, { target: "commons", spawn: [10, 7], label: "Common Ground", color: "#6fb87a" }),
    obj("portalDoor", 1, 8, { target: "hq", spawn: [2, 5], label: "Community HQ", color: "#6f9bd1" }),
    obj("portalDoor", 17, 4, { target: "hasu", spawn: [2, 5], label: "HASU Legacy Hall", color: "#c69749" }),
    obj("portalDoor", 17, 8, { target: "pti", spawn: [2, 5], label: "PTI Legacy Hall", color: "#b5654a" }),
    obj("portalDoor", 6, 11, { target: "outdoor", spawn: [10, 8], label: "Outdoor Areas", color: "#5e9e4a" }),
    obj("portalDoor", 12, 11, { target: "beach", spawn: [9, 2], label: "Beach & Park", color: "#3f9ac9" }),
    // future-expansion gateway nodes
    obj("kiosk", 3, 2, { title: "Future Expansion", body: "An access point reserved for future universe expansions.\n\nNew worlds and portals plug straight into the Connection Hub as the universe grows." }),
    obj("kiosk", 15, 2, { title: "Future Expansion", body: "Reserved gateway for an upcoming connected world.\n\n(Part of the universe roadmap — coming soon.)" }),
    obj("signpost", 6, 3, { title: "Wayfinding", text: "This is the transport center. Every space in the universe is one portal away from here." }),
    obj("signpost", 12, 3, { title: "Universe Directory", text: "Press M at any time to open the full directory and jump to any space." }),
    obj("directory", 9, 10, { title: "Universe Directory", body: "The Connection Hub links every space:\n↑ Main Spawn\n← Common Ground · Community HQ\n→ HASU Legacy Hall · PTI Legacy Hall\n↓ Outdoor Areas · Beach & Park" }),
    obj("plant", 2, 7), obj("plant", 16, 7), obj("lamp", 4, 5), obj("lamp", 14, 5),
  ];
  rooms.hub = { name: "Connection Hub", g, objs, spawn: [9, 9], snow: false };
})();

/* ----------------- COMMON GROUND (central-park heart) --------------- */
(() => {
  const W = 20, H = 13;
  const g = makeGrid(W, H, "g");
  fillRect(g, 14, 7, 5, 4, "w");     // pond
  fillRect(g, 2, 6, 16, 2, "p");     // main path
  fillRect(g, 8, 1, 2, 11, "p");     // cross path
  const objs = [
    obj("banner", 6, 0, { fw: 7, text: "COMMON GROUND" }),
    obj("portalDoor", 1, 6, { target: "hub", spawn: [9, 9], label: "Connection Hub", color: "#b8b8b8" }),
    obj("portalArch", 16, 1, { fw: 3, target: "outdoor", spawn: [10, 8], label: "Outdoor Areas", color: "#5e9e4a" }),
    obj("tree", 2, 2), obj("tree", 5, 2), obj("tree", 18, 11), obj("tree", 2, 11),
    obj("stage", 3, 9, { fw: 3, fh: 2 }),
    obj("fountain", 11, 2, { fw: 2, fh: 2 }),
    obj("eventsBoard", 6, 4, { title: "Community Board", body: "Gather, connect, and belong — no pressure, just good company.\n\n🪑 Coffee & chat — Fridays 10am\n🌳 Park hangout — Sundays noon\n🎟️ RSVP to join in.", links: [{ label: "RSVP / Sign up", url: CONFIG.links.eventForm }], formUrl: CONFIG.links.eventForm }),
    obj("bench", 13, 6), obj("bench", 18, 6),
    obj("picnic", 4, 4, { fw: 2 }),
    obj("flower", 3, 8), obj("flower", 12, 11), obj("flower", 17, 4), obj("flower", 6, 11),
    obj("bush", 15, 11), obj("bush", 2, 8), obj("lamp", 7, 5), obj("lamp", 11, 8),
    obj("flag", 18, 2, { color: "#3b6fb0" }),
    obj("coffee", 13, 11, { title: "Coffee Cart", text: "Grab a virtual coffee and say hi to whoever's around. ☕" }),
  ];
  rooms.commons = { name: "Common Ground", g, objs, spawn: [10, 7], snow: false };
})();

/* ------------------- COMMUNITY HEADQUARTERS ------------------------- */
indoorRoom("hq", "Community Headquarters", "COMMUNITY HEADQUARTERS", { W: 18, H: 12, floor: "f", carpet: [[10, 2, 7, 5]] }, (o) => {
  o.push(
    obj("teacherDesk", 3, 2, { fw: 3 }), obj("chair", 4, 4),
    obj("noticeboard", 7, 1, { title: "Operations Board", body: "Administrative space · Leadership · Operations\n\nThe organizational home base — schedules, announcements and team operations.", links: [{ label: "Open the handbook", url: CONFIG.links.handbook }] }),
    obj("computer", 3, 6), obj("computer", 5, 6), obj("computer", 3, 9), obj("computer", 5, 9),
    obj("privateZone", 11, 3, { fw: 5, fh: 4, label: "Boardroom" }),
    obj("kiosk", 15, 9, { title: "Leadership Desk", body: "Book a leadership meeting or reach the operations team.", links: [{ label: "Request a meeting", url: CONFIG.links.discord }] }),
    obj("bookshelf", 16, 1, { title: "Records", body: "Organizational records and reference material." }),
    obj("signpost", 1, 10, { title: "Private Area", text: "The Boardroom is a private audio zone — in Gather, audio & video stay inside the room for leadership meetings." }),
    obj("plant", 8, 10), obj("plant", 16, 10)
  );
});

/* ---------------- HAVE A SEAT UNIVERSE LEGACY HALL ----------------- */
indoorRoom("hasu", "Have a Seat Legacy Hall", "HAVE A SEAT LEGACY HALL", { W: 17, H: 11, floor: "t", rug: [[8, 2, 2, 8]] }, (o) => {
  o.push(
    obj("pillar", 3, 1), obj("pillar", 13, 1),
    obj("statue", 5, 3, { title: "Founder Recognition", body: "Honoring the founders of the Have a Seat Universe — the vision and people who built a place to belong." }),
    obj("statue", 5, 7),
    obj("displayCase", 8, 1, { title: "Our Mission", body: "Historical recognition & mission.\n\nWe preserve the past, enrich the present, and inspire the future — together.", color: "#c69749" }),
    obj("displayCase", 10, 1, { color: "#3b6fb0" }), obj("displayCase", 12, 3, { color: "#b5654a" }),
    obj("artFrame", 8, 5, { title: "Legacy Wall", body: "Stories, milestones and memories from across the years of Have a Seat Universe.", color: "#9c6b3f" }),
    obj("projector", 13, 7, { title: "Mission & Legacy", body: "A presentation wall for the universe's mission, history and founder tributes. Embeds slides or a recorded tribute.", links: [{ label: "Watch the tribute", url: CONFIG.links.website }] }),
    obj("bench", 9, 7), obj("plant", 2, 9), obj("plant", 14, 9)
  );
});

/* ----------------------- PTI LEGACY HALL --------------------------- */
indoorRoom("pti", "PTI Legacy Hall", "PTI LEGACY HALL", { W: 17, H: 11, floor: "t", rug: [[8, 2, 2, 8]] }, (o) => {
  o.push(
    obj("pillar", 3, 1), obj("pillar", 13, 1),
    obj("artFrame", 5, 1, { color: "#b5654a" }),
    obj("artFrame", 7, 1, { title: "Paper Tole Institute", body: "A distinct legacy space for the Paper Tole Institute (PTI) — its mission, craft and history.", color: "#9c6b3f" }),
    obj("artFrame", 9, 1, { color: "#6fb87a" }), obj("artFrame", 11, 1, { color: "#c69749" }),
    obj("displayCase", 5, 4, { title: "PTI Craft", body: "The art and craft of paper tole — layered, dimensional artwork at the heart of PTI.", color: "#b5654a" }),
    obj("displayCase", 11, 4, { color: "#3b6fb0" }),
    obj("statue", 8, 5, { title: "PTI Founder", body: "Recognizing the founder and history of the Paper Tole Institute." }),
    obj("noticeboard", 13, 7, { title: "PTI Mission & History", body: "Paper Tole Institute — preserving a craft and a community.\n\nMission, history and the people who shaped it.", links: [{ label: "Read PTI's story", url: CONFIG.links.website }] }),
    obj("bench", 9, 7), obj("plant", 2, 9), obj("plant", 14, 9)
  );
});

/* ------------------- OUTDOOR COMMUNITY AREAS ----------------------- */
(() => {
  const W = 20, H = 13;
  const g = makeGrid(W, H, "g");
  fillRect(g, 2, 6, 16, 2, "p");     // walking path
  fillRect(g, 8, 1, 2, 11, "p");
  const objs = [
    obj("banner", 6, 0, { fw: 7, text: "OUTDOOR AREAS" }),
    obj("portalDoor", 1, 6, { target: "hub", spawn: [9, 9], label: "Connection Hub", color: "#b8b8b8" }),
    obj("portalArch", 7, 0, { fw: 3, target: "commons", spawn: [10, 7], label: "Common Ground", color: "#6fb87a" }),
    obj("portalArch", 16, 11, { fw: 3, target: "beach", spawn: [9, 2], label: "Beach & Park", color: "#3f9ac9" }),
    obj("fountain", 4, 3, { fw: 2, fh: 2 }),
    obj("tree", 2, 2), obj("tree", 14, 2), obj("tree", 18, 4), obj("tree", 2, 11), obj("tree", 13, 11), obj("tree", 18, 10),
    obj("bush", 6, 4), obj("bush", 16, 6), obj("bush", 7, 9), obj("bush", 15, 9),
    obj("flower", 3, 8), obj("flower", 12, 4), obj("flower", 17, 7), obj("flower", 5, 11),
    obj("bench", 12, 6), obj("bench", 15, 6), obj("picnic", 12, 8, { fw: 2 }),
    obj("lamp", 7, 5), obj("lamp", 11, 8), obj("flag", 18, 1, { color: "#5e9e4a" }),
    obj("signpost", 3, 7, { title: "Walking Paths", text: "Wander the landscaped paths and gathering spaces — open sightlines, room to roam, and quiet corners to talk." }),
  ];
  rooms.outdoor = { name: "Outdoor Areas", g, objs, spawn: [10, 8], snow: false };
})();

/* --------------------- BEACH & PARK ADDITIONS ---------------------- */
(() => {
  const W = 20, H = 13;
  const g = makeGrid(W, H, "a");
  fillRect(g, 0, 10, 20, 3, "w");    // sea
  fillRect(g, 2, 8, 16, 1, "p");     // boardwalk
  const objs = [
    obj("banner", 6, 0, { fw: 7, text: "BEACH & PARK" }),
    obj("portalArch", 8, 0, { fw: 3, target: "hub", spawn: [9, 9], label: "Connection Hub", color: "#b8b8b8" }),
    obj("portalDoor", 1, 6, { target: "outdoor", spawn: [10, 8], label: "Outdoor Areas", color: "#5e9e4a" }),
    obj("palm", 3, 2), obj("palm", 16, 2), obj("palm", 3, 6), obj("palm", 17, 6),
    obj("beachUmbrella", 6, 5), obj("beachUmbrella", 11, 5), obj("beachUmbrella", 14, 6),
    obj("sandcastle", 8, 7), obj("sandcastle", 12, 7),
    obj("bench", 5, 8), obj("bench", 13, 8),
    obj("flag", 10, 2, { color: "#3f9ac9" }), obj("flower", 2, 1), obj("flower", 18, 1),
    obj("signpost", 6, 3, { title: "Beach & Park", text: "A relaxed, central-park-style shoreline — pull up a seat, take in the view, and enjoy the calm." }),
  ];
  rooms.beach = { name: "Beach & Park", g, objs, spawn: [9, 2], snow: false };
})();

/* ===================================================================== */
/*                       OBJECT FOOTPRINT / SOLIDS                       */
/* ===================================================================== */
// which object types block movement, and their solid footprint (tiles)
const SOLID_OBJ = {
  tree: 1, pine: 1, fountain: 1, bookshelf: 1, sofa: 1, table: 1, teacherDesk: 1,
  studentDesk: 1, podium: 1, whiteboard: 1, projector: 1, kiosk: 1, noticeboard: 1,
  directory: 1, eventsBoard: 1, giftStand: 1, coffee: 1, bench: 1, cabin: 1,
  xmasTree: 1, snowman: 1, stage: 1, picnic: 1, banner: 0, signpost: 1, gift: 0,
  bookshelf2: 1, pillar: 1, computer: 1, artFrame: 1,
  palm: 1, statue: 1, displayCase: 1, aquarium: 1, beachUmbrella: 1, flag: 1, sandcastle: 0,
};

function buildCollision(room) {
  const h = room.g.length, w = room.g[0].length;
  const col = makeGrid(w, h, 0);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (SOLID_GROUND.has(room.g[y][x])) col[y][x] = 1;
  for (const o of room.objs) {
    if (SOLID_OBJ[o.type]) {
      const fw = o.fw || 1, fh = o.fh || 1;
      for (let j = 0; j < fh; j++)
        for (let i = 0; i < fw; i++) {
          const xx = o.tx + i, yy = o.ty + j;
          if (col[yy] && col[yy][xx] !== undefined) col[yy][xx] = 1;
        }
    }
  }
  room.col = col;
  room.w = w; room.h = h;
}
Object.values(rooms).forEach(buildCollision);

/* ----- populate the campus with people (NPCs with name tags) -------- */
rooms.spawn.npcs = [
  { tx: 6, ty: 5, name: "Ava 👋", color: "#c0567a", hair: "#2a1c14", dir: "right" },
];
rooms.hub.npcs = [
  { tx: 5, ty: 9, name: "Maya", color: "#c0567a", hair: "#3a2a1c", dir: "right" },
  { tx: 14, ty: 9, name: "Leo 🎧", color: "#4a8f5e", hair: "#1c1c1c", dir: "left" },
];
rooms.commons.npcs = [
  { tx: 12, ty: 5, name: "Brad 🎧", color: "#3b6fb0", hair: "#2a1c14", dir: "down" },
  { tx: 4, ty: 11, name: "Alison", color: "#b5654a", hair: "#5b3b27", dir: "up" },
  { tx: 11, ty: 11, name: "Sam", color: "#7a5fb0", hair: "#1c1c1c", dir: "left" },
];
rooms.hq.npcs = [
  { tx: 8, ty: 6, name: "Dr. Ortiz", color: "#b08a3b", hair: "#5b3b27", dir: "down" },
  { tx: 13, ty: 5, name: "Priya", color: "#8e6fc0", hair: "#2a1c14", dir: "up" },
];
rooms.hasu.npcs = [
  { tx: 10, ty: 7, name: "Jo", color: "#3b8fb0", hair: "#2a1c14", dir: "left" },
];
rooms.outdoor.npcs = [
  { tx: 11, ty: 5, name: "Tess", color: "#5e9e4a", hair: "#5b3b27", dir: "down" },
];
rooms.beach.npcs = [
  { tx: 12, ty: 4, name: "Kai", color: "#b03b6f", hair: "#1c1c1c", dir: "down" },
];
let _ph = 0;
for (const r of Object.values(rooms)) for (const n of (r.npcs || [])) n.phase = (_ph += 1.3);

/* ===================================================================== */
/*                           GAME STATE                                  */
/* ===================================================================== */
const state = {
  roomKey: "spawn",
  player: { x: 0, y: 0, dir: "down", moving: false, anim: 0 },
  cam: { x: 0, y: 0 },
  keys: {},
  near: null,          // nearest interactive object
  transition: 0,       // fade 0..1
  pendingPortal: null,
  portalCooldown: 0,
  paused: true,        // until intro dismissed
  t: 0,
};

function room() { return rooms[state.roomKey]; }

function spawnAt(tx, ty) {
  state.player.x = tx * TS + TS / 2;
  state.player.y = ty * TS + TS / 2;
}
spawnAt(...rooms.spawn.spawn);

/* ----------------------------- INPUT --------------------------------- */
const KEYMAP = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
  W: "up", S: "down", A: "left", D: "right",
};
window.addEventListener("keydown", (e) => {
  if (KEYMAP[e.key]) { state.keys[KEYMAP[e.key]] = true; e.preventDefault(); }
  if (e.key === "e" || e.key === "E" || e.key === " ") { tryInteract(); }
  if (e.key === "Escape") closeModal();
  if (e.key === "m" || e.key === "M") toggleAreas();
});
window.addEventListener("keyup", (e) => { if (KEYMAP[e.key]) state.keys[KEYMAP[e.key]] = false; });

/* On-screen D-pad (mobile / click) */
function bindDpad() {
  document.querySelectorAll("[data-dir]").forEach((el) => {
    const dir = el.dataset.dir;
    const on = (e) => { e.preventDefault(); state.keys[dir] = true; };
    const off = (e) => { e.preventDefault(); state.keys[dir] = false; };
    el.addEventListener("mousedown", on); el.addEventListener("touchstart", on, { passive: false });
    el.addEventListener("mouseup", off); el.addEventListener("mouseleave", off);
    el.addEventListener("touchend", off); el.addEventListener("touchcancel", off);
  });
  document.getElementById("btn-interact").addEventListener("click", tryInteract);
}

/* ===================================================================== */
/*                            UPDATE LOOP                                */
/* ===================================================================== */
function update(dt) {
  if (state.paused) return;
  if (state.portalCooldown > 0) state.portalCooldown -= dt;

  const p = state.player;
  let dx = 0, dy = 0;
  if (state.keys.up) dy -= 1;
  if (state.keys.down) dy += 1;
  if (state.keys.left) dx -= 1;
  if (state.keys.right) dx += 1;

  p.moving = (dx !== 0 || dy !== 0) && state.transition === 0;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    if (Math.abs(dx) > Math.abs(dy)) p.dir = dx < 0 ? "left" : "right";
    else p.dir = dy < 0 ? "up" : "down";

    const dist = PLAYER_SPEED * dt;
    if (state.transition === 0) {
      moveAxis(dx * dist, 0);
      moveAxis(0, dy * dist);
    }
  }
  p.anim = p.moving ? p.anim + dt * 8 : 0;

  updateCamera();
  checkPortals();
  findNearest();

  if (state.transition > 0 && state.pendingPortal) {
    state.transition += dt * 2.5;
    if (state.transition >= 1) doPortal();
  } else if (state.transition > 0) {
    state.transition -= dt * 2.5;
    if (state.transition < 0) state.transition = 0;
  }
}

// AABB collision against tile grid; player half-size
const PR = 13; // player radius for collision
function moveAxis(mx, my) {
  const p = state.player;
  let nx = p.x + mx, ny = p.y + my;
  const r = room();
  // sample the box corners
  const minX = nx - PR, maxX = nx + PR, minY = ny - PR, maxY = ny + PR;
  if (solidAt(minX, p.y - PR) || solidAt(maxX, p.y - PR) || solidAt(minX, p.y + PR) || solidAt(maxX, p.y + PR)) {
    if (mx !== 0) nx = p.x;
  }
  if (solidAt(p.x - PR, minY) || solidAt(p.x + PR, minY) || solidAt(p.x - PR, maxY) || solidAt(p.x + PR, maxY)) {
    if (my !== 0) ny = p.y;
  }
  // clamp to room bounds
  nx = Math.max(PR, Math.min(r.w * TS - PR, nx));
  ny = Math.max(PR, Math.min(r.h * TS - PR, ny));
  p.x = nx; p.y = ny;
}
function solidAt(px, py) {
  const r = room();
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  if (tx < 0 || ty < 0 || tx >= r.w || ty >= r.h) return true;
  return r.col[ty][tx] === 1;
}

function updateCamera() {
  const r = room();
  const rw = r.w * TS, rh = r.h * TS;
  let cx = state.player.x - VW / 2;
  let cy = state.player.y - VH / 2;
  if (rw < VW) cx = (rw - VW) / 2; else cx = Math.max(0, Math.min(rw - VW, cx));
  if (rh < VH) cy = (rh - VH) / 2; else cy = Math.max(0, Math.min(rh - VH, cy));
  // smooth
  state.cam.x += (cx - state.cam.x) * 0.15;
  state.cam.y += (cy - state.cam.y) * 0.15;
}

/* ----------------------------- PORTALS ------------------------------- */
function portalRectsFor(o) {
  return { x: o.tx * TS, y: o.ty * TS, w: (o.fw || 1) * TS, h: (o.fh || 1) * TS };
}
function checkPortals() {
  if (state.transition > 0 || state.portalCooldown > 0) return;
  const p = state.player;
  for (const o of room().objs) {
    if (o.type === "portalArch" || o.type === "portalDoor") {
      const R = portalRectsFor(o);
      if (p.x > R.x && p.x < R.x + R.w && p.y > R.y - 6 && p.y < R.y + R.h + 6) {
        state.pendingPortal = o;
        state.transition = 0.001;
        return;
      }
    }
  }
}
function doPortal() {
  const o = state.pendingPortal;
  state.roomKey = o.target;
  spawnAt(...o.spawn);
  state.pendingPortal = null;
  state.transition = 1;       // start fading back in
  state.portalCooldown = 0.6;
  // snap camera
  updateCamera(); state.cam.x = clampCamX(); state.cam.y = clampCamY();
  flashArea(room().name);
}
function clampCamX() {
  const r = room(); const rw = r.w * TS;
  let cx = state.player.x - VW / 2;
  return rw < VW ? (rw - VW) / 2 : Math.max(0, Math.min(rw - VW, cx));
}
function clampCamY() {
  const r = room(); const rh = r.h * TS;
  let cy = state.player.y - VH / 2;
  return rh < VH ? (rh - VH) / 2 : Math.max(0, Math.min(rh - VH, cy));
}

/* --------------------------- INTERACTION ----------------------------- */
const INTERACTIVE = new Set([
  "signpost", "noticeboard", "directory", "kiosk", "bookshelf", "whiteboard",
  "projector", "eventsBoard", "giftStand", "coffee", "privateZone", "artFrame",
  "displayCase", "statue",
]);
function findNearest() {
  const p = state.player;
  let best = null, bestD = 1e9;
  for (const o of room().objs) {
    if (!INTERACTIVE.has(o.type)) continue;
    if (!(o.text || o.body || o.title)) continue;
    const cx = (o.tx + (o.fw || 1) / 2) * TS;
    const cy = (o.ty + (o.fh || 1) / 2) * TS;
    const d = Math.hypot(cx - p.x, cy - p.y);
    if (d < TS * 1.6 && d < bestD) { best = o; bestD = d; }
  }
  state.near = best;
  const hint = document.getElementById("interact-hint");
  if (best && state.transition === 0) {
    hint.classList.add("show");
    hint.querySelector(".label").textContent = best.title || best.label || "Interact";
  } else hint.classList.remove("show");
}
function tryInteract() {
  if (state.paused) { dismissIntro(); return; }
  const o = state.near;
  if (!o) return;
  if (o.text && !o.body) { showBubble(o.title, o.text); return; }
  openModal(o);
}

/* ===================================================================== */
/*                              RENDER                                   */
/* ===================================================================== */
function render() {
  // soft radial backdrop instead of flat dark (adds depth)
  const bg = ctx.createRadialGradient(VW / 2, VH * 0.42, 80, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
  bg.addColorStop(0, "#22324f");
  bg.addColorStop(1, "#121d33");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VW, VH);
  ctx.save();
  ctx.translate(-Math.round(state.cam.x), -Math.round(state.cam.y));

  const r = room();
  drawGround(r);

  // collect drawables for y-sorting
  const draw = [];
  for (const o of r.objs) {
    const baseY = (o.ty + (o.fh || 1)) * TS;
    draw.push({ baseY, kind: "obj", o });
  }
  for (const n of (r.npcs || [])) draw.push({ baseY: (n.ty + 1) * TS, kind: "npc", n });
  draw.push({ baseY: state.player.y, kind: "player" });
  draw.sort((a, b) => a.baseY - b.baseY);
  for (const d of draw) {
    if (d.kind === "obj") drawObject(d.o);
    else if (d.kind === "npc") drawNpc(d.n);
    else drawPlayer();
  }

  if (r.snow) drawSnow();
  ctx.restore();

  // gentle vignette for focus/depth
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.7);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VW, VH);

  drawMinimap();
  updatePresence();

  // transition fade
  if (state.transition > 0) {
    const a = Math.min(1, state.transition);
    ctx.fillStyle = `rgba(12,16,24,${a})`;
    ctx.fillRect(0, 0, VW, VH);
  }
}

function drawGround(r) {
  const startX = Math.max(0, Math.floor(state.cam.x / TS));
  const startY = Math.max(0, Math.floor(state.cam.y / TS));
  const endX = Math.min(r.w, Math.ceil((state.cam.x + VW) / TS));
  const endY = Math.min(r.h, Math.ceil((state.cam.y + VH) / TS));
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      drawTile(r.g[y][x], x, y);
    }
  }
}

// deterministic per-tile pseudo-random in [0,1)
function tnoise(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
function drawTile(ch, x, y) {
  const px = x * TS, py = y * TS;
  const alt = (x + y) % 2 === 0;
  let base;
  switch (ch) {
    case "g": base = alt ? C.grass : C.grass2; break;
    case "p": base = alt ? C.path : C.path2; break;
    case "f": base = alt ? C.wood : C.wood2; break;
    case "c": base = alt ? C.carpet : C.carpet2; break;
    case "r": base = alt ? C.rug : C.rug2; break;
    case "t": base = alt ? C.tile : C.tile2; break;
    case "a": base = alt ? C.sand : C.sand2; break;
    case "s": base = alt ? C.snow : C.snow2; break;
    case "i": base = C.ice; break;
    case "w": base = alt ? C.water : C.water2; break;
    case "#": base = C.wall; break;
    default: base = C.grass;
  }
  ctx.fillStyle = base;
  ctx.fillRect(px, py, TS, TS);

  if (ch === "w") {
    // rolling waves
    for (let i = 0; i < 2; i++) {
      const sh = Math.sin(state.t * 1.8 + x * 0.7 + y * 0.9 + i * 2) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255,255,255,${0.05 + sh * 0.10})`;
      ctx.fillRect(px + 5, py + 10 + i * 18 + sh * 5, TS - 16, 3);
    }
    ctx.fillStyle = "rgba(20,60,90,0.12)"; ctx.fillRect(px, py + TS - 4, TS, 4);
  } else if (ch === "#") {
    // warm office/brick wall: lit top cap, brick courses, baseboard shadow
    ctx.fillStyle = C.wallShade; ctx.fillRect(px, py, TS, TS);
    ctx.fillStyle = C.wallTop; ctx.fillRect(px, py, TS, 12);
    ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.fillRect(px, py, TS, 3);
    ctx.strokeStyle = "rgba(90,70,45,0.28)"; ctx.lineWidth = 1;
    for (let r = 1; r < 3; r++) { ctx.beginPath(); ctx.moveTo(px, py + 12 + r * 12); ctx.lineTo(px + TS, py + 12 + r * 12); ctx.stroke(); }
    const off = (y % 2) ? TS / 2 : 0;
    ctx.beginPath(); ctx.moveTo(px + off, py + 12); ctx.lineTo(px + off, py + 24);
    ctx.moveTo(px + (off + TS / 2) % TS, py + 24); ctx.lineTo(px + (off + TS / 2) % TS, py + 36); ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0.16)"; ctx.fillRect(px, py + TS - 5, TS, 5);
  } else if (ch === "f") {
    // wood plank floor: horizontal boards + seams + grain
    ctx.strokeStyle = "rgba(0,0,0,0.10)"; ctx.lineWidth = 1;
    for (let b = 0; b <= TS; b += 16) { ctx.beginPath(); ctx.moveTo(px, py + b + 0.5); ctx.lineTo(px + TS, py + b + 0.5); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let b = 0; b < TS; b += 16) ctx.fillRect(px, py + b + 1, TS, 2);
    ctx.strokeStyle = C.woodLine; const seam = (y % 2) ? 8 : 28;
    ctx.beginPath(); ctx.moveTo(px + seam + 0.5, py); ctx.lineTo(px + seam + 0.5, py + 16); ctx.stroke();
  } else if (ch === "c" || ch === "r") {
    // carpet / rug — speckled weave
    const spk = ch === "c" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    ctx.fillStyle = spk;
    for (let i = 0; i < 5; i++) { const r = tnoise(x * 9 + i, y * 7 + i); ctx.fillRect(px + (r * TS | 0), py + ((tnoise(i, x + y) * TS) | 0), 2, 2); }
  } else if (ch === "t") {
    // marble tiles: square grid + highlight
    ctx.strokeStyle = C.tileLine; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, TS, TS);
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(px + 2, py + 2, TS - 4, 2);
  } else if (ch === "a") {
    // sand: ripples + grains
    ctx.strokeStyle = "rgba(180,150,90,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py + 16 + Math.sin(x) * 2); ctx.quadraticCurveTo(px + TS / 2, py + 22, px + TS, py + 14); ctx.stroke();
    ctx.fillStyle = "rgba(120,95,50,0.18)";
    for (let i = 0; i < 4; i++) { ctx.fillRect(px + ((tnoise(x + i, y) * TS) | 0), py + ((tnoise(y, x + i) * TS) | 0), 1, 1); }
  } else if (ch === "g") {
    // lawn: blades + tonal patches
    if ((x * 7 + y * 13) % 4 === 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 1;
      const gx = px + (tnoise(x, y) * 30 + 8 | 0), gy = py + (tnoise(y, x) * 26 + 14 | 0);
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 2, gy - 5); ctx.moveTo(gx + 2, gy); ctx.lineTo(gx + 3, gy - 6); ctx.stroke();
    }
    if ((x * 5 + y * 3) % 7 === 0) { ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.beginPath(); ctx.ellipse(px + 24, py + 24, 16, 12, 0, 0, 7); ctx.fill(); }
  } else if (ch === "s") {
    if ((x * 5 + y * 11) % 6 === 0) { ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(px + 16, py + 20, 2, 0, 7); ctx.fill(); }
  } else if (ch === "p") {
    // flagstones
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1; ctx.strokeRect(px + 1.5, py + 1.5, TS - 3, TS - 3);
    ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(px + 2, py + 2, TS - 4, 2);
  }
}

/* ----------------------------- AVATARS ------------------------------- */
function drawAvatar(x, y, o) {
  const body = o.body || "#3b6fb0";
  const skin = o.skin || "#f3cda0";
  const hair = o.hair || "#5b3b27";
  const dir = o.dir || "down";
  const anim = o.anim || 0;
  const moving = o.moving;
  shadow(x, y + 14, 14, 6);
  const bob = moving ? Math.sin(anim) * 2 : Math.sin((o.idle || 0)) * 0.8;
  // body
  rr(x - 11, y - 6 + bob, 22, 20, 8); fillStroke(body, 2);
  // head
  ctx.beginPath(); ctx.arc(x, y - 12 + bob, 10, 0, 7); fillStroke(skin, 2);
  // hair
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(x, y - 14 + bob, 10, Math.PI, 0); ctx.fill();
  ctx.fillRect(x - 10, y - 15 + bob, 20, 4);
  // eyes by facing
  ctx.fillStyle = "#2a2a2a";
  const e = { down: [[-3, -11], [3, -11]], up: [], left: [[-5, -11]], right: [[5, -11]] }[dir];
  for (const [ex, ey] of e) { ctx.beginPath(); ctx.arc(x + ex, y + ey + bob, 1.6, 0, 7); ctx.fill(); }
  // feet
  ctx.fillStyle = "rgba(38,40,55,0.9)";
  const step = moving ? Math.sin(anim) * 4 : 0;
  ctx.fillRect(x - 8, y + 12 + bob, 6, 5 + step * 0.2);
  ctx.fillRect(x + 2, y + 12 + bob, 6, 5 - step * 0.2);
}
function drawNameTag(cx, topY, name, isYou) {
  ctx.save();
  ctx.font = '600 12px Poppins, sans-serif';
  const w = ctx.measureText(name).width + 18;
  ctx.fillStyle = isYou ? "rgba(62,140,90,0.95)" : "rgba(28,33,45,0.82)";
  rr(cx - w / 2, topY - 17, w, 18, 9); ctx.fill();
  if (isYou) { ctx.fillStyle = "#8df0b0"; ctx.beginPath(); ctx.arc(cx - w / 2 + 9, topY - 8, 2.5, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#fff"; ctx.textAlign = "center";
  ctx.fillText(name, cx + (isYou ? 5 : 0), topY - 4);
  ctx.restore(); ctx.textAlign = "left";
}
function drawPlayer() {
  const p = state.player;
  drawAvatar(p.x, p.y, { dir: p.dir, moving: p.moving, anim: p.anim });
  drawNameTag(p.x, p.y - 28, "You", true);
}
function drawNpc(n) {
  const x = (n.tx + 0.5) * TS, y = (n.ty + 0.5) * TS;
  drawAvatar(x, y, { body: n.color, skin: n.skin, hair: n.hair, dir: n.dir, idle: state.t * 1.5 + (n.phase || 0) });
  drawNameTag(x, y - 28, n.name, false);
}

/* --------------------------- OBJECTS --------------------------------- */
function objCenter(o) {
  return { cx: (o.tx + (o.fw || 1) / 2) * TS, cy: (o.ty + (o.fh || 1) / 2) * TS };
}
function drawObject(o) {
  const { cx, cy } = objCenter(o);
  const baseY = (o.ty + (o.fh || 1)) * TS;
  const glow = INTERACTIVE.has(o.type) && (o.text || o.body) && o.type !== "privateZone";

  switch (o.type) {
    case "tree": {
      const sway = Math.sin(state.t * 1.2 + cx * 0.05) * 1.5;
      shadow(cx, baseY - 5, 19, 7);
      ctx.beginPath(); rr(cx - 4, baseY - 24, 8, 22, 2); fillStroke("#7a5532", 2);
      ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(cx + 1, baseY - 23, 3, 20);
      // layered canopy
      ctx.beginPath(); ctx.arc(cx + sway, baseY - 32, 21, 0, 7); fillStroke("#357535", 2);
      ctx.fillStyle = "#458f45"; ctx.beginPath(); ctx.arc(cx - 9 + sway, baseY - 37, 13, 0, 7); ctx.arc(cx + 9 + sway, baseY - 35, 12, 0, 7); ctx.arc(cx + sway, baseY - 44, 13, 0, 7); ctx.fill();
      ctx.fillStyle = "#56a456"; ctx.beginPath(); ctx.arc(cx - 4 + sway, baseY - 42, 8, 0, 7); ctx.arc(cx + 7 + sway, baseY - 40, 7, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.beginPath(); ctx.arc(cx - 7 + sway, baseY - 44, 5, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.10)"; ctx.beginPath(); ctx.arc(cx + 11 + sway, baseY - 28, 7, 0, 7); ctx.fill();
      break;
    }
    case "palm": {
      const sway = Math.sin(state.t * 1.4 + cx * 0.05) * 2;
      shadow(cx, baseY - 4, 16, 6);
      ctx.fillStyle = "#a9763f"; ctx.beginPath(); ctx.moveTo(cx - 4, baseY - 2); ctx.quadraticCurveTo(cx - 2 + sway, baseY - 24, cx + 4 + sway, baseY - 40); ctx.lineTo(cx + 8 + sway, baseY - 38); ctx.quadraticCurveTo(cx + 2 + sway, baseY - 22, cx + 2, baseY - 2); ctx.closePath(); fillStroke("#a9763f", 1.5);
      const top = { x: cx + 6 + sway, y: baseY - 40 };
      ctx.fillStyle = "#3f9a54";
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(top.x + Math.cos(a) * 12, top.y + Math.sin(a) * 7, 12, 5, a, 0, 7); ctx.fill(); }
      ctx.fillStyle = "#caa54a"; ctx.beginPath(); ctx.arc(top.x, top.y, 4, 0, 7); ctx.fill();
      break;
    }
    case "statue": {
      shadow(cx, baseY - 3, 14, 5);
      ctx.fillStyle = "#bdae93"; rr(cx - 14, baseY - 17, 28, 5, 2); ctx.fill();
      ctx.fillStyle = "#cdbfa6"; rr(cx - 11, baseY - 14, 22, 13, 2); ctx.fill();      // pedestal
      ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(cx + 4, baseY - 13, 5, 11);
      ctx.fillStyle = "#b9c0c9"; rr(cx - 7, baseY - 33, 14, 19, 4); ctx.fill();        // bust
      ctx.beginPath(); ctx.arc(cx, baseY - 37, 7, 0, 7); ctx.fillStyle = "#c6ccd4"; ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fillRect(cx - 5, baseY - 32, 3, 15);
      ctx.fillStyle = "#9aa1ab"; ctx.fillRect(cx - 7, baseY - 16, 14, 2);
      break;
    }
    case "displayCase": {
      const col = o.color || "#c0a24a";
      shadow(cx, baseY - 3, 16, 5);
      ctx.fillStyle = "#6e5638"; rr(cx - 16, baseY - 12, 32, 11, 2); ctx.fill();        // wooden base
      ctx.fillStyle = "rgba(160,210,235,0.40)"; rr(cx - 15, baseY - 34, 30, 22, 3); ctx.fill(); // glass
      ctx.strokeStyle = "#cdd6dd"; ctx.lineWidth = 2; rr(cx - 15, baseY - 34, 30, 22, 3); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.moveTo(cx - 12, baseY - 32); ctx.lineTo(cx - 5, baseY - 32); ctx.lineTo(cx - 10, baseY - 14); ctx.lineTo(cx - 14, baseY - 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col; rr(cx - 6, baseY - 26, 12, 12, 2); ctx.fill();               // artifact
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(cx - 3, baseY - 24, 3, 8);
      break;
    }
    case "aquarium": {
      shadow(cx, baseY - 3, 18, 5);
      ctx.fillStyle = "#3a2c1c"; rr(cx - 18, baseY - 8, 36, 7, 2); ctx.fill();          // stand
      ctx.fillStyle = "#2b6f86"; rr(cx - 18, baseY - 26, 36, 18, 3); ctx.fill();        // water
      ctx.fillStyle = "rgba(255,255,255,0.18)"; rr(cx - 16, baseY - 24, 32, 4, 2); ctx.fill();
      ctx.strokeStyle = "#1d2730"; ctx.lineWidth = 2; rr(cx - 18, baseY - 26, 36, 18, 3); ctx.stroke();
      ctx.fillStyle = "#e0a24a"; ctx.beginPath(); ctx.arc(cx - 6 + Math.sin(state.t * 2) * 5, baseY - 17, 2.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#e6e055"; ctx.beginPath(); ctx.arc(cx + 7 + Math.cos(state.t * 1.6) * 5, baseY - 14, 2, 0, 7); ctx.fill();
      ctx.fillStyle = "#2f7d44"; ctx.fillRect(cx - 12, baseY - 14, 2, 6); ctx.fillRect(cx + 10, baseY - 13, 2, 5);
      break;
    }
    case "beachUmbrella": {
      shadow(cx, baseY - 3, 16, 5);
      ctx.strokeStyle = "#8a8f98"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, baseY - 2); ctx.lineTo(cx + 3, baseY - 34); ctx.stroke();
      const cols = ["#e0504f", "#f4f1ea"];
      for (let i = 0; i < 6; i++) {
        const a0 = Math.PI + (i / 6) * Math.PI, a1 = Math.PI + ((i + 1) / 6) * Math.PI;
        ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(cx + 3, baseY - 34); ctx.arc(cx + 3, baseY - 34, 22, a0, a1); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = "#b83b3b"; ctx.beginPath(); ctx.arc(cx + 3, baseY - 34, 3, 0, 7); ctx.fill();
      break;
    }
    case "sandcastle": {
      shadow(cx, baseY - 2, 12, 4);
      ctx.fillStyle = "#d8c074"; rr(cx - 12, baseY - 10, 24, 9, 2); ctx.fill();
      ctx.fillStyle = "#e0cb86"; rr(cx - 10, baseY - 18, 6, 10, 1); ctx.fill(); rr(cx + 4, baseY - 18, 6, 10, 1); ctx.fill(); rr(cx - 3, baseY - 23, 6, 15, 1); ctx.fill();
      ctx.fillStyle = "#b83b3b"; ctx.beginPath(); ctx.moveTo(cx, baseY - 23); ctx.lineTo(cx, baseY - 29); ctx.lineTo(cx + 6, baseY - 26); ctx.closePath(); ctx.fill();
      break;
    }
    case "flag": {
      shadow(cx, baseY - 2, 6, 3);
      ctx.fillStyle = "#9aa1ab"; ctx.fillRect(cx - 1, baseY - 46, 2, 46);
      ctx.fillStyle = "#cdd2d8"; ctx.beginPath(); ctx.arc(cx, baseY - 46, 2.5, 0, 7); ctx.fill();
      ctx.fillStyle = o.color || "#3b6fb0"; const wv = Math.sin(state.t * 3) * 2;
      ctx.beginPath(); ctx.moveTo(cx + 1, baseY - 45); ctx.lineTo(cx + 20, baseY - 43 + wv); ctx.lineTo(cx + 20, baseY - 33 + wv); ctx.lineTo(cx + 1, baseY - 35); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(cx + 3, baseY - 44, 2, 9);
      break;
    }
    case "pine": {
      shadow(cx, baseY - 4, 14, 6);
      ctx.fillStyle = "#7a5532"; ctx.fillRect(cx - 3, baseY - 12, 6, 10);
      drawPineLayers(cx, baseY - 12, "#2f6b3f");
      break;
    }
    case "bush":
      shadow(cx, baseY - 4, 14, 5);
      ctx.fillStyle = "#3f7d3f";
      ctx.beginPath(); ctx.arc(cx - 8, baseY - 8, 10, 0, 7); ctx.arc(cx + 8, baseY - 8, 10, 0, 7); ctx.arc(cx, baseY - 12, 12, 0, 7); ctx.fill();
      break;
    case "flower":
      for (let i = 0; i < 3; i++) {
        const fx = cx - 10 + i * 10, fy = baseY - 10 + (i % 2) * 6;
        ctx.strokeStyle = "#3f7d3f"; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy + 8); ctx.stroke();
        ctx.fillStyle = ["#e86a8c", "#f2c14e", "#7aa6e8"][i]; ctx.beginPath(); ctx.arc(fx, fy, 4, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(fx, fy, 1.4, 0, 7); ctx.fill();
      }
      break;
    case "lamp":
      shadow(cx, baseY - 2, 8, 4);
      ctx.fillStyle = "#3a3a3a"; ctx.fillRect(cx - 2, baseY - 30, 4, 28);
      ctx.fillStyle = "#ffe39a"; ctx.beginPath(); ctx.arc(cx, baseY - 32, 7, 0, 7); ctx.fill();
      ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(state.t * 3) * 0.08; ctx.fillStyle = "#fff3c4";
      ctx.beginPath(); ctx.arc(cx, baseY - 32, 16, 0, 7); ctx.fill(); ctx.restore();
      break;
    case "bench":
      shadow(cx, baseY - 4, 22, 5);
      ctx.fillStyle = "#6e4626"; ctx.fillRect(cx - 18, baseY - 8, 5, 8); ctx.fillRect(cx + 13, baseY - 8, 5, 8);
      rr(cx - 20, baseY - 26, 40, 6, 3); fillStroke("#8a5a33", 1.5);
      rr(cx - 20, baseY - 16, 40, 8, 3); fillStroke("#9a6539", 1.5);
      break;
    case "plant": {
      shadow(cx, baseY - 3, 12, 5);
      // terracotta pot
      ctx.fillStyle = "#b9703c"; ctx.beginPath();
      ctx.moveTo(cx - 9, baseY - 14); ctx.lineTo(cx + 9, baseY - 14); ctx.lineTo(cx + 7, baseY - 1); ctx.lineTo(cx - 7, baseY - 1); ctx.closePath(); fillStroke("#b9703c", 1.5);
      ctx.fillStyle = "#cf8550"; rr(cx - 10, baseY - 16, 20, 5, 2); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(cx + 3, baseY - 13, 4, 11);
      // layered fronds
      const lv = ["#2f7d44", "#3f9a54", "#4fae62"];
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.42;
        const lx = cx + Math.cos(a) * 13, ly = baseY - 16 + Math.sin(a) * 13;
        ctx.fillStyle = lv[i % 3]; ctx.beginPath();
        ctx.ellipse(lx, ly - 4, 4, 9, a + Math.PI / 2, 0, 7); ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.ellipse(cx - 3, baseY - 26, 3, 6, -0.3, 0, 7); ctx.fill();
      break;
    }
    case "pillar":
      shadow(cx, baseY - 2, 12, 4);
      ctx.fillStyle = "#e0d5c2"; rr(cx - 9, baseY - 46, 18, 46, 3); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.20)"; ctx.fillRect(cx - 6, baseY - 42, 3, 40);
      ctx.fillStyle = "rgba(0,0,0,0.10)"; ctx.fillRect(cx + 4, baseY - 42, 3, 40);
      ctx.fillStyle = "#cbbfa8"; rr(cx - 12, baseY - 50, 24, 7, 2); ctx.fill(); rr(cx - 12, baseY - 6, 24, 7, 2); ctx.fill();
      break;
    case "computer": {
      shadow(cx, baseY - 2, 18, 6);
      // office chair (tucked below, facing up to desk)
      ctx.fillStyle = "#2c303a"; ctx.beginPath(); ctx.ellipse(cx, baseY - 3, 10, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#3a3f4b"; rr(cx - 9, baseY - 12, 18, 10, 5); ctx.fill();
      // desk top
      ctx.fillStyle = "#caa06a"; rr(cx - 18, baseY - 22, 36, 11, 3); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(cx - 17, baseY - 21, 34, 2);
      ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(cx - 18, baseY - 13, 36, 2);
      // CPU tower
      ctx.fillStyle = "#2a2e38"; rr(cx - 17, baseY - 38, 8, 16, 1); ctx.fill();
      ctx.fillStyle = "#4cd0e0"; ctx.fillRect(cx - 15, baseY - 35, 4, 1); ctx.fillRect(cx - 15, baseY - 32, 4, 1);
      // monitor
      ctx.fillStyle = "#23262f"; rr(cx - 8, baseY - 40, 22, 16, 2); ctx.fill();
      const gl = Math.sin(state.t * 2.5 + cx * 0.1) * 0.5 + 0.5;
      const grd = ctx.createLinearGradient(cx - 6, baseY - 38, cx + 12, baseY - 26);
      grd.addColorStop(0, "#2b6cb0"); grd.addColorStop(1, "#7e3b8e");
      ctx.fillStyle = grd; rr(cx - 6, baseY - 38, 18, 12, 1); ctx.fill();
      // "code" lines on screen
      ctx.fillStyle = "rgba(120,230,170,0.9)"; ctx.fillRect(cx - 4, baseY - 36, 8, 1);
      ctx.fillStyle = "rgba(240,200,120,0.9)"; ctx.fillRect(cx - 4, baseY - 33, 11, 1);
      ctx.fillStyle = "rgba(150,200,250,0.9)"; ctx.fillRect(cx - 4, baseY - 30, 6, 1);
      ctx.fillStyle = `rgba(255,255,255,${0.10 + gl * 0.18})`; rr(cx - 6, baseY - 38, 18, 12, 1); ctx.fill();
      ctx.fillStyle = "#15171d"; ctx.fillRect(cx + 2, baseY - 25, 2, 2);
      // keyboard + mouse
      ctx.fillStyle = "#d7dbe2"; rr(cx - 7, baseY - 21, 13, 4, 1); ctx.fill();
      ctx.fillStyle = "#c3c8d0"; ctx.beginPath(); ctx.ellipse(cx + 10, baseY - 19, 2, 3, 0, 0, 7); ctx.fill();
      break;
    }
    case "artFrame": {
      const col = o.color || "#b8742f";
      shadow(cx, baseY - 3, 12, 4);
      ctx.strokeStyle = "#7d5733"; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx - 8, baseY); ctx.lineTo(cx - 4, baseY - 24); ctx.moveTo(cx + 8, baseY); ctx.lineTo(cx + 4, baseY - 24); ctx.stroke();
      ctx.lineCap = "butt";
      ctx.fillStyle = "#caa36a"; rr(cx - 14, baseY - 42, 28, 24, 3); ctx.fill();
      ctx.fillStyle = col; rr(cx - 10, baseY - 38, 20, 16, 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath();
      ctx.moveTo(cx - 8, baseY - 24); ctx.lineTo(cx - 2, baseY - 33); ctx.lineTo(cx + 2, baseY - 28); ctx.lineTo(cx + 8, baseY - 24); ctx.closePath(); ctx.fill();
      break;
    }
    case "fountain": {
      const w = (o.fw || 2) * TS, h = (o.fh || 2) * TS;
      const fx = o.tx * TS, fy = o.ty * TS;
      const fcy = fy + h / 2;
      const rOuter = Math.min(w, h) / 2 - 6;
      shadow(cx, fy + h - 8, rOuter * 0.95, 9);
      // stone basin
      ctx.beginPath(); ctx.ellipse(cx, fcy, rOuter, rOuter * 0.82, 0, 0, 7); fillStroke("#cfc8ba", 2.5);
      ctx.beginPath(); ctx.ellipse(cx, fcy, rOuter - 7, (rOuter - 7) * 0.82, 0, 0, 7); ctx.fillStyle = "#b8b1a3"; ctx.fill();
      // water
      ctx.beginPath(); ctx.ellipse(cx, fcy, rOuter - 12, (rOuter - 12) * 0.8, 0, 0, 7); ctx.fillStyle = C.water; ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath(); ctx.ellipse(cx - 6, fcy - 5, (rOuter - 18), (rOuter - 18) * 0.4, 0, 0, 7); ctx.fill();
      // center pillar + spout
      ctx.fillStyle = "#cfc8ba"; ctx.beginPath(); ctx.ellipse(cx, fcy, 7, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#bdb6a8"; ctx.fillRect(cx - 3, fcy - 16, 6, 16);
      ctx.beginPath(); ctx.ellipse(cx, fcy - 16, 6, 4, 0, 0, 7); ctx.fillStyle = "#cfc8ba"; ctx.fill();
      // droplets
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const t2 = (state.t * 2.2 + i) % 2;
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * (4 + t2 * 12), fcy - 16 + t2 * 14 - 6, 2 - t2 * 0.6, 0, 7); ctx.fill();
      }
      break;
    }
    case "sofa": {
      const sc = o.color || "#7d8db8";
      shadow(cx, baseY - 3, 24, 6);
      ctx.fillStyle = sc; rr(cx - 22, baseY - 14, 44, 13, 5); ctx.fill();           // base
      ctx.fillStyle = sc; rr(cx - 22, baseY - 26, 44, 14, 7); ctx.fill();           // backrest
      ctx.fillStyle = "rgba(0,0,0,0.12)"; rr(cx - 22, baseY - 16, 44, 4, 3); ctx.fill();
      const cu = "rgba(255,255,255,0.16)";
      ctx.fillStyle = cu; rr(cx - 19, baseY - 13, 17, 9, 4); ctx.fill(); rr(cx + 2, baseY - 13, 17, 9, 4); ctx.fill();
      ctx.fillStyle = sc; rr(cx - 23, baseY - 22, 6, 18, 3); ctx.fill(); rr(cx + 17, baseY - 22, 6, 18, 3); ctx.fill(); // arms
      ctx.fillStyle = "#3a2c1c"; ctx.fillRect(cx - 19, baseY - 2, 4, 3); ctx.fillRect(cx + 15, baseY - 2, 4, 3);
      break;
    }
    case "table":
      shadow(cx, baseY - 3, 16, 5);
      ctx.fillStyle = "#3a2c1c"; ctx.fillRect(cx - 14, baseY - 9, 3, 8); ctx.fillRect(cx + 11, baseY - 9, 3, 8);
      ctx.fillStyle = "#a9763f"; rr(cx - 16, baseY - 18, 32, 11, 5); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fillRect(cx - 14, baseY - 17, 28, 2);
      ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(cx - 16, baseY - 9, 32, 2);
      break;
    case "chair": {
      const cc = o.color || "#33373f";   // dark office chair
      shadow(cx, baseY - 2, 9, 4);
      ctx.fillStyle = cc; ctx.beginPath(); ctx.ellipse(cx, baseY - 4, 9, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#2a2e35"; ctx.fillRect(cx - 1, baseY - 7, 2, 4);
      ctx.fillStyle = cc; rr(cx - 8, baseY - 19, 16, 13, 5); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.10)"; rr(cx - 6, baseY - 17, 12, 4, 2); ctx.fill();
      break;
    }
    case "rugStool":
      shadow(cx, baseY - 2, 9, 3);
      ctx.fillStyle = "#c79a5f"; ctx.beginPath(); ctx.ellipse(cx, baseY - 8, 9, 7, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.ellipse(cx - 2, baseY - 10, 4, 3, 0, 0, 7); ctx.fill();
      break;
    case "studentDesk":
      shadow(cx, baseY - 3, 16, 5);
      ctx.fillStyle = "#2c303a"; ctx.beginPath(); ctx.ellipse(cx, baseY - 4, 8, 5, 0, 0, 7); ctx.fill();  // chair seat
      ctx.fillStyle = "#caa06a"; rr(cx - 16, baseY - 17, 32, 11, 3); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fillRect(cx - 15, baseY - 16, 30, 2);
      ctx.fillStyle = "#23262f"; rr(cx - 7, baseY - 30, 16, 11, 2); ctx.fill();   // monitor
      ctx.fillStyle = "#4f8fd0"; rr(cx - 5, baseY - 28, 12, 7, 1); ctx.fill();
      ctx.fillStyle = "#15171d"; ctx.fillRect(cx, baseY - 19, 2, 2);
      ctx.fillStyle = "#d7dbe2"; rr(cx - 6, baseY - 15, 12, 3, 1); ctx.fill();    // keyboard
      break;
    case "teacherDesk": {
      const w = (o.fw || 2) * TS;
      shadow(cx, baseY - 4, w * 0.4, 6);
      ctx.fillStyle = "#7d5733"; rr(o.tx * TS + 6, baseY - 24, w - 12, 22, 5); ctx.fill();
      break;
    }
    case "podium":
      shadow(cx, baseY - 3, 12, 4);
      ctx.fillStyle = "#9c7044"; rr(cx - 10, baseY - 26, 20, 26, 4); ctx.fill();
      ctx.fillStyle = "#caa36a"; rr(cx - 13, baseY - 30, 26, 8, 3); ctx.fill();
      break;
    case "whiteboard": {
      const w = (o.fw || 6) * TS;
      const fx = o.tx * TS;
      ctx.fillStyle = "#3a3a3a"; ctx.fillRect(fx + 6, o.ty * TS + 6, w - 12, 12);
      ctx.fillStyle = "#fbfdff"; rr(fx + 10, o.ty * TS + 8, w - 20, TS - 14, 4); ctx.fill();
      ctx.strokeStyle = "#9fb6d4"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(fx + 22, o.ty * TS + 20); ctx.lineTo(fx + w - 40, o.ty * TS + 20);
      ctx.moveTo(fx + 22, o.ty * TS + 30); ctx.lineTo(fx + w - 60, o.ty * TS + 30); ctx.stroke();
      ctx.fillStyle = "#2f6e7a"; ctx.font = "bold 12px Poppins, sans-serif";
      ctx.fillText("▶ Live class", fx + 22, o.ty * TS + 44);
      break;
    }
    case "projector":
      shadow(cx, baseY - 4, 16, 5);
      ctx.fillStyle = "#2b2f3a"; rr(cx - 18, baseY - 30, 36, 26, 4); ctx.fill();
      ctx.fillStyle = "#6fd0ff"; rr(cx - 14, baseY - 26, 28, 18, 3); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "10px Poppins"; ctx.fillText("RESOURCES", cx - 13, baseY - 14);
      break;
    case "bookshelf":
      shadow(cx, baseY - 4, 16, 5);
      ctx.fillStyle = "#7d5733"; rr(cx - 16, baseY - 34, 32, 32, 3); ctx.fill();
      for (let r = 0; r < 3; r++) {
        ctx.fillStyle = "#5a3d22"; ctx.fillRect(cx - 14, baseY - 32 + r * 10, 28, 2);
        for (let b = 0; b < 5; b++) { ctx.fillStyle = ["#d35f5f", "#5f8fd3", "#5fd38f", "#d3b65f", "#a05fd3"][(r + b) % 5]; ctx.fillRect(cx - 13 + b * 5.4, baseY - 30 + r * 10, 4, 8); }
      }
      break;
    case "kiosk":
    case "directory":
      shadow(cx, baseY - 3, 12, 4);
      ctx.fillStyle = "#34597d"; rr(cx - 12, baseY - 30, 24, 28, 4); ctx.fill();
      ctx.fillStyle = "#9fe0ff"; rr(cx - 9, baseY - 26, 18, 16, 3); ctx.fill();
      ctx.fillStyle = "#1d3a55"; ctx.font = "9px Poppins"; ctx.fillText("ⓘ", cx - 3, baseY - 14);
      break;
    case "noticeboard":
    case "eventsBoard":
      shadow(cx, baseY - 3, 16, 4);
      ctx.fillStyle = "#7d5733"; ctx.fillRect(cx - 4, baseY - 14, 8, 14);
      ctx.fillStyle = "#caa36a"; rr(cx - 20, baseY - 38, 40, 26, 4); ctx.fill();
      ctx.fillStyle = "#fff"; rr(cx - 16, baseY - 34, 14, 9, 1); ctx.fill(); rr(cx + 2, baseY - 34, 14, 9, 1); ctx.fill();
      rr(cx - 16, baseY - 23, 14, 9, 1); ctx.fill(); rr(cx + 2, baseY - 23, 14, 9, 1); ctx.fill();
      ctx.fillStyle = "#e86a6a"; ctx.beginPath(); ctx.arc(cx - 9, baseY - 35, 2, 0, 7); ctx.fill();
      break;
    case "coffee":
      shadow(cx, baseY - 3, 12, 4);
      ctx.fillStyle = "#5a3d22"; rr(cx - 12, baseY - 22, 24, 20, 4); ctx.fill();
      ctx.fillStyle = "#d9b38c"; rr(cx - 8, baseY - 18, 16, 8, 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, baseY - 28, 4, 0, 7); ctx.fill();
      break;
    case "giftStand":
      shadow(cx, baseY - 3, 14, 4);
      ctx.fillStyle = "#b23b3b"; rr(cx - 14, baseY - 26, 28, 24, 4); ctx.fill();
      ctx.fillStyle = "#f0c33c"; ctx.fillRect(cx - 3, baseY - 26, 6, 24); ctx.fillRect(cx - 14, baseY - 16, 28, 6);
      break;
    case "signpost":
      shadow(cx, baseY - 3, 8, 3);
      ctx.fillStyle = "#7d5733"; ctx.fillRect(cx - 3, baseY - 28, 6, 28);
      ctx.fillStyle = "#caa36a"; rr(cx - 16, baseY - 34, 32, 16, 3); ctx.fill();
      ctx.fillStyle = "#5a3d22"; ctx.font = "bold 11px Poppins"; ctx.fillText("ⓘ info", cx - 13, baseY - 23);
      break;
    case "picnic": {
      const w = (o.fw || 2) * TS;
      shadow(cx, baseY - 3, w * 0.4, 5);
      ctx.fillStyle = "#a8794a"; rr(o.tx * TS + 6, baseY - 18, w - 12, 14, 4); ctx.fill();
      ctx.fillStyle = "#c79a5f"; ctx.fillRect(o.tx * TS + 4, baseY - 12, w - 8, 5);
      break;
    }
    case "stage": {
      const w = (o.fw || 3) * TS, h = (o.fh || 2) * TS;
      const fx = o.tx * TS, fy = o.ty * TS;
      shadow(cx, fy + h - 6, w * 0.4, 8);
      ctx.fillStyle = "#6e4626"; rr(fx + 6, fy + 10, w - 12, h - 14, 6); ctx.fill();
      ctx.fillStyle = "#8a5a33"; rr(fx + 6, fy + 10, w - 12, 8, 4); ctx.fill();
      ctx.fillStyle = "#b23b3b"; ctx.fillRect(fx + 10, fy + 2, w - 20, 8);
      break;
    }
    case "cabin": {
      const w = (o.fw || 3) * TS, h = (o.fh || 3) * TS;
      const fx = o.tx * TS, fy = o.ty * TS;
      shadow(cx, fy + h - 8, w * 0.42, 10);
      ctx.fillStyle = "#8a5a33"; rr(fx + 8, fy + h * 0.4, w - 16, h * 0.55, 4); ctx.fill();
      ctx.fillStyle = "#b23b3b"; ctx.beginPath();
      ctx.moveTo(fx + 4, fy + h * 0.42); ctx.lineTo(cx, fy + 6); ctx.lineTo(fx + w - 4, fy + h * 0.42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath();
      ctx.moveTo(fx + 4, fy + h * 0.42); ctx.lineTo(cx, fy + 14); ctx.lineTo(fx + w - 4, fy + h * 0.42); ctx.lineTo(fx + w - 4, fy + h * 0.42 + 6); ctx.lineTo(fx + 4, fy + h * 0.42 + 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5a3d22"; rr(cx - 8, fy + h - 26, 16, 22, 3); ctx.fill();
      ctx.fillStyle = "#ffe39a"; rr(fx + 14, fy + h * 0.55, 12, 12, 2); ctx.fill();
      break;
    }
    case "snowman":
      shadow(cx, baseY - 4, 12, 5);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, baseY - 8, 11, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, baseY - 24, 8, 0, 7); ctx.fill();
      ctx.fillStyle = "#2a2a2a"; ctx.beginPath(); ctx.arc(cx - 3, baseY - 26, 1.4, 0, 7); ctx.arc(cx + 3, baseY - 26, 1.4, 0, 7); ctx.fill();
      ctx.fillStyle = "#e8862b"; ctx.beginPath(); ctx.moveTo(cx, baseY - 23); ctx.lineTo(cx + 7, baseY - 22); ctx.lineTo(cx, baseY - 21); ctx.fill();
      ctx.fillStyle = "#b23b3b"; ctx.fillRect(cx - 7, baseY - 33, 14, 4); ctx.fillRect(cx - 5, baseY - 40, 10, 8);
      break;
    case "gift": {
      const col = o.color || "#d35f5f";
      shadow(cx, baseY - 3, 10, 4);
      ctx.fillStyle = col; rr(cx - 10, baseY - 18, 20, 16, 3); ctx.fill();
      ctx.fillStyle = "#f5e6b0"; ctx.fillRect(cx - 2, baseY - 18, 4, 16); ctx.fillRect(cx - 10, baseY - 12, 20, 4);
      break;
    }
    case "xmasTree": {
      const big = o.big;
      shadow(cx, baseY - 4, big ? 22 : 14, 7);
      ctx.fillStyle = "#7a5532"; ctx.fillRect(cx - 5, baseY - 16, 10, 14);
      drawPineLayers(cx, baseY - 16, "#2f6b3f", big ? 1.5 : 1);
      // twinkling lights
      const n = big ? 16 : 9;
      for (let i = 0; i < n; i++) {
        const ph = i * 1.7;
        const tw = Math.sin(state.t * 4 + ph) * 0.5 + 0.5;
        const ang = i * 2.39, rad = (10 + (i % 4) * 9) * (big ? 1.5 : 1);
        const lx = cx + Math.cos(ang) * rad * 0.6;
        const ly = baseY - 20 - (i / n) * (big ? 70 : 44) + Math.sin(ang) * 4;
        ctx.fillStyle = ["#ff5b5b", "#ffd45b", "#5bff9a", "#5bd0ff"][i % 4];
        ctx.globalAlpha = 0.4 + tw * 0.6;
        ctx.beginPath(); ctx.arc(lx, ly, 2.4, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
      // star
      ctx.fillStyle = "#ffe14d"; drawStar(cx, baseY - (big ? 92 : 60), 6, 5);
      break;
    }
    case "banner": break;  // removed: area name shown in HUD + entry flash
    case "privateZone": {
      const w = (o.fw || 3) * TS, h = (o.fh || 4) * TS;
      const fx = o.tx * TS, fy = o.ty * TS;
      ctx.save();
      ctx.fillStyle = "rgba(140,123,209,0.12)"; rr(fx + 4, fy + 4, w - 8, h - 8, 10); ctx.fill();
      ctx.setLineDash([8, 6]); ctx.strokeStyle = "rgba(120,100,200,0.6)"; ctx.lineWidth = 2;
      rr(fx + 4, fy + 4, w - 8, h - 8, 10); ctx.stroke();
      ctx.restore();
      // table + chairs
      ctx.fillStyle = "#9c7044"; rr(cx - 16, cy - 10, 32, 18, 6); ctx.fill();
      ctx.fillStyle = "#8a6a44";
      ctx.beginPath(); ctx.arc(cx - 22, cy, 6, 0, 7); ctx.arc(cx + 22, cy, 6, 0, 7); ctx.arc(cx, cy - 18, 6, 0, 7); ctx.arc(cx, cy + 18, 6, 0, 7); ctx.fill();
      ctx.fillStyle = "#6a5aa8"; ctx.font = "bold 11px Poppins"; ctx.textAlign = "center";
      ctx.fillText("🔒 " + (o.label || "Private"), cx, fy + 18); ctx.textAlign = "left";
      break;
    }
    case "portalArch": {
      const w = (o.fw || 3) * TS;
      const fx = o.tx * TS, fy = o.ty * TS;
      drawPortalGfx(fx, fy, w, TS, o.color || "#8b7bd6");
      drawPortalLabel(o, fx + w / 2, fy - 2);
      break;
    }
    case "portalDoor": {
      const fx = o.tx * TS, fy = o.ty * TS;
      drawPortalGfx(fx, fy, TS, TS, o.color || "#8b7bd6");
      drawPortalLabel(o, fx + TS / 2, fy - 2);
      break;
    }
  }

  // interactive glow ring + bobbing prompt marker
  if (glow) {
    const pulse = Math.sin(state.t * 4) * 0.5 + 0.5;
    ctx.save();
    ctx.globalAlpha = 0.25 + pulse * 0.25;
    ctx.strokeStyle = "#ffe14d"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, baseY - 2, 18, 7, 0, 0, 7); ctx.stroke();
    ctx.restore();
    if (state.near === o) {
      ctx.fillStyle = "#ffe14d";
      const by = baseY - 50 - Math.sin(state.t * 5) * 3;
      ctx.font = "bold 14px Poppins"; ctx.textAlign = "center";
      ctx.fillText("E", cx, by + 5);
      ctx.strokeStyle = "#a8862b"; ctx.lineWidth = 1; ctx.strokeRect(cx - 9, by - 10, 18, 18);
      ctx.textAlign = "left";
    }
  }
}

function drawPortalGfx(fx, fy, w, h, col) {
  const pulse = Math.sin(state.t * 3) * 0.5 + 0.5;
  const archR = Math.min(w / 2 - 4, h * 0.45);
  shadow(fx + w / 2, fy + h - 3, w * 0.42, 5);
  // stone frame (arched top)
  ctx.beginPath();
  ctx.moveTo(fx + 4, fy + h - 2);
  ctx.lineTo(fx + 4, fy + archR + 4);
  ctx.arc(fx + w / 2, fy + archR + 4, w / 2 - 4, Math.PI, 0);
  ctx.lineTo(fx + w - 4, fy + h - 2);
  ctx.closePath();
  fillStroke("#7d6650", 2.5);
  // glowing interior
  const grd = ctx.createLinearGradient(0, fy, 0, fy + h);
  grd.addColorStop(0, "#ffffff"); grd.addColorStop(0.45, col); grd.addColorStop(1, "rgba(255,255,255,0.25)");
  ctx.save(); ctx.globalAlpha = 0.72 + pulse * 0.22;
  ctx.beginPath();
  ctx.moveTo(fx + 11, fy + h - 6);
  ctx.lineTo(fx + 11, fy + archR + 6);
  ctx.arc(fx + w / 2, fy + archR + 6, w / 2 - 11, Math.PI, 0);
  ctx.lineTo(fx + w - 11, fy + h - 6);
  ctx.closePath();
  ctx.fillStyle = grd; ctx.fill();
  ctx.restore();
  // sparkle
  ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.font = `${Math.round(h * 0.34)}px Poppins`;
  ctx.textAlign = "center"; ctx.fillText("✦", fx + w / 2, fy + h / 2 + h * 0.12); ctx.textAlign = "left";
}
function drawPortalLabel(o, x, y) {
  ctx.save();
  ctx.font = "11px Poppins"; ctx.textAlign = "center";
  const w = ctx.measureText(o.label).width + 16;
  ctx.fillStyle = "rgba(20,24,34,0.78)"; rr(x - w / 2, y - 18, w, 16, 8); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText(o.label, x, y - 6);
  ctx.restore(); ctx.textAlign = "left";
}
function drawPineLayers(cx, baseY, col, scale = 1) {
  const s = scale;
  for (let i = 0; i < 3; i++) {
    const yy = baseY - i * 14 * s;
    const wsz = (26 - i * 6) * s;
    ctx.fillStyle = i % 2 ? col : "#3a7d4a";
    ctx.beginPath();
    ctx.moveTo(cx - wsz, yy); ctx.lineTo(cx, yy - 22 * s); ctx.lineTo(cx + wsz, yy); ctx.closePath(); ctx.fill();
  }
}
function drawStar(cx, cy, outer, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? outer : outer / 2;
    const a = (Math.PI / points) * i - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill();
}

/* ----------------------------- SNOW ---------------------------------- */
let snowflakes = [];
function initSnow() {
  snowflakes = [];
  for (let i = 0; i < 90; i++)
    snowflakes.push({ x: Math.random() * 2000, y: Math.random() * 1200, r: 1 + Math.random() * 2.5, s: 12 + Math.random() * 24, ph: Math.random() * 7 });
}
function drawSnow() {
  const r = room();
  for (const f of snowflakes) {
    f.y += f.s * (1 / 60);
    f.x += Math.sin(state.t + f.ph) * 0.3;
    if (f.y > r.h * TS) f.y = -5;
    if (f.x > r.w * TS) f.x = 0; if (f.x < 0) f.x = r.w * TS;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
  }
}

/* ----------------------------- MINIMAP ------------------------------- */
function drawMinimap() {
  const r = room();
  const pad = 14, maxW = 168, maxH = 116;
  const sc = Math.min(maxW / r.w, maxH / r.h);
  const mw = r.w * sc, mh = r.h * sc;
  const ox = VW - mw - pad - 8, oy = VH - mh - pad - 8;
  ctx.save();
  ctx.fillStyle = "rgba(20,24,34,0.80)";
  rr(ox - 8, oy - 24, mw + 16, mh + 32, 12); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = '600 11px Poppins, sans-serif'; ctx.textAlign = "left";
  ctx.fillText("MAP · " + r.name, ox - 2, oy - 9);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const ch = r.g[y][x];
    let col = "#caa063";
    if (ch === "#") col = "#9c8765"; else if (ch === "w") col = "#4f97c4";
    else if (ch === "s" || ch === "i") col = "#dde6ef"; else if (ch === "g") col = "#74a44f";
    else if (ch === "p") col = "#cbb992"; else if (ch === "c") col = "#566aa0";
    else if (ch === "r") col = "#b1614a"; else if (ch === "t") col = "#dde2ea";
    else if (ch === "a") col = "#e3cd88"; else if (ch === "f") col = "#c08a4e";
    ctx.fillStyle = col; ctx.fillRect(ox + x * sc, oy + y * sc, sc + 0.6, sc + 0.6);
  }
  for (const o of r.objs) {
    if (o.type === "portalArch" || o.type === "portalDoor") {
      ctx.fillStyle = o.color || "#ffd45b";
      ctx.fillRect(ox + o.tx * sc, oy + o.ty * sc, Math.max(3, (o.fw || 1) * sc), Math.max(3, sc));
    }
  }
  for (const n of (r.npcs || [])) {
    ctx.fillStyle = n.color; ctx.beginPath();
    ctx.arc(ox + (n.tx + 0.5) * sc, oy + (n.ty + 0.5) * sc, 2.4, 0, 7); ctx.fill();
  }
  const px = ox + (state.player.x / TS) * sc, py = oy + (state.player.y / TS) * sc;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, 3.4, 0, 7); ctx.fill();
  ctx.strokeStyle = "#3ec46d"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 5.5, 0, 7); ctx.stroke();
  ctx.restore();
}

/* -------------------- PRESENCE / PROXIMITY VIDEO --------------------- */
let presenceKey = "";
function updatePresence() {
  const r = room();
  const near = [];
  for (const n of (r.npcs || [])) {
    const d = Math.hypot((n.tx + 0.5) * TS - state.player.x, (n.ty + 0.5) * TS - state.player.y);
    if (d < TS * 3.2) near.push(n);
  }
  const key = near.map((n) => n.name).join("|");
  if (key === presenceKey) return;
  presenceKey = key;
  renderVideoBar(near);
}
function renderVideoBar(near) {
  const bar = document.getElementById("videobar");
  if (!near.length) { bar.classList.remove("show"); return; }
  const tiles = [{ name: "You", color: "#3ec46d", you: true }].concat(
    near.slice(0, 4).map((n) => ({ name: n.name, color: n.color }))
  );
  bar.innerHTML = tiles.map((t) => {
    const initial = t.name.replace(/[^A-Za-z]/g, "").charAt(0) || "•";
    return `<div class="vtile${t.you ? " you" : ""}">
      <div class="vface" style="background:linear-gradient(135deg,${t.color},#1d2330)">${initial}</div>
      <div class="vname">${t.you ? "🟢 You" : escapeHtml(t.name)}</div>
      <div class="vmic">🎤</div>
    </div>`;
  }).join("");
  bar.classList.add("show");
}

/* ===================================================================== */
/*                           UI / MODALS                                 */
/* ===================================================================== */
function showBubble(title, text) {
  const b = document.getElementById("bubble");
  b.querySelector(".b-title").textContent = title || "Sign";
  b.querySelector(".b-text").textContent = text;
  b.classList.add("show");
  clearTimeout(showBubble._t);
  showBubble._t = setTimeout(() => b.classList.remove("show"), 6000);
}
function openModal(o) {
  const m = document.getElementById("modal");
  m.querySelector(".m-title").textContent = o.title || "Info";
  const body = m.querySelector(".m-body");
  body.innerHTML = "";
  if (o.body) {
    const p = document.createElement("p");
    p.style.whiteSpace = "pre-line";
    p.textContent = o.body;
    body.appendChild(p);
  }
  // embedded form / iframe preview (mock to keep demo offline-friendly)
  if (o.formUrl) {
    const box = document.createElement("div");
    box.className = "embed-mock";
    box.innerHTML = `<div class="embed-bar"><span>🔗 Embedded form</span><span class="embed-url">${escapeHtml(o.formUrl)}</span></div>
      <div class="embed-fields">
        <label>Your name<input placeholder="Type here…"></label>
        <label>Email<input placeholder="you@example.com"></label>
        <label>Notes<textarea placeholder="Tell us more…"></textarea></label>
        <button class="embed-submit">Submit</button>
      </div>
      <p class="embed-note">In the live Gather build this is your real Google Form / Airtable, embedded inline so members never leave the space.</p>`;
    box.querySelector(".embed-submit").addEventListener("click", () => {
      box.querySelector(".embed-fields").innerHTML = "<p class='ok'>✅ Thanks! Your response was recorded (demo).</p>";
    });
    body.appendChild(box);
  }
  if (o.links && o.links.length) {
    const wrap = document.createElement("div");
    wrap.className = "m-links";
    for (const l of o.links) {
      const a = document.createElement("a");
      a.href = l.url; a.target = "_blank"; a.rel = "noopener";
      a.className = "m-link"; a.textContent = "🔗 " + l.label;
      wrap.appendChild(a);
    }
    body.appendChild(wrap);
  }
  m.classList.add("show");
}
function closeModal() {
  document.getElementById("modal").classList.remove("show");
  document.getElementById("areas").classList.remove("show");
}
function escapeHtml(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function flashArea(name) {
  const el = document.getElementById("area-flash");
  el.textContent = name;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  document.getElementById("hud-area").textContent = name;
}

/* ---- fast-travel "Areas" menu ---- */
function toggleAreas() {
  const a = document.getElementById("areas");
  a.classList.toggle("show");
}
function buildAreasMenu() {
  const list = document.getElementById("areas-list");
  const order = [
    ["spawn", "🪑 Main Spawn"], ["hub", "✦ Connection Hub"], ["commons", "🌳 Common Ground"],
    ["hq", "🏢 Community HQ"], ["hasu", "🏛️ HASU Legacy Hall"], ["pti", "🎴 PTI Legacy Hall"],
    ["outdoor", "🌿 Outdoor Areas"], ["beach", "🏖️ Beach & Park"],
  ];
  for (const [key, label] of order) {
    const b = document.createElement("button");
    b.textContent = label;
    b.addEventListener("click", () => {
      state.roomKey = key; spawnAt(...rooms[key].spawn);
      state.cam.x = clampCamX(); state.cam.y = clampCamY();
      closeModal(); flashArea(rooms[key].name);
    });
    list.appendChild(b);
  }
}

/* ----------------------------- INTRO --------------------------------- */
function dismissIntro() {
  document.getElementById("intro").classList.add("hide");
  state.paused = false;
  flashArea(room().name);
}

/* ===================================================================== */
/*                            MAIN LOOP                                  */
/* ===================================================================== */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.t += dt;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

/* ----------------------------- BOOT ---------------------------------- */
function boot() {
  initSnow();
  bindDpad();
  buildAreasMenu();
  document.getElementById("intro-start").addEventListener("click", dismissIntro);
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  document.getElementById("btn-areas").addEventListener("click", toggleAreas);
  document.getElementById("areas-close").addEventListener("click", () => document.getElementById("areas").classList.remove("show"));
  // fill campus name
  document.querySelectorAll("[data-campus]").forEach((el) => el.textContent = CONFIG.campusName);
  document.querySelectorAll("[data-tagline]").forEach((el) => el.textContent = CONFIG.tagline);
  state.cam.x = clampCamX(); state.cam.y = clampCamY();
  requestAnimationFrame(loop);
}
boot();
