// hud.js — the HUD (score, distance, lives, night, corn), mission banners,
// SPOTTED!/CAUGHT!/ESCAPED! alerts, the title screen and the end screens.
// One job: every pixel of UI text and panels.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  function panel(ctx, x, y, w, h, fill) {
    ctx.fillStyle = fill || 'rgba(43,26,16,0.78)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(247,200,115,0.7)'; ctx.lineWidth = 2; ctx.stroke();
  }

  function hearts(ctx, lives, max) {
    for (var i = 0; i < max; i++) {
      var x = 1180 - i * 34, y = 47;
      ctx.save();
      ctx.translate(x, y);
      if (i < lives) {
        ctx.fillStyle = '#e84a5f';
        ctx.beginPath(); ctx.arc(-6, -4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, -4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(0, 13); ctx.lineTo(13, 0); ctx.closePath(); ctx.fill();
      } else {
        ctx.strokeStyle = '#e84a5f'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-6, -4, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(6, -4, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(0, 13); ctx.lineTo(13, 0); ctx.closePath(); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawHUD(ctx, s) {
    // Top bar
    panel(ctx, 16, 12, 760, 64, 'rgba(43,26,16,0.72)');
    ctx.fillStyle = '#f7c873'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('SCORE ' + Math.floor(s.score), 32, 40);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText(s.distance + ' m', 250, 40);
    ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText('CORN ' + s.corn + '/12', 380, 40);
    ctx.fillStyle = '#ffb08a'; ctx.font = 'bold 17px sans-serif';
    ctx.fillText(s.night.name + '  ·  ' + s.night.place.toUpperCase(), 500, 40);
    // Lives (hearts)
    panel(ctx, 1090, 12, 174, 64, 'rgba(43,26,16,0.72)');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('LIVES', 1177, 27);
    hearts(ctx, s.lives, CFG.MAX_LIVES);
    // Clock
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(s.clock, 1264, 100);
    // Mission banner
    if (s.bannerTimer > 0) {
      ctx.globalAlpha = Math.min(1, s.bannerTimer / 30);
      panel(ctx, 340, 96, 600, 46);
      ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.bannerOverride || s.night.banner, 640, 127);
      ctx.globalAlpha = 1;
    }
    // SPOTTED! alert
    if (s.spotted && s.mode === 'play') {
      var pulse = 0.75 + Math.sin(s.time * 0.3) * 0.25;
      ctx.globalAlpha = pulse;
      panel(ctx, 490, 160, 300, 52, 'rgba(176,30,20,0.85)');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('SPOTTED!', 640, 196);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText('HIDE IN THE HAY  (E)  or OUTRUN HIM!', 640, 226);
    }
    // "CAUGHT — one life lost" flash
    if (s.caughtFlash > 0) {
      ctx.globalAlpha = Math.min(0.85, s.caughtFlash / 40);
      panel(ctx, 440, 260, 400, 60, 'rgba(176,30,20,0.9)');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CAUGHT!  -1 LIFE', 640, 298);
      ctx.globalAlpha = 1;
    }
  }

  function drawTitle(ctx, s) {
    ctx.fillStyle = 'rgba(43,26,16,0.45)';
    ctx.fillRect(0, 0, CFG.W, CFG.H);
    panel(ctx, 240, 120, 800, 400, 'rgba(43,26,16,0.88)');
    ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 64px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TURKEY RUN', 640, 205);
    ctx.fillStyle = '#ffb08a'; ctx.font = 'bold 26px sans-serif';
    ctx.fillText('3 NIGHTS TO FREEDOM', 640, 248);
    ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
    ctx.fillText('Turkey Run: 3 nights, 4 stages, 12 corn, 1 forest gate', 640, 292);
    ctx.fillText('Escape Thanksgiving dinner — outrun Farmer Jed!', 640, 322);
    ctx.fillStyle = '#f7c873'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText('ARROWS / WASD — run      SPACE — jump      E — hide in hay', 640, 368);
    ctx.fillText('Dodge knives, the drum grill, the oven and snare traps.', 640, 396);
    ctx.fillText('Grab corn for points. 3 lives. Reach the forest gate!', 640, 424);
    var blink = Math.sin(s.time * 0.12) > 0;
    if (blink) {
      ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 26px sans-serif';
      ctx.fillText('▶  CLICK or press ENTER to start  ◀', 640, 478);
    }
    ctx.fillStyle = '#c9a227'; ctx.font = '15px sans-serif';
    ctx.fillText('Night 1 Farmyard  →  Night 2 Backyard Drum Grill  →  Night 3 Dining Room → Forest Gate', 640, 556);
  }

  function drawEnd(ctx, s) {
    ctx.fillStyle = s.escaped ? 'rgba(20,60,25,0.5)' : 'rgba(60,10,5,0.55)';
    ctx.fillRect(0, 0, CFG.W, CFG.H);
    // Staged escape shot shifts the panel left so the turkey + forest gate
    // stay visible on the right; free play centres it.
    var px = (s.endPanelX !== undefined && s.endPanelX !== null) ? s.endPanelX : 290;
    var cx = px + 350;
    panel(ctx, px, 150, 700, 380, 'rgba(43,26,16,0.9)');
    if (s.escaped) {
      ctx.fillStyle = '#7ac74f'; ctx.font = 'bold 56px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('ESCAPED!', cx, 235);
      ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 24px sans-serif';
      ctx.fillText('THANKSGIVING SURVIVED!', cx, 275);
    } else {
      ctx.fillStyle = '#ff6a4d'; ctx.font = 'bold 56px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CAUGHT!', cx, 235);
      ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Thanksgiving dinner claims another turkey...', cx, 275);
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText('FINAL SCORE  ' + Math.floor(s.score) + '     DISTANCE  ' + Math.floor(s.distance) + ' m', cx, 330);
    ctx.font = '20px sans-serif';
    ctx.fillText('Corn collected  ' + s.corn + ' / 12      Nights survived  ' + s.nightsCleared + ' / 3', cx, 366);
    ctx.fillStyle = '#f7c873'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Best escape: ' + s.best, cx, 402);
    var blink = Math.sin(s.time * 0.12) > 0;
    if (blink) {
      ctx.fillStyle = '#ffd23c'; ctx.font = 'bold 24px sans-serif';
      ctx.fillText('▶  CLICK or press ENTER to run again  ◀', cx, 470);
    }
    ctx.fillStyle = '#c9a227'; ctx.font = '15px sans-serif';
    ctx.fillText('R — restart now      M — mute', cx, 508);
  }

  function drawPaused(ctx, s) {
    panel(ctx, 440, 280, 400, 90);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 640, 322);
    ctx.font = '16px sans-serif';
    ctx.fillText('P or click to resume', 640, 352);
  }

  window.TR.HUD = {
    drawHUD: drawHUD, drawTitle: drawTitle, drawEnd: drawEnd, drawPaused: drawPaused,
  };
})();
