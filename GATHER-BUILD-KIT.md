# 🪑 Gather.town Build Kit — Have a Seat Universe (Phases 1–3)

A complete, step-by-step plan to build **Phase 1 — Foundational Universe Core** of the
**Have a Seat Universe** *inside the client-owned Gather.town account*. Follow it top to bottom
and you'll have a warm, low-pressure, central-park-style universe with a spawn, a connection hub,
common ground, headquarters, two legacy halls, and the outdoor + beach/park zones — connected by
portals, with private audio zones, clickable objects, an embedded form, and an external automation.

**Estimated build time:** ~3–5 hours for a clean Phase 1.

> The interactive prototype in this folder ([index.html](index.html)) is your **visual blueprint** —
> open it, click each space, and build the Gather room to match. The render in `image/` shows the
> intended look and layout.

> Mapmaker button labels shift slightly between Gather updates; when in doubt use the in-app
> **search** in each panel. Official docs are linked at the end.

---

## 0. Contract guardrails (read first — these are non-negotiable)
From the signed Phase 1 scope:
- ✅ **Build inside the client-owned Gather account** (or another approved existing platform account).
- ✅ **Client keeps full owner/admin access at all times.** Never lock the client out; never leave the
  only copy of the final build in the builder's personal account.
- ✅ **Warm, welcoming, community-focused, low-pressure** for first-time visitors.
- ✅ **Modular & copy-paste-ready** wherever possible, so future areas can be added without rebuilding.
- ✅ Use **clickable objects, portals, embedded forms/links, private audio zones, simple interactive items**.
- ✅ **Automations are external workflows only** — click object/iframe → submit form → Airtable / Google
  Sheets / Zapier / Make handles tracking or alerts.
- ❌ **No** advanced Gather zone triggers, complex webhooks, custom dashboards, advanced API work, or
  backend development (unless agreed separately).
- ✅ Provide **screenshots / short video walkthrough updates** during the project and **hand over all
  setup notes** at completion.

---

## 1. Account & Space setup (15 min)
1. **Confirm access the contract-safe way (do this before building):** ask the client to invite you to
   **their** space as **Admin** (or **Builder/Mapmaker**): Space → **Settings → Roles/Members** → add your
   email → role **Admin**. The client remains **Owner**. *(If you must prototype in your own space first,
   agree in writing to rebuild/transfer into theirs — never hand over a build that only lives in your account.)*
2. In the client space, bottom toolbar → **Build (hammer)** → **Edit in Mapmaker** (opens a new tab).
3. Name the space **"Have a Seat Universe"** (Settings → Space name / preferences).

The Mapmaker tools you'll use constantly:
- **Objects** — furniture, plants, decor, screens.
- **Tile Effects** — Impassable, Spawn, Portal, Private Area, Spotlight.
- **Walls & Floors** — paint floors and walls.
- **Rooms list** (lower-right) — add/select the rooms (floors).

---

## 2. Space structure — the 8 Phase 1 rooms

Create these in the **Rooms list** → "Add a room". The central-park **heart** is Main Spawn →
Connection Hub → Common Ground working together.

| # | Room name | Suggested size | Role (from the brief) |
|---|-----------|----------------|------------------------|
| 1 | **Main Spawn** | 20 × 14 | Primary arrival; welcome; low-pressure orientation; guest spawn |
| 2 | **Connection Hub** | 30 × 22 | Transport/navigation center; future-expansion gateway; directory/wayfinding |
| 3 | **Common Ground** | 30 × 20 | Central-park gathering; informal networking; relaxed conversation; belonging |
| 4 | **Community Headquarters** | 26 × 18 | Administrative space; leadership meetings; operations |
| 5 | **Have a Seat Legacy Hall** | 24 × 16 | Historical & founder recognition; mission/legacy of Have a Seat Universe |
| 6 | **PTI Legacy Hall** | 24 × 16 | Distinct legacy/recognition for Paper Tole Institute; PTI mission/history |
| 7 | **Outdoor Community Areas** | 30 × 20 | Walking paths; landscaping; gathering & interaction zones |
| 8 | **Beach & Park** | 30 × 20 | Beach + park + central-park community zones (where approved) |

> Keep the **default Spawn** in **Main Spawn** (Section 4.1). Every other room is reached by portals.

---

