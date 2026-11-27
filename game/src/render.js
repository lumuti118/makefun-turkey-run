// render.js — draws the whole scene: sky, sun, parallax hills, ground,
// per-night scenery (coop + fences, backyard grill party, dining table,
// forest gate), haystacks, props, and every actor. One job: painting.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  function sky(ctx, night, time) {
    var g = ctx.createLinearGradient(0, 0, 0, CFG.H);
    g.addColorStop(0, night.skyTop);
    g.addColorStop(0.55, night.sky);
    g.addColorStop(1, '#f7dc9a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CFG.W, CFG.H);
    // Low autumn sun
    ctx.fillStyle = '#fff2b0';
    ctx.beginPath(); ctx.arc(1060, 110, 52, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,242,176,0.4)';
    ctx.beginPath(); ctx.arc(1060, 110, 78, 0, Math.PI * 2); ctx.fill();
    // Drifting clouds
    ctx.fillStyle = 'rgba(255,250,235,0.85)';
    for (var i = 0; i < 3; i++) {
      var cx = ((time * 0.12 + i * 430) % 1500) - 120;
      ctx.beginPath(); ctx.ellipse(cx, 70 + i * 46, 70, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 40, 78 + i * 46, 46, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Far hills
    ctx.fillStyle = 'rgba(160,90,40,0.35)';
    ctx.beginPath(); ctx.moveTo(0, 470);
    ctx.quadraticCurveTo(320, 380, 640, 460);
    ctx.quadraticCurveTo(960, 540, 1280, 430);
    ctx.lineTo(1280, 600); ctx.lineTo(0, 600); ctx.closePath(); ctx.fill();
  }

  function ground(ctx, night) {
    ctx.fillStyle = night.ground;
    ctx.fillRect(0, CFG.GROUND_Y, CFG.W, CFG.H - CFG.GROUND_Y);
    ctx.fillStyle = night.groundDark;
    ctx.fillRect(0, CFG.GROUND_Y, CFG.W, 10);
    // Grass tufts / dirt clods
    ctx.fillStyle = 'rgba(90,50,15,0.5)';
    for (var x = 20; x < CFG.W; x += 90) {
      ctx.beginPath(); ctx.moveTo(x, CFG.GROUND_Y + 46); ctx.lineTo(x + 6, CFG.GROUND_Y + 30); ctx.lineTo(x + 12, CFG.GROUND_Y + 46); ctx.fill();
    }
  }

  function drawProp(ctx, p, night, time) {
    if (p.x < -120 || p.x > 1400) return;
    ctx.save();
    ctx.translate(p.x, CFG.GROUND_Y);
    ctx.scale(p.s, p.s);
    if (p.kind === 'pumpkin') {
      ctx.fillStyle = '#d96a1e';
      ctx.beginPath(); ctx.ellipse(0, -18, 26, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b5500f';
      ctx.beginPath(); ctx.ellipse(-8, -18, 8, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(8, -18, 8, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a7a2a'; ctx.fillRect(-3, -42, 6, 12);
    } else if (p.kind === 'fence') {
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(-30, -52, 8, 52); ctx.fillRect(22, -52, 8, 52);
      ctx.fillRect(-34, -48, 68, 8); ctx.fillRect(-34, -26, 68, 8);
    } else if (p.kind === 'tree') {
      ctx.fillStyle = '#6f4420'; ctx.fillRect(-8, -90, 16, 90);
      ctx.fillStyle = '#c96a1e';
      ctx.beginPath(); ctx.arc(0, -110, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e08a2e';
      ctx.beginPath(); ctx.arc(-18, -96, 24, 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'bush') {
      ctx.fillStyle = '#7a8a2a';
      ctx.beginPath(); ctx.arc(-14, -12, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, -14, 20, 0, Math.PI * 2); ctx.fill();
    } else { // lantern
      ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-2, -70, 4, 70);
      ctx.fillStyle = '#f2c230';
      ctx.beginPath(); ctx.arc(0, -78, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(242,194,48,0.35)';
      ctx.beginPath(); ctx.arc(0, -78, 24, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawHaystack(ctx, h, time) {
    if (h.x < -160 || h.x > 1440) return;
    ctx.save();
    ctx.translate(h.x, CFG.GROUND_Y);
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-60, -90, 0, -96); ctx.quadraticCurveTo(60, -90, 70, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 22, -88); ctx.quadraticCurveTo(i * 26, -40, i * 18, -4); ctx.stroke();
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(60,20,5,0.8)'; ctx.lineWidth = 3;
    ctx.strokeText('HAYSTACK: hide (E)', 0, -112);
    ctx.fillText('HAYSTACK: hide (E)', 0, -112);
    ctx.restore();
  }

  function drawCoop(ctx, x) {
    ctx.save();
    ctx.translate(x, CFG.GROUND_Y);
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-90, -70); ctx.lineTo(0, -120); ctx.lineTo(90, -70); ctx.lineTo(90, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a96f33';
    ctx.fillRect(-90, -70, 180, 70);
    ctx.fillStyle = '#2b1508';
    ctx.beginPath(); ctx.arc(0, -40, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('COOP', 0, -132);
    ctx.restore();
  }

  function drawTable(ctx, tableX, time) {
    ctx.save();
    ctx.translate(tableX, CFG.GROUND_Y);
    // Thanksgiving table: white cloth, turkey platter, candles, pies
    ctx.fillStyle = '#f7f0e0';
    ctx.fillRect(-260, -96, 520, 96);
    ctx.fillStyle = '#d9c9a8';
    ctx.fillRect(-260, -96, 520, 10);
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-250, -6, 14, 6); ctx.fillRect(236, -6, 14, 6);
    // Platter with a (different!) roast bird — the turkey's fate if caught
    ctx.fillStyle = '#c9c9c9';
    ctx.beginPath(); ctx.ellipse(0, -96, 70, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a96f33';
    ctx.beginPath(); ctx.ellipse(0, -108, 44, 18, 0, 0, Math.PI * 2); ctx.fill();
    // Candles
    [-180, 180].forEach(function (cx) {
      ctx.fillStyle = '#fff2b0';
      ctx.fillRect(cx - 4, -128, 8, 32);
      ctx.fillStyle = '#ff9a1e';
      ctx.beginPath(); ctx.ellipse(cx, -134, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
    });
    // Pies
    ctx.fillStyle = '#c96a1e';
    ctx.beginPath(); ctx.arc(-120, -100, 22, 0, Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(120, -100, 22, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('THANKSGIVING TABLE — sneak under it!', 0, -196);
    ctx.restore();
  }

  function drawGate(ctx, x, time) {
    ctx.save();
    ctx.translate(x, CFG.GROUND_Y);
    // Forest gate: two pines + wooden arch + "FREEDOM" sign
    ctx.fillStyle = '#2f5d2a';
    [-90, 90].forEach(function (px) {
      ctx.beginPath(); ctx.moveTo(px - 40, -40); ctx.lineTo(px, -190); ctx.lineTo(px + 40, -40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6f4420'; ctx.fillRect(px - 8, -40, 16, 40);
      ctx.fillStyle = '#2f5d2a';
    });
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-110, -210, 220, 16);
    ctx.fillStyle = '#f7f0e0';
    ctx.fillRect(-70, -252, 140, 34);
    ctx.fillStyle = '#2f5d2a'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FOREST GATE', 0, -228);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
    ctx.fillText('FREEDOM →', 0, -170);
    ctx.restore();
  }

  function drawBackyardSet(ctx, state, time) {
    // Night 2 backyard dressing: string lights hung low, below the HUD.
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 150); ctx.quadraticCurveTo(640, 205, 1280, 150); ctx.stroke();
    for (var i = 0; i < 9; i++) {
      var lx = 60 + i * 140;
      var ly = 150 + Math.sin((lx / 1280) * Math.PI) * 52;
      ctx.fillStyle = ['#ff5a3c', '#ffd23c', '#7ac74f'][i % 3];
      ctx.beginPath(); ctx.arc(lx, ly + 8, 7, 0, Math.PI * 2); ctx.fill();
    }
  }

  window.TR.Render = {
    sky: sky, ground: ground, drawProp: drawProp, drawHaystack: drawHaystack,
    drawCoop: drawCoop, drawTable: drawTable, drawGate: drawGate,
    drawBackyardSet: drawBackyardSet,
  };
})();
