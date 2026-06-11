# Virtual Community Campus — Interactive Demo

A walkable, **Gather.town-style** virtual space built in plain HTML5 + Canvas + JavaScript.
No dependencies, no build step. It runs in any modern browser and is meant to be shown
**live to the client** as a proof-of-concept for the real Gather build.

---

## ▶ How to run it

**Option A — just open it**
Double-click `index.html` (opens in your browser via `file://`). Everything works offline.

**Option B — local server (recommended for screen-sharing / phone testing)**
```bash
node serve.js
```
Then open **http://localhost:8080**. To test on your phone on the same Wi-Fi, open
`http://<your-computer-ip>:8080`.

**To host a public link** (great for sending the client): drag this folder into
[netlify.com/drop](https://app.netlify.com/drop), or push to GitHub and enable Pages,
or run `npx vercel`. You'll get a shareable URL in under a minute.

---

## 🎮 Controls
- **Move:** `W` `A` `S` `D` or Arrow keys (on-screen D-pad on mobile)
- **Interact:** `E` (or tap the `E` button) when an object glows
- **Travel:** walk into a glowing **✦ portal**
- **Jump to any area:** press `M` or the 🗺️ **Areas** button

---

## 🗺️ What's in the demo (maps to the client's brief)

| Client requirement        | In this demo |
|---------------------------|--------------|
| Welcome / spawn area      | **Welcome Plaza** — banner, welcome sign, getting-started board, archway portal |
| Main connection hub       | **Campus Hub** — central plaza with a fountain and portals to every area + a directory sign |
| Community commons         | **Community Commons** — lounge, coffee corner, community board, library/handbook links |
| Education / classroom      | **Classroom** — desks, podium, interactive whiteboard (live-class link), resource screen |
| Meeting rooms             | **Meeting Rooms** — 3 walled **private zones** (the Gather "private area" concept) |
| Park / outdoor social     | **Park & Outdoors** — trees, pond, benches, picnic, stage, **Events board with embedded RSVP form** |
| Christmas village         | **Christmas Village** — snow, cabins, lit tree, snowmen, gifts, **holiday sign-up form** |
| Interactive objects/links | Signs (popups), notice boards, kiosks, bookshelves, screens — all clickable |
| Embedded links / forms    | Object popups open external links **and** a mock embedded Google-Form/Airtable |
| Portals & signs           | Glowing portals between every area; labeled signposts and directories |

---

## 🔁 How this demo maps to the real Gather.town build

This is a **design + interaction prototype**. The actual delivery is built inside the
client's Gather account using the Mapmaker. Everything shown here has a 1:1 Gather feature:

- **Areas** → separate Gather **Maps** (or zones on one map), connected by **Portals**.
- **Portals (✦)** → Gather Portal tiles between maps.
- **Signs / popups** → objects with the **"Text"** interaction.
- **Kiosks / boards / screens** → objects with **"Embedded website"** or **"External call/link"**.
- **Embedded forms** → a Google Form / Airtable / Typeform set as an embedded website object.
- **Private meeting rooms** → Gather **Private Areas** (audio/video stays inside the room).
- **Spawn area** → the map's **Spawn tile**.
- **Automations** → Form → Google Sheet/Airtable → Zapier/Make for notifications & member flows.

---

## 🎨 Rebranding for the client (2-minute edit)

Open `game.js` and edit the `CONFIG` block at the top:
```js
const CONFIG = {
  campusName: "Hopewell Community Campus",   // ← the client's name
  tagline:    "A warm virtual home for our community",
  links: {
    discord:     "https://discord.gg/your-invite",
    website:     "https://example.org",
    classroom:   "https://meet.google.com/your-room",
    eventForm:   "https://docs.google.com/forms/.../viewform?embedded=true",
    holidayForm: "https://docs.google.com/forms/.../viewform?embedded=true",
    handbook:    "https://example.org/handbook",
  },
};
```
Swap in the client's name, logo links and real forms and it instantly feels bespoke.

---

## 🎥 Tips for the live demo / recording
1. Run `node serve.js`, full-screen the browser.
2. Click **Enter the campus**, then walk Welcome → Hub → each area through the portals.
3. Press `E` on the whiteboard, the events board, and the Christmas gift stand to show
   **links and the embedded form** (submit it to show the success state).
4. Pop into a **Meeting Room** to explain private areas.
5. End in the **Christmas Village** with the snow falling — strong closing shot.

---

## 📁 Files
- `index.html` — page shell, HUD, modals, intro
- `style.css` — all styling (cozy, modern, responsive)
- `game.js` — engine: rooms, rendering, movement, collisions, portals, interactions
- `serve.js` — optional tiny local server
