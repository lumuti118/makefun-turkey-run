// missions.js — scoring, lives, night progression and win/lose.
// One job: the rules of the escape (what earns points, what costs a life,
// when a night is cleared, when the turkey escapes or is caught).
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  function newRun(seed) {
    return {
      mode: 'title', // title | play | paused | end
      score: 0, distance: 0, corn: 0, lives: CFG.MAX_LIVES,
      time: 0, clock: '0:00', speed: CFG.RUN_SPEED,
      nightIndex: 0, nightsCleared: 0, escaped: false, caught: false,
      bannerTimer: 0, caughtFlash: 0, spotted: false, farmerGap: 999,
      best: 'No escape yet — be the first turkey out!',
      rng: window.TR.makeRng(seed || 20261127),
      seed: seed || 20261127,
      turkeyX: 420,
      bgOverride: null, // staged shots may force a background (forest gate)
      bannerOverride: null,
      endPanelX: null,
    };
  }

  function fmtClock(frames) {
    var total = Math.floor(frames / 60);
    var m = Math.floor(total / 60), s = total % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // One frame of play: distance grows, score follows, nights advance.
  function tick(s) {
    s.time++;
    s.clock = fmtClock(s.time);
    if (s.mode !== 'play') return;
    s.distance += s.speed * 0.045;
    s.score += CFG.SCORE_METER * 0.045;
    // Night transitions: banner + bonus + farmer speeds up.
    var ni = window.TR.World.nightFor(s.distance);
    if (ni !== s.nightIndex) {
      s.nightIndex = ni;
      s.nightsCleared = ni;
      s.score += CFG.SCORE_NIGHT_BONUS;
      s.bannerTimer = 150;
      window.TR.Audio.gobble();
    }
    if (s.bannerTimer > 0) s.bannerTimer--;
    if (s.caughtFlash > 0) s.caughtFlash--;
    // The forest gate: 900 m and the turkey is free.
    if (s.distance >= CFG.NIGHT_END[2]) {
      s.escaped = true;
      s.mode = 'end';
      s.nightsCleared = 3; // all three nights survived, gate included
      s.best = 'Escaped in ' + s.clock + ' — ' + s.distance.toFixed(0) + ' m, score ' + Math.floor(s.score);
      window.TR.Audio.escapeJingle();
      window.TR.Audio.stopChase();
    }
  }

  function collectCorn(s) {
    s.corn++;
    s.score += CFG.SCORE_CORN;
    window.TR.Audio.corn();
  }

  // A hazard hit: lose a life, brief invulnerability, farmer pushed back.
  // Returns 'dead' when lives run out.
  function hit(s, farmer) {
    s.lives--;
    s.caughtFlash = 70;
    window.TR.Audio.clang();
    window.TR.Audio.gobble();
    if (farmer) farmer.x = Math.max(60, farmer.x - 220);
    if (s.lives <= 0) {
      s.lives = 0;
      s.caught = true;
      s.mode = 'end';
      s.best = 'Caught after ' + s.distance.toFixed(0) + ' m — score ' + Math.floor(s.score);
      window.TR.Audio.stopChase();
      return 'dead';
    }
    return 'hurt';
  }

  function reset(s, seed) {
    var fresh = newRun(seed || s.seed);
    Object.keys(fresh).forEach(function (k) { s[k] = fresh[k]; });
  }

  window.TR.Missions = {
    newRun: newRun, tick: tick, collectCorn: collectCorn, hit: hit, reset: reset,
  };
})();
