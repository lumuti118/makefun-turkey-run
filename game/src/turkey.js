// turkey.js — the player turkey. One job: turkey physics, state
// (running / jumping / hiding / hurt) and drawing the turkey itself.
// Drawn in code (canvas shapes, original art): big expressive eyes, a
// panicked-or-determined face, warm desert palette — Oscar's Oasis style
// slapstick, never copied artwork.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

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
    ctx.save();
    ctx.translate(t.x, t.y);
    if (t.hurtTimer > 0 && (t.hurtTimer % 8 < 4)) ctx.globalAlpha = 0.45;
    var bob = t.onGround ? Math.sin(t.runPhase) * 3 : 0;
    var legSwing = t.onGround ? Math.sin(t.runPhase) * 10 : 6;

    // Shadow
    ctx.fillStyle = 'rgba(60,30,10,0.28)';
    ctx.beginPath(); ctx.ellipse(0, 4, 46, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Tail feathers (fan, ochre + dusty orange)
    var tailCols = ['#c96a1e', '#e08a2e', '#a34d12'];
    for (var i = -2; i <= 2; i++) {
      ctx.save();
      ctx.rotate(i * 0.32 - 0.1);
      ctx.fillStyle = tailCols[(i + 2) % 3];
      ctx.beginPath(); ctx.ellipse(-34, -52 + bob * 0.4, 13, 34, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f7c873';
      ctx.beginPath(); ctx.ellipse(-34, -78 + bob * 0.4, 6, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Legs (running)
    ctx.strokeStyle = '#e8a33c'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-8 + legSwing, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -18); ctx.lineTo(8 - legSwing, 0); ctx.stroke();

    // Body — warm sand-brown, plump
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.ellipse(0, -38 + bob, 44, 36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a96f33';
    ctx.beginPath(); ctx.ellipse(0, -30 + bob, 38, 26, 0, 0, Math.PI * 2); ctx.fill();
    // Wing
    ctx.fillStyle = '#6f4420';
    ctx.beginPath(); ctx.ellipse(-6, -36 + bob, 24, 16, -0.5, 0, Math.PI * 2); ctx.fill();

    // Head — big, with the BIG expressive eyes
    ctx.fillStyle = '#b07a3e';
    ctx.beginPath(); ctx.arc(26, -82 + bob, 24, 0, Math.PI * 2); ctx.fill();
    // Beak
    ctx.fillStyle = '#e8a33c';
    ctx.beginPath(); ctx.moveTo(44, -86 + bob); ctx.lineTo(62, -78 + bob); ctx.lineTo(44, -72 + bob); ctx.closePath(); ctx.fill();
    // Wattle
    ctx.fillStyle = '#d23b2e';
    ctx.beginPath(); ctx.ellipse(48, -66 + bob, 6, 10, 0.3, 0, Math.PI * 2); ctx.fill();
    // Eyes: huge white + pupil; panic = wide + raised brows, determined = narrowed
    var eyeY = -88 + bob;
    var eyeR = t.face === 'panic' ? 10 : 8;
    [18, 38].forEach(function (ex) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c0f08';
      var px = ex + (t.face === 'panic' ? 2 : 4);
      var py = eyeY + (t.face === 'panic' ? -2 : 1);
      ctx.beginPath(); ctx.arc(px, py, t.face === 'panic' ? 4.5 : 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(px + 1.5, py - 1.5, 1.4, 0, Math.PI * 2); ctx.fill();
    });
    // Brows
    ctx.strokeStyle = '#5f3517'; ctx.lineWidth = 3;
    ctx.beginPath();
    if (t.face === 'panic') {
      ctx.moveTo(10, -102 + bob); ctx.lineTo(26, -98 + bob);
      ctx.moveTo(30, -98 + bob); ctx.lineTo(46, -102 + bob);
    } else if (t.face === 'relieved') {
      ctx.moveTo(10, -100 + bob); ctx.quadraticCurveTo(18, -104 + bob, 26, -100 + bob);
      ctx.moveTo(30, -100 + bob); ctx.quadraticCurveTo(38, -104 + bob, 46, -100 + bob);
    } else {
      ctx.moveTo(10, -98 + bob); ctx.lineTo(26, -101 + bob);
      ctx.moveTo(30, -101 + bob); ctx.lineTo(46, -98 + bob);
    }
    ctx.stroke();
    // Mouth: panic = open gasp, determined = flat line, relieved = smile
    ctx.strokeStyle = '#5f3517'; ctx.lineWidth = 3;
    ctx.beginPath();
    if (t.face === 'panic') {
      ctx.fillStyle = '#7a1f16';
      ctx.beginPath(); ctx.ellipse(38, -64 + bob, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
    } else if (t.face === 'relieved') {
      ctx.arc(36, -68 + bob, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    } else {
      ctx.moveTo(30, -64 + bob); ctx.lineTo(44, -64 + bob);
    }
    ctx.stroke();

    // Sweat drop when panicking (slapstick)
    if (t.face === 'panic') {
      ctx.fillStyle = '#9fd8ef';
      ctx.beginPath(); ctx.ellipse(52, -104 + bob + Math.sin(time * 0.1) * 2, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  window.TR.Turkey = { newTurkey: newTurkey, update: update, draw: draw, hurt: hurt };
})();
