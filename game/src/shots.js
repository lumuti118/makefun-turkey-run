// shots.js — deterministic staged screenshot scenes (?shot=1..4&seed=1).
// One job: pose one frozen frame per shot so the screenshots are repeatable.
// These are STAGED SCENES rendered live by the game code — never presented
// as a recording of one played run. Numbers are coherent across the shots:
// time 0:38 -> 1:24 -> 2:10 -> 2:47, score 240 -> 610 -> 980 -> 1350,
// distance 120 m -> 340 m -> 620 m -> 900 m, lives 3 -> 3 -> 2 -> 2.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  function base(G, n) {
    var s = G.run, w = G.world, t = G.turkey, f = G.farmer, h = G.hazards;
    s.mode = 'play';
    s.nightIndex = n;
    s.bannerTimer = 9999; // banner stays up for the shot
    s.caughtFlash = 0;
    s.bgOverride = null;
    s.bannerOverride = null;
    t.hidden = false; t.hurtTimer = 0; t.onGround = true; t.y = CFG.GROUND_Y; t.vy = 0;
    f.state = 'chase'; f.stateTimer = 9999;
    h.list = [];
    w.corn.forEach(function (c) { c.taken = false; });
    return { s: s, w: w, t: t, f: f, h: h };
  }

  function placeCorn(G, spots) {
    G.world.corn.forEach(function (c, i) {
      if (spots[i]) { c.x = spots[i][0]; c.y = spots[i][1]; c.taken = false; }
      else c.taken = true;
    });
  }

  var SHOTS = {
    // 1-cover: busiest Night 1 mid-run frame. Turkey centre-frame, big
    // panicked eyes, big farmer right behind, oven + knife ahead, corn
    // scattered, full HUD, mission banner. Farmyard painting behind.
    1: function (G) {
      var o = base(G, 0);
      o.s.time = 38 * 60; o.s.clock = '0:38'; o.s.score = 240; o.s.distance = 120;
      o.s.lives = 3; o.s.corn = 2;
      o.t.x = 620; o.t.face = 'panic';
      o.f.x = 380; o.f.state = 'chase';
      o.h.list.push({ kind: 'oven', x: 1010, y: CFG.GROUND_Y, w: 110, h: 130, heat: 0.8 });
      o.h.list.push({ kind: 'knife', x: 1000, y: 280, vy: 0, w: 26, h: 70, spin: 0.2 });
      o.h.list.push({ kind: 'trap', x: 760, y: CFG.GROUND_Y, w: 70, h: 26, sprung: false });
      placeCorn(G, [[520, 520], [700, 470], [820, 540], [960, 480]]);
      G.scene = { haystackX: null, tableX: null };
      o.s.spotted = true;
    },
    // 2-kitchen (BACKYARD DRUM GRILL): Night 2 outdoors. Turkey mid-jump
    // over a carving knife, the big smoking drum grill glowing behind with
    // a flare-up, SPOTTED! banner, lives 2/3. Backyard painting behind.
    2: function (G) {
      var o = base(G, 1);
      o.s.time = 84 * 60; o.s.clock = '1:24'; o.s.score = 610; o.s.distance = 340;
      o.s.lives = 2; o.s.corn = 5;
      o.t.x = 560; o.t.y = CFG.GROUND_Y - 120; o.t.onGround = false; o.t.vy = -4; o.t.face = 'panic';
      o.f.x = 300; o.f.state = 'chase';
      o.h.list.push({ kind: 'grill', x: 830, y: CFG.GROUND_Y, w: 130, h: 96, flare: 0.9, smokeSeed: 3 });
      o.h.list.push({ kind: 'knife', x: 700, y: 480, vy: 0, w: 26, h: 70, spin: -0.2 });
      placeCorn(G, [[460, 520], [760, 460], [940, 540]]);
      G.scene = { haystackX: 1010, tableX: null };
      o.s.spotted = true;
      o.s.bannerOverride = 'SPOTTED! — HIDE IN THE HAY';
    },
    // 3-dining: Night 3 dining room. Turkey sneaking past the Thanksgiving
    // table, family seated behind it, farmer searching in the distance,
    // high score. Dining-room painting behind.
    3: function (G) {
      var o = base(G, 2);
      o.s.time = 130 * 60; o.s.clock = '2:10'; o.s.score = 980; o.s.distance = 620;
      o.s.lives = 2; o.s.corn = 9;
      o.t.x = 230; o.t.face = 'determined';
      o.f.x = 1120; o.f.state = 'search';
      o.h.list.push({ kind: 'knife', x: 880, y: 260, vy: 0, w: 26, h: 70, spin: 0.1 });
      o.h.list.push({ kind: 'oven', x: 110, y: CFG.GROUND_Y, w: 110, h: 130, heat: 0.5 });
      placeCorn(G, [[380, 540], [760, 480]]);
      // Narrower family here so the searching farmer fits at the right
      // without covering Aunt Rose.
      G.scene = { haystackX: null, tableX: 620, familyW: 860 };
      o.s.spotted = false;
    },
    // 4-escape: the finale. Forest-gate painting, turkey running with a
    // relieved/happy face, ESCAPED! end screen, final score + distance.
    4: function (G) {
      var o = base(G, 2);
      o.s.time = 167 * 60; o.s.clock = '2:47'; o.s.score = 1350; o.s.distance = 900;
      o.s.lives = 2; o.s.corn = 12;
      o.s.mode = 'end'; o.s.escaped = true; o.s.caught = false;
      o.s.nightsCleared = 3;
      o.s.best = 'Escaped in 2:47 — 900 m, score 1350';
      o.s.endPanelX = 60; // narrow panel left, turkey + forest gate visible right
      o.s.bgOverride = 'bg-forest';
      o.t.x = 900; o.t.face = 'relieved';
      o.f.x = 1160; o.f.state = 'search';
      placeCorn(G, []);
      G.scene = { haystackX: null, tableX: null };
      o.s.spotted = false;
    },
  };

  function applyShot(G, num) {
    var fn = SHOTS[num];
    if (!fn) return false;
    G.scene = { haystackX: null, tableX: null, familyW: null };
    fn(G);
    // Keep the run's night object in sync with the shot's night index.
    G.run.night = window.TR.NIGHTS[G.run.nightIndex];
    G.run.bannerTimer = 9999;
    return true;
  }

  window.TR.Shots = { applyShot: applyShot, SHOTS: SHOTS };
})();
