import * as THREE from "three";
import { PointerLockControls } from "https://unpkg.com/three@0.186.0/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Posicionamos la cámara DENTRO de la habitación, a una altura de ojos
// humana aproximada (1.6m si 1 unidad = 1 metro, convención habitual en 3D).
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Dimensiones de la habitación: 10 de ancho (x) x 10 de profundidad (z) x 3 de alto (y).
const ANCHO = 10;
const ALTO = 3;

const materialPiso = new THREE.MeshStandardMaterial({ color: 0x8a8a8a });
const materialPared = new THREE.MeshStandardMaterial({ color: 0xcfcfcf });

// PlaneGeometry crea un plano (2D) que hay que rotar/posicionar en el
// espacio 3D para que cumpla el rol de piso o pared.
const piso = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ANCHO), materialPiso);
piso.rotation.x = -Math.PI / 2; // lo acuesta: de "parado" (mirando a cámara) a "horizontal"
scene.add(piso);

// Pared del fondo: sin rotar, su cara visible (normal) ya mira hacia +z,
// que es hacia adentro de la habitación (donde está la cámara).
const paredFondo = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredFondo.position.set(0, ALTO / 2, -ANCHO / 2);
scene.add(paredFondo);

// Pared frontal: hay que rotarla 180° para que su cara visible mire
// hacia -z (de nuevo, hacia adentro), ya que queda "detrás" de la cámara.
const paredFrente = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredFrente.position.set(0, ALTO / 2, ANCHO / 2);
paredFrente.rotation.y = Math.PI;
scene.add(paredFrente);

// Pared izquierda: rotada 90° para que su cara mire hacia +x (adentro).
const paredIzquierda = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredIzquierda.position.set(-ANCHO / 2, ALTO / 2, 0);
paredIzquierda.rotation.y = Math.PI / 2;
scene.add(paredIzquierda);

// Pared derecha: rotada -90° para que su cara mire hacia -x (adentro).
const paredDerecha = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), materialPared);
paredDerecha.position.set(ANCHO / 2, ALTO / 2, 0);
paredDerecha.rotation.y = -Math.PI / 2;
scene.add(paredDerecha);

const luz = new THREE.DirectionalLight(0xffffff, 1.5);
luz.position.set(3, 5, 3);
scene.add(luz);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// --- Mesita con tocadiscos ---
// Grupo: varios meshes que se mueven/posicionan juntos como si fueran uno solo.
const mesita = new THREE.Group();

const pataGeometria = new THREE.BoxGeometry(0.06, 0.5, 0.06);
const materialMadera = new THREE.MeshStandardMaterial({ color: 0x6b4423 });

// Una pata en cada esquina de la mesa (0.5 de ancho x 0.35 de profundidad).
[
  [-0.22, -0.15],
  [0.22, -0.15],
  [-0.22, 0.15],
  [0.22, 0.15],
].forEach(([x, z]) => {
  const pata = new THREE.Mesh(pataGeometria, materialMadera);
  pata.position.set(x, 0.25, z);
  mesita.add(pata);
});

const tapa = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.35), materialMadera);
tapa.position.set(0, 0.52, 0);
mesita.add(tapa);

// El tocadiscos: base + disco (gira solo, decorativo) + brazo.
const baseTocadiscos = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.04, 0.3),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
baseTocadiscos.position.set(0, 0.56, 0);
mesita.add(baseTocadiscos);

const disco = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.12, 0.01, 32),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);
disco.position.set(0, 0.585, 0);
mesita.add(disco);

const brazo = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.02, 0.15),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
brazo.position.set(0.13, 0.6, -0.1);
brazo.rotation.y = 0.4;
mesita.add(brazo);

// Posición de la mesita: pegada a la pared del fondo, del lado derecho.
mesita.position.set(3.5, 0, -4.3);
scene.add(mesita);

// Punto de referencia para medir distancia del jugador (a la altura del disco).
const posTocadiscos = new THREE.Vector3(3.5, 1, -4.3);

// PointerLockControls resuelve el "mouse look": bloquea el cursor en el centro
// de la pantalla y rota la cámara según el movimiento del mouse (estilo FPS).
// El WASD (moverse) lo programamos nosotros más abajo.
const controls = new PointerLockControls(camera, document.body);

const overlay = document.getElementById("overlay");

overlay.addEventListener("click", () => controls.lock());
// "lock"/"unlock" son eventos que dispara el navegador cuando el pointer lock
// se activa o se desactiva (ej: al apretar Escape, que el navegador captura siempre).
controls.addEventListener("lock", () => overlay.setAttribute("hidden", ""));
controls.addEventListener("unlock", () => overlay.removeAttribute("hidden"));

// Estado de qué teclas están apretadas AHORA MISMO. Se actualiza con los
// eventos de teclado, pero el movimiento real ocurre en el loop de animación.
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

const VELOCIDAD = 3; // unidades por segundo
const MARGEN_PARED = 0.5; // qué tan cerca de la pared se puede acercar la cámara
const LIMITE = ANCHO / 2 - MARGEN_PARED;

// --- Interacción con el tocadiscos ---
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

  if (panelAbierto) {
    cerrarPanel();
    return;
  }

  const distancia = camera.position.distanceTo(posTocadiscos);
  if (distancia <= DISTANCIA_INTERACCION) abrirPanel();
});

// Clock mide el tiempo real entre frames (delta). Sin esto, el movimiento
// dependería de qué tan rápido es el monitor/la compu (más fps = te moverías
// más rápido), en vez de tener una velocidad constante en el tiempo.
const reloj = new THREE.Clock();

function animar() {
  requestAnimationFrame(animar);

  const delta = reloj.getDelta();
  const distanciaPaso = VELOCIDAD * delta;

  if (controls.isLocked) {
    // Mientras el panel está abierto, pausamos el caminar (WASD) para poder
    // leer tranquilo; mirar alrededor con el mouse se sigue pudiendo.
    if (!panelAbierto) {
      if (teclas.adelante) controls.moveForward(distanciaPaso);
      if (teclas.atras) controls.moveForward(-distanciaPaso);
      if (teclas.derecha) controls.moveRight(distanciaPaso);
      if (teclas.izquierda) controls.moveRight(-distanciaPaso);

      // Clamp manual: evita que la cámara atraviese las paredes. No es física
      // real, solo un límite simple en cada eje.
      camera.position.x = Math.max(-LIMITE, Math.min(LIMITE, camera.position.x));
      camera.position.z = Math.max(-LIMITE, Math.min(LIMITE, camera.position.z));
    }

    const distanciaTocadiscos = camera.position.distanceTo(posTocadiscos);
    if (!panelAbierto && distanciaTocadiscos <= DISTANCIA_INTERACCION) {
      promptInteraccion.removeAttribute("hidden");
    } else {
      promptInteraccion.setAttribute("hidden", "");
    }
  }

  // El disco gira todo el tiempo, como detalle ambiente (no depende de la interacción).
  disco.rotation.y += delta * 2;

  renderer.render(scene, camera);
}

animar();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
