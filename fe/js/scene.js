import * as THREE from "three";
import { PointerLockControls } from "https://unpkg.com/three@0.186.0/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const ALTURA_OJOS = 1.6;
camera.position.set(0, ALTURA_OJOS, 3);

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
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const plankH = 64;
  for (let y = 0; y < 512; y += plankH) {
    const r = 168 + Math.random() * 35;
    const g = 118 + Math.random() * 30;
    const b = 52 + Math.random() * 25;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, 512, plankH);

    for (let i = 0; i < 8; i++) {
      const gy = y + Math.random() * plankH;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(
        128, gy + Math.random() * 4 - 2,
        384, gy + Math.random() * 4 - 2,
        512, gy + Math.random() * 6 - 3
      );
      ctx.strokeStyle = `rgba(100,65,25,${0.06 + Math.random() * 0.08})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(30,18,8,0.5)";
    ctx.fillRect(0, y + plankH - 1, 512, 1.5);

    if (Math.random() > 0.75) {
      const kx = 50 + Math.random() * 400;
      const ky = y + 10 + Math.random() * (plankH - 20);
      ctx.beginPath();
      ctx.ellipse(kx, ky, 5 + Math.random() * 5, 3 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110,70,30,${0.2 + Math.random() * 0.15})`;
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function crearTexturaCiudad() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, 1024);
  sky.addColorStop(0, "#4a8fc4");
  sky.addColorStop(0.3, "#7cb8d8");
  sky.addColorStop(0.55, "#a8d0e4");
  sky.addColorStop(0.75, "#d0e4ef");
  sky.addColorStop(1, "#ecf2f6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 2048, 1024);

  for (let i = 0; i < 14; i++) {
    const cx = Math.random() * 2048;
    const cy = 30 + Math.random() * 180;
    const blobs = 2 + Math.floor(Math.random() * 4);
    for (let b = 0; b < blobs; b++) {
      ctx.fillStyle = `rgba(255,255,255,${0.45 + Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(
        cx + (b - blobs / 2) * (30 + Math.random() * 45),
        cy + Math.random() * 12 - 6,
        25 + Math.random() * 60,
        10 + Math.random() * 22,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  for (let x = -10; x < 2058; x += 10 + Math.random() * 30) {
    const h = 50 + Math.random() * 180;
    const w = 8 + Math.random() * 30;
    const g = 135 + Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgb(${g - 5},${g + 5},${g + 15})`;
    ctx.fillRect(x, 1024 - h, w, h);
  }

  for (let x = -10; x < 2058; x += 18 + Math.random() * 50) {
    const h = 160 + Math.random() * 480;
    const w = 15 + Math.random() * 65;
    const s = 45 + Math.floor(Math.random() * 35);
    ctx.fillStyle = `rgb(${s + 5},${s + 8},${s + 18})`;
    ctx.fillRect(x, 1024 - h, w, h);

    for (let wy = 1024 - h + 6; wy < 1018; wy += 12) {
      for (let wx = x + 3; wx < x + w - 3; wx += 9) {
        if (Math.random() > 0.28) {
          ctx.fillStyle = Math.random() > 0.4
            ? `rgba(255,225,150,${0.4 + Math.random() * 0.5})`
            : `rgba(170,200,230,${0.25 + Math.random() * 0.3})`;
          ctx.fillRect(wx, wy, 5, 7);
        }
      }
    }
  }

  return new THREE.CanvasTexture(canvas);
}

// ── Habitación ─────────────────────────────────────────────────────

const materialPiso = new THREE.MeshStandardMaterial({
  map: crearTexturaParquet(),
  roughness: 0.55,
  metalness: 0.02,
});
const materialPared = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
const materialTecho = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });

const piso = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ANCHO), materialPiso);
piso.rotation.x = -Math.PI / 2;
piso.receiveShadow = true;
scene.add(piso);

const techo = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ANCHO), materialTecho);
techo.rotation.x = Math.PI / 2;
techo.position.y = ALTO;
scene.add(techo);

// Pared del fondo: un gran hueco que ocupa casi toda la superficie (ventanal).
const VENTANAL_MARGEN_LAT = 0.25;
const VENTANAL_MARGEN_INF = 0.1;
const VENTANAL_MARGEN_SUP = 0.15;
const VENTANAL_ANCHO = ANCHO - VENTANAL_MARGEN_LAT * 2;
const VENTANAL_ALTO = ALTO - VENTANAL_MARGEN_INF - VENTANAL_MARGEN_SUP;

