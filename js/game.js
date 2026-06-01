// ─── GAME LOOP ──────────────────────────────────────────────────
let prevTime = performance.now();
let frameCount = 0, fpsTime = 0, fps = 0;

function update() {
  const now = performance.now();
  const dt  = Math.min((now - prevTime) / 1000, 0.05);
  prevTime  = now;

  // FPS counter (update every 0.5 s)
  frameCount++;
  fpsTime += dt;
  if (fpsTime >= 0.5) {
    fps = Math.round(frameCount / fpsTime);
    document.getElementById('fps-display').textContent = `FPS: ${fps}`;
    frameCount = 0; fpsTime = 0;
  }

  // Sub-systems
  updatePlayer(dt);                                               // player.js

  const moving = (keys['KeyW']||keys['KeyS']||keys['KeyA']||keys['KeyD']) && player.onGround;
  updateWeaponBob(moving, player.sprinting, dt);                 // weapon.js

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

// ─── RESIZE ─────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── START / PAUSE SCREEN ───────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  canvas.requestPointerLock();
  document.getElementById('lockscreen').style.display = 'none';

  const wn = document.getElementById('weapon-name');
  wn.style.opacity = '1';
  setTimeout(() => { wn.style.opacity = '0'; }, 1800);
});

// ─── KICK OFF ───────────────────────────────────────────────────
update();
