const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const newHighScoreElement = document.getElementById('newHighScore');

let gameState = 'start';
let score = 0;
let highScore = parseInt(localStorage.getItem('spaceshipFantasyHighScore') || '0');
let lives = 3;
let keys = {};
let bullets = [];
let enemies = [];
let particles = [];
let enemySpawnTimer = 0;
let stars = [];
let isNewHighScore = false;

class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.shootCooldown = 0;
    }

    update() {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (keys['ArrowUp'] && this.y > canvas.height / 2) {
            this.y -= this.speed;
        }
        if (keys['ArrowDown'] && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }

        if (keys[' '] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = 10;
        }
        
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    shoot() {
        bullets.push(new Bullet(this.x + this.width / 2, this.y));
        gameAudio.playShoot();
    }

    draw() {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#00ccff';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2 - 5, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2 - 3, this.y + this.height + 5);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2 + 3, this.y + this.height + 5);
        ctx.lineTo(this.x + this.width / 2 + 5, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = 8;
        this.active = true;
    }

    update() {
        this.y -= this.speed;
        if (this.y < -this.height) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - this.width / 2 + 1, this.y, this.width - 2, 4);
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2 + Math.random() * 2;
        this.active = true;
        this.type = Math.random() < 0.7 ? 'basic' : 'fast';
        if (this.type === 'fast') {
            this.speed *= 1.5;
            this.width = 25;
            this.height = 25;
        }
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.active = false;
        }
    }

    draw() {
        if (this.type === 'basic') {
            ctx.fillStyle = '#ff0066';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = '#ff9900';
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(45 * Math.PI / 180);
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.size = Math.random() * 3 + 1;
        this.life = 30;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size *= 0.96;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 30;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = this.size * 0.5;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5 + this.size * 0.25;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

let player;

function init() {
    player = new Player();
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    lives = 3;
    enemySpawnTimer = 0;
    isNewHighScore = false;
    
    if (stars.length === 0) {
        for (let i = 0; i < 100; i++) {
            stars.push(new Star());
        }
    }
    
    updateUI();
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - 30);
    enemies.push(new Enemy(x, -30));
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i] && enemies[j] &&
                bullets[i].x > enemies[j].x &&
                bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].y > enemies[j].y &&
                bullets[i].y < enemies[j].y + enemies[j].height) {
                
                for (let k = 0; k < 10; k++) {
                    particles.push(new Particle(
                        enemies[j].x + enemies[j].width / 2,
                        enemies[j].y + enemies[j].height / 2,
                        enemies[j].type === 'basic' ? '#ff0066' : '#ff9900'
                    ));
                }
                
                score += enemies[j].type === 'basic' ? 10 : 20;
                bullets[i].active = false;
                enemies[j].active = false;
                gameAudio.playExplosion();
                updateUI();
            }
        }
    }
    
    for (let enemy of enemies) {
        if (enemy.active &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            for (let k = 0; k < 20; k++) {
                particles.push(new Particle(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    '#00ff00'
                ));
            }
            
            enemy.active = false;
            lives--;
            gameAudio.playPlayerHit();
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    highScoreElement.textContent = highScore;
    
    if (score > highScore && !isNewHighScore) {
        isNewHighScore = true;
        highScore = score;
        localStorage.setItem('spaceshipFantasyHighScore', highScore.toString());
    }
}

function gameOver() {
    gameState = 'gameover';
    finalScoreElement.textContent = score;
    
    if (isNewHighScore) {
        newHighScoreElement.style.display = 'block';
        gameAudio.playHighScore();
        for (let i = 0; i < 30; i++) {
            particles.push(new Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                '#ffff00'
            ));
        }
    } else {
        newHighScoreElement.style.display = 'none';
    }
    
    gameOverScreen.style.display = 'block';
    gameAudio.stopMusic();
    gameAudio.playGameOver();
}

function startGame() {
    gameState = 'playing';
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    init();
    gameAudio.resume();
    gameAudio.startMusic();
}

function gameLoop() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let star of stars) {
        star.update();
        star.draw();
    }
    
    if (gameState === 'playing') {
        player.update();
        player.draw();
        
        enemySpawnTimer++;
        if (enemySpawnTimer > 60) {
            spawnEnemy();
            enemySpawnTimer = 0;
        }
        
        bullets = bullets.filter(bullet => {
            bullet.update();
            bullet.draw();
            return bullet.active;
        });
        
        enemies = enemies.filter(enemy => {
            enemy.update();
            enemy.draw();
            return enemy.active;
        });
        
        particles = particles.filter(particle => {
            particle.update();
            particle.draw();
            return particle.life > 0;
        });
        
        checkCollisions();
    }
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameState === 'gameover') {
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

gameLoop();