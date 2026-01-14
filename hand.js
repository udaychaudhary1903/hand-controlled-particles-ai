import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

canvas.width = 220;
canvas.height = 160;

export let handX = 0;
export let handY = 0;
export let handZ = 0;
export let isPinching = false;

let smoothX = 0.5;
let smoothY = 0.5;
let smoothZ = 0;
const SMOOTHING = 0.15;

const connections = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];

function drawHand(hand){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);

  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 2;

  for (const [a,b] of connections){
    const p1 = hand[a];
    const p2 = hand[b];

    ctx.beginPath();
    ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
    ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
    ctx.stroke();
  }

  for (const p of hand){
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI*2);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
  }

  ctx.restore();
}


const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults((results) => {
  if (results.multiHandLandmarks.length > 0) {
    const hand = results.multiHandLandmarks[0];
    drawHand(hand);

    const indexTip = hand[8];
    const thumbTip = hand[4];

    const dx = indexTip.x - thumbTip.x;
    const dy = indexTip.y - thumbTip.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    isPinching = dist < 0.05;

    smoothX += (indexTip.x - smoothX) * SMOOTHING;
    smoothY += (indexTip.y - smoothY) * SMOOTHING;
    smoothZ += (indexTip.z - smoothZ) * SMOOTHING;

    handX = smoothX;
    handY = smoothY;
    handZ = smoothZ;
  } else {
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480,
});

camera.start();
