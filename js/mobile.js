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
      position: fixed; width: min(100px, 24vw); height: min(100px, 24vw);
      left: 10px; bottom: max(16px, env(safe-area-inset-bottom, 0px));
      border-radius: 50%;
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
    /* Sprint toggle ON */
    #mc-btn-sprint.active {
      background: rgba(0,255,136,0.25) !important;
      border-color: #00ff88 !important;
      color: #fff !important;
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

  // ── Buttons (jump/crouch/reload = right side, sprint = left side toggle) ──
  const BTN_RIGHT = [
    { id:'mc-btn-jump',   icon:'↑', size:42 },
    { id:'mc-btn-crouch', icon:'↓', size:38 },
    { id:'mc-btn-reload', icon:'⟳', size:38 },
  ];
  BTN_RIGHT.forEach(({ id, icon, size }) => {
    const btn = document.createElement('button');
    btn.id = id; btn.className = 'mc-btn';
    btn.textContent = icon;
    btn.style.cssText = `
      position: fixed; border-radius: 50%;
      background: rgba(0,0,0,0.6); border: 1.5px solid rgba(0,255,136,0.5);
      color: #00ff88; display: flex; align-items: center; justify-content: center;
      font-weight: 700; z-index: 62; touch-action: none;
      -webkit-tap-highlight-color: transparent; cursor: pointer;
      width: ${size}px; height: ${size}px; font-size: ${Math.round(size*0.4)}px;
    `;
    document.body.appendChild(btn);
  });

  // Sprint — ฝั่งซ้าย, toggle on/off
  const sprintBtn = document.createElement('button');
  sprintBtn.id = 'mc-btn-sprint';
  sprintBtn.textContent = '⚡';
  sprintBtn.style.cssText = `
    position: fixed; border-radius: 50%;
    background: rgba(0,0,0,0.6); border: 1.5px solid rgba(0,255,136,0.5);
    color: #00ff88; display: flex; align-items: center; justify-content: center;
    font-weight: 700; z-index: 62; touch-action: none;
    -webkit-tap-highlight-color: transparent; cursor: pointer;
    width: 38px; height: 38px; font-size: 15px;
  `;
  document.body.appendChild(sprintBtn);

  // ── Layout ───────────────────────────────────────────────────
  // ใช้ vmin เป็นหน่วยหลักเพื่อให้ scale ตามหน้าจอทุกขนาด
  function vmin(n) { return Math.round(n * Math.min(window.innerWidth, window.innerHeight) / 100); }

  function placeButtons() {
    const W   = window.innerWidth;
    const safeB = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--sab') || '0') || 0;

    // ขนาดปุ่ม (vmin) — clamp ไม่ให้ใหญ่/เล็กเกินไปบน tablet
    const SHOOT = Math.min(Math.max(vmin(14), 72), 110);  // ปุ่มยิง
    const BTN   = Math.min(Math.max(vmin(9),  40),  58);  // jump/crouch
    const RLD   = Math.min(Math.max(vmin(8),  36),  52);  // reload
    const GAP   = Math.min(Math.max(vmin(2),   8),  14);  // ช่องว่างระหว่างปุ่ม
    const PAD   = Math.min(Math.max(vmin(3),  12),  24);  // padding จากขอบจอ

    // ── Shoot: ล่างขวา ─────────────────────────────────────────
    // center ของ shoot group ห่างจากขอบขวา
    const groupR  = PAD + SHOOT / 2 + BTN + GAP;
    const groupB  = PAD + safeB + SHOOT / 2;     // ลดลง — ไม่บวก BTN+GAP แล้ว

    // shoot วางจาก right/bottom
    const shootR = Math.round(groupR - SHOOT / 2);
    const shootB = Math.round(groupB - SHOOT / 2);
    shootBase.style.cssText = `
      position: fixed;
      right: ${shootR}px; bottom: ${shootB}px;
      left: auto; top: auto;
      width: ${SHOOT}px; height: ${SHOOT}px;
      border-radius: 50%;
      background: rgba(255,80,80,0.08);
      border: 1.5px solid rgba(255,80,80,0.35);
      z-index: 61; touch-action: none; cursor: pointer;
    `;

    // ── Crouch: ขวาของ Shoot ระดับล่าง ───────────────────────────
    const crouchR = Math.round(groupR - SHOOT / 2 - GAP - BTN);
    const crouchB = Math.round(PAD + safeB);       // ชิดล่างสุด
    applyBtn('mc-btn-crouch', BTN, crouchR, crouchB);

    // ── Jump: บน Crouch ตรงๆ ──────────────────────────────────
    applyBtn('mc-btn-jump', BTN,
      crouchR,
      crouchB + BTN + GAP
    );

    // ── Reload: ซ้ายของ Shoot ระดับเดียวกับ Crouch ────────────
    applyBtn('mc-btn-reload', RLD,
      Math.round(groupR + SHOOT / 2 + GAP),
      crouchB + Math.round((BTN - RLD) / 2)    // center Y ตรงกับ crouch
    );

    // ── Sprint: ขวาของ joystick base ───────────────────────────
    // joystick base: left=10px, width=min(100px, 24vw)
    const joyDiam = Math.min(100, Math.round(W * 0.24));
    const spSz  = Math.min(Math.max(vmin(8), 34), 50);
    sprintBtn.style.cssText = `
      position: fixed;
      left: ${Math.round(10 + joyDiam + GAP * 2)}px;
      bottom: ${Math.round(PAD + safeB)}px;
      width: ${spSz}px; height: ${spSz}px;
      font-size: ${Math.round(spSz * 0.42)}px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6); border: 1.5px solid rgba(0,255,136,0.5);
      color: #00ff88; display: flex; align-items: center; justify-content: center;
      font-weight: 700; z-index: 62; touch-action: none;
      -webkit-tap-highlight-color: transparent; cursor: pointer;
    `;
  }

  // safe-area-inset-bottom ผ่าน CSS custom property
  const sabStyle = document.createElement('style');
  sabStyle.textContent = `:root { --sab: 0px; }
    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      :root { --sab: env(safe-area-inset-bottom); }
    }`;
  document.head.appendChild(sabStyle);

  // applyBtn วางจาก right/bottom (ใช้ร่วมกันทุกปุ่มฝั่งขวา)
  function applyBtn(id, size, right, bottom) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.cssText = `
      position: fixed;
      right: ${Math.round(right)}px; bottom: ${Math.round(bottom)}px;
      left: auto; top: auto;
      width: ${size}px; height: ${size}px; font-size: ${Math.round(size * 0.42)}px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6); border: 1.5px solid rgba(0,255,136,0.5);
      color: #00ff88; display: flex; align-items: center; justify-content: center;
      font-weight: 700; z-index: 62; touch-action: none;
      -webkit-tap-highlight-color: transparent; cursor: pointer;
    `;
  }

  placeButtons();
  window.addEventListener('resize', placeButtons);
  screen.orientation?.addEventListener('change', () => setTimeout(placeButtons, 200));

  // ── Move joystick logic ──────────────────────────────────────
  const base = document.getElementById('mc-joystick-base');
  const knob = document.getElementById('mc-joystick-knob');
  const R = 40;
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
  const SR = 40;
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
    moveShootKnob(t.clientX - rect.left - rect.width/2, t.clientY - rect.top - rect.height/2);
    startShooting();
  }, { passive: false });

  shootBase.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === shootId);
    if (!t) return;
    yaw   -= (t.clientX - prevSx) * SENS;
    pitch -= (t.clientY - prevSy) * SENS;
    pitch  = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
    prevSx = t.clientX; prevSy = t.clientY;
    const rect = shootBase.getBoundingClientRect();
    moveShootKnob(t.clientX - rect.left - rect.width/2, t.clientY - rect.top - rect.height/2);
  }, { passive: false });

  shootBase.addEventListener('touchend',   e => { e.preventDefault(); const t = [...e.changedTouches].find(t=>t.identifier===shootId); if(t) endShoot(); }, { passive: false });
  shootBase.addEventListener('touchcancel',e => { e.preventDefault(); endShoot(); }, { passive: false });

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

  // ── Look zone ────────────────────────────────────────────────
  let lookId = null, lx = 0, ly = 0;
  lookZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0]; lookId = t.identifier; lx = t.clientX; ly = t.clientY;
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

  // ── Hold buttons ─────────────────────────────────────────────
  function hold(id, code) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', e => { e.preventDefault(); keys[code] = true;  }, { passive: false });
    el.addEventListener('touchend',   e => { e.preventDefault(); keys[code] = false; }, { passive: false });
  }
  hold('mc-btn-jump',   'Space');
  hold('mc-btn-crouch', 'KeyC');

  // ── Sprint toggle (on/off) ────────────────────────────────────
  let sprintOn = false;
  sprintBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    sprintOn = !sprintOn;
    keys['ShiftLeft'] = sprintOn;
    sprintBtn.classList.toggle('active', sprintOn);
  }, { passive: false });

  // ── Reload ───────────────────────────────────────────────────
  document.getElementById('mc-btn-reload')
    .addEventListener('touchstart', e => { e.preventDefault(); reload(); }, { passive: false });
}
