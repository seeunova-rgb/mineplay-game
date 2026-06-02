// ─── MOBILE CONTROLS ────────────────────────────────────────────
// Injects touch input into the existing `keys` object and
// updates `yaw` / `pitch` directly (same globals as player.js).

const isMobile = () =>
  ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  window.matchMedia('(pointer: coarse)').matches;

if (!isMobile()) {
  // Desktop: nothing to do
} else {
  // ── Inject mobile controls ──────────────────────────────────
  // We wait for DOM ready, then build the UI.
  document.addEventListener('DOMContentLoaded', initMobileControls);
  // Also try immediately in case DOM is already ready.
  if (document.readyState !== 'loading') initMobileControls();
}

function initMobileControls() {
  if (document.getElementById('mobile-controls')) return; // already init

  // ── Override lockscreen for mobile (no pointerlock needed) ──
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      mouseLocked = true; // set the global directly
    }, true);
  }

  // ── Build overlay ────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'mobile-controls';
  overlay.innerHTML = `
    <!-- Left: joystick -->
    <div id="mc-joystick-zone">
      <div id="mc-joystick-base">
        <div id="mc-joystick-knob"></div>
      </div>
    </div>

    <!-- Right: look area (transparent) -->
    <div id="mc-look-zone"></div>

    <!-- Action buttons -->
    <button id="mc-btn-shoot"  class="mc-btn mc-btn-shoot">🔫</button>
    <button id="mc-btn-jump"   class="mc-btn mc-btn-jump">↑</button>
    <button id="mc-btn-crouch" class="mc-btn mc-btn-crouch">↓</button>
    <button id="mc-btn-sprint" class="mc-btn mc-btn-sprint">⚡</button>
    <button id="mc-btn-reload" class="mc-btn mc-btn-reload">⟳</button>
  `;
  document.body.appendChild(overlay);

  // ── Inject CSS ───────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #mobile-controls {
      position: fixed; inset: 0;
      z-index: 50;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }

    /* ── Joystick zone (left half bottom) ── */
    #mc-joystick-zone {
      position: absolute;
      left: 0; bottom: 0;
      width: 50%; height: 55%;
      pointer-events: auto;
      display: flex; align-items: center; justify-content: center;
    }
    #mc-joystick-base {
      width: 110px; height: 110px;
      border-radius: 50%;
      background: rgba(200,255,0,0.07);
      border: 1.5px solid rgba(200,255,0,0.22);
      position: relative;
    }
    #mc-joystick-knob {
      position: absolute;
      width: 48px; height: 48px;
      border-radius: 50%;
      background: rgba(200,255,0,0.30);
      border: 1.5px solid rgba(200,255,0,0.7);
      top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      transition: background .1s;
    }

    /* ── Look zone (right half) ── */
    #mc-look-zone {
      position: absolute;
      right: 0; top: 0;
      width: 50%; height: 75%;
      pointer-events: auto;
    }

    /* ── Action buttons ── */
    .mc-btn {
      position: absolute;
      pointer-events: auto;
      background: rgba(0,0,0,0.55);
      border: 1.5px solid rgba(200,255,0,0.35);
      border-radius: 50%;
      color: #c8ff00;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      -webkit-tap-highlight-color: transparent;
      transition: background .08s, transform .08s;
    }
    .mc-btn:active { background: rgba(200,255,0,0.22); transform: scale(0.93); }

    .mc-btn-shoot  { width: 68px; height: 68px; right: 22px;  bottom: 48px;  font-size: 22px; }
    .mc-btn-jump   { width: 52px; height: 52px; right: 102px; bottom: 80px;  font-size: 20px; }
    .mc-btn-crouch { width: 46px; height: 46px; right: 106px; bottom: 24px;  font-size: 16px; }
    .mc-btn-sprint { width: 46px; height: 46px; right: 22px;  bottom: 128px; font-size: 16px; }
    .mc-btn-reload { width: 52px; height: 52px; right: 102px; bottom: 148px; font-size: 22px; }
  `;
  document.head.appendChild(style);

  // ── Joystick logic ───────────────────────────────────────────
  const joystickZone = document.getElementById('mc-joystick-zone');
  const joystickBase = document.getElementById('mc-joystick-base');
  const joystickKnob = document.getElementById('mc-joystick-knob');

  let joystickActive = false;
  let joystickOrigin = { x: 0, y: 0 };
  const JOY_RADIUS = 44; // max knob travel in px

  function joystickStart(cx, cy) {
    joystickActive = true;
    const rect = joystickBase.getBoundingClientRect();
    joystickOrigin.x = rect.left + rect.width / 2;
    joystickOrigin.y = rect.top  + rect.height / 2;
    joystickMove(cx, cy);
  }

  function joystickMove(cx, cy) {
    if (!joystickActive) return;
    let dx = cx - joystickOrigin.x;
    let dy = cy - joystickOrigin.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > JOY_RADIUS) {
      dx = dx / dist * JOY_RADIUS;
      dy = dy / dist * JOY_RADIUS;
    }
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    // Map to keys
    const threshold = JOY_RADIUS * 0.25;
    keys['KeyW'] = dy < -threshold;
    keys['KeyS'] = dy >  threshold;
    keys['KeyA'] = dx < -threshold;
    keys['KeyD'] = dx >  threshold;

    // Auto-sprint when joystick pushed far forward
    keys['_joySprintHint'] = dy < -(JOY_RADIUS * 0.75);
  }

  function joystickEnd() {
    joystickActive = false;
    joystickKnob.style.transform = 'translate(-50%,-50%)';
    keys['KeyW'] = keys['KeyS'] = keys['KeyA'] = keys['KeyD'] = false;
    keys['_joySprintHint'] = false;
  }

  joystickZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    joystickStart(t.clientX, t.clientY);
  }, { passive: false });

  joystickZone.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    joystickMove(t.clientX, t.clientY);
  }, { passive: false });

  joystickZone.addEventListener('touchend', e => {
    e.preventDefault();
    joystickEnd();
  }, { passive: false });

  // ── Look / camera drag ───────────────────────────────────────
  const lookZone = document.getElementById('mc-look-zone');
  let lookLastX = 0, lookLastY = 0, lookActive = false;
  const LOOK_SENS = 0.005;

  lookZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    lookLastX = t.clientX;
    lookLastY = t.clientY;
    lookActive = true;
  }, { passive: false });

  lookZone.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!lookActive) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - lookLastX;
    const dy = t.clientY - lookLastY;
    lookLastX = t.clientX;
    lookLastY = t.clientY;

    yaw   -= dx * LOOK_SENS;
    pitch -= dy * LOOK_SENS;
    pitch = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
  }, { passive: false });

  lookZone.addEventListener('touchend', e => {
    e.preventDefault();
    lookActive = false;
  }, { passive: false });

  // ── Action buttons ───────────────────────────────────────────
  function holdKey(btn, code) {
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[code] = true; }, { passive: false });
    btn.addEventListener('touchend',   e => { e.preventDefault(); keys[code] = false; }, { passive: false });
  }

  holdKey(document.getElementById('mc-btn-jump'),   'Space');
  holdKey(document.getElementById('mc-btn-crouch'), 'KeyC');
  holdKey(document.getElementById('mc-btn-sprint'), 'ShiftLeft');

  // Shoot button
  const shootBtn = document.getElementById('mc-btn-shoot');
  shootBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    shoot();
  }, { passive: false });
  // Rapid fire while held
  let shootInterval = null;
  shootBtn.addEventListener('touchstart', () => {
    shootInterval = setInterval(() => shoot(), 110);
  }, { passive: false });
  shootBtn.addEventListener('touchend', () => {
    clearInterval(shootInterval);
    shootInterval = null;
  });

  const reloadBtn = document.getElementById('mc-btn-reload');
  reloadBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    reload();
  }, { passive: false });
}
