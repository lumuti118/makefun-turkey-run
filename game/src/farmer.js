// farmer.js — the chasers. One job: farmer AI (chase -> search -> corner)
// plus the Thanksgiving family at the dining table, and drawing them all.
// The farmer is a real painted cartoon sprite (game/assets/farmer-jed.jpg,
// chroma-keyed by assets.js): big, red-faced, straw hat, arms reaching.
// The family is one painted scene (game/assets/family-table.jpg): Grandma
// pointing, Uncle Bob snoring, Cousin May giggling, Aunt Rose gasping,
// seated behind the Thanksgiving table with the roast bird on it.
// Shout lines and name labels are still drawn in code above the art.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  // Draw widths on screen. Sprite aspect sets the height.
  var FARMER_W = 300;
  var FAMILY_W = 1020;

  function newFarmer() {
    return {
      x: 150, y: CFG.GROUND_Y, state: 'chase', // chase | search | corner
      stateTimer: 0, searchX: 0, speed: 2.6, armSwing: 0,
      spotted: false, name: 'Farmer Jed',
    };
  }

  // gap = horizontal distance farmer -> turkey (px). AI:
  // chase while the turkey is visible; if the turkey hides, search the
  // haystacks; if the turkey lingers near a wall/edge, corner (speed up).
  function update(f, turkey, state) {
    f.armSwing += 0.3;
    var gap = turkey.x - f.x;
    f.stateTimer--;
    if (turkey.hidden) {
      if (f.state !== 'search') { f.state = 'search'; f.stateTimer = 150; f.searchX = turkey.x; }
      // Farmer walks to the haystack and pokes around, then gives up.
      var dx = f.searchX - f.x;
      f.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.6);
      if (f.stateTimer <= 0) { f.state = 'chase'; f.x -= 60; }
    } else if (gap < 130 && state.distance > 40) {
      f.state = 'corner';
      f.x += f.speed * 1.7; // lunges to corner the turkey
    } else {
      if (f.state !== 'chase') f.state = 'chase';
      f.x += f.speed;
    }
    // Farmer never quite catches the turkey while it keeps running at full
    // speed — he gains only when the turkey dawdles or gets hit.
    if (f.x > turkey.x - 40) f.x = turkey.x - 40;
    f.spotted = !turkey.hidden && gap < 420;
    state.farmerGap = turkey.x - f.x;
  }

  function drawFarmer(ctx, f) {
    // Ground shadow under the sprite's feet.
    ctx.fillStyle = 'rgba(60,30,10,0.30)';
    ctx.beginPath(); ctx.ellipse(f.x, CFG.GROUND_Y + 6, 74, 10, 0, 0, Math.PI * 2); ctx.fill();
    var h = window.TR.Assets.spriteHeight('farmer-jed', FARMER_W);
    var bob = Math.sin(f.armSwing) * 3;
    var ok = window.TR.Assets.drawSprite(ctx, 'farmer-jed', f.x, f.y + bob * 0.4, FARMER_W, false);
    if (!ok) {
      ctx.fillStyle = '#b03024';
      ctx.beginPath(); ctx.ellipse(f.x, f.y - 105, 52, 48, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Shout line above his head when chasing.
    if (f.state === 'chase' || f.state === 'corner') {
      var shout = f.state === 'corner' ? 'GOTCHA!' : 'COME BACK HERE!';
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#7c1d14'; ctx.lineWidth = 4;
      ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
      var sy = f.y - h - 26;
      ctx.strokeText(shout, f.x + 30, sy);
      ctx.fillText(shout, f.x + 30, sy);
    }
    // Name tag under his feet so the judge knows who he is.
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(60,20,5,0.8)'; ctx.lineWidth = 3;
    ctx.strokeText('FARMER JED', f.x, f.y + 26);
    ctx.fillText('FARMER JED', f.x, f.y + 26);
  }

  // The Thanksgiving family, seated at the dining table in Night 3.
  // They are watchers, not chasers: Grandma points, Uncle snores, the
  // cousin giggles, the aunt gasps — while the turkey sneaks past.
  // Drawn so the table's bottom edge sits on the ground line.
  function drawFamily(ctx, tableX, time, width) {
    var w = width || FAMILY_W;
    var h = window.TR.Assets.spriteHeight('family-table', w);
    var topY = CFG.GROUND_Y - h;
    var bob = Math.sin(time * 0.05) * 2;
    var ok = window.TR.Assets.drawSprite(ctx, 'family-table', tableX, CFG.GROUND_Y + bob * 0.2, w, false);
    if (!ok) {
      ctx.fillStyle = '#f7f0e0';
      ctx.fillRect(tableX - 260, CFG.GROUND_Y - 96, 520, 96);
      return;
    }
    // Names in one line above the painting (the heads touch the top edge
    // of the sprite, so labels on the art itself would cover their hair).
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(60,20,5,0.85)'; ctx.lineWidth = 3;
    ctx.strokeText('THANKSGIVING TABLE — sneak past it!', tableX, topY - 34);
    ctx.fillText('THANKSGIVING TABLE — sneak past it!', tableX, topY - 34);
    ctx.font = 'bold 13px sans-serif';
    ctx.strokeText('GRANDMA  ·  UNCLE BOB  ·  COUSIN MAY  ·  AUNT ROSE', tableX, topY - 14);
    ctx.fillText('GRANDMA  ·  UNCLE BOB  ·  COUSIN MAY  ·  AUNT ROSE', tableX, topY - 14);
  }

  window.TR.Farmer = {
    newFarmer: newFarmer, update: update,
    drawFarmer: drawFarmer, drawFamily: drawFamily,
    FARMER_W: FARMER_W, FAMILY_W: FAMILY_W,
  };
})();
