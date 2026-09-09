import * as THREE from "three";
import { PointerLockControls } from "https://unpkg.com/three@0.186.0/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const ALTURA_OJOS = 1.6;
camera.position.set(3, ALTURA_OJOS, 4.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const ANCHO = 10;
const ALTO = 4;

// ── Texturas procedurales ──────────────────────────────────────────

function crearTexturaParquet() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d");
  const pH = 64;
  for (let y = 0; y < 512; y += pH) {
    ctx.fillStyle = `rgb(${168 + Math.random() * 35},${118 + Math.random() * 30},${52 + Math.random() * 25})`;
    ctx.fillRect(0, y, 512, pH);
    for (let i = 0; i < 8; i++) {
      const gy = y + Math.random() * pH;
      ctx.beginPath(); ctx.moveTo(0, gy);
      ctx.bezierCurveTo(128, gy + Math.random() * 4 - 2, 384, gy + Math.random() * 4 - 2, 512, gy + Math.random() * 6 - 3);
      ctx.strokeStyle = `rgba(100,65,25,${0.06 + Math.random() * 0.08})`;
      ctx.lineWidth = 0.5 + Math.random(); ctx.stroke();
    }
    ctx.fillStyle = "rgba(30,18,8,0.5)";
    ctx.fillRect(0, y + pH - 1, 512, 1.5);
    if (Math.random() > 0.75) {
      ctx.beginPath();
      ctx.ellipse(50 + Math.random() * 400, y + 10 + Math.random() * (pH - 20), 5 + Math.random() * 5, 3 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110,70,30,0.25)`; ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function crearTexturaCiudad() {
  const c = document.createElement("canvas");
  c.width = 2048; c.height = 1024;
  const ctx = c.getContext("2d");
  const sky = ctx.createLinearGradient(0, 0, 0, 1024);
  sky.addColorStop(0, "#4a8fc4"); sky.addColorStop(0.3, "#7cb8d8");
  sky.addColorStop(0.55, "#a8d0e4"); sky.addColorStop(0.75, "#d0e4ef");
  sky.addColorStop(1, "#ecf2f6");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 2048, 1024);

  for (let i = 0; i < 16; i++) {
    const cx = Math.random() * 2048, cy = 30 + Math.random() * 180;
    for (let b = 0; b < 2 + Math.floor(Math.random() * 4); b++) {
      ctx.fillStyle = `rgba(255,255,255,${0.45 + Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(cx + (b - 2) * (30 + Math.random() * 45), cy + Math.random() * 12 - 6, 25 + Math.random() * 60, 10 + Math.random() * 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let x = -10; x < 2058; x += 10 + Math.random() * 30) {
    const h = 50 + Math.random() * 180, w = 8 + Math.random() * 30;
    const g = 135 + Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgb(${g - 5},${g + 5},${g + 15})`; ctx.fillRect(x, 1024 - h, w, h);
  }
  for (let x = -10; x < 2058; x += 18 + Math.random() * 50) {
    const h = 160 + Math.random() * 480, w = 15 + Math.random() * 65;
    const s = 45 + Math.floor(Math.random() * 35);
    ctx.fillStyle = `rgb(${s + 5},${s + 8},${s + 18})`; ctx.fillRect(x, 1024 - h, w, h);
    for (let wy = 1024 - h + 6; wy < 1018; wy += 12)
      for (let wx = x + 3; wx < x + w - 3; wx += 9)
        if (Math.random() > 0.28) {
          ctx.fillStyle = Math.random() > 0.4 ? `rgba(255,225,150,${0.4 + Math.random() * 0.5})` : `rgba(170,200,230,${0.25 + Math.random() * 0.3})`;
          ctx.fillRect(wx, wy, 5, 7);
        }
  }
  return new THREE.CanvasTexture(c);
}

function crearTexturaArte(seed) {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const ctx = c.getContext("2d");
  const hue = (seed * 137) % 360;
  ctx.fillStyle = `hsl(${hue},15%,90%)`; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6 + seed % 5; i++) {
    const h = (hue + i * 55 + Math.random() * 40) % 360;
    ctx.fillStyle = `hsla(${h},${40 + Math.random() * 30}%,${30 + Math.random() * 35}%,${0.3 + Math.random() * 0.5})`;
    ctx.beginPath();
    if (Math.random() > 0.6) ctx.arc(Math.random() * 256, Math.random() * 256, 15 + Math.random() * 45, 0, Math.PI * 2);
    else if (Math.random() > 0.3) ctx.rect(Math.random() * 200, Math.random() * 200, 20 + Math.random() * 80, 20 + Math.random() * 80);
    else {
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.bezierCurveTo(Math.random() * 256, Math.random() * 256, Math.random() * 256, Math.random() * 256, Math.random() * 256, Math.random() * 256);
      ctx.lineWidth = 5 + Math.random() * 15; ctx.strokeStyle = ctx.fillStyle; ctx.stroke();
    }
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

function crearTexturaAlfombra() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#3a3535"; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(${60 + Math.random() * 30},${50 + Math.random() * 25},${50 + Math.random() * 25},0.3)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 4);
  }
  ctx.strokeStyle = "rgba(80,60,50,0.2)"; ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, 240, 240);
  ctx.strokeRect(14, 14, 228, 228);
  return new THREE.CanvasTexture(c);
}

// ── Habitación (shell) ─────────────────────────────────────────────

const materialPiso = new THREE.MeshStandardMaterial({ map: crearTexturaParquet(), roughness: 0.55, metalness: 0.02 });
const materialPared = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
const materialTecho = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });

const piso = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ANCHO), materialPiso);
piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true;
scene.add(piso);

const techo = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ANCHO), materialTecho);
techo.rotation.x = Math.PI / 2; techo.position.y = ALTO;
scene.add(techo);

// Pared del fondo — un hueco gigante para el ventanal
const VM_LAT = 0.25, VM_INF = 0.1, VM_SUP = 0.15;
const V_ANCHO = ANCHO - VM_LAT * 2, V_ALTO = ALTO - VM_INF - VM_SUP;
const vX1 = -V_ANCHO / 2, vX2 = V_ANCHO / 2, vY1 = VM_INF, vY2 = ALTO - VM_SUP;

const formaParedFondo = new THREE.Shape();
formaParedFondo.moveTo(-ANCHO / 2, 0); formaParedFondo.lineTo(ANCHO / 2, 0);
formaParedFondo.lineTo(ANCHO / 2, ALTO); formaParedFondo.lineTo(-ANCHO / 2, ALTO);
formaParedFondo.lineTo(-ANCHO / 2, 0);
const huecoV = new THREE.Path();
huecoV.moveTo(vX1, vY1); huecoV.lineTo(vX1, vY2);
huecoV.lineTo(vX2, vY2); huecoV.lineTo(vX2, vY1); huecoV.lineTo(vX1, vY1);
formaParedFondo.holes.push(huecoV);

const paredFondo = new THREE.Mesh(new THREE.ShapeGeometry(formaParedFondo), materialPared);
paredFondo.position.set(0, 0, -ANCHO / 2);
scene.add(paredFondo);

// Pared frontal con hueco para puerta
const PUERTA_X = 3.5, PUERTA_W = 0.9, PUERTA_H = 2.2;
const formaParedFrente = new THREE.Shape();
formaParedFrente.moveTo(-ANCHO / 2, 0); formaParedFrente.lineTo(ANCHO / 2, 0);
formaParedFrente.lineTo(ANCHO / 2, ALTO); formaParedFrente.lineTo(-ANCHO / 2, ALTO);
formaParedFrente.lineTo(-ANCHO / 2, 0);
const huecoPuerta = new THREE.Path();
const pX1 = PUERTA_X - PUERTA_W / 2, pX2 = PUERTA_X + PUERTA_W / 2;
huecoPuerta.moveTo(-pX1, 0); huecoPuerta.lineTo(-pX1, PUERTA_H);
huecoPuerta.lineTo(-pX2, PUERTA_H); huecoPuerta.lineTo(-pX2, 0); huecoPuerta.lineTo(-pX1, 0);
formaParedFrente.holes.push(huecoPuerta);

const paredFrente = new THREE.Mesh(new THREE.ShapeGeometry(formaParedFrente), materialPared);
paredFrente.position.set(0, 0, ANCHO / 2);
paredFrente.rotation.y = Math.PI;
scene.add(paredFrente);

const paredIzquierda = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredIzquierda.position.set(-ANCHO / 2, ALTO / 2, 0); paredIzquierda.rotation.y = Math.PI / 2;
scene.add(paredIzquierda);

const paredDerecha = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredDerecha.position.set(ANCHO / 2, ALTO / 2, 0); paredDerecha.rotation.y = -Math.PI / 2;
scene.add(paredDerecha);

// ── Ventanal industrial ────────────────────────────────────────────

const zPared = -ANCHO / 2;
const matMarco = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.85, roughness: 0.25 });
const gF = 0.05;

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = true; scene.add(m); return m;
}

box(V_ANCHO + gF * 2, gF, 0.06, matMarco, 0, vY2 + gF / 2, zPared + 0.03);
box(V_ANCHO + gF * 2, gF, 0.06, matMarco, 0, vY1 - gF / 2, zPared + 0.03);
box(gF, V_ALTO + gF * 2, 0.06, matMarco, vX1 - gF / 2, vY1 + V_ALTO / 2, zPared + 0.03);
box(gF, V_ALTO + gF * 2, 0.06, matMarco, vX2 + gF / 2, vY1 + V_ALTO / 2, zPared + 0.03);

for (let i = 1; i < 5; i++) box(gF * 0.6, V_ALTO, 0.04, matMarco, vX1 + (V_ANCHO / 5) * i, vY1 + V_ALTO / 2, zPared + 0.03);
for (let i = 1; i < 3; i++) box(V_ANCHO, gF * 0.6, 0.04, matMarco, 0, vY1 + (V_ALTO / 3) * i, zPared + 0.03);

const vidrio = new THREE.Mesh(
  new THREE.PlaneGeometry(V_ANCHO, V_ALTO),
  new THREE.MeshStandardMaterial({ color: 0xbfd9e8, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
);
vidrio.position.set(0, vY1 + V_ALTO / 2, zPared + 0.01);
scene.add(vidrio);

box(V_ANCHO + 0.1, 0.04, 0.18, matMarco, 0, vY1, zPared + 0.09);

const paisaje = new THREE.Mesh(
  new THREE.PlaneGeometry(ANCHO * 8, ALTO * 6),
  new THREE.MeshBasicMaterial({ map: crearTexturaCiudad() })
);
paisaje.position.set(0, ALTO * 0.7, zPared - 3);
scene.add(paisaje);

// ── Puerta ─────────────────────────────────────────────────────────

const matPuerta = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
const matMarcoPuerta = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

box(PUERTA_W, PUERTA_H, 0.06, matPuerta, PUERTA_X, PUERTA_H / 2, ANCHO / 2 - 0.04);
box(PUERTA_W + 0.14, 0.07, 0.08, matMarcoPuerta, PUERTA_X, PUERTA_H + 0.035, ANCHO / 2 - 0.02);
box(0.07, PUERTA_H + 0.07, 0.08, matMarcoPuerta, PUERTA_X - PUERTA_W / 2 - 0.035, PUERTA_H / 2, ANCHO / 2 - 0.02);
box(0.07, PUERTA_H + 0.07, 0.08, matMarcoPuerta, PUERTA_X + PUERTA_W / 2 + 0.035, PUERTA_H / 2, ANCHO / 2 - 0.02);

const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.1 }));
handle.rotation.x = Math.PI / 2; handle.position.set(PUERTA_X - 0.3, 1, ANCHO / 2 - 0.08);
scene.add(handle);

// ── Zócalo ─────────────────────────────────────────────────────────

const matZocalo = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
box(ANCHO, 0.1, 0.03, matZocalo, 0, 0.05, ANCHO / 2 - 0.015);
box(0.03, 0.1, ANCHO, matZocalo, -ANCHO / 2 + 0.015, 0.05, 0);
box(0.03, 0.1, ANCHO, matZocalo, ANCHO / 2 - 0.015, 0.05, 0);

// ── Iluminación ────────────────────────────────────────────────────

const luzSol = new THREE.DirectionalLight(0xfff5e6, 2.8);
luzSol.position.set(2, ALTO + 3, -ANCHO - 2);
luzSol.target.position.set(0, 0, 2);
luzSol.castShadow = true;
luzSol.shadow.mapSize.width = 2048; luzSol.shadow.mapSize.height = 2048;
luzSol.shadow.camera.near = 0.1; luzSol.shadow.camera.far = 30;
luzSol.shadow.camera.left = -8; luzSol.shadow.camera.right = 8;
luzSol.shadow.camera.top = 8; luzSol.shadow.camera.bottom = -2;
scene.add(luzSol); scene.add(luzSol.target);
scene.add(new THREE.AmbientLight(0xc8d8e8, 0.5));
scene.add(new THREE.HemisphereLight(0x87ceeb, 0xb88860, 0.3));

// ── Escritorio doble con monitores ─────────────────────────────────

const escritorio = new THREE.Group();
const matEscritorio = new THREE.MeshStandardMaterial({ color: 0xd4c4a8 });
const matMetal = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.3 });
const matNegro = new THREE.MeshStandardMaterial({ color: 0x111111 });

const superficie = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.85), matEscritorio);
superficie.position.set(0, 0.75, 0); superficie.castShadow = true; superficie.receiveShadow = true;
escritorio.add(superficie);

const pataGeo = new THREE.BoxGeometry(0.05, 0.75, 0.05);
[[-1.15, -0.38], [1.15, -0.38], [-1.15, 0.38], [1.15, 0.38]].forEach(([x, z]) => {
  const p = new THREE.Mesh(pataGeo, matMetal); p.position.set(x, 0.375, z); escritorio.add(p);
});

const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.03, 0.03), matMetal);
crossbar.position.set(0, 0.1, -0.38); escritorio.add(crossbar);

function crearMonitor(x, screenColor) {
  const pantalla = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.36, 0.02), matNegro);
  pantalla.position.set(x, 1.15, -0.22); pantalla.castShadow = true; escritorio.add(pantalla);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ color: screenColor }));
  face.position.set(x, 1.15, -0.209); escritorio.add(face);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.04), matNegro);
  stand.position.set(x, 0.95, -0.22); escritorio.add(stand);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.15), matNegro);
  base.position.set(x, 0.77, -0.22); escritorio.add(base);
}
crearMonitor(-0.35, 0x1a2a3a);
crearMonitor(0.3, 0x1e2d3d);

const teclado = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.012, 0.14), new THREE.MeshStandardMaterial({ color: 0x222222 }));
teclado.position.set(0, 0.783, 0.12); escritorio.add(teclado);
const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.018, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222 }));
mouse.position.set(0.45, 0.783, 0.12); escritorio.add(mouse);

const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.02, 16), matNegro);
lampBase.position.set(-0.95, 0.78, -0.15); escritorio.add(lampBase);
const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), matNegro);
lampArm.position.set(-0.95, 0.98, -0.15); escritorio.add(lampArm);
const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 16), matNegro);
lampHead.position.set(-0.95, 1.2, -0.15); lampHead.rotation.z = Math.PI; escritorio.add(lampHead);
const lampLight = new THREE.PointLight(0xffeedd, 0.4, 3);
lampLight.position.set(-0.95, 1.14, -0.15); escritorio.add(lampLight);

const pcTower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.42, 0.4), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
pcTower.position.set(0.95, 0.21, 0.15); pcTower.castShadow = true; escritorio.add(pcTower);
const pcLed = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x00ff44 }));
pcLed.position.set(0.95, 0.3, 0.351); escritorio.add(pcLed);

const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }));
mug.position.set(-0.55, 0.81, 0.2); escritorio.add(mug);

escritorio.position.set(0, 0, -3.8);
scene.add(escritorio);

// ── Silla de oficina ───────────────────────────────────────────────

const silla = new THREE.Group();
const matSilla = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
const matSillaMetal = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.2 });

const asiento = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), matSilla);
asiento.position.set(0, 0.45, 0); silla.add(asiento);
const respaldoSilla = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.5, 0.03), new THREE.MeshStandardMaterial({ color: 0x333333 }));
respaldoSilla.position.set(0, 0.73, -0.22); silla.add(respaldoSilla);
const columna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), matSillaMetal);
columna.position.set(0, 0.27, 0); silla.add(columna);

for (let i = 0; i < 5; i++) {
  const ang = (i / 5) * Math.PI * 2;
  const pata = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.22), matSillaMetal);
  pata.position.set(Math.sin(ang) * 0.13, 0.1, Math.cos(ang) * 0.13);
  pata.rotation.y = ang; silla.add(pata);
  const rueda = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), matSilla);
  rueda.position.set(Math.sin(ang) * 0.23, 0.022, Math.cos(ang) * 0.23); silla.add(rueda);
}

const apoyaL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.25), matSillaMetal);
apoyaL.position.set(-0.24, 0.52, -0.05); silla.add(apoyaL);
const apoyaR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.25), matSillaMetal);
apoyaR.position.set(0.24, 0.52, -0.05); silla.add(apoyaR);

silla.position.set(0.1, 0, -2.6); silla.rotation.y = 0.15;
scene.add(silla);

// ── Tocadiscos mejorado (consola mid-century) ──────────────────────

const consolaToca = new THREE.Group();
const matMadera = new THREE.MeshStandardMaterial({ color: 0x8b5e34 });
const matMaderaOsc = new THREE.MeshStandardMaterial({ color: 0x6b4423 });

const credenza = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.4), matMadera);
credenza.position.set(0, 0.42, 0); credenza.castShadow = true; consolaToca.add(credenza);

[[-0.5, -0.15], [0.5, -0.15], [-0.5, 0.15], [0.5, 0.15]].forEach(([x, z]) => {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.2, 8), matMaderaOsc);
  p.position.set(x, 0.1, z); consolaToca.add(p);
});

const baseToca = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.4), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
baseToca.position.set(-0.15, 0.67, 0); consolaToca.add(baseToca);

const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 32), matNegro);
disco.position.set(-0.15, 0.7, 0); consolaToca.add(disco);

const vinylLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.013, 16), new THREE.MeshStandardMaterial({ color: 0xc04040 }));
vinylLabel.position.set(-0.15, 0.701, 0); consolaToca.add(vinylLabel);

const brazoToca = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.2), new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9 }));
brazoToca.position.set(0.12, 0.72, -0.06); brazoToca.rotation.y = 0.3; consolaToca.add(brazoToca);

const grille = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.32), new THREE.MeshStandardMaterial({ color: 0x705030 }));
grille.position.set(0.35, 0.42, 0.201); consolaToca.add(grille);

consolaToca.position.set(4.3, 0, -1.5);
consolaToca.rotation.y = -Math.PI / 2;
scene.add(consolaToca);

const posTocadiscos = new THREE.Vector3(4.3, 1, -1.5);

const repisa = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 0.25), matMaderaOsc);
repisa.position.set(4.85, 1.6, -1.5); repisa.rotation.y = -Math.PI / 2;
scene.add(repisa);

const coloresVinilos = [0x3d5a6c, 0xc97b4a, 0x6b8e5a, 0xd9a05b, 0x8a4f5e];
coloresVinilos.forEach((color, i) => {
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.02), new THREE.MeshStandardMaterial({ color }));
  v.position.set(4.85, 1.77, -1.5 + (i - 2) * 0.19); v.rotation.y = -Math.PI / 2;
  scene.add(v);
});

// ── Biblioteca (bookshelf) ─────────────────────────────────────────

const biblioteca = new THREE.Group();
const matEstante = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });

const ladoL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.4, 0.35), matEstante);
ladoL.position.set(-0.6, 1.2, 0); biblioteca.add(ladoL);
const ladoR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.4, 0.35), matEstante);
ladoR.position.set(0.6, 1.2, 0); biblioteca.add(ladoR);
const topB = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.04, 0.35), matEstante);
topB.position.set(0, 2.4, 0); biblioteca.add(topB);
const backB = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.02), matEstante);
backB.position.set(0, 1.2, -0.165); biblioteca.add(backB);

const bookColors = [0xc04040, 0x4060a0, 0x40a060, 0xd4a030, 0x8040a0, 0x40a0a0, 0xd06030, 0x2050a0];
for (let s = 0; s < 5; s++) {
  const shelfY = 0.04 + s * 0.47;
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.03, 0.34), matEstante);
  shelf.position.set(0, shelfY, 0); biblioteca.add(shelf);
  let bx = -0.5;
  while (bx < 0.48) {
    const bw = 0.025 + Math.random() * 0.04;
    const bh = 0.22 + Math.random() * 0.2;
    const bc = bookColors[Math.floor(Math.random() * bookColors.length)];
    const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.22), new THREE.MeshStandardMaterial({ color: bc }));
    book.position.set(bx + bw / 2, shelfY + 0.015 + bh / 2, 0.03);
    biblioteca.add(book);
    bx += bw + 0.004;
  }
}

biblioteca.position.set(-4.7, 0, 1.5);
biblioteca.rotation.y = Math.PI / 2;
scene.add(biblioteca);

// ── Sillón ─────────────────────────────────────────────────────────

const sillon = new THREE.Group();
const matSillon = new THREE.MeshStandardMaterial({ color: 0x3a3a42 });
const matSillonClaro = new THREE.MeshStandardMaterial({ color: 0x454550 });

const asientoS = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.7), matSillon);
asientoS.position.set(0, 0.35, 0); sillon.add(asientoS);
const respaldoS = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.12), matSillon);
respaldoS.position.set(0, 0.6, -0.35); sillon.add(respaldoS);
const brazoSL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.7), matSillon);
brazoSL.position.set(-0.45, 0.42, 0); sillon.add(brazoSL);
const brazoSR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.7), matSillon);
brazoSR.position.set(0.45, 0.42, 0); sillon.add(brazoSR);

[[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].forEach(([x, z]) => {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8), matMetal);
  p.position.set(x, 0.1, z); sillon.add(p);
});

const cojin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.1), matSillonClaro);
cojin.position.set(0, 0.6, -0.22); cojin.rotation.x = -0.1; sillon.add(cojin);

sillon.position.set(-2.5, 0, 2.5);
sillon.rotation.y = -Math.PI / 2;
scene.add(sillon);

// ── TV + mueble TV ─────────────────────────────────────────────────

const tvGrupo = new THREE.Group();

const muebleTV = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.4), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
muebleTV.position.set(0, 0.175, 0); tvGrupo.add(muebleTV);

const tvPantalla = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.75, 0.03), matNegro);
tvPantalla.position.set(0, 0.73, -0.05); tvPantalla.castShadow = true; tvGrupo.add(tvPantalla);
const tvFace = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.7), new THREE.MeshBasicMaterial({ color: 0x0a0f18 }));
tvFace.position.set(0, 0.73, -0.034); tvGrupo.add(tvFace);
const tvBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.2), matNegro);
tvBase.position.set(0, 0.37, 0); tvGrupo.add(tvBase);

tvGrupo.position.set(-4.65, 0, 2.5);
tvGrupo.rotation.y = Math.PI / 2;
scene.add(tvGrupo);

// ── Alfombra ───────────────────────────────────────────────────────

const alfombra = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 1.6),
  new THREE.MeshStandardMaterial({ map: crearTexturaAlfombra(), roughness: 0.9 })
);
alfombra.rotation.x = -Math.PI / 2; alfombra.position.set(-3.5, 0.005, 2.5);
scene.add(alfombra);

// ── Cuadros (abstract art) ─────────────────────────────────────────

function crearCuadro(ancho, alto, seed) {
  const grupo = new THREE.Group();
  const matFrame = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const g = 0.035;
  const ft = new THREE.Mesh(new THREE.BoxGeometry(ancho + g * 2, g, 0.025), matFrame);
  ft.position.set(0, alto / 2 + g / 2, 0); grupo.add(ft);
  const fb = new THREE.Mesh(new THREE.BoxGeometry(ancho + g * 2, g, 0.025), matFrame);
  fb.position.set(0, -alto / 2 - g / 2, 0); grupo.add(fb);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(g, alto, 0.025), matFrame);
  fl.position.set(-ancho / 2 - g / 2, 0, 0); grupo.add(fl);
  const fr = new THREE.Mesh(new THREE.BoxGeometry(g, alto, 0.025), matFrame);
  fr.position.set(ancho / 2 + g / 2, 0, 0); grupo.add(fr);

  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshStandardMaterial({ map: crearTexturaArte(seed) }));
  canvas.position.set(0, 0, 0.01); grupo.add(canvas);
  return grupo;
}

const cuadro1 = crearCuadro(0.7, 0.5, 1);
cuadro1.position.set(ANCHO / 2 - 0.02, 2.2, -3); cuadro1.rotation.y = -Math.PI / 2;
scene.add(cuadro1);

const cuadro2 = crearCuadro(0.9, 0.6, 2);
cuadro2.position.set(ANCHO / 2 - 0.02, 2.4, 0.5); cuadro2.rotation.y = -Math.PI / 2;
scene.add(cuadro2);

const cuadro3 = crearCuadro(0.6, 0.8, 3);
cuadro3.position.set(-ANCHO / 2 + 0.02, 2.5, -2.5); cuadro3.rotation.y = Math.PI / 2;
scene.add(cuadro3);

const cuadro4 = crearCuadro(1.0, 0.5, 4);
cuadro4.position.set(1, 2.6, ANCHO / 2 - 0.02); cuadro4.rotation.y = Math.PI;
scene.add(cuadro4);

// ── Planta ─────────────────────────────────────────────────────────

const planta = new THREE.Group();
const maceta = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.18, 10), new THREE.MeshStandardMaterial({ color: 0xc8885a }));
maceta.position.set(0, 0.09, 0); planta.add(maceta);
const tierra = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10), new THREE.MeshStandardMaterial({ color: 0x3d2817 }));
tierra.position.set(0, 0.18, 0); planta.add(tierra);
for (let i = 0; i < 7; i++) {
  const hoja = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.04, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2d5a27 }));
  hoja.position.set(Math.random() * 0.1 - 0.05, 0.22 + Math.random() * 0.18, Math.random() * 0.1 - 0.05);
  planta.add(hoja);
}
planta.position.set(1.8, 0.75, -3.8);
scene.add(planta);

const planta2 = planta.clone();
planta2.position.set(-4.2, 0, 4);
scene.add(planta2);

// ── Lámpara de pie ─────────────────────────────────────────────────

const lampaPie = new THREE.Group();
const matLampa = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
const baseLP = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16), matLampa);
baseLP.position.set(0, 0.015, 0); lampaPie.add(baseLP);
const posteLP = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 8), matLampa);
posteLP.position.set(0, 0.83, 0); lampaPie.add(posteLP);
const pantallaLP = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.22, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xf5e6cc, side: THREE.DoubleSide }));
pantallaLP.position.set(0, 1.7, 0); lampaPie.add(pantallaLP);
const luzLP = new THREE.PointLight(0xffeedd, 0.5, 4);
luzLP.position.set(0, 1.6, 0); lampaPie.add(luzLP);

lampaPie.position.set(-1.5, 0, 3.8);
scene.add(lampaPie);

// ── Controles ──────────────────────────────────────────────────────

const controls = new PointerLockControls(camera, document.body);
const overlay = document.getElementById("overlay");
overlay.addEventListener("click", () => controls.lock());
controls.addEventListener("lock", () => overlay.setAttribute("hidden", ""));
controls.addEventListener("unlock", () => overlay.removeAttribute("hidden"));

const teclas = { adelante: false, atras: false, izquierda: false, derecha: false };
window.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") teclas.adelante = true;
  if (e.code === "KeyS") teclas.atras = true;
  if (e.code === "KeyA") teclas.izquierda = true;
  if (e.code === "KeyD") teclas.derecha = true;
});
window.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") teclas.adelante = false;
  if (e.code === "KeyS") teclas.atras = false;
  if (e.code === "KeyA") teclas.izquierda = false;
  if (e.code === "KeyD") teclas.derecha = false;
});

const VELOCIDAD = 3;
const LIMITE = ANCHO / 2 - 0.5;

const GRAVEDAD = -20, FUERZA_SALTO = 6;
let velocidadY = 0;
window.addEventListener("keydown", (e) => {
  if (e.code !== "Space" || !controls.isLocked) return;
  if (Math.abs(camera.position.y - ALTURA_OJOS) < 0.01) velocidadY = FUERZA_SALTO;
});

// ── Colisión ───────────────────────────────────────────────────────

const M = 0.3;
const OBSTACULOS = [
  { minX: -1.5 - M, maxX: 1.5 + M, minZ: -4.3 - M, maxZ: -3.3 + M },
  { minX: 3.7 - M, maxX: 5 + M, minZ: -2.2 - M, maxZ: -0.8 + M },
  { minX: -5 - M, maxX: -4 + M, minZ: 0.5 - M, maxZ: 2.5 + M },
  { minX: -3.2 - M, maxX: -1.8 + M, minZ: 2 - M, maxZ: 3 + M },
  { minX: -5 - M, maxX: -4 + M, minZ: 2 - M, maxZ: 3 + M },
];

function estaDentroDeObstaculo(x, z) {
  return OBSTACULOS.some((o) => x >= o.minX && x <= o.maxX && z >= o.minZ && z <= o.maxZ);
}

// ── Interacción con tocadiscos ─────────────────────────────────────

const API_URL = "http://localhost:3000";
const DISTANCIA_INTERACCION = 1.5;
const promptInteraccion = document.getElementById("prompt-interaccion");
const panelInfo = document.getElementById("panel-info");
const panelContenido = document.getElementById("panel-contenido");
let panelAbierto = false;

async function abrirPanel() {
  panelAbierto = true;
  panelInfo.removeAttribute("hidden");
  panelContenido.innerHTML = "<p>Cargando...</p>";
  try {
    const r = await fetch(`${API_URL}/proyectos`);
    if (!r.ok) throw new Error(`Error: ${r.status}`);
    const proyectos = await r.json();
    panelContenido.innerHTML = proyectos.map((p) => `<li><strong>${p.titulo}</strong>: ${p.descripcion}</li>`).join("");
  } catch (err) {
    console.error(err);
    panelContenido.innerHTML = "<p>No se pudo cargar la información.</p>";
  }
}

function cerrarPanel() { panelAbierto = false; panelInfo.setAttribute("hidden", ""); }

window.addEventListener("keydown", (e) => {
  if (e.code !== "KeyE" || !controls.isLocked) return;
  if (panelAbierto) { cerrarPanel(); return; }
  if (camera.position.distanceTo(posTocadiscos) <= DISTANCIA_INTERACCION) abrirPanel();
});

// ── Animación ──────────────────────────────────────────────────────

const reloj = new THREE.Clock();

function animar() {
  requestAnimationFrame(animar);
  const delta = reloj.getDelta();
  const paso = VELOCIDAD * delta;

  if (controls.isLocked) {
    velocidadY += GRAVEDAD * delta;
    camera.position.y += velocidadY * delta;
    let enElSuelo = false;
    if (camera.position.y <= ALTURA_OJOS) {
      camera.position.y = ALTURA_OJOS; velocidadY = 0; enElSuelo = true;
    }

    if (!panelAbierto) {
      const xP = camera.position.x, zP = camera.position.z;
      if (teclas.adelante) controls.moveForward(paso);
      if (teclas.atras) controls.moveForward(-paso);
      if (teclas.derecha) controls.moveRight(paso);
      if (teclas.izquierda) controls.moveRight(-paso);
      camera.position.x = Math.max(-LIMITE, Math.min(LIMITE, camera.position.x));
      camera.position.z = Math.max(-LIMITE, Math.min(LIMITE, camera.position.z));
      if (enElSuelo && estaDentroDeObstaculo(camera.position.x, camera.position.z)) {
        camera.position.x = xP; camera.position.z = zP;
      }
    }

    const dist = camera.position.distanceTo(posTocadiscos);
    if (!panelAbierto && dist <= DISTANCIA_INTERACCION) promptInteraccion.removeAttribute("hidden");
    else promptInteraccion.setAttribute("hidden", "");
  }

  disco.rotation.y += delta * 2;
  renderer.render(scene, camera);
}

animar();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
