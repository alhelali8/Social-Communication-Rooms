/* =====================================================================
   Paper Tole Institute — Virtual Campus
   Image-based interactive campus: the real render is the environment.
   Click numbered spaces to zoom in; an info card shows a close-up of
   that space plus its description, links and sign-up forms.
   ===================================================================== */
"use strict";

/* Replace these with the client's real links / Google Forms / Sheets. */
const LINKS = {
  website: "https://example.org",
  discord: "https://discord.gg/your-invite",
  classroom: "https://meet.google.com/your-room",
  handbook: "https://example.org/handbook",
  eventForm: "https://docs.google.com/forms/d/e/your-form/viewform?embedded=true",
};

/* x,y are percent positions of the marker on the render (0..100). */
const SPACES = [
  { id: "commons", n: "1", x: 47.0, y: 28.5, title: "Community Commons", sub: "Spawn Point · The Heart of Campus",
    blurb: "Gather, connect, and belong. The central plaza where every visitor arrives and every path begins.",
    links: [{ label: "Join our community", url: LINKS.discord }], form: true },
  { id: "atrium", n: "2", x: 23.0, y: 11.5, title: "Founder Timeline Atrium", sub: "Stories · Legacy · Inspiration",
    blurb: "Explore the stories and legacies of our founders — milestones and memories that preserve the past and inspire the future.",
    links: [{ label: "Read our story", url: LINKS.website }] },
  { id: "gallery", n: "3", x: 67.5, y: 13.0, title: "Gallery & Discussion Room", sub: "Art · Exhibits · Conversations",
    blurb: "Art, exhibits, and meaningful conversations. Each work opens a story — a space made for talks and critiques.",
    links: [{ label: "Open the gallery", url: LINKS.website }] },
  { id: "toleway", n: "4", x: 20.0, y: 28.5, title: "Toleway Shop", sub: "Resources · Tools · Books",
    blurb: "Tools, books, and resources — multiple ways of creating, all in one place. Browse and borrow what you need.",
    links: [{ label: "Browse resources", url: LINKS.handbook }] },
  { id: "media", n: "5", x: 67.5, y: 28.5, title: "Media Center", sub: "Focus · Connected Zones",
    blurb: "Quiet, connected spaces for focused work, recording and media. Screens embed live video, streams or slides.",
    links: [{ label: "Open media library", url: LINKS.website }] },
  { id: "hall", n: "6", x: 47.0, y: 11.5, title: "Community Hall", sub: "Keynotes · Presentations · Events",
    blurb: "Keynotes, presentations, and community events on a full stage with audience seating and a live screen.",
    links: [{ label: "View programme", url: LINKS.website }, { label: "Watch live", url: LINKS.classroom }] },
  { id: "studio1", n: "7", x: 20.0, y: 45.0, title: "Teaching Studio 1", sub: "Crafting & Demo Studio",
    blurb: "A hands-on studio for live demonstrations and small-group making.",
    bullets: ["Large demo table", "Tools & materials", "Live crafting instruction", "Hands-on workshops", "Small group learning"],
    links: [{ label: "Join a workshop", url: LINKS.classroom }] },
  { id: "studio2", n: "8", x: 33.0, y: 61.0, title: "Teaching Studio 2", sub: "Computer Learning Lab",
    blurb: "A digital classroom of workstations for research, writing and virtual training.",
    bullets: ["Computer workstations", "Online research & AI tools", "Great writing workshops", "Digital presentation projects", "Virtual classes & training"],
    links: [{ label: "Join live class", url: LINKS.classroom }] },
  { id: "studio3", n: "9", x: 60.0, y: 61.0, title: "Teaching Studio 3", sub: "Round Table · Mini Lecture Hall",
    blurb: "A flexible room for talks, forums and roundtable discussion.",
    bullets: ["Mini lecture hall seating", "Presentations & talks", "Roundtable discussions", "Guest speakers", "Community forums"],
    links: [{ label: "View the schedule", url: LINKS.website }] },
  { id: "navigation", n: "10", x: 70.0, y: 52.0, title: "Navigation Hub", sub: "Direction · Wayfinding · Help",
    blurb: "Find your way around campus — clear wayfinding, a help desk and directions to every space.",
    links: [{ label: "Ask for help", url: LINKS.discord }] },
  { id: "mastery", n: "11", x: 16.0, y: 61.0, title: "Mastery Room", sub: "Expert Insights · Deep Dives",
    blurb: "Advanced sessions for those going deeper, led by experts.",
    bullets: ["Expert-led workshops", "Advanced skill building", "Deep dive sessions", "Strategy & mastery", "Certified learning paths"],
    links: [{ label: "Browse mastery tracks", url: LINKS.handbook }] },
  { id: "technique", n: "12", x: 72.0, y: 61.0, title: "Technique Room", sub: "Practice · Refine · Apply",
    blurb: "A practice space to refine technique and build confidence.",
    bullets: ["Skill practice stations", "Step-by-step labs", "Refine techniques", "Apply what you learn", "Build with confidence"],
    links: [{ label: "Start a lab", url: LINKS.website }] },
  { id: "hub", n: "✦", x: 47.0, y: 43.0, title: "Connection Hub", sub: "Expansion Gateway",
    blurb: "The transport center that links every space and reaches future expansions: Contribute Campus, Wellness Village, Veterans Community, Education Campus, Student Campus and Partner Worlds — plus the Live Events Calendar, Campus Spaces Directory and Add New World.",
    links: [{ label: "Live events calendar", url: LINKS.website }] },
  { id: "arrival", n: "◆", x: 47.0, y: 62.0, title: "Arrival Plaza", sub: "Mani So'Win Point",
    blurb: "Step into a welcoming courtyard plaza. Take in the signs, the campus' heart and tone, and begin your journey.",
    links: [{ label: "Getting started", url: LINKS.website }] },
];

