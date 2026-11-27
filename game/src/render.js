// render.js — draws the painted world. One job: painting.
// The scenery is four full 1280x720 cartoon paintings (game/assets/bg-*),
// one per night, plus the forest-gate painting for the finale. This file
// only picks the painting and draws the one code prop left — the haystack
// the turkey hides in (its straw is drawn in code so it can sit exactly
// where the hide spot is, in any night).
(function () {
  'use strict';
  var CFG = window.TR.CFG;

  function drawBackground(ctx, night, bgOverride) {
    var name = bgOverride || night.bg;
    window.TR.Assets.drawBackground(ctx, name);
  }

  function drawHaystack(ctx, h, time) {
    if (h.x < -160 || h.x > 1440) return;
    ctx.save();
    ctx.translate(h.x, CFG.GROUND_Y);
    // Ground shadow
    ctx.fillStyle = 'rgba(60,30,10,0.28)';
    ctx.beginPath(); ctx.ellipse(0, 4, 76, 9, 0, 0, Math.PI * 2); ctx.fill();
    // Straw mound, layered golds
    ctx.fillStyle = '#d9a41e';
    ctx.beginPath(); ctx.moveTo(-74, 0); ctx.quadraticCurveTo(-64, -94, 0, -100); ctx.quadraticCurveTo(64, -94, 74, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath(); ctx.moveTo(-66, 0); ctx.quadraticCurveTo(-56, -82, 0, -88); ctx.quadraticCurveTo(56, -82, 66, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 22, -88); ctx.quadraticCurveTo(i * 26, -40, i * 18, -4); ctx.stroke();
    }
    // Stray straws sticking out the top
    ctx.strokeStyle = '#f2d76a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, -92); ctx.lineTo(-24, -112); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -94); ctx.lineTo(12, -116); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, -88); ctx.lineTo(34, -106); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(60,20,5,0.85)'; ctx.lineWidth = 3;
    ctx.strokeText('HAYSTACK: hide (E)', 0, -124);
    ctx.fillText('HAYSTACK: hide (E)', 0, -124);
    ctx.restore();
  }

  window.TR.Render = {
    drawBackground: drawBackground, drawHaystack: drawHaystack,
  };
})();
