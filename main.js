import * as THREE from "three";
import { handX, handY, handZ, isPinching } from "./hand.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshNormalMaterial()
);
scene.add(cube);
camera.position.z = 3;

let lastX = 0.5;
let lastY = 0.5;
let velX = 0;
let velY = 0;

const ROTATION_STRENGTH = 8;
const DAMPING = 0.85;

function animate() {
  requestAnimationFrame(animate);

  // Position
  cube.position.x = -(handX - 0.5) * 6;
  cube.position.y = -(handY - 0.5) * 6;
  cube.position.z = -handZ * 10;

  if (isPinching) {
    velX += (handX - lastX) * ROTATION_STRENGTH;
    velY += (handY - lastY) * ROTATION_STRENGTH;
  }

  cube.rotation.y += velX;
  cube.rotation.x += velY;

  velX *= DAMPING;
  velY *= DAMPING;

  lastX = handX;
  lastY = handY;

  renderer.render(scene, camera);
}

animate();
