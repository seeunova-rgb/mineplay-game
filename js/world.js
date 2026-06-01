// ─── TERRAIN ────────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(300, 300, 60, 60);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a2010 });

// Subtle height variation
const pos = groundGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), z = pos.getZ(i);
  pos.setY(i,
    Math.sin(x * 0.08) * 0.6 +
    Math.cos(z * 0.07) * 0.5 +
    Math.sin(x * 0.03 + z * 0.04) * 1.5
  );
}
groundGeo.computeVertexNormals();

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ─── BUILDINGS ──────────────────────────────────────────────────
function makeBuilding(x, z, w, d, h, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

const buildings = [];
const bData = [
  [8,  8,  5, 4, 4, 0x2a3020], [-12, 5, 6, 4, 6, 0x252820],
  [20, -5, 8, 5, 5, 0x1e2515], [-18,-12, 5, 6, 3, 0x2a2e1a],
  [5, -20, 4, 4, 5, 0x223018], [-6, 15, 7, 3, 4, 0x1a2010],
  [28, 12, 5, 5, 7, 0x2e3520], [-25, 3, 4, 4, 4, 0x252a18],
  [0,  30, 8, 6, 5, 0x1e2810], [15,-18, 3, 6, 6, 0x283022],
  [-10,-25,6, 4, 3, 0x1a2015], [32,-15, 5, 5, 4, 0x252a1a],
];
bData.forEach(([x,z,w,d,h,c]) => buildings.push({ mesh: makeBuilding(x,z,w,d,h,c), x,z,w,d,h }));

// ─── TREES ──────────────────────────────────────────────────────
function makeTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.15, 1.8, 6),
    new THREE.MeshLambertMaterial({ color: 0x3a2a18 })
  );
  trunk.position.set(x, 0.9, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 2.5, 7),
    new THREE.MeshLambertMaterial({ color: 0x1a3a10 })
  );
  foliage.position.set(x, 3.0, z);
  foliage.castShadow = true;
  scene.add(foliage);
}

const treePts = [
  [3,12],[-4,18],[16,6],[22,18],[10,-12],[-14,10],[-20,20],
  [30,-8],[18,-22],[-8,26],[-25,16],[12,28],[-30,-5],[25,25],
  [35,5],[-35,10],[8,-30],[-15,-28],[40,15],[5,35]
];
treePts.forEach(([x,z]) => makeTree(x, z));

// ─── ROCKS ──────────────────────────────────────────────────────
function makeRock(x, z, s) {
  const geo = new THREE.DodecahedronGeometry(s, 0);
  const mat = new THREE.MeshLambertMaterial({ color: 0x404540 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, s * 0.5, z);
  mesh.rotation.set(Math.random(), Math.random(), Math.random());
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
}
[[6,-8,0.5],[14,10,0.7],[-9,-6,0.4],[-16,18,0.6],[24,-12,0.5],[20,5,0.8],[2,22,0.5]]
  .forEach(([x,z,s]) => makeRock(x,z,s));

// ─── SKY ────────────────────────────────────────────────────────
const skyGeo = new THREE.SphereGeometry(200, 16, 8);
const skyMat = new THREE.MeshBasicMaterial({ color: 0x0d151e, side: THREE.BackSide });
scene.add(new THREE.Mesh(skyGeo, skyMat));
