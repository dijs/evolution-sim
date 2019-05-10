const size = 600;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const maxSpeed = 5;
const maxSize = 64;
const maxSense = 64;
const foodSize = 16;

function createBlob() {
  return {
    x: Math.random() * size,
    y: Math.random() * size,
    vx: 0,
    vy: 0,
    turn: 0,
    size: 16,
    speed: 2,
    sense: 32,
    ate: 0
  };
}

function createFood() {
  return {
    x: Math.random() * size,
    y: Math.random() * size,
    eaten: false
  };
}

const blobs = [createBlob(), createBlob(), createBlob()];

const foods = [
  createFood(),
  createFood(),
  createFood(),
  createFood(),
  createFood(),
  createFood()
];

function contains(circle, pt) {
  return Math.hypot(circle.x - pt.x, circle.y - pt.y) < circle.size;
}

function circle(x, y, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function renderBlob({ x, y, speed, size, sense }) {
  const r = (speed / maxSpeed) * 128;
  const g = (size / maxSize) * 128;
  const b = (sense / maxSense) * 128;
  const k = 6;
  circle(x, y, size + sense, `rgb(${r * k}, ${g * k}, ${b * k})`);
  circle(x, y, size, `rgb(${r}, ${g}, ${b})`);
}

function renderFood({ x, y, eaten }) {
  if (eaten) return;
  circle(x, y, foodSize, '#3eccf7');
}

function render() {
  ctx.fillStyle = '#ddd';
  ctx.fillRect(0, 0, size, size);
  foods.forEach(renderFood);
  blobs.forEach(renderBlob);
}

const randomDirection = () => {
  const r = Math.random();
  return r < 0.33 ? -1 : r < 0.66 ? 0 : 1;
};

function updateBlob(blob) {
  blob.x = Math.max(0, Math.min(size, blob.x + blob.vx));
  blob.y = Math.max(0, Math.min(size, blob.y + blob.vy));
  if (Date.now() - blob.turn > 1000) {
    blob.vx = randomDirection() * blob.speed;
    blob.vy = randomDirection() * blob.speed;
    blob.turn = Date.now();
  }
  const foodFound = foods.find(food => contains(blob, food));
  if (foodFound && !foodFound.eaten) {
    foodFound.eaten = true;
    blob.ate++;
  }
}

function update() {
  blobs.forEach(updateBlob);
}

setInterval(() => {
  update();
  render();
}, 1000 / 30);
