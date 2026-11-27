// audio.js — all sound is generated in code with WebAudio. No audio files,
// no network. One job: bleeps, gobbles, clangs and the chase jingle.
(function () {
  'use strict';

  var ctx = null;
  var muted = false;
  var chaseTimer = null;

  function ensure() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // Panicked gobble: two fast descending squawks.
  function gobble() {
    tone(520, 0.09, 'sawtooth', 0.14, 300);
    setTimeout(function () { tone(460, 0.09, 'sawtooth', 0.14, 260); }, 90);
  }

  function jump() { tone(300, 0.14, 'sine', 0.12, 620); }
  function corn() { tone(880, 0.07, 'triangle', 0.12); setTimeout(function () { tone(1320, 0.09, 'triangle', 0.12); }, 70); }
  function clang() { tone(190, 0.25, 'square', 0.16, 90); tone(1250, 0.08, 'square', 0.08, 900); }
  function thud() { tone(120, 0.18, 'sine', 0.2, 55); }
  function alarm() { tone(660, 0.12, 'square', 0.13, 660); setTimeout(function () { tone(660, 0.12, 'square', 0.13, 660); }, 150); }
  function escapeJingle() {
    var notes = [523, 659, 784, 1046];
    notes.forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.22, 'triangle', 0.14); }, i * 140);
    });
  }

  // Low chase pulse while the farmer is close. Started/stopped by the game.
  function startChase() {
    if (chaseTimer || muted) return;
    chaseTimer = setInterval(function () {
      if (!ensure()) return;
      tone(98, 0.16, 'sawtooth', 0.05, 82);
    }, 320);
  }
  function stopChase() {
    if (chaseTimer) { clearInterval(chaseTimer); chaseTimer = null; }
  }

  window.TR.Audio = {
    ensure: ensure, gobble: gobble, jump: jump, corn: corn,
    clang: clang, thud: thud, alarm: alarm, escapeJingle: escapeJingle,
    startChase: startChase, stopChase: stopChase,
    toggleMute: function () { muted = !muted; if (muted) stopChase(); return muted; },
  };
})();
