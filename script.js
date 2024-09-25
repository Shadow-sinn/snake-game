// Récupère l'élément canvas et son contexte 2D
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Récupère les éléments HTML pour le bouton de démarrage, le sélecteur de niveau et l'affichage du score et du message de fin de partie
const startBtn = document.getElementById('start-btn');
const levelSelect = document.getElementById('level-select');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

// Initialise le score à 0
let score = 0;

// Stocke l'intervalle pour la boucle de jeu et les intervalles pour les ennemis
let gameInterval;
let enemyIntervals = [];

// Initialise le serpent avec sa position de départ
let snake = [{ x: 120, y: 120 }, { x: 90, y: 120 }, { x: 60, y: 120 }];

// Initialise la direction du serpent
let direction = 'right';

// Stocke les positions des ennemis
let enemies = [];

// Initialise la position de la nourriture
let food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };

// Stocke les dernières positions des ennemis
let lastEnemyPositions = [];

// Définit les paramètres de jeu en fonction du niveau de difficulté
const gameSettings = {
    easy: { enemySpeed: 7000 },
    medium: { enemySpeed: 5000, enemyCount: 2 },
    hard: { enemySpeed: 3000, enemyCount: 3 }
};

// Récupère le niveau de difficulté sélectionné
let currentLevel = gameSettings[levelSelect.value];

// Définit les dimensions du canvas
canvas.width = 390;
canvas.height = 390;

// Fonction pour démarrer une nouvelle partie
function startGame() {
    // Réinitialise le score
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;

    // Cache le message de fin de partie
    gameOverMessage.style.display = 'none';

    // Arrête la boucle de jeu et les intervalles des ennemis
    clearInterval(gameInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));
    enemyIntervals = [];

    // Récupère le niveau de difficulté sélectionné
    currentLevel = gameSettings[levelSelect.value];

    // Réinitialise le serpent, les ennemis et la nourriture
    snake = [{ x: 120, y: 120 }, { x: 90, y: 120 }, { x: 60, y: 120 }];
    direction = 'right';
    enemies = [];
    for (let i = 0; i < currentLevel.enemyCount; i++) {
        enemies.push(getNewEnemyPosition());
    }
    food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
    lastEnemyPositions = enemies.map(enemy => ({ x: enemy.x, y: enemy.y }));

    // Démarre la boucle de jeu et les intervalles des ennemis
    gameInterval = setInterval(gameLoop, 100);
    enemyIntervals = enemies.map(enemy => setInterval(() => moveEnemy(enemy), currentLevel.enemySpeed));
}

// Fonction pour la boucle de jeu
function gameLoop() {
    // Efface le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Déplace le serpent
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = { ...snake[i - 1] };
    }

    // Met à jour la position de la tête du serpent en fonction de la direction
    if (direction === 'right') {
        snake[0].x += 30;
    } else if (direction === 'left') {
        snake[0].x -= 30;
    } else if (direction === 'up') {
        snake[0].y -= 30;
    } else if (direction === 'down') {
        snake[0].y += 30;
    }

    // Vérifie la collision avec les bords du canvas ou avec le corps du serpent
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

    // Vérifie la collision avec la nourriture
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        snake.push({ ...snake[snake.length - 1] });
        food = { x: Math.floor(Math.random() * 13) * 30, y: Math.floor(Math.random() * 13) * 30 };
    }

    // Vérifie la collision avec les ennemis
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

    // Dessine le serpent
    ctx.fillStyle = 'green';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, 30, 30));

    // Dessine la nourriture
    ctx.fillStyle = 'blue';
    ctx.fillRect(food.x, food.y, 30, 30);

    // Dessine les ennemis
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, 30, 30));
}

// Fonction pour déplacer un ennemi
function moveEnemy(enemy) {
    enemy = getNewEnemyPosition(enemy);
}

// Fonction pour générer une nouvelle position pour un ennemi
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

// Fonction pour vérifier si la nouvelle position d'un ennemi est trop proche de sa position précédente
function isTooClose(x1, y1, x2, y2) {
    const distanceX = Math.abs(x1 - x2);
    const distanceY = Math.abs(y1 - y2);

    // Vérifie si la nouvelle position est à moins de 6 blocs de la position précédente
    return distanceX < 180 && distanceY < 180;
}

// Fonction pour gérer la fin de la partie
function gameOver() {
    // Arrête la boucle de jeu et les intervalles des ennemis
    clearInterval(gameInterval);
    enemyIntervals.forEach(interval => clearInterval(interval));

    // Affiche le message de fin de partie
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

// Gestion des événements clavier pour contrôler le serpent
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

// Gestion du clic sur le bouton de démarrage
startBtn.addEventListener('click', startGame);

// Gestion du changement de niveau de difficulté
levelSelect.addEventListener('change', () => {
    currentLevel = gameSettings[levelSelect.value];
    enemyIntervals.forEach(interval => clearInterval(interval));
    enemyIntervals = [];
    startGame();
});

// Initialiser l'affichage des meilleurs scores
updateHighScores();