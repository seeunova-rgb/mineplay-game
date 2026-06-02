// ─── MOBILE CONTROLS ────────────────────────────────────────────
const isMobile = () =>
  ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  window.matchMedia('(pointer: coarse)').matches;

if (isMobile()) {
  if (document.readyState !== 'loading') initMobileControls();
  else document.addEventListener('DOMContentLoaded', initMobileControls);
}

function initMobileControls() {
  if (document.getElementById('mc-root')) return;

  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.addEventListener('click', () => { mouseLocked = true; }, true);

  const style = document.createElement('style');
  style.textContent = `
    #mc-joystick-zone {
      position: fixed; left: 0; bottom: 0;
      width: 45%; height: 55%; z-index: 50; touch-action: none;
    }
    #mc-look-zone {
      position: fixed; left: 45%; top: 0;
      width: 55%; height: 100%; z-index: 50; touch-action: none;
    }
    #mc-joystick-base {
      position: fixed; width: 110px; height: 110px;
      left: 10px; bottom: 20px; border-radius: 50%;
      background: rgba(0,255,136,0.07);
      border: 1.5px solid rgba(0,255,136,0.25);
    }
    #mc-joystick-knob {
      position: absolute; width: 48px; height: 48px;
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      border-radius: 50%;
      background: rgba(0,255,136,0.30);
      border: 1.5px solid rgba(0,255,136,0.7);
    }
    #mc-shoot-base {
      position: fixed; border-radius: 50%;
      background: rgba(255,80,80,0.08);
      border: 1.5px solid rgba(255,80,80,0.35);
      z-index: 61; touch-action: none; cursor: pointer;
    }
    #mc-shoot-knob {
      position: absolute; width: 52px; height: 52px;
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      border-radius: 50%;
      background: rgba(255,80,80,0.55);
      border: 1.5px solid rgba(255,100,100,0.9);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; pointer-events: none;
    }
    .mc-btn {
      position: fixed !important; border-radius: 50% !important;
      background: rgba(0,0,0,0.6) !important;
      border: 1.5px solid rgba(0,255,136,0.5) !important;
      color: #00ff88 !important;
      display: flex !important; align-items: center !important;
      justify-content: center !important; font-weight: 700 !important;
      z-index: 62 !important; touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);

  // ── Move joystick ────────────────────────────────────────────
  const joyZone = document.createElement('div');
  joyZone.id = 'mc-joystick-zone';
  joyZone.innerHTML = `<div id="mc-joystick-base"><div id="mc-joystick-knob"></div></div>`;
  document.body.appendChild(joyZone);

  // ── Look zone ────────────────────────────────────────────────
  const lookZone = document.createElement('div');
  lookZone.id = 'mc-look-zone';
  document.body.appendChild(lookZone);

  // ── Shoot joystick ───────────────────────────────────────────
  const shootBase = document.createElement('div');
  shootBase.id = 'mc-shoot-base';
  shootBase.innerHTML = `<div id="mc-shoot-knob">🔫</div>`;
  document.body.appendChild(shootBase);

  // ── Other buttons ────────────────────────────────────────────
  const BTN = [
    { id:'mc-btn-jump',   icon:'↑',  size:50 },
    { id:'mc-btn-crouch', icon:'↓',  size:44 },
    { id:'mc-btn-sprint', icon:'⚡', size:44 },
    { id:'mc-btn-reload', icon:'⟳',  size:44 },
  ];
  BTN.forEach(({ id, icon, size }) => {
    const btn = document.createElement('button');
    btn.id = id; btn.className = 'mc-btn';
    btn.textContent = icon;
    btn.style.width = size + 'px'; btn.style.height = size + 'px';
    btn.style.fontSize = (size * 0.35) + 'px';
    document.body.appendChild(btn);
  });

  // ── Layout: จัด shoot joystick + ปุ่มให้ไม่ทับกัน ────────────
  // shoot joystick = วงใหญ่ขวาล่าง
  // ปุ่มอื่นเรียงด้านบนและซ้ายของ shoot
  function placeButtons() {
    // ใช้ CSS bottom ล้วนๆ อ้างอิง visual viewport จริง
    // ROW1 = แถวล่าง, ROW2 = แถวบน (เหนือ ROW1)
    const ROW1 = 88, ROW2 = 148;

    shootBase.style.cssText = `
      position: fixed; right: 16px; bottom: ${ROW1}px;
      width: 110px; height: 110px; border-radius: 50%;
      background: rgba(255,80,80,0.08);
      border: 1.5px solid rgba(255,80,80,0.35);
      z-index: 61; touch-action: none; cursor: pointer;
    `;

    // reload อยู่เหนือ shoot (ROW2)
    // jump อยู่ซ้ายของ shoot แถวบน
    // crouch/sprint อยู่ซ้ายของ shoot แถวล่าง
    const btnLayout = [
      { id:'mc-btn-reload', s:44, right:  16, bottom: ROW2 },
      { id:'mc-btn-jump',   s:50, right: 134, bottom: ROW2 },
      { id:'mc-btn-crouch', s:44, right: 192, bottom: ROW1 },
      { id:'mc-btn-sprint', s:44, right: 134, bottom: ROW1 },
    ];

    btnLayout.forEach(({ id, s, right, bottom }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.cssText = `
        position: fixed; right: ${right}px; bottom: ${bottom}px;
        left: auto; top: auto; width: ${s}px; height: ${s}px;
        font-size: ${Math.round(s*0.35)}px; border-radius: 50%;
        background: rgba(0,0,0,0.6); border: 1.5px solid rgba(0,255,136,0.5);
        color: #00ff88; display: flex; align-items: center; justify-content: center;
        font-weight: 700; z-index: 62; touch-action: none;
        -webkit-tap-highlight-color: transparent; cursor: pointer;
      `;
    });
  }

  placeButtons();
  window.addEventListener('resize', placeButtons);
  screen.orientation?.addEventListener('change', () => setTimeout(placeButtons, 200));

  // ── Move joystick logic ──────────────────────────────────────
  const base = document.getElementById('mc-joystick-base');
  const knob = document.getElementById('mc-joystick-knob');
  const R = 44;
  let joyId = null, ox = 0, oy = 0;

  joyZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0]; joyId = t.identifier;
    const rect = base.getBoundingClientRect();
    ox = rect.left + rect.width / 2; oy = rect.top + rect.height / 2;
    moveJoy(t.clientX, t.clientY);
  }, { passive: false });

  joyZone.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === joyId);
    if (t) moveJoy(t.clientX, t.clientY);
  }, { passive: false });

  joyZone.addEventListener('touchend', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === joyId);
    if (t) endJoy();
  }, { passive: false });

  function moveJoy(cx, cy) {
    let dx = cx - ox, dy = cy - oy;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d > R) { dx = dx/d*R; dy = dy/d*R; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const thr = R * 0.25;
    keys['KeyW'] = dy < -thr; keys['KeyS'] = dy > thr;
    keys['KeyA'] = dx < -thr; keys['KeyD'] = dx > thr;
  }

  function endJoy() {
    joyId = null;
    knob.style.transform = 'translate(-50%,-50%)';
    ['KeyW','KeyS','KeyA','KeyD'].forEach(k => keys[k] = false);
  }

  // ── Shoot joystick logic ─────────────────────────────────────
  const shootKnob = document.getElementById('mc-shoot-knob');
  const SR = 44;
  const SENS = 0.005;
  let shootId = null, prevSx = null, prevSy = null;
  let shootTimer = null;

  function startShooting() {
    if (shootTimer) return;
    shoot(); shootTimer = setInterval(() => shoot(), 110);
  }
  function stopShooting() {
    clearInterval(shootTimer); shootTimer = null;
  }

  shootBase.addEventListener('touchstart', e => {
    e.preventDefault();
    if (shootId !== null) return;
    const t = e.changedTouches[0];
    shootId = t.identifier;
    prevSx = t.clientX; prevSy = t.clientY;
    const rect = shootBase.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    moveShootKnob(t.clientX - cx, t.clientY - cy);
    startShooting();
  }, { passive: false });

  shootBase.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === shootId);
    if (!t) return;
    // หัน
    yaw   -= (t.clientX - prevSx) * SENS;
    pitch -= (t.clientY - prevSy) * SENS;
    pitch  = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
    prevSx = t.clientX; prevSy = t.clientY;
    // knob visual
    const rect = shootBase.getBoundingClientRect();
    moveShootKnob(t.clientX - rect.left - rect.width/2, t.clientY - rect.top - rect.height/2);
  }, { passive: false });

  shootBase.addEventListener('touchend', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === shootId);
    if (t) endShoot();
  }, { passive: false });

  shootBase.addEventListener('touchcancel', e => { e.preventDefault(); endShoot(); }, { passive: false });

  function moveShootKnob(dx, dy) {
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d > SR) { dx = dx/d*SR; dy = dy/d*SR; }
    shootKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  function endShoot() {
    shootId = null; prevSx = null; prevSy = null;
    shootKnob.style.transform = 'translate(-50%,-50%)';
    stopShooting();
  }

  // ── Look zone (หันเฉยๆ) ──────────────────────────────────────
  let lookId = null, lx = 0, ly = 0;

  lookZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    lookId = t.identifier; lx = t.clientX; ly = t.clientY;
  }, { passive: false });

  lookZone.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === lookId);
    if (!t) return;
    yaw   -= (t.clientX - lx) * SENS;
    pitch -= (t.clientY - ly) * SENS;
    pitch  = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
    lx = t.clientX; ly = t.clientY;
  }, { passive: false });

  lookZone.addEventListener('touchend', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === lookId);
    if (t) lookId = null;
  }, { passive: false });

  // ── Action buttons ───────────────────────────────────────────
  function hold(id, code) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', e => { e.preventDefault(); keys[code] = true;  }, { passive: false });
    el.addEventListener('touchend',   e => { e.preventDefault(); keys[code] = false; }, { passive: false });
  }
  hold('mc-btn-jump',   'Space');
  hold('mc-btn-crouch', 'KeyC');
  hold('mc-btn-sprint', 'ShiftLeft');

  document.getElementById('mc-btn-reload')
    .addEventListener('touchstart', e => { e.preventDefault(); reload(); }, { passive: false });
}
