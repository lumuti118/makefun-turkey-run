// turkey.js — the player turkey. One job: turkey physics, state
// (running / jumping / hiding / hurt) and drawing the turkey itself.
// The turkey is a real painted cartoon sprite (game/assets/turkey-*.jpg,
// chroma-keyed by assets.js): panic face while the farmer is close,
// determined while he is far, relieved/happy once escaped. The art faces
// left, so it is mirrored at draw time — the game runs to the right.
// A code-drawn shadow and a hurt flash are the only shapes left here.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  // Draw width of the turkey sprite on screen. The sprite's own aspect
  // sets its height (~0.85x the width after trimming).
  var SPRITE_W = 210;

  function newTurkey() {
    return {
      x: 420, y: CFG.GROUND_Y, vy: 0, onGround: true,
      hidden: false, hurtTimer: 0, face: 'panic', // panic | determined | relieved
      runPhase: 0, dir: 1,
    };
  }

  function update(t, input, state) {
    t.runPhase += 0.22;
    if (t.hurtTimer > 0) t.hurtTimer--;
    if (t.hidden) return; // hiding in a haystack: the turkey stays put
    if (input.left) t.x = Math.max(90, t.x - 3.4);
    if (input.right) t.x = Math.min(700, t.x + 3.4);
    if (input.jump && t.onGround) {
      t.vy = CFG.JUMP_V;
      t.onGround = false;
      window.TR.Audio.jump();
    }
    if (!t.onGround) {
      t.vy += CFG.GRAVITY;
      t.y += t.vy;
      if (t.y >= CFG.GROUND_Y) { t.y = CFG.GROUND_Y; t.vy = 0; t.onGround = true; }
    }
    // Face follows the danger: farmer close = panic, far = determined.
    t.face = (state.farmerGap < 260) ? 'panic' : 'determined';
    if (state.escaped) t.face = 'relieved';
  }

  function hurt(t) { t.hurtTimer = 40; window.TR.Audio.thud(); }

  function draw(ctx, t, time) {
    var bob = t.onGround ? Math.sin(t.runPhase) * 4 : 0;
    var tilt = t.onGround ? Math.sin(t.runPhase) * 0.05 : -0.12;
    // Ground shadow (stays on the ground even while jumping).
    ctx.fillStyle = 'rgba(60,30,10,0.30)';
    ctx.beginPath(); ctx.ellipse(t.x, CFG.GROUND_Y + 6, 52, 9, 0, 0, Math.PI * 2); ctx.fill();

    var name = (t.face === 'relieved') ? 'turkey-happy' : 'turkey-panic';
    var alpha = (t.hurtTimer > 0 && (t.hurtTimer % 8 < 4)) ? 0.45 : 1;
    ctx.save();
    ctx.translate(t.x, t.y + bob);
    ctx.rotate(tilt);
    ctx.translate(-t.x, -(t.y + bob));
    var ok = window.TR.Assets.drawSprite(ctx, name, t.x, t.y + bob, SPRITE_W, true, alpha);
    ctx.restore();
    if (!ok) {
      // Art failed to load: a plain brown body keeps the game playable.
      ctx.fillStyle = '#8a5a2b';
      ctx.beginPath(); ctx.ellipse(t.x, t.y - 38, 44, 36, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  window.TR.Turkey = {
    newTurkey: newTurkey, update: update, draw: draw, hurt: hurt,
    SPRITE_W: SPRITE_W,
  };
})();
