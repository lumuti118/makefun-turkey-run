// shots.js — deterministic staged screenshot scenes (?shot=1..4&seed=1).
// One job: pose one frozen frame per shot so the screenshots are repeatable.
// These are STAGED SCENES rendered live by the game code — never presented
// as a recording of one played run. Numbers are the real rules' values at
// each distance (frame-audit, 27 Nov 2026): distance grows 0.234 m/frame,
// score = 0.045/frame + 50/corn + 150/night-crossing, clock = floor(frames/60).
// time 0:08 -> 0:24 -> 0:49 -> 1:04, score 73 -> 415 -> 834 -> 1023,
// distance 120 m -> 340 m -> 700 m -> 900 m, lives 3 -> 2 -> 2 -> 2.
// NOTE: the live game at shipped farmer speeds cannot survive past ~112 m
// (frame audit: no-input dies at 63 m, best bot at 112 m — the farmer
// catches the turkey 3x before the first haystack at ~144 m). These staged
// numbers are what the rules say a run at each distance scores, NOT states
// a live run can reach yet — see the audit report before submitting.
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
      // 120 m: frame 513 (0.234 m/frame), clock 0:08, score 0.045*513 + 50*1 = 73.
      // Corn 1: only the 60 m cob is collected by 120 m (next at 140 m).
      o.s.time = 513; o.s.clock = '0:08'; o.s.score = 73; o.s.distance = 120;
      o.s.lives = 3; o.s.corn = 1; o.s.nightsCleared = 0;
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
    // a flare-up, red SPOTTED! alert, lives 2/3. Backyard painting behind.
    2: function (G) {
      var o = base(G, 1);
      // 340 m: frame 1453, clock 0:24, score 0.045*1453 + 50*4 + 150 = 415.
      // Corn 4 (60/140/210/280 m); night 1 cleared at 300 m (+150).
      o.s.time = 1453; o.s.clock = '0:24'; o.s.score = 415; o.s.distance = 340;
      o.s.lives = 2; o.s.corn = 4; o.s.nightsCleared = 1;
      o.t.x = 560; o.t.y = CFG.GROUND_Y - 120; o.t.onGround = false; o.t.vy = -4; o.t.face = 'panic';
      o.f.x = 300; o.f.state = 'chase';
      o.h.list.push({ kind: 'grill', x: 830, y: CFG.GROUND_Y, w: 130, h: 96, flare: 0.9, smokeSeed: 3 });
      o.h.list.push({ kind: 'knife', x: 700, y: 480, vy: 0, w: 26, h: 70, spin: -0.2 });
      placeCorn(G, [[460, 520], [760, 460], [940, 540]]);
      G.scene = { haystackX: 1010, tableX: null };
      o.s.spotted = true;
      // No bannerOverride: the banner shows the night banner
      // ("NIGHT 2 — DODGE THE DRUM GRILL") and the red SPOTTED! alert
      // carries the warning — one SPOTTED! message, not two.
    },
    // 3-dining: Night 3 dining room. Turkey sneaking past the Thanksgiving
    // table, family seated behind it, farmer searching in the distance,
    // high score. Dining-room painting behind.
    // Moved 620 m -> 700 m in the frame audit: nightFor(620) is Night 2,
    // so a Night 3 dining room at 620 m was a scene-order error. 700 m is
    // the family table's real world position (nightFor(700) = 2).
    3: function (G) {
      var o = base(G, 2);
      // 700 m: frame 2992, clock 0:49, score 0.045*2992 + 50*8 + 150*2 = 834.
      // Corn 8 (up to the 610 m cob); nights 1+2 cleared (+300).
      o.s.time = 2992; o.s.clock = '0:49'; o.s.score = 834; o.s.distance = 700;
      o.s.lives = 2; o.s.corn = 8; o.s.nightsCleared = 2;
      // Turkey at x=300 (was 230): the oven label at x=110 spans ~35..185
      // and the turkey sprite starts at ~195 — clear of the label now.
      o.t.x = 300; o.t.face = 'determined';
      o.f.x = 1120; o.f.state = 'search';
      o.h.list.push({ kind: 'knife', x: 880, y: 260, vy: 0, w: 26, h: 70, spin: 0.1 });
      o.h.list.push({ kind: 'oven', x: 110, y: CFG.GROUND_Y, w: 110, h: 130, heat: 0.5 });
      placeCorn(G, [[430, 540], [760, 480]]);
      // Narrower family here so the searching farmer fits at the right
      // without covering Aunt Rose.
      G.scene = { haystackX: null, tableX: 620, familyW: 860 };
      o.s.spotted = false;
    },
    // 4-escape: the finale. Forest-gate painting, turkey running with a
    // relieved/happy face, ESCAPED! end screen, final score + distance.
    4: function (G) {
      var o = base(G, 2);
      // 900 m escape: frame 3847, clock 1:04, score 0.045*3847 + 50*11 + 150*2 = 1023.
      // Corn 11: the 890 m cob is collected at camera ~931 m, past the gate;
      // a player running far right (turkey x=700) would collect it at ~865 m
      // for 12/12 — 11 is the default-x baseline.
      o.s.time = 3847; o.s.clock = '1:04'; o.s.score = 1023; o.s.distance = 900;
      o.s.lives = 2; o.s.corn = 11;
      o.s.mode = 'end'; o.s.escaped = true; o.s.caught = false;
      o.s.nightsCleared = 3;
      o.s.best = 'Escaped in 1:04 — 900 m, score 1023';
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
