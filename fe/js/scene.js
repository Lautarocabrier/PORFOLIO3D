import * as THREE from "three";

// Toda escena de Three.js necesita estas 3 piezas mínimas:
// 1. Scene: el "contenedor" que agrupa todo lo que se va a dibujar.
// 2. Camera: desde dónde y con qué perspectiva se mira la escena.
// 3. Renderer: el motor que efectivamente dibuja la escena en un <canvas>.

const scene = new THREE.Scene();

// PerspectiveCamera(fov, aspect ratio, near, far):
// - fov: campo de visión en grados (cuánto "ve" la cámara, como un zoom)
// - aspect: ancho/alto de la pantalla, para no deformar la imagen
// - near/far: distancia mínima y máxima que la cámara renderiza
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Un objeto 3D = geometría (la forma) + material (cómo se ve: color, textura, luz).
const geometria = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x4f9dff });
const cubo = new THREE.Mesh(geometria, material);
scene.add(cubo);

// Sin luz, un MeshStandardMaterial se ve negro: necesita algo que lo ilumine.
const luz = new THREE.DirectionalLight(0xffffff, 2);
luz.position.set(3, 3, 3);
scene.add(luz);

// Luz ambiental: ilumina parejo todos los objetos desde todas direcciones,
// para que el lado oscuro del cubo no quede totalmente negro.
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// El "game loop": esta función se repite indefinidamente, una vez por frame
// (~60 veces por segundo), sincronizada con el refresco de pantalla.
function animar() {
  requestAnimationFrame(animar);

  cubo.rotation.x += 0.01;
  cubo.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animar();

// Si el usuario cambia el tamaño de la ventana (o rota el celular),
// hay que avisarle a la cámara y al renderer el nuevo tamaño,
// si no la imagen queda estirada o cortada.
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
