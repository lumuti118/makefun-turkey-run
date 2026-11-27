[![Turkey Run — turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun)
[![Rank](https://make.fun/badge/turkey-run-game-01/lumuti118/makefun-turkey-run/rank.svg)](https://make.fun)
[![Reward](https://make.fun/badge/turkey-run-game-01/lumuti118/makefun-turkey-run/reward.svg)](https://make.fun)

# Turkey Run: 3 Nights to Freedom

**Turkey Run: 3 nights, 4 stages, 12 corn, 1 forest gate — escape Thanksgiving dinner**

A turkey escape game in plain 2D canvas, drawn and sounded entirely in code
— no libraries, no network, no assets. A turkey breaks out of the coop on
Thanksgiving and runs for the forest gate across three nights, chased the
whole way by Farmer Jed.

- **Night 1 — The Farmyard:** escape the coop, dodge falling carving knives,
  snare traps and the farmhouse oven, grab corn, hide in the haystacks.
- **Night 2 — The Backyard Drum Grill:** Thanksgiving dinner is cooking
  OUTSIDE. A big rusty oil-drum BBQ smoker blocks the yard — dodge its smoke
  and flare-ups, jump the knives, keep running while the family eats.
- **Night 3 — The Dining Room:** sneak under the Thanksgiving table past
  Grandma, Uncle Bob, Cousin May and Aunt Rose while the farmer searches the
  room — then sprint for the forest gate in The Great Escape finale.

- **Play it:** arrows / WASD to run, Space to jump, E to hide in a haystack,
  P to pause, M to mute, Enter or click to start / restart. Mouse works on
  every menu.
- **Feel it:** the farmer chases, searches the haystacks when you hide, and
  lunges to corner you when you dawdle; "SPOTTED!" flashes when he sees you,
  "CAUGHT! -1 LIFE" when a hazard lands, and "ESCAPED! — THANKSGIVING
  SURVIVED" at the gate. Gobbles, clangs and the chase pulse are generated
  with WebAudio in code.
- **Score it:** 1 point per metre, 50 per corn cob (12 in the run), +150 per
  night cleared, 3 lives. HUD shows score, distance, lives, night, corn and
  the clock.

## Run it

Double-click `game/index.html` — it plays straight from `file://` in desktop
Chrome (the game is twelve classic scripts under `game/src/`, no modules, no
server needed). Or serve it:

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser.

Deterministic staged screenshot scenes: `?shot=1&seed=1` (Night 1 mid-run
cover), `?shot=2&seed=1` (Night 2 backyard drum grill), `?shot=3&seed=1`
(Night 3 under the dining table), `?shot=4&seed=1` (the forest-gate escape).
The four screenshots are staged scenes rendered live by the game code, with
coherent numbers across them (0:38 / 240 pts / 120 m / 3 lives → 1:24 / 610 /
340 m / 2 lives → 2:10 / 980 / 620 m / 2 lives → 2:47 / 1350 / 900 m /
2 lives) — not a recording of one played run.

## Structure

One clear job per file, named for what it does:

- `game/src/config.js` — tuning, the 3-night plan, seeded RNG
- `game/src/input.js` — keyboard + mouse intents
- `game/src/audio.js` — WebAudio sounds generated in code
- `game/src/world.js` — the farm world, corn, haystacks, night progression
- `game/src/turkey.js` — the player turkey: physics + expressive drawing
- `game/src/farmer.js` — farmer AI (chase / search / corner) + the family
- `game/src/hazards.js` — carving knives, drum grill, oven, snare traps
- `game/src/render.js` — painting the farm, backyard, dining room, gate
- `game/src/hud.js` — HUD, banners, title and end screens
- `game/src/missions.js` — scoring, lives, night clears, win / lose
- `game/src/shots.js` — deterministic staged screenshot scenes
- `game/src/main.js` — the loop and state machine

## Provenance

Built with AI assistance. The game code, art and sounds were written for this
entry; the starter kit's layout (main.ts / serve.ts / shots.json shape) was
used as a reference for the hand-in format, and `vendor/makefun-game.ts` is
the kit's copy, unchanged.

---

Built for [make.fun](https://make.fun/r/7vjqmhmr) — turkey-run-game-01.