const formaParedFondo = new THREE.Shape();
formaParedFondo.moveTo(-ANCHO / 2, 0);
formaParedFondo.lineTo(ANCHO / 2, 0);
formaParedFondo.lineTo(ANCHO / 2, ALTO);
formaParedFondo.lineTo(-ANCHO / 2, ALTO);
formaParedFondo.lineTo(-ANCHO / 2, 0);

const vX1 = -VENTANAL_ANCHO / 2;
const vX2 = VENTANAL_ANCHO / 2;
const vY1 = VENTANAL_MARGEN_INF;
const vY2 = ALTO - VENTANAL_MARGEN_SUP;

const huecoVentanal = new THREE.Path();
huecoVentanal.moveTo(vX1, vY1);
huecoVentanal.lineTo(vX1, vY2);
huecoVentanal.lineTo(vX2, vY2);
huecoVentanal.lineTo(vX2, vY1);
huecoVentanal.lineTo(vX1, vY1);
formaParedFondo.holes.push(huecoVentanal);

const paredFondo = new THREE.Mesh(
  new THREE.ShapeGeometry(formaParedFondo),
  materialPared
);
paredFondo.position.set(0, 0, -ANCHO / 2);
scene.add(paredFondo);

const paredFrente = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredFrente.position.set(0, ALTO / 2, ANCHO / 2);
paredFrente.rotation.y = Math.PI;
scene.add(paredFrente);

const paredIzquierda = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredIzquierda.position.set(-ANCHO / 2, ALTO / 2, 0);
paredIzquierda.rotation.y = Math.PI / 2;
scene.add(paredIzquierda);

const paredDerecha = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredDerecha.position.set(ANCHO / 2, ALTO / 2, 0);
paredDerecha.rotation.y = -Math.PI / 2;
scene.add(paredDerecha);

// ── Ventanal industrial (marco metálico + grilla + vidrio) ─────────

const zPared = -ANCHO / 2;
const materialMarco = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  metalness: 0.85,
  roughness: 0.25,
});
const grosorFrame = 0.05;

function addFrame(w, h, d, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materialMarco);
  m.position.set(x, y, z);
  scene.add(m);
}

addFrame(VENTANAL_ANCHO + grosorFrame * 2, grosorFrame, 0.06, 0, vY2 + grosorFrame / 2, zPared + 0.03);
addFrame(VENTANAL_ANCHO + grosorFrame * 2, grosorFrame, 0.06, 0, vY1 - grosorFrame / 2, zPared + 0.03);
addFrame(grosorFrame, VENTANAL_ALTO + grosorFrame * 2, 0.06, vX1 - grosorFrame / 2, vY1 + VENTANAL_ALTO / 2, zPared + 0.03);
addFrame(grosorFrame, VENTANAL_ALTO + grosorFrame * 2, 0.06, vX2 + grosorFrame / 2, vY1 + VENTANAL_ALTO / 2, zPared + 0.03);

const COLS = 5;
const FILAS = 3;

for (let i = 1; i < COLS; i++) {
  const x = vX1 + (VENTANAL_ANCHO / COLS) * i;
  addFrame(grosorFrame * 0.6, VENTANAL_ALTO, 0.04, x, vY1 + VENTANAL_ALTO / 2, zPared + 0.03);
}

for (let i = 1; i < FILAS; i++) {
  const y = vY1 + (VENTANAL_ALTO / FILAS) * i;
  addFrame(VENTANAL_ANCHO, grosorFrame * 0.6, 0.04, 0, y, zPared + 0.03);
}

const vidrio = new THREE.Mesh(
  new THREE.PlaneGeometry(VENTANAL_ANCHO, VENTANAL_ALTO),
  new THREE.MeshStandardMaterial({
    color: 0xbfd9e8,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  })
);
vidrio.position.set(0, vY1 + VENTANAL_ALTO / 2, zPared + 0.01);
scene.add(vidrio);

const windowsill = new THREE.Mesh(
  new THREE.BoxGeometry(VENTANAL_ANCHO + 0.1, 0.04, 0.18),
  materialMarco
);
windowsill.position.set(0, vY1, zPared + 0.09);
scene.add(windowsill);

// ── Paisaje urbano (detrás de la ventana) ──────────────────────────

const paisaje = new THREE.Mesh(
  new THREE.PlaneGeometry(ANCHO * 4, ALTO * 4),
  new THREE.MeshBasicMaterial({ map: crearTexturaCiudad() })
);
paisaje.position.set(0, ALTO * 0.6, zPared - 6);
scene.add(paisaje);

// ── Zócalo (baseboard) ─────────────────────────────────────────────

