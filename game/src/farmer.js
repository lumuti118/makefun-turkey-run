// farmer.js — the chasers. One job: farmer AI (chase -> search -> corner)
// plus the Thanksgiving family at the dining table, and drawing them all.
// The farmer is big, looming, relentless — Oscar's Oasis chaser energy.
(function () {
  'use strict';
  var CFG = window.TR.CFG;

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
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.fillStyle = 'rgba(60,30,10,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 4, 58, 10, 0, 0, Math.PI * 2); ctx.fill();
    var swing = Math.sin(f.armSwing) * 8;
    // Legs (heavy stomp)
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, -70); ctx.lineTo(-14 + swing, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -70); ctx.lineTo(14 - swing, 0); ctx.stroke();
    // Big body: red plaid shirt + overalls
    ctx.fillStyle = '#b03024';
    ctx.beginPath(); ctx.ellipse(0, -105, 52, 48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7c1d14'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-50, -120); ctx.lineTo(50, -120); ctx.moveTo(-50, -95); ctx.lineTo(50, -95); ctx.stroke();
    ctx.fillStyle = '#2f4d6d';
    ctx.fillRect(-34, -78, 68, 34);
    // Arms reaching forward (grabbing!)
    ctx.strokeStyle = '#b03024'; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(30, -130); ctx.lineTo(74, -96 + swing); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -130); ctx.lineTo(-64, -96 - swing); ctx.stroke();
    // Hands
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath(); ctx.arc(78, -94 + swing, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-68, -94 - swing, 10, 0, Math.PI * 2); ctx.fill();
    // Head: big, red-faced, moustache, straw hat
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath(); ctx.arc(0, -178, 30, 0, Math.PI * 2); ctx.fill();
    // Moustache + angry brows
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-18, -168, 36, 7);
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-20, -192); ctx.lineTo(-4, -186); ctx.moveTo(20, -192); ctx.lineTo(4, -186); ctx.stroke();
    // Eyes (small, furious — the opposite of the turkey's big eyes)
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-10, -182, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -182, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c0f08';
    ctx.beginPath(); ctx.arc(-8, -182, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -182, 3, 0, Math.PI * 2); ctx.fill();
    // Straw hat
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath(); ctx.ellipse(0, -200, 46, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9b23c';
    ctx.beginPath(); ctx.ellipse(0, -208, 26, 16, 0, 0, Math.PI * 2); ctx.fill();
    // Shout lines when chasing
    if (f.state === 'chase' || f.state === 'corner') {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#7c1d14'; ctx.lineWidth = 2;
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      var shout = f.state === 'corner' ? 'GOTCHA!' : 'COME BACK HERE!';
      ctx.fillText(shout, 10, -232);
    }
    ctx.restore();
  }

  // The Thanksgiving family, seated at the dining table in Night 3.
  // They are blockers / watchers: Grandma points, Uncle snores, the kids giggle.
  function drawFamily(ctx, tableX, time) {
    var members = [
      { dx: -150, col: '#7a4a8a', label: 'GRANDMA', act: 'points!' },
      { dx: -40, col: '#2f6d4f', label: 'UNCLE BOB', act: 'snores...' },
      { dx: 80, col: '#c96a1e', label: 'COUSIN MAY', act: 'giggles!' },
      { dx: 180, col: '#4a6d8a', label: 'AUNT ROSE', act: 'gasps!' },
    ];
    members.forEach(function (m, i) {
      var x = tableX + m.dx;
      var bob = Math.sin(time * 0.05 + i * 2) * 2;
      ctx.save();
      ctx.translate(x, CFG.GROUND_Y - 118 + bob);
      ctx.fillStyle = m.col;
      ctx.beginPath(); ctx.arc(0, -28, 26, 0, Math.PI * 2); ctx.fill(); // head
      ctx.beginPath(); ctx.ellipse(0, 22, 34, 34, 0, 0, Math.PI * 2); ctx.fill(); // body
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-9, -32, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(9, -32, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c0f08';
      ctx.beginPath(); ctx.arc(-8, -32, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(10, -32, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(m.label, 0, -62);
      ctx.font = '12px sans-serif';
      ctx.fillText(m.act, 0, 78);
      ctx.restore();
    });
  }

  window.TR.Farmer = {
    newFarmer: newFarmer, update: update,
    drawFarmer: drawFarmer, drawFamily: drawFamily,
  };
})();