## 3. Global build conventions (do these in every room)
- **Floors first** (Walls & Floors): interior rooms = wood or tile; Common Ground/Outdoor = grass;
  Beach = sand + a water-edge; Legacy Halls = marble/tile with a rug runner.
- **Walls:** enclose interior rooms (Hub, HQ, both Legacy Halls); leave a 1-tile gap at each portal/door.
- **Impassable tiles:** Tile Effects → **Impassable** → stamp over walls, water, and large furniture.
- **Low-pressure design:** open sightlines, wide paths, no dead-ends at the entrance, clear signage.
- **Modularity (contract):** build one polished **"unit"** of each repeated element (a workstation
  cluster, a legacy display bay, a beach lounge set), then **copy-paste** it — so future areas drop in
  without a rebuild. Gather Mapmaker supports marquee-select + copy/paste of object groups.
- **Save often:** top nav → **Save**.

---

## 4. Room-by-room build

### 4.1 Main Spawn 🪑 (spawn + orientation)
- **Floor:** grass with a stone path to the archway.
- **Objects (search):** `sign`/`banner` ("Welcome"), `lamp` ×2, `tree`/`bush` ×4, `flower`, `flag` ×2,
  `arch`/`gate` (or 2× `pillar` + a `door`).
- **Spawn tile:** Tile Effects → **Spawn** → leave Spawn ID **blank** → stamp 2–3 open tiles near the
  entrance. *(Never on an Impassable tile.)*
- **Orientation sign (interactive):** `signpost` → **Note**: *"Welcome — take your time. Use arrow keys
  to walk, press X near glowing objects. Step through the arch when you're ready."*
- **Getting-started board:** `bulletin board` → **Note** with 3 tips + a `link` to the website.
- **Portal:** at the arch → **Connection Hub** (Section 5).

### 4.2 Connection Hub ✦ (transport center + expansion gateway)
- **Floor:** marble/plaza tiles; a **rug** under the centerpiece. Centerpiece: search `fountain`
  or a glowing `globe`/`portal` object (the "Expansion Gateway").
- **Objects:** `bench` ×4, `lamp` ×4, `plant` ×2, a `directory`/`bulletin board`.
- **Directory (interactive):** **Note** listing every space + direction (wayfinding function).
- **7 portals** around the plaza — to **Main Spawn, Common Ground, Community HQ, Have a Seat Legacy
  Hall, PTI Legacy Hall, Outdoor Areas, Beach & Park** — each with a `door`/`arch` on top and a small
  `sign` label next to it.
- **Future-expansion gateway nodes:** place 2–4 decorative `portal`/`pad` objects with a **Note**:
  *"Reserved gateway — future universe expansion (coming soon)."* This satisfies "access point for
  future universe expansions / future portal & gateway locations" **without** building those worlds now.
- **Live Events Calendar (interactive):** a `kiosk`/`tv` → **Embedded website** = a public Google
  Calendar embed (or **Note** + link if embedding is blocked).

### 4.3 Common Ground 🌳 (central-park heart)
- **Floor:** grass; a **pond** (water tile + Impassable); winding stone paths.
- **Objects:** `tree` ×6, `bush`, `flower`, `bench` ×3, `picnic table` ×2, `lamp`, `gazebo`/`stage`,
  `fountain`, a `coffee cart`/`cafe`.
- **Community board (interactive, showcase):** `bulletin board` → **Embedded website** = your **RSVP
  Google Form** (Sections 7–8). Low-pressure copy: *"Gather, connect, and belong — no pressure, just
  good company."*
- **Relaxed conversation areas:** cluster benches/tables in 2–3 small groupings for informal networking.
- **Optional private nook:** a small **Private Area** (ID 10) around a bench circle for quiet 1:1s.
- **Spotlight (optional):** `Spotlight` tile on the gazebo/stage for announcements to the whole room.

### 4.4 Community Headquarters 🏢 (admin · leadership · operations)
- **Floor:** wood; a carpet zone for the boardroom.
- **Objects:** `reception desk`, `desk` + `computer`/`monitor` ×4 (an ops workstation cluster — build
  one, copy-paste), `bookshelf` ("Records"), `plant` ×2, a meeting `table` + `chair`s.
- **Operations board (interactive):** `bulletin board` → **Note** (announcements/operations) + a `link`
  to the handbook.