const materialZocalo = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
const zocH = 0.1;

const zocFrente = new THREE.Mesh(new THREE.BoxGeometry(ANCHO, zocH, 0.03), materialZocalo);
zocFrente.position.set(0, zocH / 2, ANCHO / 2 - 0.015);
scene.add(zocFrente);

const zocIzq = new THREE.Mesh(new THREE.BoxGeometry(0.03, zocH, ANCHO), materialZocalo);
zocIzq.position.set(-ANCHO / 2 + 0.015, zocH / 2, 0);
scene.add(zocIzq);

const zocDer = new THREE.Mesh(new THREE.BoxGeometry(0.03, zocH, ANCHO), materialZocalo);
zocDer.position.set(ANCHO / 2 - 0.015, zocH / 2, 0);
scene.add(zocDer);

// ── Iluminación ────────────────────────────────────────────────────

const luzSol = new THREE.DirectionalLight(0xfff5e6, 2.8);
luzSol.position.set(2, ALTO + 3, -ANCHO - 2);
luzSol.target.position.set(0, 0, 0);
luzSol.castShadow = true;
luzSol.shadow.mapSize.width = 1024;
luzSol.shadow.mapSize.height = 1024;
luzSol.shadow.camera.near = 0.1;
luzSol.shadow.camera.far = 30;
luzSol.shadow.camera.left = -8;
luzSol.shadow.camera.right = 8;
luzSol.shadow.camera.top = 8;
luzSol.shadow.camera.bottom = -2;
scene.add(luzSol);
scene.add(luzSol.target);

scene.add(new THREE.AmbientLight(0xc8d8e8, 0.5));
scene.add(new THREE.HemisphereLight(0x87ceeb, 0xb88860, 0.3));

// ── Mesita con tocadiscos ──────────────────────────────────────────

const mesita = new THREE.Group();
const pataGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06);
const materialMadera = new THREE.MeshStandardMaterial({ color: 0x6b4423 });

[[-0.26, -0.21], [0.26, -0.21], [-0.26, 0.21], [0.26, 0.21]].forEach(([x, z]) => {
  const pata = new THREE.Mesh(pataGeo, materialMadera);
  pata.position.set(x, 0.25, z);
  mesita.add(pata);
});

const tapa = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.5), materialMadera);
tapa.position.set(0, 0.52, 0);
mesita.add(tapa);

const baseTocadiscos = new THREE.Mesh(
  new THREE.BoxGeometry(0.45, 0.05, 0.45),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
baseTocadiscos.position.set(0, 0.565, 0);
mesita.add(baseTocadiscos);

const disco = new THREE.Mesh(
  new THREE.CylinderGeometry(0.18, 0.18, 0.015, 32),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);
disco.position.set(0, 0.598, 0);
mesita.add(disco);

const brazo = new THREE.Mesh(
  new THREE.BoxGeometry(0.03, 0.03, 0.22),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
brazo.position.set(0.19, 0.62, -0.15);
brazo.rotation.y = 0.4;
mesita.add(brazo);

mesita.position.set(3.5, 0, -4.3);
scene.add(mesita);

const posTocadiscos = new THREE.Vector3(3.5, 1, -4.3);

// ── Repisa con vinilos ─────────────────────────────────────────────

const repisa = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 0.25), materialMadera);
repisa.position.set(3.5, 1.4, -4.85);
scene.add(repisa);

const coloresVinilos = [0x3d5a6c, 0xc97b4a, 0x6b8e5a, 0xd9a05b, 0x8a4f5e];
coloresVinilos.forEach((color, i) => {
  const vinilo = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.28, 0.28),
    new THREE.MeshStandardMaterial({ color })
  );
  vinilo.position.set(3.5 + (i - 2) * 0.19, 1.56, -4.85);
  scene.add(vinilo);
});

// ── Cama estilo loft ───────────────────────────────────────────────

const cama = new THREE.Group();

const frameCama = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.22, 1.4),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
);
frameCama.position.set(0, 0.11, 0);
frameCama.castShadow = true;
cama.add(frameCama);

const colchon = new THREE.Mesh(
  new THREE.BoxGeometry(1.9, 0.18, 1.3),
  new THREE.MeshStandardMaterial({ color: 0xf0e8dc })
);
colchon.position.set(0, 0.31, 0);
cama.add(colchon);

const sabana = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 0.04, 1.35),
  new THREE.MeshStandardMaterial({ color: 0xd5cdc3 })
);
sabana.position.set(0.2, 0.38, 0);
cama.add(sabana);

