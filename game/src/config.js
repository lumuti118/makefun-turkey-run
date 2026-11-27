// config.js — tuning constants, the 3-night plan and the seeded RNG.
// One job: numbers and level definitions. Nothing here draws or updates.
(function () {
  'use strict';

  // Seeded RNG (mulberry32) so staged shots and spawns are deterministic.
  function makeRng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var CFG = {
    W: 1280, H: 720,
    GROUND_Y: 600,
    GRAVITY: 0.55,
    JUMP_V: -13.5,
    RUN_SPEED: 5.2,
    MAX_LIVES: 3,
    // Night lengths in metres; reaching the end of Night 3 = the forest gate.
    NIGHT_END: [300, 650, 900],
    // Farmer base speed per night (m/s of screen chase); he gets faster.
    FARMER_SPEED: [1.8, 2.4, 3.0],
    // Hazard spawn gap (frames) per night; smaller = denser.
    HAZARD_GAP: [110, 85, 65],
    CORN_PER_NIGHT: 4,
    SCORE_CORN: 50,
    SCORE_METER: 1,
    SCORE_NIGHT_BONUS: 150,
  };

  // The world: coop -> farmyard -> BACKYARD DRUM-GRILL (Night 2) ->
  // dining room -> forest gate. Night 2 is OUTDOORS, a real-life
  // Thanksgiving backyard: the cooking happens outside on a big oil-drum
  // BBQ smoker, not in an indoor kitchen. Each night has its own painted
  // background (game/assets/bg-*.jpg); the forest gate is the finale shot.
  var NIGHTS = [
    {
      n: 1, name: 'NIGHT 1', title: 'ESCAPE THE FARMYARD',
      place: 'Farmyard', bg: 'bg-farmyard',
      sky: '#f7c873', skyTop: '#e8955a',
      ground: '#c98f4e', groundDark: '#a96f33',
      banner: 'NIGHT 1 — ESCAPE THE FARMYARD',
      intro: 'The farmer is coming. Run, little turkey, run!',
      hazardKinds: ['knife', 'trap', 'oven'],
    },
    {
      n: 2, name: 'NIGHT 2', title: 'THE BACKYARD DRUM GRILL',
      place: 'Backyard Grill', bg: 'bg-grill',
      sky: '#f2a65e', skyTop: '#d96f3c',
      ground: '#b57a3d', groundDark: '#8f5c28',
      banner: 'NIGHT 2 — DODGE THE DRUM GRILL',
      intro: 'Thanksgiving dinner is cooking OUTSIDE. Dodge the drum grill!',
      hazardKinds: ['knife', 'grill', 'trap', 'grill'],
    },
    {
      n: 3, name: 'NIGHT 3', title: 'THE GREAT ESCAPE',
      place: 'Dining Room', bg: 'bg-dining',
      sky: '#e08a4e', skyTop: '#b4502e',
      ground: '#7d4a26', groundDark: '#5f3517',
      banner: 'NIGHT 3 — THE GREAT ESCAPE',
      intro: 'Past the Thanksgiving table — the forest gate is ahead!',
      hazardKinds: ['knife', 'oven', 'trap', 'knife'],
    },
  ];

  window.TR = window.TR || {};
  window.TR.CFG = CFG;
  window.TR.NIGHTS = NIGHTS;
  window.TR.makeRng = makeRng;
})();
