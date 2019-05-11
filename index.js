const size = 600;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const maxSpeed = 8;
const maxSize = 32;
const maxSense = 64;
const foodSize = 16;
const dayLength = 7000;
const foodDistance = size - 100;

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
    size: randNear(16, 16),
    speed,
    sense: randNear(32, 24),
    energy: 0,
    ate: 0,
    dead: false
  };
}

function mutate(blob) {
  blob.speed += randNear(0, 2);
  blob.sense += randNear(0, 8);
  blob.size += randNear(0, 4);
}

function handleEndOfDay(blob) {
  if (blob.dead) return;
  const populate = blob.ate > 1;
  const dead = blob.ate < 1;
  Object.assign(blob, randomBorder(blob.speed), {
    ate: 0,
    energy: 0,
    dead
  });
  if (dead) {
    blob.died = Date.now();
  }
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

const blobs = Array(16)
  .fill(0)
  .map(createBlob);

const foods = Array(7)
  .fill(0)
  .map(createFood);

function distance(circle, pt) {
  return Math.hypot(circle.x - pt.x, circle.y - pt.y);
}

function circle(x, y, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function renderBlob({ x, y, speed, size, sense, dead, ate, energy }) {
  if (dead) return;
  const r = (speed / maxSpeed) * 128;
  const g = (size / maxSize) * 128;
  const b = (sense / maxSense) * 128;
  circle(x, y, size + sense, `rgba(${r}, ${g}, ${b}, 0.2)`);
  circle(x, y, size, `rgb(${r}, ${g}, ${b})`);
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  // ctx.fillText('' + energy, x, y);
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
  blob.energy += 4;
  if (blob.energy >= blob.speed) {
    blob.x = Math.max(0, Math.min(size, blob.x + blob.vx));
    blob.y = Math.max(0, Math.min(size, blob.y + blob.vy));
    blob.energy -= blob.speed;
  }
  blob.vx = Math.max(
    -blob.speed,
    Math.min(blob.speed, blob.vx + (Math.random() - 0.5))
  );
  blob.vy = Math.max(
    -blob.speed,
    Math.min(blob.speed, blob.vy + (Math.random() - 0.5))
  );
  // if touching a border, bounce away
  if (blob.y + blob.size + blob.sense >= size) {
    blob.vy -= blob.speed;
  }
  if (blob.y - blob.size - blob.sense < blob.size) {
    blob.vy += blob.speed;
  }
  if (blob.x + blob.size + blob.sense >= size) {
    blob.vx -= blob.speed;
  }
  if (blob.x - blob.size - blob.sense < blob.size) {
    blob.vx += blob.speed;
  }
  // move towards food when in sensing range
  const foodSensed = foods.find(
    food =>
      !food.eaten && distance(blob, food) < blob.size + blob.sense + foodSize
  );
  if (foodSensed) {
    const dx = foodSensed.x - blob.x;
    const dy = foodSensed.y - blob.y;
    const dist = Math.hypot(dx, dy);
    blob.vx = (dx / dist) * blob.speed;
    blob.vy = (dy / dist) * blob.speed;
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
    const sorted = blobs.sort((x, y) => x.died - y.died);
    console.log('Last surviving', sorted[sorted.length - 1]);
  }
}

setTimeout(endOfDay, dayLength);
