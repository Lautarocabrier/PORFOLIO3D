import * as THREE from "three";
import { PointerLockControls } from "https://unpkg.com/three@0.186.0/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Altura de ojos humana aproximada (1.6m si 1 unidad = 1 metro, convención
// habitual en 3D). Declarada acá arriba porque también la usan el salto y
// la colisión más abajo.
const ALTURA_OJOS = 1.6;

// Posicionamos la cámara DENTRO de la habitación, a esa altura de ojos.
camera.position.set(0, ALTURA_OJOS, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Dimensiones de la habitación: 10 de ancho (x) x 10 de profundidad (z) x 3 de alto (y).
const ANCHO = 10;
const ALTO = 3;

// Genera una textura de mármol "a mano", dibujando en un <canvas> oculto
// (fondo claro + vetas curvas grises semi-transparentes) y usando ese
// canvas como textura. Evita depender de una imagen externa.
function crearTexturaMarmol() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f3ede3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.bezierCurveTo(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * canvas.width,
      Math.random() * canvas.height
    );
    ctx.strokeStyle = `rgba(150, 138, 125, ${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.stroke();
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = THREE.RepeatWrapping;
  textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(4, 4); // repite el patrón 4x4 veces sobre el piso de 10x10
  return textura;
}

const materialPiso = new THREE.MeshStandardMaterial({
  map: crearTexturaMarmol(),
  roughness: 0.35, // bajo = más brillante/pulido, como mármol real
  metalness: 0.05,
});
// Tono arena cálido para las paredes (en vez del gris frío que teníamos).
const materialPared = new THREE.MeshStandardMaterial({ color: 0xe3c9a0 });

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

// --- Techo a dos aguas (estilo cabaña) ---
// Un techo a dos aguas son dos "faldones" (paneles inclinados) que suben
// desde el borde de cada pared hasta encontrarse en una cumbrera central.
const ALTURA_TECHO = 2; // cuánto sube el techo desde el borde de la pared hasta el pico
const CORRIDA_TECHO = ANCHO / 2; // distancia horizontal desde la pared hasta el centro
// Teorema de Pitágoras: el largo real del faldón (la "hipotenusa" de la subida).
const LARGO_FALDON = Math.sqrt(CORRIDA_TECHO ** 2 + ALTURA_TECHO ** 2);
// Ángulo de inclinación respecto a la horizontal (atan2 da el ángulo de un triángulo
// a partir de sus catetos: opuesto=ALTURA_TECHO, adyacente=CORRIDA_TECHO).
const ANGULO_TECHO = Math.atan2(ALTURA_TECHO, CORRIDA_TECHO);

// DoubleSide: el panel se ve desde las dos caras. Con una sola rotación
// nueva (no probada visualmente todavía como las paredes) es más seguro
// que apostar a que la normal quedó mirando exactamente para el lado justo.
const materialTecho = new THREE.MeshStandardMaterial({ color: 0x5c3a21, side: THREE.DoubleSide });

// Técnica de "bisagra": un Group ubicado justo en el borde superior de la
// pared (donde el faldón debe arrancar), rotado en Z. Todo lo que cuelga
// del group rota junto con él, como una puerta sobre su gozne.
const bisagraDerecha = new THREE.Group();
bisagraDerecha.position.set(ANCHO / 2, ALTO, 0);
bisagraDerecha.rotation.z = -ANGULO_TECHO;
scene.add(bisagraDerecha);

const faldonDerecho = new THREE.Mesh(
  new THREE.PlaneGeometry(LARGO_FALDON, ANCHO),
  materialTecho
);
faldonDerecho.rotation.x = -Math.PI / 2; // lo acuesta, igual que hicimos con el piso
faldonDerecho.position.set(-LARGO_FALDON / 2, 0, 0); // lo corre para que arranque EN la bisagra
bisagraDerecha.add(faldonDerecho);

const bisagraIzquierda = new THREE.Group();
bisagraIzquierda.position.set(-ANCHO / 2, ALTO, 0);
bisagraIzquierda.rotation.z = ANGULO_TECHO; // espejado: ángulo opuesto
scene.add(bisagraIzquierda);

const faldonIzquierdo = new THREE.Mesh(
  new THREE.PlaneGeometry(LARGO_FALDON, ANCHO),
  materialTecho
);
faldonIzquierdo.rotation.x = -Math.PI / 2;
faldonIzquierdo.position.set(LARGO_FALDON / 2, 0, 0); // espejado: hacia el otro lado
bisagraIzquierda.add(faldonIzquierdo);

// Viga de cumbrera: una tabla larga en el pico, donde se juntan los dos faldones.
const cumbrera = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, ANCHO), materialTecho);
cumbrera.position.set(0, ALTO + ALTURA_TECHO, 0);
scene.add(cumbrera);

// Frontones: los triángulos que tapan el hueco arriba de la pared frontal y
// la del fondo (donde el techo, visto de frente, forma una "A").
const formaFronton = new THREE.Shape();
formaFronton.moveTo(-ANCHO / 2, 0);
formaFronton.lineTo(ANCHO / 2, 0);
formaFronton.lineTo(0, ALTURA_TECHO);
formaFronton.lineTo(-ANCHO / 2, 0);
const geometriaFronton = new THREE.ShapeGeometry(formaFronton);

const frontonFondo = new THREE.Mesh(geometriaFronton, materialPared);
frontonFondo.position.set(0, ALTO, -ANCHO / 2);
scene.add(frontonFondo);

const frontonFrente = new THREE.Mesh(geometriaFronton, materialPared);
frontonFrente.position.set(0, ALTO, ANCHO / 2);
frontonFrente.rotation.y = Math.PI;
scene.add(frontonFrente);

const luz = new THREE.DirectionalLight(0xffffff, 1.5);
luz.position.set(3, 5, 3);
scene.add(luz);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// --- Mesita con tocadiscos ---
// Grupo: varios meshes que se mueven/posicionan juntos como si fueran uno solo.
const mesita = new THREE.Group();

const pataGeometria = new THREE.BoxGeometry(0.06, 0.5, 0.06);
const materialMadera = new THREE.MeshStandardMaterial({ color: 0x6b4423 });

// Una pata en cada esquina de la mesa (0.6 de ancho x 0.5 de profundidad,
// agrandada para que el tocadiscos más grande entre bien).
[
  [-0.26, -0.21],
  [0.26, -0.21],
  [-0.26, 0.21],
  [0.26, 0.21],
].forEach(([x, z]) => {
  const pata = new THREE.Mesh(pataGeometria, materialMadera);
  pata.position.set(x, 0.25, z);
  mesita.add(pata);
});

const tapa = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.5), materialMadera);
tapa.position.set(0, 0.52, 0);
mesita.add(tapa);

// El tocadiscos (más grande que antes): base + disco (gira solo) + brazo.
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

// Posición de la mesita: pegada a la pared del fondo, del lado derecho.
mesita.position.set(3.5, 0, -4.3);
scene.add(mesita);

// Punto de referencia para medir distancia del jugador (a la altura del disco).
const posTocadiscos = new THREE.Vector3(3.5, 1, -4.3);

// --- Repisa con vinilos, en la pared, sobre el tocadiscos ---
const repisa = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.04, 0.25),
  materialMadera
);
repisa.position.set(3.5, 1.4, -4.85);
scene.add(repisa);

// Cada vinilo es una caja fina "parada" (como un disco guardado en su funda),
// con colores distintos para que se note que son portadas distintas.
const coloresVinilos = [0x3d5a6c, 0xc97b4a, 0x6b8e5a, 0xd9a05b, 0x8a4f5e];

coloresVinilos.forEach((color, i) => {
  const vinilo = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.28, 0.28),
    new THREE.MeshStandardMaterial({ color })
  );
  // i - 2 centra la fila (con 5 vinilos, quedan en -2,-1,0,1,2 de separación).
  vinilo.position.set(3.5 + (i - 2) * 0.19, 1.56, -4.85);
  scene.add(vinilo);
});

// --- Cama, contra la pared izquierda ---
// Convención de esta sección: el eje X del grupo es el "largo" de la cama
// (el lado negativo de X queda pegado a la pared, ahí va la almohada).
const cama = new THREE.Group();

const frame = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.3, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x8b5e34 })
);
frame.position.set(0, 0.15, 0);
cama.add(frame);

const colchon = new THREE.Mesh(
  new THREE.BoxGeometry(1.9, 0.2, 1.1),
  new THREE.MeshStandardMaterial({ color: 0xf2e9dc })
);
colchon.position.set(0, 0.4, 0);
cama.add(colchon);

const almohada = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.12, 0.9),
  new THREE.MeshStandardMaterial({ color: 0xfaf6ef })
);
almohada.position.set(-0.75, 0.48, 0);
cama.add(almohada);

const manta = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 0.06, 1.15),
  new THREE.MeshStandardMaterial({ color: 0xc97b4a })
);
manta.position.set(0.3, 0.43, 0);
cama.add(manta);

// Headboard (respaldo) contra la pared, para que se note que la cama "apoya" ahí.
const respaldo = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 0.9, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x8b5e34 })
);
respaldo.position.set(-1.04, 0.45, 0);
cama.add(respaldo);

cama.position.set(-3.7, 0, -1);
scene.add(cama);

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

// --- Salto y gravedad ---
const GRAVEDAD = -20; // un poco más fuerte que la real, para que el salto se sienta ágil
const FUERZA_SALTO = 6; // velocidad vertical inicial al saltar
let velocidadY = 0;

window.addEventListener("keydown", (e) => {
  if (e.code !== "Space" || !controls.isLocked) return;

  // Solo se puede saltar estando en el piso (evita "doble salto" en el aire).
  const enElSuelo = Math.abs(camera.position.y - ALTURA_OJOS) < 0.01;
  if (enElSuelo) velocidadY = FUERZA_SALTO;
});

// --- Colisión simple contra los muebles ---
// Cajas rectangulares (en X y Z) que marcan dónde "hay algo sólido".
// Tienen un margen extra (0.3) para que no haga falta tocar el mueble
// exactamente para que te frene, simulando que el jugador ocupa un lugar.
const MARGEN_MUEBLE = 0.3;
const OBSTACULOS = [
  // Cama
  { minX: -4.8 - MARGEN_MUEBLE, maxX: -2.7 + MARGEN_MUEBLE, minZ: -1.6 - MARGEN_MUEBLE, maxZ: -0.4 + MARGEN_MUEBLE },
  // Mesita con tocadiscos
  { minX: 3.2 - MARGEN_MUEBLE, maxX: 3.8 + MARGEN_MUEBLE, minZ: -4.55 - MARGEN_MUEBLE, maxZ: -4.05 + MARGEN_MUEBLE },
];

function estaDentroDeObstaculo(x, z) {
  return OBSTACULOS.some((o) => x >= o.minX && x <= o.maxX && z >= o.minZ && z <= o.maxZ);
}

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
    // Gravedad: la velocidad vertical se reduce cada frame (integración simple:
    // velocidad += aceleración × tiempo), y esa velocidad mueve la posición.
    velocidadY += GRAVEDAD * delta;
    camera.position.y += velocidadY * delta;

    let enElSuelo = false;
    if (camera.position.y <= ALTURA_OJOS) {
      camera.position.y = ALTURA_OJOS;
      velocidadY = 0;
      enElSuelo = true;
    }

    // Mientras el panel está abierto, pausamos el caminar (WASD) para poder
    // leer tranquilo; mirar alrededor con el mouse se sigue pudiendo.
    if (!panelAbierto) {
      const xPrevio = camera.position.x;
      const zPrevio = camera.position.z;

      if (teclas.adelante) controls.moveForward(distanciaPaso);
      if (teclas.atras) controls.moveForward(-distanciaPaso);
      if (teclas.derecha) controls.moveRight(distanciaPaso);
      if (teclas.izquierda) controls.moveRight(-distanciaPaso);

      // Clamp manual: evita que la cámara atraviese las paredes. No es física
      // real, solo un límite simple en cada eje.
      camera.position.x = Math.max(-LIMITE, Math.min(LIMITE, camera.position.x));
      camera.position.z = Math.max(-LIMITE, Math.min(LIMITE, camera.position.z));

      // Los muebles solo frenan si estás pisando el piso: si saltaste y en
      // este instante estás en el aire, se los puede "pasar por arriba".
      if (enElSuelo && estaDentroDeObstaculo(camera.position.x, camera.position.z)) {
        camera.position.x = xPrevio;
        camera.position.z = zPrevio;
      }
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