- **Boardroom (Private Area — important):** enclose a room with a big table; Tile Effects → **Private
  Area** → Name **"Boardroom"**, **ID 1** → stamp the floor. Audio/video stay inside for leadership
  meetings. Add a **Note** sign: *"Private area — leadership meeting room."*

### 4.5 Have a Seat Legacy Hall 🏛️ (founder & mission recognition)
- **Floor:** marble/tile with a central **rug runner**; `pillar` ×2 for a grand entrance.
- **Objects:** `statue`/`bust` on `pedestal` ×2 (founders), `display case`/`glass case` ×3 (artifacts),
  `painting`/`frame`, `bench` ×2, `plant` ×2.
- **Founder displays (interactive):** each statue/case → **Note** with the founder's story.
- **Mission & Legacy wall (interactive):** a large `tv`/`poster` → **Embedded website** (a slide deck or
  recorded tribute) **or** **Note**: *"We preserve the past, enrich the present, and inspire the future."*

### 4.6 PTI Legacy Hall 🎴 (Paper Tole Institute — distinct legacy)
- **Floor:** marble/tile + rug runner; `pillar` ×2.
- **Objects:** `frame`/`painting` ×4 (paper-tole artworks), `display case` ×2, `statue` (PTI founder),
  `bench`, `plant` ×2.
- **PTI artworks (interactive):** frames → **Note** describing the paper-tole craft.
- **PTI Mission & History (interactive):** `bulletin board`/`tv` → **Note** or **Embedded website** with
  PTI's mission and history. *(Keep this hall visually distinct from 4.5 so the two legacies read as
  separate.)*

### 4.7 Outdoor Community Areas 🌿 (paths · landscaping · gathering)
- **Floor:** grass; **walking paths** winding through; a planted/landscaped feel.
- **Objects:** `tree` ×6, `bush` ×4, `flower` ×4, `bench` ×2, `picnic table`, `lamp`, `fountain`
  (a gathering circle), `flag`.
- **Wayfinding sign (interactive):** `signpost` → **Note**: *"Wander the paths and gathering spaces —
  Common Ground is this way, the Beach & Park that way."*
- This room is mostly **open community interaction zones** — keep it spacious and calm.

### 4.8 Beach & Park 🏖️ (beach + central-park zones)
- **Floor:** sand; a **sea edge** (water tiles + Impassable) along one side; a `boardwalk` path.
- **Objects (search "beach"/"summer"/"park"):** `palm tree` ×4, `beach umbrella` ×3, `sandcastle` ×2,
  `bench` ×2, `flag`, `flower`. Optional `volleyball`/`towel` for life.
- **Relaxed sign (interactive):** `sign` → **Note**: *"A relaxed, central-park-style shoreline — pull up
  a seat and enjoy the calm."*
- **Portals:** back to **Connection Hub** and across to **Outdoor Areas** (Section 5).

---

## 5. Portals — exact steps & the full map
**Steps** (Mapmaker → **Tile Effects → Portal**):
1. Select **Portal**, then with the **Stamp** tool click the entrance tile on the current map.
2. Pick the destination **Room**; it opens so you can click the **exit** tile.
3. Place a `door`/`arch` object on top of the portal tile so it reads as an entrance.
4. Build the **return** portal from the destination back to the source.

**Phase 1 portal map (9 connections = 18 portal tiles, all round-trips):**

| From ⇄ To | From ⇄ To |
|-----------|-----------|
| Main Spawn ⇄ Connection Hub | Connection Hub ⇄ Have a Seat Legacy Hall |
| Connection Hub ⇄ Common Ground | Connection Hub ⇄ PTI Legacy Hall |
| Connection Hub ⇄ Community HQ | Connection Hub ⇄ Outdoor Areas |
| Connection Hub ⇄ Beach & Park | Common Ground ⇄ Outdoor Areas |
| Outdoor Areas ⇄ Beach & Park | |

This makes a continuous **outdoor loop** (Common Ground ↔ Outdoor ↔ Beach) with everything reachable
from the Hub — the "unified spawn, navigation, and expansion framework" the phase deliverable asks for.

> Place each return portal **next to a clear tile** (not on furniture or another portal) so avatars
> don't instantly bounce.

---

## 6. Private audio areas — recap
Rule: **same Private-Area ID = same audio/video bubble.** Give each distinct private space a **unique
Name + ID**:

