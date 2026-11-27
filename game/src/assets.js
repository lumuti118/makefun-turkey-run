// assets.js — loads the game's painted art and hands it to the draw calls.
// One job: images in, drawable art out. No game logic here.
//
// The art is nine painted files under game/assets/, loaded by relative
// path — zero network requests, the game opens straight from file://.
//
// Why the sprites are PNGs with real alpha instead of being chroma-keyed
// in this file: the image tool cannot output transparency, so the sprites
// were painted on a solid flat magenta key colour — but a canvas that has
// drawn a file:// image is TAINTED in desktop Chrome, and getImageData
// throws, so runtime keying cannot work from file:// at all. The key was
// therefore removed at asset-build time (same distance rule a runtime
// keyer would use: pixels within 70 of magenta (253, 0, 161) fully out,
// within 115 faded out for a soft edge), each sprite trimmed to its
// content box, and saved as a PNG with a true alpha channel. This file
// just loads those PNGs and the four full-scene JPG backgrounds.
(function () {
  'use strict';

  var FILES = {
    'bg-farmyard': 'assets/bg-farmyard.jpg',
    'bg-grill': 'assets/bg-grill.jpg',
    'bg-dining': 'assets/bg-dining.jpg',
    'bg-forest': 'assets/bg-forest.jpg',
    'turkey-panic': 'assets/turkey-panic.png',
    'turkey-happy': 'assets/turkey-happy.png',
    'farmer-jed': 'assets/farmer-jed.png',
    'family-table': 'assets/family-table.png',
    'drum-grill': 'assets/drum-grill.png',
  };

  var store = {};   // name -> loaded image (backgrounds and sprites alike)
  var loaded = 0;
  var total = 0;
  var ready = false;
  var failed = [];

  function loadAll(done) {
    var names = Object.keys(FILES);
    total = names.length;
    if (total === 0) { ready = true; done(); return; }
    names.forEach(function (name) {
      var img = new Image();
      img.onload = function () {
        store[name] = img;
        loaded++;
        if (loaded + failed.length >= total) { ready = true; done(); }
      };
      img.onerror = function () {
        failed.push(name);
        loaded++;
        if (loaded + failed.length >= total) { ready = true; done(); }
      };
      img.src = FILES[name];
    });
  }

  // Draw a background painting full-bleed over the 1280x720 canvas.
  function drawBackground(ctx, name) {
    var img = store[name];
    if (img) ctx.drawImage(img, 0, 0, 1280, 720);
  }

  // Draw a sprite so its bottom edge sits at (cx, bottomY) and it is `w`
  // wide (height follows the sprite's own aspect). flip=true mirrors it
  // horizontally (the turkey art faces left; the game runs right).
  // Returns false when the sprite is not loaded, so callers can fall back.
  function drawSprite(ctx, name, cx, bottomY, w, flip, alpha) {
    var img = store[name];
    if (!img) return false;
    var h = w * (img.height / img.width);
    ctx.save();
    if (alpha !== undefined && alpha < 1) ctx.globalAlpha = alpha;
    ctx.translate(cx, bottomY - h / 2);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  // Height of a sprite when drawn `w` wide (for layout that needs it).
  function spriteHeight(name, w) {
    var img = store[name];
    return img ? w * (img.height / img.width) : 0;
  }

  window.TR.Assets = {
    loadAll: loadAll,
    drawBackground: drawBackground,
    drawSprite: drawSprite,
    spriteHeight: spriteHeight,
    isReady: function () { return ready; },
    failed: function () { return failed.slice(); },
    count: function () { return { loaded: loaded, total: total }; },
  };
})();
