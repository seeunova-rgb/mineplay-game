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
      position: fixed; width: min(110px, 26vw); height: min(110px, 26vw);
      left: 10px; bottom: max(16px, env(safe-area-inset-bottom, 0px)); border-radius: 50%;
      background: rgba(0,255,136,0.07);
      border: 1.5px solid rgba(0,255,136,0.25);
    }
    #mc-joystick-knob {
      position: absolute; width: 44%; height: 44%;
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
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Scale ปุ่มตามขนาดจอ: base ref = 400px wide, จำกัด scale 0.7–1.2
    const scale = Math.min(1.2, Math.max(0.7, W / 420));

    const SHOOT_SIZE = Math.round(110 * scale);
    const BTN_L      = Math.round(50  * scale);  // jump (ใหญ่สุด)
    const BTN_S      = Math.round(44  * scale);  // reload/crouch/sprint
    const PAD        = Math.round(14  * scale);  // margin ขอบขวา/ล่าง
    const GAP        = Math.round(8   * scale);  // ช่องว่างระหว่างปุ่ม

    // safe area bottom (notch/home bar)
    const safeBottom = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sab') || '0'
    ) || 0;

    const ROW1_bottom = PAD + safeBottom;                      // แถวล่าง
    const ROW2_bottom = ROW1_bottom + BTN_S + GAP;             // แถวบน
    const SHOOT_right = PAD;
    const SMALL_right = SHOOT_right + SHOOT_SIZE + GAP;        // คอลัมน์ซ้ายของ shoot
    const WIDE_right  = SMALL_right + BTN_S + GAP;             // คอลัมน์ที่ 3

    shootBase.style.cssText = `
      position: fixed; right: ${SHOOT_right}px; bottom: ${ROW1_bottom}px;
      width: ${SHOOT_SIZE}px; height: ${SHOOT_SIZE}px; border-radius: 50%;
      background: rgba(255,80,80,0.08);
      border: 1.5px solid rgba(255,80,80,0.35);
      z-index: 61; touch-action: none; cursor: pointer;
    `;

    const btnLayout = [
      { id:'mc-btn-reload', s: BTN_S, right: SHOOT_right, bottom: ROW2_bottom },
      { id:'mc-btn-jump',   s: BTN_L, right: SMALL_right, bottom: ROW2_bottom },
      { id:'mc-btn-sprint', s: BTN_S, right: SMALL_right, bottom: ROW1_bottom },
      { id:'mc-btn-crouch', s: BTN_S, right: WIDE_right,  bottom: ROW1_bottom },
    ];

    btnLayout.forEach(({ id, s, right, bottom }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.cssText = `
        position: fixed; right: ${right}px; bottom: ${bottom}px;
        left: auto; top: auto; width: ${s}px; height: ${s}px;
        font-size: ${Math.round(s * 0.38)}px; border-radius: 50%;
        background: rgba(0,0,0,0.6); border: 1.5px solid rgba(0,255,136,0.5);
        color: #00ff88; display: flex; align-items: center; justify-content: center;
        font-weight: 700; z-index: 62; touch-action: none;
        -webkit-tap-highlight-color: transparent; cursor: pointer;
      `;
    });
  }

  // inject CSS var สำหรับ safe-area-inset-bottom
  const sabStyle = document.createElement('style');
  sabStyle.textContent = `:root { --sab: env(safe-area-inset-bottom, 0px); }`;
  document.head.appendChild(sabStyle);

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
