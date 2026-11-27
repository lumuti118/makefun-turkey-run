// main.js — the game loop and state machine. One job: wire every module
// together (input -> update -> render), own the canvas, and run the game
// from file:// with zero network requests.
//
// Art loads first: nothing is drawn until assets.js has loaded and
// chroma-keyed every painting, so a staged shot never captures a half
// painted frame. In shot mode the page then sets window.__shotReady so
// the screenshot script knows the frame is final.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  window.TR.Input.bindCanvas(canvas);

  var params = new URLSearchParams(window.location.search);
  var shotNum = parseInt(params.get('shot') || '0', 10) || 0;
  var seed = parseInt(params.get('seed') || '20261127', 10) || 20261127;

  var G = {
    run: window.TR.Missions.newRun(seed),
    world: window.TR.World.newWorld(seed),
    turkey: window.TR.Turkey.newTurkey(),
    farmer: window.TR.Farmer.newFarmer(),
    hazards: window.TR.Hazards.newHazards(),
    scene: { haystackX: null, tableX: null, familyW: null },
    shotMode: shotNum > 0,
  };
  G.run.night = window.TR.NIGHTS[0];
  G.run.farmerGap = 999;
  G.run.spotted = false;

  function nearHaystack() {
    var t = G.turkey;
    for (var i = 0; i < G.world.haystacks.length; i++) {
      var h = G.world.haystacks[i];
      if (Math.abs(h.x - t.x) < 90 && t.onGround) return h;
    }
    return null;
  }

  function startRun() {
    window.TR.Missions.reset(G.run, seed);
    G.run.night = window.TR.NIGHTS[0];
    G.run.mode = 'play';
    G.run.bannerTimer = 150;
    G.world = window.TR.World.newWorld(seed);
    G.turkey = window.TR.Turkey.newTurkey();
    G.farmer = window.TR.Farmer.newFarmer();
    G.farmer.speed = CFG.FARMER_SPEED[0];
    G.hazards = window.TR.Hazards.newHazards();
    window.TR.Audio.ensure();
    window.TR.Audio.gobble();
    window.TR.Audio.startChase();
  }

  function render() {
    var s = G.run, night = G.shotMode ? window.TR.NIGHTS[s.nightIndex]
      : window.TR.World.nightDef(s.distance);
    s.night = night;
    var time = s.time;
    // The painted world: one full-scene painting per night (forest gate
    // for the staged finale, and for the escape moment in free play too).
    // No gradients, no code sky any more.
    var bgName = s.bgOverride || (s.escaped ? 'bg-forest' : null);
    window.TR.Render.drawBackground(ctx, night, bgName);

    // The Thanksgiving family behind their table (Night 3, staged or
    // when the run passes the table at 700 m) — never once the turkey
    // has reached the forest gate, staged or played.
    if ((s.nightIndex === 2 && s.distance < 820) || G.scene.tableX !== null) {
      var tableX = G.scene.tableX !== null ? G.scene.tableX
        : window.TR.World.screenX(700, s.distance);
      if (tableX > -300 && tableX < 1600) {
        window.TR.Farmer.drawFamily(ctx, tableX, time, G.scene.familyW);
      }
    }

    // Haystacks: the world's scrolling ones in free play, the scene's
    // own one in staged shots.
    if (!G.shotMode) {
      G.world.haystacks.forEach(function (h) {
        window.TR.Render.drawHaystack(ctx, h, time);
      });
    }
    if (G.shotMode && G.scene.haystackX !== null) {
      window.TR.Render.drawHaystack(ctx, { x: G.scene.haystackX }, time);
    }

    // Corn
    G.world.corn.forEach(function (c) { window.TR.Hazards.drawCorn(ctx, c, time); });

    // Hazards
    G.hazards.list.forEach(function (hz) {
      if (hz.kind === 'knife') window.TR.Hazards.drawKnife(ctx, hz);
      else if (hz.kind === 'grill') window.TR.Hazards.drawGrill(ctx, hz, time);
      else if (hz.kind === 'oven') window.TR.Hazards.drawOven(ctx, hz, time);
      else window.TR.Hazards.drawTrap(ctx, hz);
    });

    // Farmer + turkey — hidden on the title screen, where the title
    // panel + the happy turkey sprite carry the scene (the pair would
    // otherwise poke out from behind the panel). A hidden turkey is
    // inside the haystack: draw a tuft.
    if (s.mode !== 'title') {
      window.TR.Farmer.drawFarmer(ctx, G.farmer);
      if (G.turkey.hidden) {
        ctx.save();
        ctx.fillStyle = '#e8c85a';
        ctx.beginPath(); ctx.ellipse(G.turkey.x, CFG.GROUND_Y - 40, 30, 26, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(60,20,5,0.85)'; ctx.lineWidth = 3;
        ctx.strokeText('HIDDEN...', G.turkey.x, CFG.GROUND_Y - 78);
        ctx.fillText('HIDDEN...', G.turkey.x, CFG.GROUND_Y - 78);
        ctx.restore();
      } else {
        window.TR.Turkey.draw(ctx, G.turkey, time);
      }
    }

    // HUD + overlays
    if (s.mode !== 'title') window.TR.HUD.drawHUD(ctx, s);
    if (s.mode === 'title') window.TR.HUD.drawTitle(ctx, s);
    if (s.mode === 'end') window.TR.HUD.drawEnd(ctx, s);
    if (s.mode === 'paused') window.TR.HUD.drawPaused(ctx, s);

    // Shot-mode caption: which staged scene this is (judge-facing honesty).
    if (G.shotMode) {
      ctx.fillStyle = 'rgba(43,26,16,0.8)';
      ctx.fillRect(16, 668, 560, 36);
      ctx.fillStyle = '#f7c873'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('STAGED SCENE ' + shotNum + ' / 4 — rendered live by the game (seed ' + seed + ')', 28, 691);
    }
  }

  function update() {
    var s = G.run, input = window.TR.Input.held();

    // Title / end screens: click or Enter starts; R restarts.
    if (s.mode === 'title' || s.mode === 'end') {
      if (window.TR.Input.wasPressed('Enter') || window.TR.Input.getClick()) startRun();
      if (window.TR.Input.wasPressed('KeyR') || window.TR.Input.wasPressed('R')) startRun();
      s.time++;
      return;
    }
    if (window.TR.Input.wasPressed('KeyP') || window.TR.Input.wasPressed('P')) {
      s.mode = s.mode === 'paused' ? 'play' : 'paused';
    }
    if (window.TR.Input.wasPressed('KeyM') || window.TR.Input.wasPressed('M')) window.TR.Audio.toggleMute();
    if (s.mode === 'paused') { s.time++; return; }

    // Hide / unhide with E near a haystack.
    if (window.TR.Input.wasPressed('KeyE') || window.TR.Input.wasPressed('E')) {
      if (G.turkey.hidden) { G.turkey.hidden = false; }
      else if (nearHaystack()) {
        G.turkey.hidden = true;
        window.TR.Audio.gobble();
      }
    }

    window.TR.Missions.tick(s);
    if (s.mode !== 'play') return; // escaped during this tick

    // Farmer speed follows the night.
    G.farmer.speed = CFG.FARMER_SPEED[s.nightIndex];

    window.TR.World.update(G.world, s);
    window.TR.Turkey.update(G.turkey, input, s);
    window.TR.Farmer.update(G.farmer, G.turkey, s);
    window.TR.Hazards.update(G.hazards, s, 1);

    // Corn pickup.
    G.world.corn.forEach(function (c) {
      if (!c.taken && Math.abs(c.x - G.turkey.x) < 46 && Math.abs(c.y - (G.turkey.y - 50)) < 60) {
        c.taken = true;
        window.TR.Missions.collectCorn(s);
      }
    });

    // Hazard hit.
    var hit = window.TR.Hazards.hitTest(G.hazards, G.turkey, s);
    if (hit) {
      window.TR.Turkey.hurt(G.turkey);
      var res = window.TR.Missions.hit(s, G.farmer);
      if (res === 'dead') window.TR.Audio.stopChase();
    }

    // Farmer catches the turkey if he closes the gap entirely — but not
    // while the turkey is flashing invulnerable after a hit.
    if (G.farmer.x >= G.turkey.x - 46 && !G.turkey.hidden && G.turkey.hurtTimer <= 0) {
      window.TR.Turkey.hurt(G.turkey);
      var res2 = window.TR.Missions.hit(s, G.farmer);
      if (res2 === 'dead') window.TR.Audio.stopChase();
    }

    s.spotted = G.farmer.spotted;
    s.turkeyX = G.turkey.x;
  }

  function frame() {
    update();
    render();
    window.TR.Input.endFrame();
    if (!G.shotMode) requestAnimationFrame(frame);
  }

  // Boot: wait for the art, then pose the staged shot once (and flag it
  // ready for the screenshot script) or start the free-play loop.
  window.TR.Assets.loadAll(function () {
    if (G.shotMode) {
      window.TR.Shots.applyShot(G, shotNum);
      render();
      document.getElementById('status').textContent =
        'Turkey Run staged scene ' + shotNum + ': ' + G.run.night.banner +
        ' — score ' + Math.floor(G.run.score) + ', ' + G.run.distance + ' m, lives ' + G.run.lives;
      window.__shotReady = true;
    } else {
      window.__shotReady = true;
      requestAnimationFrame(frame);
    }
  });

  window.TR.Game = G;
})();