const manta = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.06, 1.38),
  new THREE.MeshStandardMaterial({ color: 0x3a3a42 })
);
manta.position.set(0.15, 0.42, 0);
manta.castShadow = true;
cama.add(manta);

const almohada1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xe8ddd0 })
);
almohada1.position.set(-0.75, 0.42, -0.25);
cama.add(almohada1);

const almohada2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xe0d5c8 })
);
almohada2.position.set(-0.75, 0.42, 0.25);
cama.add(almohada2);

cama.position.set(-3.7, 0, -1);
scene.add(cama);

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
const MARGEN_PARED = 0.5;
const LIMITE = ANCHO / 2 - MARGEN_PARED;

// ── Salto y gravedad ───────────────────────────────────────────────

const GRAVEDAD = -20;
const FUERZA_SALTO = 6;
let velocidadY = 0;

window.addEventListener("keydown", (e) => {
  if (e.code !== "Space" || !controls.isLocked) return;
  const enElSuelo = Math.abs(camera.position.y - ALTURA_OJOS) < 0.01;
  if (enElSuelo) velocidadY = FUERZA_SALTO;
});

// ── Colisión con muebles ───────────────────────────────────────────

const MARGEN_MUEBLE = 0.3;
const OBSTACULOS = [
  { minX: -4.8 - MARGEN_MUEBLE, maxX: -2.7 + MARGEN_MUEBLE, minZ: -1.7 - MARGEN_MUEBLE, maxZ: -0.3 + MARGEN_MUEBLE },
  { minX: 3.2 - MARGEN_MUEBLE, maxX: 3.8 + MARGEN_MUEBLE, minZ: -4.55 - MARGEN_MUEBLE, maxZ: -4.05 + MARGEN_MUEBLE },
];

function estaDentroDeObstaculo(x, z) {
  return OBSTACULOS.some((o) => x >= o.minX && x <= o.maxX && z >= o.minZ && z <= o.maxZ);
}

// ── Interacción con el tocadiscos ──────────────────────────────────

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
    const respuesta = await fetch(`${API_URL}/proyectos`);
    if (!respuesta.ok) throw new Error(`Error del servidor: ${respuesta.status}`);
    const proyectos = await respuesta.json();

    panelContenido.innerHTML = proyectos
      .map((p) => `<li><strong>${p.titulo}</strong>: ${p.descripcion}</li>`)
      .join("");
  } catch (err) {
    console.error(err);
    panelContenido.innerHTML = "<p>No se pudo cargar la información.</p>";
  }
}

function cerrarPanel() {
  panelAbierto = false;
  panelInfo.setAttribute("hidden", "");
}

window.addEventListener("keydown", (e) => {
  if (e.code !== "KeyE" || !controls.isLocked) return;
  if (panelAbierto) { cerrarPanel(); return; }
  if (camera.position.distanceTo(posTocadiscos) <= DISTANCIA_INTERACCION) abrirPanel();
});

// ── Loop de animación ──────────────────────────────────────────────

const reloj = new THREE.Clock();

function animar() {
  requestAnimationFrame(animar);

  const delta = reloj.getDelta();
  const distanciaPaso = VELOCIDAD * delta;

  if (controls.isLocked) {
    velocidadY += GRAVEDAD * delta;
    camera.position.y += velocidadY * delta;

    let enElSuelo = false;
    if (camera.position.y <= ALTURA_OJOS) {
      camera.position.y = ALTURA_OJOS;
      velocidadY = 0;
      enElSuelo = true;
    }

    if (!panelAbierto) {
      const xPrevio = camera.position.x;
      const zPrevio = camera.position.z;

      if (teclas.adelante) controls.moveForward(distanciaPaso);
      if (teclas.atras) controls.moveForward(-distanciaPaso);
      if (teclas.derecha) controls.moveRight(distanciaPaso);
      if (teclas.izquierda) controls.moveRight(-distanciaPaso);

      camera.position.x = Math.max(-LIMITE, Math.min(LIMITE, camera.position.x));
      camera.position.z = Math.max(-LIMITE, Math.min(LIMITE, camera.position.z));

      if (enElSuelo && estaDentroDeObstaculo(camera.position.x, camera.position.z)) {
        camera.position.x = xPrevio;
        camera.position.z = zPrevio;
      }
    }

    const distTocadiscos = camera.position.distanceTo(posTocadiscos);
    if (!panelAbierto && distTocadiscos <= DISTANCIA_INTERACCION) {
      promptInteraccion.removeAttribute("hidden");
    } else {
      promptInteraccion.setAttribute("hidden", "");
    }
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
