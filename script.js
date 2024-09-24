const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const SNAKE_SIZE = 20;
const SPEED = 100;
const OBSTACLE_UPDATE_INTERVAL = 5000;

let canvas;
let ctx;
let snake;
let direction;
let score;
let food;
let obstacle;
let isGameRunning = false;
let gameInterval;
let obstacleInterval;
let gameOverMessage = document.getElementById('game-over-message');

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  snake = [{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }]; 
  direction = 'right';
  score = 0;
  food = generateFood();
  obstacle = generateObstacle();
  draw();

  if (gameInterval) {
    clearInterval(gameInterval);
  }
  gameInterval = setInterval(update, SPEED);

  if (obstacleInterval) {
    clearInterval(obstacleInterval);
  }
  obstacleInterval = setInterval(moveObstacle, OBSTACLE_UPDATE_INTERVAL);

  updateScoreDisplay();
  gameOverMessage.style.display = 'none'; 
}

function generateFood() {
  let x = Math.floor(Math.random() * (CANVAS_WIDTH / SNAKE_SIZE)) * SNAKE_SIZE;
  let y = Math.floor(Math.random() * (CANVAS_HEIGHT / SNAKE_SIZE)) * SNAKE_SIZE;
  return { x, y };
}

function generateObstacle() {
  let x = Math.floor(Math.random() * (CANVAS_WIDTH / SNAKE_SIZE)) * SNAKE_SIZE;
  let y = Math.floor(Math.random() * (CANVAS_HEIGHT / SNAKE_SIZE)) * SNAKE_SIZE;
  return { x, y };
}

function moveObstacle() {
  obstacle = generateObstacle();
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Dessiner le serpent 
  ctx.lineCap = 'round'; 
  ctx.lineWidth = SNAKE_SIZE; 
  ctx.strokeStyle = '#FFFFFF'; 
  ctx.beginPath();
  ctx.moveTo(snake[0].x + SNAKE_SIZE / 2, snake[0].y + SNAKE_SIZE / 2); 

  for (let i = 1; i < snake.length; i++) {
    ctx.lineTo(snake[i].x + SNAKE_SIZE / 2, snake[i].y + SNAKE_SIZE / 2);
  }
  ctx.stroke();

  // Tête du serpent
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(snake[0].x + SNAKE_SIZE / 2, snake[0].y + SNAKE_SIZE / 2, SNAKE_SIZE / 2, 0, 2 * Math.PI);
  ctx.fill();

  // Dessiner la nourriture
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(food.x, food.y, SNAKE_SIZE, SNAKE_SIZE);

  // Dessiner l'obstacle
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(obstacle.x, obstacle.y, SNAKE_SIZE, SNAKE_SIZE);
}

function update() {
  if (!isGameRunning) return;

  let head = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case 'right':
      head.x += SNAKE_SIZE;
      break;
    case 'left':
      head.x -= SNAKE_SIZE;
      break;
    case 'up':
      head.y -= SNAKE_SIZE;
      break;
    case 'down':
      head.y += SNAKE_SIZE;
      break;
  }

  if (
    head.x < 0 ||
    head.x >= CANVAS_WIDTH ||
    head.y < 0 ||
    head.y >= CANVAS_HEIGHT ||
    snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)
  ) {
    isGameRunning = false;
    gameOverMessage.style.display = 'flex'; 
    gameOverMessage.innerHTML = `Game Over!<br>Votre score final est ${score}`; 
    return;
  }

  if (head.x === obstacle.x && head.y === obstacle.y) {
    snake.splice(snake.length / 2);
    obstacle = generateObstacle();
    score = Math.floor(score / 2);
    updateScoreDisplay();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScoreDisplay();
    food = generateFood();
  } else {
    snake.pop();
  }

  draw();
}

function updateScoreDisplay() {
  document.getElementById('score').textContent = `Score: ${score}`;
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowRight':
      if (direction !== 'left') direction = 'right';
      break;
    case 'ArrowLeft':
      if (direction !== 'right') direction = 'left';
      break;
    case 'ArrowUp':
      if (direction !== 'down') direction = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') direction = 'down';
      break;
  }
});

document.getElementById('start-btn').addEventListener('click', () => {
  isGameRunning = true;
  init();
});