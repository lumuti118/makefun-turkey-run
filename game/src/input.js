// input.js — keyboard + mouse input. One job: turn keys/clicks into game
// intents (move, jump, hide, start, restart, pause). No game logic here.
(function () {
  'use strict';

  var keys = {};
  var pressed = {}; // edge-triggered: true only on the frame the key went down
  var click = null; // {x, y} in canvas coords, consumed by the game loop

  function keyName(e) {
    var k = e.key;
    if (k === ' ') return 'Space';
    if (k.length === 1) return k.toUpperCase();
    return k;
  }

  window.addEventListener('keydown', function (e) {
    var k = keyName(e);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(k) !== -1) {
      e.preventDefault();
    }
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
  });
  window.addEventListener('keyup', function (e) {
    keys[e.key === ' ' ? 'Space' : (e.key.length === 1 ? e.key.toUpperCase() : e.key)] = false;
  });
  window.addEventListener('blur', function () { keys = {}; });

  function bindCanvas(canvas) {
    canvas.addEventListener('mousedown', function (e) {
      var r = canvas.getBoundingClientRect();
      click = {
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top) * (canvas.height / r.height),
      };
    });
  }

  function held() {
    return {
      left: !!(keys.ArrowLeft || keys.A),
      right: !!(keys.ArrowRight || keys.D),
      up: !!(keys.ArrowUp || keys.W),
      down: !!(keys.ArrowDown || keys.S),
      jump: !!(keys.Space || keys.ArrowUp || keys.W),
    };
  }

  function wasPressed(name) { return !!pressed[name]; }

  function endFrame() {
    pressed = {};
    click = null;
  }

  window.TR.Input = {
    bindCanvas: bindCanvas,
    held: held,
    wasPressed: wasPressed,
    endFrame: endFrame,
    getClick: function () { return click; },
    isDown: function (name) { return !!keys[name]; },
  };
})();
