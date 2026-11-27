// Turkey Run: 3 Nights to Freedom — the entrypoint that hands the game in.
// It copies game/ and screenshots/ from beside this file into the output
// directory and writes /output/dossier.json, the summary the judge reads,
// using the vendored make.fun library. Node 22+, standard library only, no
// network, no timestamps and no randomness at run time, so two runs write
// byte-identical output.
//
// The game is plain static files a desktop browser loads offline:
// game/index.html plus thirteen classic scripts under game/src/ (no modules,
// no build step), so it opens straight from file:// as well as from a server.
// The art is nine painted files under game/assets/ (four full-scene JPG
// backgrounds, five chroma-keyed PNG character sprites with real alpha) —
// local files only, loaded by relative path, zero network requests at
// run time.
//
// Serve the game locally first with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Layout guard: the game must be the thirteen classic scripts under
// game/src/ loaded by game/index.html — a module tag would be blocked from
// file://, so fail the build here, not at grading.
const expectedScripts = [
  'config.js', 'assets.js', 'input.js', 'audio.js', 'world.js', 'turkey.js', 'farmer.js',
  'hazards.js', 'render.js', 'hud.js', 'missions.js', 'shots.js', 'main.js',
];
for (const name of expectedScripts) {
  if (!existsSync(join(here, 'game', 'src', name))) {
    throw new Error(`missing game/src/${name} — the thirteen-script layout is incomplete`);
  }
}
const entryHtml = readFileSync(join(here, 'game', 'index.html'), 'utf8');
if (entryHtml.includes('type="module"')) {
  throw new Error('game/index.html uses a module script — file:// would be blocked');
}
if (!entryHtml.includes('<script src="./src/main.js">')) {
  throw new Error('game/index.html does not load ./src/main.js as a classic script');
}
if (!entryHtml.includes('<script src="./src/assets.js">')) {
  throw new Error('game/index.html does not load ./src/assets.js — the painted art would never load');
}

// Art guard: the nine painted assets the game loads by relative path.
// Backgrounds are JPG paintings; sprites are PNGs with a true alpha
// channel (the magenta key was removed at asset-build time — see
// game/src/assets.js — because file:// canvas is tainted and runtime
// keying throws in desktop Chrome).
const expectedAssets = [
  'bg-farmyard.jpg', 'bg-grill.jpg', 'bg-dining.jpg', 'bg-forest.jpg',
  'turkey-panic.png', 'turkey-happy.png', 'farmer-jed.png', 'family-table.png',
  'drum-grill.png',
];
for (const name of expectedAssets) {
  if (!existsSync(join(here, 'game', 'assets', name))) {
    throw new Error(`missing game/assets/${name} — a painted asset is gone`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes: game/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Turkey Run dossier written to ${out}`);

// Build report: confirm the handed-in screenshots are all present and
// inside the scorer's per-file cap, so a bad capture fails here, not at grading.
const shotDir = join(out, 'screenshots');
const shots = existsSync(shotDir) ? readdirSync(shotDir).sort() : [];
let shotBytes = 0;
for (const name of shots) {
  const size = statSync(join(shotDir, name)).size;
  shotBytes += size;
  if (size > 262144) throw new Error(`screenshot over the 256 KiB cap: ${name} (${size} bytes)`);
}
const dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log(`${shots.length} screenshots, ${shotBytes} bytes total; dossier.json ${dossierBytes} bytes`);