| Room | Private Area | ID |
|------|--------------|----|
| Community HQ | Boardroom | 1 |
| Common Ground | Quiet Nook (optional) | 10 |

Stamp the floor of each; tiles highlight with the name. Save when done.

---

## 7. Interactive objects & the embedded form — exact steps
Place/double-click an object → **Object Interactions** → choose:
- **No interaction** — plain decor.
- **Note** — text popup. Best for **signs, boards, founder displays, rules**.
- **Embedded website** — opens a site *inside* Gather. Use for **forms, calendars, slides**.
- **External call / link** — opens a link in a new tab.
- **Sound** — plays audio.

**Embed a Google Form (the showcase, in Common Ground):**
1. Object Picker → choose the board/kiosk/tv.
2. **Object Interactions → Embedded website**.
3. Paste the form **embed** URL — must be `https` and allow iframes:
   Google Form → **Send → `< >` (embed)** → copy the
   `https://docs.google.com/forms/d/e/…/viewform?embedded=true` src.
4. **Activation distance** = 3. **Custom prompt** = *"Press X to sign up"*.
5. Place, then **Save**.

> If a site shows "refused to connect," it blocks embedding — fall back to **Note** / **External link**.

---

## 8. Simple automation — external workflow only (form → sheet → alert)
Per the contract, automations are **external** — Gather just shows the form/iframe.

1. **Google Form → Responses → Link to Sheets** (creates the response spreadsheet).
2. **Zapier** or **Make**:
   - **Trigger:** Google Forms – New Response (or Google Sheets – New Row).
   - **Action:** Airtable – Create Record / Slack / Discord / Gmail – Send Email.
3. Map fields (Name, Email, Notes) into the record/message.
4. Turn it on; submit a test response and confirm it lands.

No webhooks, dashboards, or API/backend work — exactly the brief's "external tracking or alert" scope.

---

## 9. Modularity & future expansion (contract requirement)
- Build **one** of each repeated element, then **copy-paste**: ops workstation, legacy display bay,
  beach lounge set, a portal-door+sign unit.
- Keep the **Connection Hub** the single place new worlds plug into — add a portal + a labeled door and
  the universe grows without touching existing rooms.
- Document the **naming/ID scheme** (rooms, private-area IDs, portal pairs) so the next builder can
  extend it cleanly.

---

## 10. Updates & handover checklist
**During the build:** share short clips/screenshots (Loom or phone screen-record) at each milestone.

**Final handover package (per contract):**
- [ ] **Client confirmed as Owner; you as Admin** on the client's space (client never locked out).
- [ ] All **8 rooms** built, decorated, low-pressure, connected by portals (round-trips tested).
- [ ] Spawn in **Main Spawn**; no spawn on impassable tiles.
- [ ] **Boardroom** private area verified (audio stays inside).
- [ ] All interactive objects tested (notes open, links open, **form embeds and submits**).
- [ ] Automation tested end-to-end (test response → Sheet/Airtable + alert).
- [ ] Modular/copy-paste units documented for future areas.
- [ ] A 2–4 min **walkthrough video**.
- [ ] A **setup-notes doc**: room map, every link/form URL, private-area IDs, the Zap/Make scenario,
      and how to edit — handed to the client.

---

## 11. Client demo / recording script (2–4 min)
1. Spawn in **Main Spawn**, read the welcome sign, walk through the arch.
2. Arrive at the **Connection Hub**; pan the gateway fountain + the labeled portals + the directory.
3. **Common Ground** → open the community board and **submit the embedded form**.
4. **Community HQ** → step into the **Boardroom** private area (audio stays inside).
5. **Have a Seat Legacy Hall** → open a founder display; **PTI Legacy Hall** → show the distinct PTI legacy.
6. **Outdoor Areas** → walk the paths; portal across to **Beach & Park** for the relaxed closing shot.
7. Voice-over: *"Everything here is native Gather — spawn, portals, private areas, embedded forms — with
   an external Zapier automation so responses reach your team automatically, and a hub that's ready for
   future expansions."*

---

## 12. Build order (fastest path)
1. Confirm Admin access in the **client's** space + create the 8 rooms (Sec 1–2).
2. Floors + walls + impassable for all rooms (Sec 3).
3. Spawn in Main Spawn (4.1).
4. All portals (Sec 5) — get navigation working first.
5. Decorate room by room (Sec 4); build modular units once, copy-paste.
6. Interactive objects + the embedded form (Sec 7).
7. Boardroom private area (4.4, 6).
8. External automation (Sec 8).
9. Test everything → record video → handover (Sec 10–11).

