// world.js — the farm world: night/place data, corn pickups, haystack
// hiding spots, and distance -> night progression.
// One job: the world the turkey runs through. The scenery itself is
// painted (game/assets/bg-*.jpg); this file only places the things the
// turkey interacts with.
(function () {
  'use strict';
  var CFG = window.TR.CFG, NIGHTS = window.TR.NIGHTS;

  // A world is built fresh per run from a fixed seed: same seed, same farm.
  function newWorld(seed) {
    var rng = window.TR.makeRng(seed);
    var corn = [];
    var haystacks = [];
    // 12 corn cobs across the 3 nights, 4 per night, at fixed distances.
    var cornDist = [60, 140, 210, 280, 360, 440, 520, 610, 700, 780, 850, 890];
    for (var i = 0; i < cornDist.length; i++) {
      corn.push({ d: cornDist[i], x: screenX(cornDist[i], 0), y: CFG.GROUND_Y - 46 - (rng() * 60 | 0), taken: false });
    }
    // Haystacks to hide in: one per night, roughly mid-night.
    haystacks.push({ d: 180, x: screenX(180, 0) }, { d: 480, x: screenX(480, 0) }, { d: 760, x: screenX(760, 0) });
    return { rng: rng, corn: corn, haystacks: haystacks, scroll: 0 };
  }

  function nightFor(distance) {
    if (distance < CFG.NIGHT_END[0]) return 0;
    if (distance < CFG.NIGHT_END[1]) return 1;
    return 2;
  }

  function nightDef(distance) { return NIGHTS[nightFor(distance)]; }

  // Screen x of a thing that lives at world-distance d, given the camera.
  function screenX(d, cameraD) { return 640 + (d - cameraD) * 4.2; }

  // Advance the world one frame: scroll by run speed, move corn/haystacks.
  function update(world, state) {
    world.scroll += state.speed;
    var cam = state.distance;
    world.corn.forEach(function (c) { c.x = screenX(c.d, cam); });
    world.haystacks.forEach(function (h) { h.x = screenX(h.d, cam); });
  }

  window.TR.World = {
    newWorld: newWorld, nightFor: nightFor, nightDef: nightDef,
    screenX: screenX, update: update,
  };
})();
