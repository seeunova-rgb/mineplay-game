// ─── WEAPON MODEL ───────────────────────────────────────────────
const weaponGroup = new THREE.Group();
const stockMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.55), stockMat);
weaponGroup.add(stock);

const barrel = new THREE.Mesh(
  new THREE.BoxGeometry(0.04, 0.04, 0.4),
  new THREE.MeshLambertMaterial({ color: 0x111111 })
);
barrel.position.set(0, 0.015, -0.45);
weaponGroup.add(barrel);

const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.06), stockMat);
grip.position.set(0, -0.1, 0.05);
weaponGroup.add(grip);

const mag = new THREE.Mesh(
  new THREE.BoxGeometry(0.05, 0.18, 0.08),
  new THREE.MeshLambertMaterial({ color: 0x252525 })
);
mag.position.set(0, -0.12, -0.08);
weaponGroup.add(mag);

camera.add(weaponGroup);
weaponGroup.position.set(0.22, -0.22, -0.5);
scene.add(camera);

// ─── WEAPON BOB ─────────────────────────────────────────────────
let bobTime = 0;
let shootRecoil = 0;

function updateWeaponBob(moving, sprinting, dt) {
  if (moving) bobTime += dt * (sprinting ? 14 : 9);
  const bobX = Math.sin(bobTime) * (moving ? (sprinting ? 0.012 : 0.007) : 0.002);
  const bobY = Math.abs(Math.sin(bobTime)) * (moving ? (sprinting ? 0.01 : 0.006) : 0.001);
  weaponGroup.position.x = 0.22 + bobX;
  weaponGroup.position.y = -0.22 - bobY + shootRecoil * 0.04;
  weaponGroup.position.z = -0.5 - shootRecoil * 0.06;
  weaponGroup.rotation.x = shootRecoil * 0.15;
  shootRecoil *= 0.82;
}

// ─── RELOAD ─────────────────────────────────────────────────────
let isReloading = false;

function updateAmmoHUD() {
  document.getElementById('ammo-val').innerHTML =
    `${player.ammo}<span class="ammo-reserve">/${player.reserve}</span>`;
}

function reload() {
  if (isReloading) return;
  if (player.reserve <= 0) return;
  if (player.ammo === 30) return;
  isReloading = true;

  const reloadEl = document.getElementById('reload-text');
  if (reloadEl) reloadEl.classList.add('visible');

  setTimeout(() => {
    const needed = 30 - player.ammo;
    const fill = Math.min(needed, player.reserve);
    player.ammo += fill;
    player.reserve -= fill;
    updateAmmoHUD();
    isReloading = false;
    if (reloadEl) reloadEl.classList.remove('visible');
  }, 1800);
}

// R key to reload
document.addEventListener('keydown', e => { if (e.code === 'KeyR') reload(); });

// ─── SHOOT ──────────────────────────────────────────────────────
let lastShot = 0;

function shoot() {
  const now = performance.now();
  if (now - lastShot < 100) return;
  if (isReloading) return;
  if (player.ammo <= 0) {
    reload(); // รีโหลดอัตโนมัติ
    return;
  }
  lastShot = now;

  player.ammo--;
  shootRecoil = 1;

  updateAmmoHUD();

  // รีโหลดอัตโนมัติเมื่อกระสุนหมด
  if (player.ammo === 0) reload();

  // Muzzle flash
  const flash = new THREE.PointLight(0xffaa44, 8, 3);
  flash.position.copy(camera.position).add(new THREE.Vector3(0, 0, -0.5));
  scene.add(flash);
  setTimeout(() => scene.remove(flash), 60);

  // Raycast hit detection
  const dir = new THREE.Vector3(0, 0, -1)
    .applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  const ray = new THREE.Raycaster(camera.position.clone(), dir.normalize(), 0.1, 80);
  const targets = scene.children.filter(c => c.isMesh && c !== ground);
  const hits = ray.intersectObjects(targets, true);
  if (hits.length > 0) showHitmarker();
}

function showHitmarker() {
  const hm = document.getElementById('hitmarker');
  hm.style.opacity = '1';
  setTimeout(() => hm.style.opacity = '0', 120);
}
