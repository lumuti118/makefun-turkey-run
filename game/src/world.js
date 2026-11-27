// world.js — the farm world: night/place data, scrolling scenery, corn
// pickups, haystack hiding spots, and distance -> night progression.
// One job: the world the turkey runs through.
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
      corn.push({ d: cornDist[i], x: 0, y: CFG.GROUND_Y - 46 - (rng() * 60 | 0), taken: false });
    }
    // Haystacks to hide in: one per night, roughly mid-night.
    haystacks.push({ d: 180, x: 0 }, { d: 480, x: 0 }, { d: 760, x: 0 });
    // Scenery props placed by distance so the parallax never repeats oddly.
    var props = [];
    var kinds = ['pumpkin', 'fence', 'tree', 'bush', 'lantern'];
    for (var d = 20; d < 900; d += 45) {
      props.push({ d: d, kind: kinds[(rng() * kinds.length) | 0], s: 0.8 + rng() * 0.6 });
    }
    return { rng: rng, corn: corn, haystacks: haystacks, props: props, scroll: 0 };
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
    world.props.forEach(function (p) { p.x = screenX(p.d, cam); });
  }

  window.TR.World = {
    newWorld: newWorld, nightFor: nightFor, nightDef: nightDef,
    screenX: screenX, update: update,
  };
})();