---

## 13. PHASE 2 — Education, work, demo & sales-ready spaces
Build these **after** Phase 1, as new **Rooms** in the same Space (Rooms list → "Add a room").
Use the live 3D prototype ([index.html](index.html)) as the visual reference — open the **🗺️ Directory**
to see every space and its contents. **Reuse via copy-paste:** build ONE classroom, ONE meeting room,
ONE office perfectly, then duplicate (marquee-select objects → Ctrl/Cmd-C → Ctrl/Cmd-V) into each new
room and rename. That satisfies the "modular / copy-paste-ready" requirement.

### 13.1 Rooms to create
| Wing | Rooms | Floor | Key objects (Object search terms) | Interaction |
|---|---|---|---|---|
| **Skool Classroom Wing** | Skool Classroom 1–6 | wood/tile | `whiteboard`/`tv` (front, screen-share), `podium`, rows of `chair`+`desk`, `plant`, name `sign` | TV → **Embedded website** = Skool/class link |
| **Meeting Room Wing** | Meeting Room 1–6 | carpet | `meeting table`, `chair`s, `tv` (presentation), `plant` | each room = **Private Area** (unique ID); TV → embed |
| **Training Classroom Wing** | Training Classroom 1–6 | wood | `whiteboard`/`tv`, `podium` (instructor), demo `table`, student `chair`s | TV → embed class/recording |
| **Office Rental / Co-Space** | Office Rental 1–6 | wood | `desk`+`monitor` workstation, `office chair`, `sofa`, `plant` | `sign` → **Note** "Rentable office — enquire"; **Private Area** per office |
| **The Stage** | The Stage (1 large) | tile | `stage`/raised platform, `podium`, audience `chair` rows, big `tv`/screen | **Spotlight** tiles on stage; screen → embed stream/slides |
| **Studio Flat** | Studio Flat (1, next to Main Spawn) | wood | `sofa`, `bed`, `table`, `kitchen`/`counter`, `tv`, `plant` | `sign` → Note (tours/onboarding); portal from Main Spawn |
| **Ready for Purchase/Rent Units** | Rent Unit A / B / C | tile | **make each distinct** — a shop, a flat, an office; add a "FOR LEASE" `sign` | `sign`/board → **Embedded** enquiry form |

### 13.2 Signage & branding (every room)
- Add a `sign`/`text` object at each entrance → **Note** with the room name (classroom identification signage).
- Keep the **same floor/wall palette and a logo image** in each room for consistent universe branding
  (upload your logo via **Objects → Upload New**).

### 13.3 Presentation / screen-share spaces
- The "screen-sharing presentation space" in classrooms/training/stage is a Gather **Spotlight** tile area
  (presenter is heard room-wide) + an **Embedded website** screen object for slides/video. (Native Gather
  screenshare is automatic inside a room; the Spotlight makes one presenter broadcast to all.)

### 13.4 Private areas (Section 6 rules)
Give every Meeting Room and Office a **unique Private-Area Name + ID** so audio/video stays inside.
Suggested IDs: Meeting Rooms 21–26, Offices 31–36, Boardroom 1 (Phase 1).

### 13.5 Navigation system (Educational & Sales)
- In the **Connection Hub** and **Navigation Hub**, place a `directory`/`board` → **Note** listing all wings
  with directions, **and** an **Embedded website** = a simple "Campus Map" page or your site's directory.
- Put a **labeled portal + sign** at each wing entrance ("→ Skool Classrooms", "→ Meeting Rooms", etc.).

### 13.6 Portals
Connect each wing to the **Connection Hub** (and the Studio Flat to **Main Spawn**), round-trip, exactly
like Section 5. One portal in / one portal back per room or per wing-corridor.

---

## 14. PHASE 3 — Seasonal, shopping & the First Down Football Club
Add as more **Rooms**. The Football Club is the **required major destination** — build it fully.

