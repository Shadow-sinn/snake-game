const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const levelSelect = document.getElementById('level-select');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

let score = 0;
let gameInterval;
let enemyInterval;
let snake = [{ x: 120, y: 120 }, { x: 90, y: 120 }, { x: 60, y: 120 }];
let direction = 'right';
let enemy = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
let food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
let lastEnemyPosition = { x: enemy.x, y: enemy.y };

const gameSettings = {
    easy: { enemySpeed: 7000 },
    medium: { enemySpeed: 5000 },
    hard: { enemySpeed: 3000 }
};

let currentLevel = gameSettings[levelSelect.value];

// Set canvas dimensions
canvas.width = 390;
canvas.height = 390;

function startGame() {
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gameOverMessage.style.display = 'none';
    clearInterval(gameInterval);
    clearInterval(enemyInterval);

    currentLevel = gameSettings[levelSelect.value];

    snake = [{ x: 120, y: 120 }, { x: 90, y: 120 }, { x: 60, y: 120 }];
    direction = 'right';
    enemy = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
    food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
    lastEnemyPosition = { x: enemy.x, y: enemy.y };

    gameInterval = setInterval(gameLoop, 100);
    enemyInterval = setInterval(moveEnemy, currentLevel.enemySpeed);
}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move the snake
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = { ...snake[i - 1] };
    }

    // Update the head's position based on direction
    if (direction === 'right') {
        snake[0].x += 30;
    } else if (direction === 'left') {
        snake[0].x -= 30;
    } else if (direction === 'up') {
        snake[0].y -= 30;
    } else if (direction === 'down') {
        snake[0].y += 30;
    }

    // Check collision with wall or self
    if (snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height) {
        gameOver();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Check collision with food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        snake.push({...snake[snake.length - 1]});
        food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
    }

    // Check collision with enemy
    if (snake[0].x === enemy.x && snake[0].y === enemy.y) {
        if (snake.length > 3) {
            snake.splice(Math.floor(snake.length / 2));
            score = Math.floor(score / 2);
            scoreDisplay.textContent = `Score: ${score}`;
        } else {
            gameOver();
            return;
        }
        enemy = getNewEnemyPosition();
    }

    // Draw the snake
    ctx.fillStyle = 'green';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, 30, 30));

    // Draw the food
    ctx.fillStyle = 'blue';
    ctx.fillRect(food.x, food.y, 30, 30);

    // Draw the enemy
    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x, enemy.y, 30, 30);
}

function moveEnemy() {
    enemy = getNewEnemyPosition();
}

function getNewEnemyPosition() {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * 13) * 30;
        newY = Math.floor(Math.random() * 13) * 30;
    } while (isTooClose(lastEnemyPosition.x, lastEnemyPosition.y, newX, newY));

    lastEnemyPosition.x = newX;
    lastEnemyPosition.y = newY;

    return { x: newX, y: newY };
}

function isTooClose(x1, y1, x2, y2) {
    const distanceX = Math.abs(x1 - x2);
    const distanceY = Math.abs(y1 - y2);

    // Vérifier si la nouvelle position est à moins de 6 blocs de la position précédente
    return distanceX < 180 && distanceY < 180;
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(enemyInterval);
    gameOverMessage.style.display = 'flex';
    gameOverMessage.innerHTML = `Game Over!<br>Votre score final est ${score}`;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && direction !== 'down') {
        direction = 'up';
    } else if (e.key === 'ArrowDown' && direction !== 'up') {
        direction = 'down';
    } else if (e.key === 'ArrowLeft' && direction !== 'right') {
        direction = 'left';
    } else if (e.key === 'ArrowRight' && direction !== 'left') {
        direction = 'right';
    }
});

startBtn.addEventListener('click', startGame);
levelSelect.addEventListener('change', () => {
    currentLevel = gameSettings[levelSelect.value];
    clearInterval(enemyInterval);
    enemyInterval = setInterval(moveEnemy, currentLevel.enemySpeed);
});