// ─── SCENE SETUP ────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.fog = new THREE.FogExp2(0x0a0f12, 0.022);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f12);
scene.fog = renderer.fog;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 1.7, 0);

// ─── LIGHTING ───────────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0x1a2030, 1.2);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
sun.position.set(30, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;  sun.shadow.camera.bottom = -80;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x304060, 0.6);
fill.position.set(-20, 10, -30);
scene.add(fill);