/* ----------------------------- elements ----------------------------- */
const stage = document.getElementById("stage");
const wrap = document.getElementById("mapwrap");
const mapImg = document.getElementById("map");
const hotsEl = document.getElementById("hotspots");
const card = document.getElementById("card");

/* view transform state */
let view = { s: 1, x: 0, y: 0 };
const FIT = () => ({ w: wrap.offsetWidth, h: wrap.offsetHeight });

function applyView(animate = true) {
  wrap.style.transition = animate ? "transform .5s cubic-bezier(.22,.61,.36,1)" : "none";
  wrap.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
  hotsEl.style.setProperty("--inv", 1 / view.s);   // keep markers a constant on-screen size
}
function clampView() {
  const { w, h } = FIT();
  const sw = stage.clientWidth, sh = stage.clientHeight;
  const minX = sw - w * view.s, minY = sh - h * view.s;
  if (w * view.s <= sw) view.x = (sw - w * view.s) / 2; else view.x = Math.min(0, Math.max(minX, view.x));
  if (h * view.s <= sh) view.y = (sh - h * view.s) / 2; else view.y = Math.min(0, Math.max(minY, view.y));
}
function resetView() {
  view.s = 1; view.x = 0; view.y = 0; clampView(); applyView();
  hideCard();
}
function focusSpace(sp) {
  const { w, h } = FIT();
  const sw = stage.clientWidth, sh = stage.clientHeight;
  view.s = Math.min(2.8, Math.max(2.0, (sw / w) * 2.4));
  // center the marker point in the stage
  view.x = sw / 2 - (sp.x / 100) * w * view.s;
  view.y = sh / 2 - (sp.y / 100) * h * view.s;
  clampView(); applyView();
}

/* ----------------------------- hotspots ----------------------------- */
function buildHotspots() {
  hotsEl.innerHTML = "";
  for (const sp of SPACES) {
    const b = document.createElement("button");
    b.className = "hotspot" + (sp.n === "✦" ? " hub" : sp.n === "◆" ? " arrival" : "");
    b.style.left = sp.x + "%";
    b.style.top = sp.y + "%";
    b.innerHTML = `<span class="hs-inner"><span class="hs-dot">${sp.n}</span><span class="hs-label">${escapeHtml(sp.title)}</span></span>`;
    b.addEventListener("click", (e) => { e.stopPropagation(); openSpace(sp); });
    hotsEl.appendChild(b);
  }
}

