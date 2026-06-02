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

  // ── Override start button ────────────────────────────────────
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => { mouseLocked = true; }, true);
  }

  // ── Inject CSS ───────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #mc-joystick-zone {
      position: fixed;
      left: 0; bottom: 0;
      width: 45%; height: 55%;
      z-index: 50;
      touch-action: none;
    }
    #mc-look-zone {
      position: fixed;
      left: 45%; top: 0;
      width: 55%; height: 70%;
      z-index: 50;
      touch-action: none;
    }
    #mc-joystick-base {
      position: fixed;
      width: 110px; height: 110px;
      left: 10px; bottom: 20px;
      border-radius: 50%;
      background: rgba(0,255,136,0.07);
      border: 1.5px solid rgba(0,255,136,0.25);
    }
    #mc-joystick-knob {
      position: absolute;
      width: 48px; height: 48px;
      top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      border-radius: 50%;
      background: rgba(0,255,136,0.30);
      border: 1.5px solid rgba(0,255,136,0.7);
    }
    .mc-btn {
      position: fixed !important;
      border-radius: 50% !important;
      background: rgba(0,0,0,0.6) !important;
      border: 1.5px solid rgba(0,255,136,0.5) !important;
      color: #00ff88 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-weight: 700 !important;
      z-index: 60 !important;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);

  // ── Build joystick zone ──────────────────────────────────────
  const joyZone = document.createElement('div');
  joyZone.id = 'mc-joystick-zone';
  joyZone.innerHTML = `
    <div id="mc-joystick-base">
      <div id="mc-joystick-knob"></div>
    </div>`;
  document.body.appendChild(joyZone);

  // ── Build look zone ──────────────────────────────────────────
  const lookZone = document.createElement('div');
  lookZone.id = 'mc-look-zone';
  document.body.appendChild(lookZone);

  // ── Build buttons (เพิ่มตรง body ไม่มี parent จำกัด) ────────
  const BTN = [
    { id:'mc-btn-shoot',  icon:'🔫', size:64 },
    { id:'mc-btn-jump',   icon:'↑',  size:50 },
    { id:'mc-btn-crouch', icon:'↓',  size:44 },
    { id:'mc-btn-sprint', icon:'⚡', size:44 },
    { id:'mc-btn-reload', icon:'⟳',  size:44 },
  ];
  BTN.forEach(({ id, icon, size }) => {
    const btn = document.createElement('button');
    btn.id = id;
    btn.className = 'mc-btn';
    btn.textContent = icon;
    btn.style.width  = size + 'px';
    btn.style.height = size + 'px';
    btn.style.fontSize = (size * 0.35) + 'px';
    document.body.appendChild(btn);
  });

  // ── Position buttons (เรียกทุกครั้งที่ rotate) ───────────────
  function placeButtons() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const land = W > H;
    const r = 16, gap = 10;

    // portrait:  ปุ่มชิดมุมขวาล่าง
    // landscape: เล็กลงนิด ชิดมุมขวาล่างเหมือนกัน
    const cfg = land ? [
      { id:'mc-btn-shoot',  s:54, r:16,  b:12  },
      { id:'mc-btn-jump',   s:44, r:80,  b:12  },
      { id:'mc-btn-crouch', s:40, r:134, b:12  },
      { id:'mc-btn-sprint', s:40, r:80,  b:66  },
      { id:'mc-btn-reload', s:40, r:16,  b:76  },
    ] : [
      { id:'mc-btn-shoot',  s:64, r:16,  b:16  },
      { id:'mc-btn-jump',   s:50, r:90,  b:16  },
      { id:'mc-btn-crouch', s:44, r:144, b:16  },
      { id:'mc-btn-sprint', s:44, r:90,  b:76  },
      { id:'mc-btn-reload', s:44, r:16,  b:90  },
    ];

    cfg.forEach(({ id, s, r: right, b: bottom }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.cssText = `
        position: fixed;
        right: ${right}px;
        bottom: ${bottom}px;
        left: auto;
        top: auto;
        width: ${s}px;
        height: ${s}px;
        font-size: ${Math.round(s*0.35)}px;
        border-radius: 50%;
        background: rgba(0,0,0,0.6);
        border: 1.5px solid rgba(0,255,136,0.5);
        color: #00ff88;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        z-index: 60;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
        cursor: pointer;
      `;
    });
  }

  placeButtons();
  window.addEventListener('resize', placeButtons);
  screen.orientation?.addEventListener('change', () => setTimeout(placeButtons, 200));

  // ── Joystick logic ───────────────────────────────────────────
  const base = document.getElementById('mc-joystick-base');
  const knob = document.getElementById('mc-joystick-knob');
  const R = 44;
  let joyId = null, ox = 0, oy = 0;

  joyZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    joyId = t.identifier;
    const rect = base.getBoundingClientRect();
    ox = rect.left + rect.width / 2;
    oy = rect.top  + rect.height / 2;
    move(t.clientX, t.clientY);
  }, { passive: false });

  joyZone.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === joyId);
    if (t) move(t.clientX, t.clientY);
  }, { passive: false });

  joyZone.addEventListener('touchend', e => {
    e.preventDefault();
    const t = [...e.changedTouches].find(t => t.identifier === joyId);
    if (t) endJoy();
  }, { passive: false });

  function move(cx, cy) {
    let dx = cx - ox, dy = cy - oy;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d > R) { dx = dx/d*R; dy = dy/d*R; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const thr = R * 0.25;
    keys['KeyW'] = dy < -thr;
    keys['KeyS'] = dy >  thr;
    keys['KeyA'] = dx < -thr;
    keys['KeyD'] = dx >  thr;
  }

  function endJoy() {
    joyId = null;
    knob.style.transform = 'translate(-50%,-50%)';
    ['KeyW','KeyS','KeyA','KeyD'].forEach(k => keys[k] = false);
  }


  // ── Look + Shoot zone ────────────────────────────────────────
  // แตะใน look zone = หันเฉยๆ
  // แตะที่ปุ่มยิงแล้วลาก = ยิง+หัน (ลากออกนอกปุ่มก็ยังยิง)
  const SENS = 0.005;
  const activeTouches = new Map(); // id → { lx, ly, isShooting }
  let shootTimer = null;

  function startShooting() {
    if (shootTimer) return;
    shoot();
    shootTimer = setInterval(() => shoot(), 110);
  }
  function stopShooting() {
    clearInterval(shootTimer);
    shootTimer = null;
  }
  function anyoneShooting() {
    return [...activeTouches.values()].some(v => v.isShooting);
  }

  // ปุ่มยิง: แตะ = เริ่มยิง, ลาก = หันด้วย
  const shootEl = document.getElementById('mc-btn-shoot');
  shootEl.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const t of e.changedTouches)
      activeTouches.set(t.identifier, { lx: t.clientX, ly: t.clientY, isShooting: true });
    startShooting();
  }, { passive: false });

  // look zone: แตะ = หันเฉยๆ ไม่ยิง
  lookZone.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const t of e.changedTouches)
      if (!activeTouches.has(t.identifier))
        activeTouches.set(t.identifier, { lx: t.clientX, ly: t.clientY, isShooting: false });
  }, { passive: false });

  // touchmove บน document เพื่อจับลากออกนอก zone/ปุ่ม
  document.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      const entry = activeTouches.get(t.identifier);
      if (!entry) continue;
      yaw   -= (t.clientX - entry.lx) * SENS;
      pitch -= (t.clientY - entry.ly) * SENS;
      pitch  = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
      entry.lx = t.clientX;
      entry.ly = t.clientY;
    }
  }, { passive: true });

  function endTouch(t) {
    activeTouches.delete(t.identifier);
    if (!anyoneShooting()) stopShooting();
  }
  document.addEventListener('touchend',    e => { for (const t of e.changedTouches) endTouch(t); }, { passive: true });
  document.addEventListener('touchcancel', e => { for (const t of e.changedTouches) endTouch(t); }, { passive: true });

  // ── Action buttons ───────────────────────────────────────────
  function hold(id, code) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', e => { e.preventDefault(); keys[code] = true; },  { passive: false });
    el.addEventListener('touchend',   e => { e.preventDefault(); keys[code] = false; }, { passive: false });
  }
  hold('mc-btn-jump',   'Space');
  hold('mc-btn-crouch', 'KeyC');
  hold('mc-btn-sprint', 'ShiftLeft');

  const reloadEl = document.getElementById('mc-btn-reload');
  reloadEl.addEventListener('touchstart', e => { e.preventDefault(); reload(); }, { passive: false });
}
