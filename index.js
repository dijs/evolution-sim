const size = 600;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const maxSpeed = 5;
const maxSize = 64;
const maxSense = 64;
const foodSize = 16;
const dayLength = 5000;
const foodDistance = 400;

let day = 1;

function randomBorder(speed) {
  const r = Math.floor(Math.random() * 4);
  const x = Math.random() * size;
  const y = Math.random() * size;
  switch (r) {
    case 0:
      return { x, y: 0, vx: 0, vy: speed };
    case 1:
      return { x, y: size, vx: 0, vy: -speed };
    case 2:
      return { x: 0, y, vx: speed, vy: 0 };
    case 3:
      return { x: size, y, vx: -speed, vy: 0 };
  }
}

function randNear(x, k) {
  return x + (Math.random() * k - k / 2);
}

function createBlob() {
  const speed = randNear(4, 2);
  return {
    ...randomBorder(speed),
    turn: Date.now(),
    size: randNear(16, 8),
    speed,
    sense: randNear(32, 24),
    ate: 0,
    dead: false
  };
}

function mutate(blob) {
  blob.speed += randNear(0, 3);
  blob.sense += randNear(0, 3);
  blob.size += randNear(0, 3);
}

function handleEndOfDay(blob) {
  const populate = blob.ate > 1;
  Object.assign(blob, randomBorder(blob.speed), {
    turn: Date.now(),
    ate: 0,
    dead: blob.ate < 1
  });
  if (populate) {
    const offspring = { ...blob };
    mutate(offspring);
    blobs.push(offspring);
  }
}

function createFood() {
  return {
    x: randNear(size / 2, foodDistance),
    y: randNear(size / 2, foodDistance),
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
  createFood(),
  createFood(),
  createFood(),
  createFood()
];

function distance(circle, pt) {
  return Math.hypot(circle.x - pt.x, circle.y - pt.y);
}

function circle(x, y, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function renderBlob({ x, y, speed, size, sense, dead, ate }) {
  if (dead) return;
  const r = (speed / maxSpeed) * 128;
  const g = (size / maxSize) * 128;
  const b = (sense / maxSense) * 128;
  const k = 6;
  circle(x, y, size + sense, `rgb(${r * k}, ${g * k}, ${b * k})`);
  circle(x, y, size, `rgb(${r}, ${g}, ${b})`);
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText('' + ate, x, y);
}

function renderFood({ x, y, eaten }) {
  if (eaten) return;
  circle(x, y, foodSize, '#3eccf7');
}

function render() {
  ctx.fillStyle = '#ddd';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#333';
  ctx.font = '14px monospace';
  ctx.fillText('Day ' + day, 5, 15);
  foods.forEach(renderFood);
  blobs.forEach(renderBlob);
}

const randomDirection = () => {
  const r = Math.random();
  return r < 0.33 ? -1 : r < 0.66 ? 0 : 1;
};

function updateBlob(blob) {
  if (blob.dead) return;
  blob.x = Math.max(0, Math.min(size, blob.x + blob.vx));
  blob.y = Math.max(0, Math.min(size, blob.y + blob.vy));
  if (Date.now() - blob.turn > 1000) {
    blob.vx = randomDirection() * blob.speed;
    blob.vy = randomDirection() * blob.speed;
    blob.turn = Date.now();
  }
  const foodSensed = foods.find(
    food =>
      !food.eaten && distance(blob, food) < blob.size + blob.sense + foodSize
  );
  if (foodSensed) {
    const dx = foodSensed.x - blob.x;
    const dy = foodSensed.y - blob.y;
    blob.vx = (dx / Math.abs(dx)) * blob.speed;
    blob.vy = (dy / Math.abs(dy)) * blob.speed;
  }
  const foodFound = foods.find(
    food => !food.eaten && distance(blob, food) < blob.size
  );
  if (foodFound) {
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

function endOfDay() {
  day++;
  for (let i = 0; i < foods.length; i++) {
    foods[i] = createFood();
  }
  blobs.forEach(handleEndOfDay);
  if (blobs.filter(({ dead }) => !dead).length) {
    setTimeout(endOfDay, dayLength);
  } else {
    console.log('Sim Over');
  }
}

setTimeout(endOfDay, dayLength);
