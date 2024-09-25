const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const levelSelect = document.getElementById('level-select');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

// Variable pour stocker les meilleurs scores
let highScores = {
    easy: 0,
    medium: 0,
    hard: 0
};

let score = 0;
let gameInterval;
let enemyIntervals = [];
let snake = [{ x: 120, y: 120 }, { x: 90, y: 120 }, { x: 60, y: 120 }];
let direction = 'right';
let enemies = [];
let food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
let lastEnemyPositions = [];

const gameSettings = {
    easy: { enemySpeed: 7000 },
    medium: { enemySpeed: 5000, enemyCount: 2 },
    hard: { enemySpeed: 3000, enemyCount: 3 }
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
    enemyIntervals.forEach(interval => clearInterval(interval));
    enemyIntervals = [];

    currentLevel = gameSettings[levelSelect.value];

    snake = [{ x: 120, y: 120 }, { x: 90, y: 120 }, { x: 60, y: 120 }];
    direction = 'right';
    enemies = [];
    for (let i = 0; i < currentLevel.enemyCount; i++) {
        enemies.push(getNewEnemyPosition());
    }
    food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
    lastEnemyPositions = enemies.map(enemy => ({ x: enemy.x, y: enemy.y }));

    gameInterval = setInterval(gameLoop, 100);
    enemyIntervals = enemies.map(enemy => setInterval(() => moveEnemy(enemy), currentLevel.enemySpeed));
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
        snake.push({ ...snake[snake.length - 1] });
        food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
    }

    // Check collision with enemies
    for (let i = 0; i < enemies.length; i++) {
        if (snake[0].x === enemies[i].x && snake[0].y === enemies[i].y) {
            if (snake.length > 3) {
                snake.splice(Math.floor(snake.length / 2));
                score = Math.floor(score / 2);
                scoreDisplay.textContent = `Score: ${score}`;
            } else {
                gameOver();
                return;
            }
            enemies[i] = getNewEnemyPosition();
            lastEnemyPositions[i] = { x: enemies[i].x, y: enemies[i].y };
        }
    }

    // Draw the snake
    ctx.fillStyle = 'green';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, 30, 30));

    // Draw the food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 30, 30);

    // Draw the enemies
    ctx.fillStyle = 'black';
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, 30, 30));
}

function moveEnemy(enemy) {
    enemy = getNewEnemyPosition(enemy);
}

function getNewEnemyPosition(enemy = null) {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * 13) * 30;
        newY = Math.floor(Math.random() * 13) * 30;
    } while (isTooClose(enemy?.x, enemy?.y, newX, newY));

    if (enemy) {
        enemy.x = newX;
        enemy.y = newY;
        return enemy;
    } else {
        return { x: newX, y: newY };
    }
}

function isTooClose(x1, y1, x2, y2) {
    const distanceX = Math.abs(x1 - x2);
    const distanceY = Math.abs(y1 - y2);

    // Vérifier si la nouvelle position est à moins de 6 blocs de la position précédente
    return distanceX < 180 && distanceY < 180;
}

function gameOver() {
    clearInterval(gameInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));
    gameOverMessage.style.display = 'flex';
    gameOverMessage.innerHTML = `Game Over!<br>Votre score final est ${score}`;

    // Mettre à jour le meilleur score si nécessaire
    if (score > highScores[levelSelect.value]) {
        highScores[levelSelect.value] = score;
        updateHighScores();
    }
}

function updateHighScores() {
    const highScoresElement = document.getElementById('high-scores');
    highScoresElement.innerHTML = `
        <h3>Meilleurs scores :</h3>
        <ul>
            <li>Facile : ${highScores.easy}</li>
            <li>Moyen : ${highScores.medium}</li>
            <li>Difficile : ${highScores.hard}</li>
        </ul>
    `;
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
    enemyIntervals.forEach(interval => clearInterval(interval));
    enemyIntervals = [];
    startGame();
});

// Initialiser l'affichage des meilleurs scores
updateHighScores();