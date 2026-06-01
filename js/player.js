// ─── PLAYER STATE ───────────────────────────────────────────────
const player = {
  pos: new THREE.Vector3(0, 1.7, 0),
  vel: new THREE.Vector3(),
  yaw: 0, pitch: 0,
  onGround: false,
  sprinting: false,
  crouching: false,
  stamina: 100,
  hp: 100, kills: 0,
  ammo: 30, reserve: 90,
  eyeHeight: 1.7,
  targetEyeHeight: 1.7,
};

const keys = {};
let mouseLocked = false;
let yaw = 0, pitch = 0;

// ─── INPUT ──────────────────────────────────────────────────────
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

document.addEventListener('mousemove', e => {
  if (!mouseLocked) return;
  const sens = 0.0018;
  yaw   -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, pitch));
});

document.addEventListener('mousedown', e => {
  if (!mouseLocked) return;
  if (e.button === 0) shoot();
});

document.addEventListener('pointerlockchange', () => {
  mouseLocked = !!document.pointerLockElement;
});

// ESC to pause
document.addEventListener('keydown', e => {
  if (e.code === 'Escape' && mouseLocked) {
    document.getElementById('lockscreen').style.display = 'flex';
    document.getElementById('lockscreen').querySelector('p').textContent = 'PAUSED — CLICK TO RESUME';
  }
});

// ─── COLLISION ──────────────────────────────────────────────────
function checkBuildingCollision(nx, nz) {
  const margin = 0.45;
  for (const b of buildings) {
    const hw = b.w / 2 + margin, hd = b.d / 2 + margin;
    if (Math.abs(nx - b.x) < hw && Math.abs(nz - b.z) < hd) return true;
  }
  return false;
}

function getGroundHeight(x, z) {
  return (
    Math.sin(x * 0.08) * 0.6 +
    Math.cos(z * 0.07) * 0.5 +
    Math.sin(x * 0.03 + z * 0.04) * 1.5
  );
}

// ─── PHYSICS CONSTANTS ──────────────────────────────────────────
const GRAVITY    = -18;
const JUMP_FORCE = 7;

// ─── MOVEMENT UPDATE ────────────────────────────────────────────
// Called each frame with delta time (dt in seconds).
function updatePlayer(dt) {
  // Crouch
  player.crouching = !!keys['KeyC'];
  player.targetEyeHeight = player.crouching ? 1.0 : 1.7;
  player.eyeHeight += (player.targetEyeHeight - player.eyeHeight) * 0.18;

  // Stamina / Sprint
  const wantSprint = (!!keys['ShiftLeft'] || !!keys['_joySprintHint']) && !!keys['KeyW'] && !player.crouching;
  if (wantSprint && player.stamina > 0) {
    player.sprinting = true;
    player.stamina = Math.max(0, player.stamina - 22 * dt);
  } else {
    player.sprinting = false;
    player.stamina = Math.min(100, player.stamina + 10 * dt);
  }
  const sprintBar = document.getElementById('sprint-bar');
  sprintBar.style.width = player.stamina + '%';
  sprintBar.style.background = player.stamina < 20 ? '#ff4444' : '#c8ff00';

  // Movement direction
  const speed = player.crouching ? 2.5 : player.sprinting ? 7.5 : 4.5;
  const moveDir = new THREE.Vector3();
  if (keys['KeyW']) moveDir.z -= 1;
  if (keys['KeyS']) moveDir.z += 1;
  if (keys['KeyA']) moveDir.x -= 1;
  if (keys['KeyD']) moveDir.x += 1;
  moveDir.normalize().multiplyScalar(speed);

  // Rotate by yaw
  const sinY = Math.sin(yaw), cosY = Math.cos(yaw);
  const worldX = moveDir.x * cosY + moveDir.z * sinY;
  const worldZ = -moveDir.x * sinY + moveDir.z * cosY;

  // Collision-aware XZ movement
  const nx = player.pos.x + worldX * dt;
  const nz = player.pos.z + worldZ * dt;
  if (!checkBuildingCollision(nx, player.pos.z)) player.pos.x = nx;
  if (!checkBuildingCollision(player.pos.x, nz)) player.pos.z = nz;

  // Clamp to world bounds
  player.pos.x = Math.max(-140, Math.min(140, player.pos.x));
  player.pos.z = Math.max(-140, Math.min(140, player.pos.z));

  // Gravity & vertical movement
  player.vel.y += GRAVITY * dt;
  player.pos.y += player.vel.y * dt;

  // Ground check
  const gh = getGroundHeight(player.pos.x, player.pos.z);
  const eyeFloor = gh + player.eyeHeight;
  if (player.pos.y <= eyeFloor) {
    player.pos.y = eyeFloor;
    player.vel.y = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // Jump
  if (keys['Space'] && player.onGround && !player.crouching) {
    player.vel.y = JUMP_FORCE;
    player.onGround = false;
  }

  // Apply to camera
  camera.position.copy(player.pos);
  camera.rotation.set(pitch, yaw, 0, 'YXZ');

  // Minimap dot (maps ±140 world units → 5..95px)
  const mx = 50 + (player.pos.x / 140) * 45;
  const mz = 50 + (player.pos.z / 140) * 45;
  const mdot = document.getElementById('minimap-dot');
  mdot.style.left = mx + 'px';
  mdot.style.top  = mz + 'px';

  // Coord display
  document.getElementById('coord-display').textContent =
    `POS: ${player.pos.x.toFixed(1)} / ${player.pos.z.toFixed(1)}`;
}
