# ✅ Gather Build Checklist — Room 1: Main Spawn

Build this **first**. It's the room visitors arrive in. Keep the **3D prototype's Main Spawn open
next to you as the picture** (spawn point, tiled plaza, fence, trees, welcome sign, archway to the Hub).

Each line is one action in the Gather **Mapmaker**. Tick them off as you go.

---

## A. Open the builder
- [ ] Open the space (the invite link), signed in as **Builder/Admin**.
- [ ] Bottom toolbar → **Build (hammer)** → **Edit in Mapmaker** (new tab).

## B. Create the room
- [ ] **Rooms list** (lower-right) → **+ Add a room** → name it exactly **`Main Spawn`**.
- [ ] When asked for a size, choose **Blank**, about **18 × 14 tiles** (you can resize later).

## C. Floor (the plaza)
- [ ] Top tabs → **Walls & Floors** → **Floors**.
- [ ] Pick a **light stone / tiled** floor.
- [ ] Paint the whole room with it (click-drag). This is the cream tiled plaza in the prototype.

## D. Border fence (open plaza, no walls)
- [ ] Top tabs → **Objects** → search **`fence`**.
- [ ] Place fence pieces around the **outer edge** of the plaza…
- [ ] …but **leave a 2–3 tile gap at the top-center** — that gap is the entrance/portal to the Hub.

## E. Make the fence solid
- [ ] Top tabs → **Tile Effects** → **Impassable**.
- [ ] Stamp **Impassable** tiles over every fence piece (so avatars can't walk through it).
- [ ] Leave the entrance gap **open** (no Impassable there).

## F. Spawn point (where people appear)
- [ ] **Tile Effects** → **Spawn**.
- [ ] Leave **Spawn ID blank** (default).
- [ ] Stamp **2–3 tiles** in the **lower-center** of the plaza (open floor, NOT on fence/objects).

## G. Objects (match the prototype)
Use **Objects** tab → search each term → click to place. Approximate positions from the prototype:
- [ ] `tree` × 4 — one near each corner of the plaza.
- [ ] `potted plant` × 2 — near the top, beside the entrance.
- [ ] `street lamp` (or `lamp`) × 2 — left and right of center.
- [ ] `bench` × 2 — optional, sides.
- [ ] `sign` (or `signpost`) × 1 — center-left = the **Welcome sign**.
- [ ] `bulletin board` (or `poster`) × 1 = the **Getting-Started board**.
- [ ] After placing big objects, add **Impassable** tiles over the **trees and lamps** (Tile Effects).

## H. Make the signs interactive
- [ ] Double-click the **Welcome sign** → **Object Interactions** → **Note** → paste:
  > *Welcome to the Have a Seat Universe! Take your time — no rush. Use the arrow keys to walk, and press X near glowing objects. When you're ready, head through the archway to the Connection Hub.*
- [ ] Double-click the **Getting-Started board** → **Note** → paste:
  > *Getting started: • Walk through portals (✦) to travel between spaces. • Press X near glowing objects to interact. • Open the map/directory to jump anywhere.*
  - [ ] (Optional) instead/also use **Embedded website** = your real website or directory URL.

## I. Portal to the Connection Hub
*(Do this once the **Connection Hub** room also exists — build that room next, then come back.)*
- [ ] At the **entrance gap (top-center)**, add an `archway`/`gate` object for looks (Objects → search `arch`).
- [ ] **Tile Effects** → **Portal** → stamp the entrance tile → choose room **Connection Hub** → click its exit tile.
- [ ] Then build the **return portal** (in Connection Hub, a portal back to Main Spawn).

## J. Save & test
- [ ] Top nav → **Save**.
- [ ] Go back to the space tab → reload → you should **spawn in Main Spawn**, see the sign/board notes
      when you press **X**, and walk through the arch to the Hub.

---

### ✔ Done = Main Spawn matches the prototype
Spawn point ✓ · tiled plaza ✓ · fence with entrance ✓ · trees/lamps/plants ✓ · welcome sign + board (Notes) ✓ · portal to Hub ✓

**Next:** Room 2 = **Connection Hub** (see [GATHER-BUILD-KIT.md](GATHER-BUILD-KIT.md) §4.2 / the prototype).
Then Common Ground — and you'll have the demoable Phase 1 core to show the client.