### 14.1 Seasonal & community spaces
| Space | Floor | Objects | Notes |
|---|---|---|---|
| **Seasonal Village** | grass | **swappable décor:** Fall = `pumpkin`, `hay`, fall trees · Winter = `christmas tree`, `snowman`, `string lights`, snow tiles | See 14.3 for the seasonal swap |
| **Christmas Tree Plaza** | stone/snow | big `christmas tree`, `string lights`, `bench`es, `lamp`s, presentation board | Can be a **separate Room** you toggle on/off seasonally |
| **Seasonal Event Center** | tile | `stage`, audience `chair`s, announcements `board` (Note), `tv` | event hosting + community announcements |
| **Activity-Based Social Space** | grass | playful ground tiles, `ball`/games, `bench`es, gathering circle | "where approved by Client" |
| **Shared Shopping District** | tile | row of **storefronts**: `counter`, shelves, goods, awning, "shop" `sign` | each shop = a unit; renter personalization where approved |

### 14.2 First Down Football Club (10 spaces — do not omit)
Follow the client-approved football-club reference. Brand all rooms with the club identity + logo.
| Room | Objects | Interaction |
|---|---|---|
| **First Down Clubhouse** (flagship/hub) | lounge `sofa`s, `tv`, trophy `shelf`, football décor | arrival/social hub; portal target |
| **Fan Lounge** | `sofa`s, `tv`, `table`, football | casual social |
| **Fantasy Football Center** | `desk`+`monitor`s, draft `board` | board/TV → embed fantasy tool |
| **Watch Party Hall** | **large `tv`/screen**, audience `chair` rows | screen → embed stream/scores; **poll** via embedded form where supported |
| **Sports Education Room** | `tv`, `podium`, `chair`s, `bookshelf` | TV → embed rules/history content |
| **Sponsor & Affiliate Showcase** | `display case`s / `poster`s with sponsor logos | each → **External link** to sponsor/affiliate |
| **The Huddle** (podcast) | round `table` + `chair`s + `mic` props | Note/embed for the podcast |
| **Stats & Leaderboards** | wall `tv`/`board`s | embed leaderboard page where supported |
| **Football Field / Play Feature** | green field tiles + yard-line tiles + `goal post` | avatar play area (where platform-supported) |
| **Future Stadium Expansion Zone** | empty fenced lot + "Future Stadium" `sign` | reserved; leave a portal stub for later |

> **Platform-dependent items** (live scores on the watch screen, polls, real leaderboards, avatar football
> physics) are **"where platform-supported."** In Gather you provide the **space + an embedded website**
> that shows those (e.g. an embedded scoreboard/leaderboard page or a poll form). Native Gather doesn't
> compute scores itself.

### 14.3 Seasonal re-theming (theme changes over time)
Gather can't auto-swap by date, so do it the **save-and-reuse** way:
1. Build the **Winter (Christmas)** version of the Seasonal Village / Tree Plaza as its **own Room** (or a
   duplicate of the village Room with holiday décor).
2. To switch seasons, change the **portal** from the hub to point at the active seasonal Room (Fall ↔ Winter),
   and/or **duplicate the Room** to keep an off-season copy saved for later reuse.
3. Keep each seasonal Room saved in the Space so it can be **removed from the active map after the season and
   re-added next year** (the spec's "saved for later seasonal reuse").

### 14.4 Navigation & portals
- Add the Football Club + Seasonal areas to the **directory** (14.x signage) and the labeled-portal system.
- The Football Club should have its **own arrival portal** from the Connection Hub (it's a destination).

---

## Official references
- Mapmaker Overview — https://support.gather.town/hc/en-us/articles/15910431512980-Mapmaker-Overview
- Spawn Tiles — https://support.gather.town/hc/en-us/articles/15910416874644-Spawn-Tiles
- Portal Tiles — https://support.gather.town/hc/en-us/articles/21592490446740-Connect-Tiles-Rooms-or-Spaces-with-Portal-Tiles
- Add a Room & connect with portals — https://support.gather.town/hc/en-us/articles/15910374690836-Add-a-Room-and-Connect-it-With-Portal-Tiles
- Private Areas — https://support.gather.town/hc/en-us/articles/15910385713684-Private-Area-Tiles
- Tile Effects Overview — https://support.gather.town/hc/en-us/articles/15910385115412-Tile-Effects-Overview
- Embedded Websites — https://support.gather.town/hc/en-us/articles/15910417713940-Embedded-Websites
- Objects Overview — https://support.gather.town/hc/en-us/articles/15910376994708-Objects-Overview
- Roles & permissions — https://support.gather.town/hc/en-us/articles/15910571840788-Roles-and-Permissions