/* --------------------------- info card ------------------------------ */
function openSpace(sp) {
  focusSpace(sp);
  document.getElementById("card-num").textContent = sp.n;
  document.getElementById("card-sub").textContent = sp.sub || "";
  document.getElementById("card-title").textContent = sp.title;
  document.getElementById("card-blurb").textContent = sp.blurb || "";
  // close-up thumbnail from the same render
  const thumb = document.getElementById("card-thumb-img");
  thumb.style.backgroundImage = `url('image/campus-overview.png')`;
  thumb.style.backgroundSize = "440%";
  thumb.style.backgroundPosition = `${sp.x}% ${sp.y}%`;
  // bullets
  const ul = document.getElementById("card-bullets");
  ul.innerHTML = (sp.bullets || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  ul.style.display = sp.bullets ? "grid" : "none";
  // form
  const formEl = document.getElementById("card-form");
  formEl.innerHTML = sp.form ? formMarkup() : "";
  if (sp.form) wireForm(formEl);
  // links
  document.getElementById("card-links").innerHTML = (sp.links || [])
    .map((l) => `<a class="m-link" href="${l.url}" target="_blank" rel="noopener">🔗 ${escapeHtml(l.label)}</a>`).join("");
  document.getElementById("card-explore").onclick = () => focusSpace(sp);
  card.classList.add("show"); card.setAttribute("aria-hidden", "false");
  closeList();
}
function hideCard() { card.classList.remove("show"); card.setAttribute("aria-hidden", "true"); }

function formMarkup() {
  return `<div class="embed-mock">
    <div class="embed-bar"><span>🔗 Embedded sign-up</span><span class="embed-url">${escapeHtml(LINKS.eventForm)}</span></div>
    <div class="embed-fields">
      <label>Your name<input placeholder="Type here…"></label>
      <label>Email<input placeholder="you@example.com"></label>
      <button class="embed-submit">Submit</button>
    </div>
    <p class="embed-note">In the live Gather build this is your real Google Form / Airtable, embedded so members never leave the space.</p>
  </div>`;
}
function wireForm(el) {
  el.querySelector(".embed-submit").addEventListener("click", () => {
    el.querySelector(".embed-fields").innerHTML = "<p class='ok'>✅ Thanks! Your response was recorded (demo).</p>";
  });
}

/* --------------------------- spaces list ---------------------------- */
const listEl = document.getElementById("list");
function buildList() {
  listEl.innerHTML = SPACES.map((sp, i) =>
    `<button data-i="${i}"><b>${sp.n}</b> ${escapeHtml(sp.title)}<small>${escapeHtml(sp.sub || "")}</small></button>`).join("");
  listEl.querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => { openSpace(SPACES[+b.dataset.i]); }));
}
function toggleList() { listEl.classList.toggle("show"); }
function closeList() { listEl.classList.remove("show"); }

/* ----------------------- pan (drag) + zoom (wheel) ------------------ */
let drag = null;
stage.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".hotspot")) return;
  drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
  stage.setPointerCapture(e.pointerId); stage.classList.add("grabbing");
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
  view.x = drag.vx + dx; view.y = drag.vy + dy; clampView(); applyView(false);
});
function endDrag(e) { if (drag) { stage.classList.remove("grabbing"); drag = null; } }
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);
stage.addEventListener("click", (e) => { if (!e.target.closest(".hotspot")) { /* background click */ } });

stage.addEventListener("wheel", (e) => {
  e.preventDefault();
  const { w, h } = FIT();
  const rect = stage.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const prev = view.s;
  const ns = Math.min(3.2, Math.max(1, view.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
  // keep cursor anchored
  view.x = mx - (mx - view.x) * (ns / prev);
  view.y = my - (my - view.y) * (ns / prev);
  view.s = ns; clampView(); applyView(false);
}, { passive: false });

/* ------------------------------- misc ------------------------------- */
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

document.getElementById("btn-reset").addEventListener("click", resetView);
document.getElementById("btn-list").addEventListener("click", (e) => { e.stopPropagation(); toggleList(); });
document.getElementById("card-close").addEventListener("click", hideCard);
document.addEventListener("click", (e) => { if (!e.target.closest("#list") && !e.target.closest("#btn-list")) closeList(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") { hideCard(); closeList(); } });
window.addEventListener("resize", () => { clampView(); applyView(false); });
document.getElementById("intro-start").addEventListener("click", () => document.getElementById("intro").classList.remove("show"));

function boot() {
  buildHotspots(); buildList();
  if (mapImg.complete) { clampView(); applyView(false); }
  else mapImg.addEventListener("load", () => { clampView(); applyView(false); });
}
boot();
