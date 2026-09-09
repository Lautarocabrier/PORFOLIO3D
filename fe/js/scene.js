import * as THREE from "three";

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

function animar() {
  requestAnimationFrame(animar);
  renderer.render(scene, camera);
}

animar();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
