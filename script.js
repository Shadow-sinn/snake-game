const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const levelSelect = document.getElementById('level-select');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

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
let food = { x: 0, y: 0 };
let lastEnemyPositions = [];

const gameSettings = {
    easy: { enemySpeed: 7000, enemyCount: 1 },
    medium: { enemySpeed: 5000, enemyCount: 2 },
    hard: { enemySpeed: 3000, enemyCount: 3 }
};

let currentLevel = gameSettings[levelSelect.value];

canvas.width = 390;
canvas.height = 390;

// Couleurs pour le fond animé
let gradientColors = ["#FF69B4", "#33CC33", "#66CCCC", "#FFC080", "#FF69B4"];
let gradientIndex = 0;

function drawBackground() {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gradientColors.length; i++) {
        gradient.addColorStop(i / (gradientColors.length - 1), gradientColors[i]);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    gradientIndex++;
    if (gradientIndex >= gradientColors.length) {
        gradientIndex = 0;
    }
    gradientColors.push(gradientColors.shift());
}

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
    food = getNewFoodPosition();
    lastEnemyPositions = enemies.map(enemy => ({ x: enemy.x, y: enemy.y }));

    gameInterval = setInterval(gameLoop, 100);
    enemyIntervals = enemies.map(enemy => setInterval(() => moveEnemy(enemy), currentLevel.enemySpeed));
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = { ...snake[i - 1] };
    }

    if (direction === 'right') snake[0].x += 30;
    else if (direction === 'left') snake[0].x -= 30;
    else if (direction === 'up') snake[0].y -= 30;
    else if (direction === 'down') snake[0].y += 30;

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

    if (snake[0].x === food.x && snake[0].y === food.y) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        snake.push({ ...snake[snake.length - 1] });
        food = getNewFoodPosition();
    }

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

    // Dessin du serpent
    ctx.fillStyle = 'green';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, 30, 30));

    // Dessin de la nourriture
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 30, 30);

    // Dessin des ennemis
    ctx.fillStyle = 'black';
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, 30, 30));
}

// Fonction pour déplacer un ennemi
function moveEnemy(enemy) {
    enemy = getNewEnemyPosition(enemy);
}

// Fonction pour obtenir une nouvelle position pour un ennemi
function getNewEnemyPosition(enemy = null) {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * 13) * 30;
        newY = Math.floor(Math.random() * 13) * 30;
    } while (isPositionOnSnake(newX, newY) || isPositionTooCloseToSnake(newX, newY));

    if (enemy) {
        enemy.x = newX;
        enemy.y = newY;
        return enemy;
    } else {
        return { x: newX, y: newY };
    }
}

// Fonction pour obtenir une nouvelle position pour la nourriture
function getNewFoodPosition() {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * 13) * 30;
        newY = Math.floor(Math.random() * 13) * 30;
    } while (isPositionOnSnake(newX, newY) || isPositionTooCloseToSnake(newX, newY));
    return { x: newX, y: newY };
}

// Fonction pour vérifier si une position est sur le serpent
function isPositionOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Fonction pour vérifier si une position est trop proche du serpent
function isPositionTooCloseToSnake(x, y) {
    return snake.some(segment => {
        const distanceX = Math.abs(x - segment.x);
        const distanceY = Math.abs(y - segment.y);
        return distanceX < 60 && distanceY < 60;
    });
}

// Fonction pour gérer la fin du jeu
function gameOver() {
    clearInterval(gameInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));
    gameOverMessage.style.display = 'flex';
    gameOverMessage.innerHTML = `Perdu !<br>Votre score final est ${score}`;

    const currentLevel = levelSelect.value;
    if (score > highScores[currentLevel]) {
        highScores[currentLevel] = score;
        updateHighScores();
    }
}

// Fonction pour mettre à jour l'affichage des meilleurs scores
function updateHighScores() {
    const highScoreEasy = document.getElementById('high-score-easy');
    const highScoreMedium = document.getElementById('high-score-medium');
    const highScoreHard = document.getElementById('high-score-hard');

    highScoreEasy.textContent = `Facile: ${highScores.easy}`;
    highScoreMedium.textContent = `Moyen: ${highScores.medium}`;
    highScoreHard.textContent = `Difficile: ${highScores.hard}`;
}

// Gestion des événements clavier
document.addEventListener('keydown', (e) => {
    e.preventDefault(); // Empêche le comportement par défaut des touches fléchées
    if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
    else if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
    else if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
    else if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
});

// Gestion du clic sur le bouton de démarrage
startBtn.addEventListener('click', startGame);

// Gestion du changement de niveau de difficulté
levelSelect.addEventListener('change', () => {
    const selectedLevel = levelSelect.value;

    if (selectedLevel === 'bonus') {
        // Redirige vers la page bonus.html
        window.location.href = "/game/bonus.html";
    } else {
        // Démarre le jeu avec le niveau sélectionné
        currentLevel = gameSettings[selectedLevel];
        enemyIntervals.forEach(interval => clearInterval(interval));
        enemyIntervals = [];
        startGame();
    }
});

// Initialisation des meilleurs scores
updateHighScores();