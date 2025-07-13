class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game state
        this.gameState = 'prep'; // 'prep', 'wave', 'gameOver'
        this.wave = 1;
        this.coreHP = 100;
        this.maxTowers = 5;
        this.towersPlaced = 0;
        
        // Game objects
        this.towers = [];
        this.enemies = [];
        this.grid = [];
        this.path = [];
        
        // Grid settings
        this.gridSize = 10;
        this.tileSize = this.width / this.gridSize;
        
        // Wave settings
        this.enemiesPerWave = 10;
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = 60; // frames between enemy spawns
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        
        // Animation
        this.animationId = null;
        this.lastTime = 0;
        this.tickRate = 60; // FPS
        
        // Input
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        
        this.initialize();
    }
    
    initialize() {
        this.generateGrid();
        this.generatePath();
        this.setupEventListeners();
        this.updateUI();
        this.startGameLoop();
    }
    
    generateGrid() {
        this.grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = {
                    x: col * this.tileSize + this.tileSize / 2,
                    y: row * this.tileSize + this.tileSize / 2,
                    isPath: false,
                    hasTower: false,
                    row: row,
                    col: col
                };
            }
        }
    }
    
    generatePath() {
        // Simple path: start from left, go right, then down, then right to end
        this.path = [];
        
        // Start at left side
        for (let row = 2; row < 8; row++) {
            this.path.push({ x: this.grid[0][row].x, y: this.grid[0][row].y });
            this.grid[0][row].isPath = true;
        }
        
        // Go right
        for (let col = 1; col < 4; col++) {
            this.path.push({ x: this.grid[2][col].x, y: this.grid[2][col].y });
            this.grid[2][col].isPath = true;
        }
        
        // Go down
        for (let row = 3; row < 7; row++) {
            this.path.push({ x: this.grid[row][3].x, y: this.grid[row][3].y });
            this.grid[row][3].isPath = true;
        }
        
        // Go right to end
        for (let col = 4; col < this.gridSize; col++) {
            this.path.push({ x: this.grid[6][col].x, y: this.grid[6][col].y });
            this.grid[6][col].isPath = true;
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            
            // Show range indicator for towers
            this.updateTowerRangeIndicators();
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.handleClick();
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        // UI event listeners
        document.getElementById('start-wave').addEventListener('click', () => {
            this.startWave();
        });
        
        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    handleClick() {
        if (this.gameState !== 'prep') return;
        
        const tile = this.getTileAtPosition(this.mouseX, this.mouseY);
        if (tile && !tile.isPath && !tile.hasTower && this.towersPlaced < this.maxTowers) {
            this.placeTower(tile);
        }
    }
    
    getTileAtPosition(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            return this.grid[row][col];
        }
        return null;
    }
    
    placeTower(tile) {
        const tower = new Tower(tile.x, tile.y);
        this.towers.push(tower);
        tile.hasTower = true;
        this.towersPlaced++;
        this.updateUI();
    }
    
    startWave() {
        if (this.gameState !== 'prep' || this.towersPlaced === 0) return;
        
        this.gameState = 'wave';
        this.enemiesSpawned = 0;
        this.enemiesRemaining = this.enemiesPerWave;
        this.enemySpawnTimer = 0;
        
        this.updateUI();
        this.hideOverlay();
    }
    
    spawnEnemy() {
        if (this.enemiesSpawned >= this.enemiesPerWave) return;
        
        const enemyTypes = ['circle', 'triangle', 'square'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const enemy = new Enemy(type, this.path, this.wave);
        this.enemies.push(enemy);
        
        this.enemiesSpawned++;
        this.enemySpawnTimer = 0;
    }
    
    update() {
        if (this.gameState === 'wave') {
            // Spawn enemies
            this.enemySpawnTimer++;
            if (this.enemySpawnTimer >= this.enemySpawnDelay) {
                this.spawnEnemy();
            }
            
            // Update enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                enemy.update();
                
                // Remove dead enemies
                if (enemy.isFullyDead()) {
                    this.enemies.splice(i, 1);
                    this.enemiesRemaining--;
                }
                
                // Check if enemy reached end
                if (enemy.reachedEnd) {
                    this.coreHP -= 10;
                    this.enemies.splice(i, 1);
                    this.enemiesRemaining--;
                    
                    if (this.coreHP <= 0) {
                        this.gameOver();
                    }
                }
            }
            
            // Update towers
            for (let tower of this.towers) {
                tower.update(this.enemies);
            }
            
            // Check if wave is complete
            if (this.enemiesRemaining <= 0 && this.enemies.length === 0) {
                this.waveComplete();
            }
        }
        
        this.updateUI();
    }
    
    waveComplete() {
        this.wave++;
        this.gameState = 'prep';
        this.enemiesPerWave += 2;
        this.showOverlay('Wave Complete!', 'Prepare for the next wave. Place your towers.');
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.showOverlay('Game Over!', `You survived ${this.wave} waves. Click Reset to try again.`);
    }
    
    resetGame() {
        this.wave = 1;
        this.coreHP = 100;
        this.towersPlaced = 0;
        this.enemiesPerWave = 10;
        this.gameState = 'prep';
        
        this.towers = [];
        this.enemies = [];
        this.generateGrid();
        this.generatePath();
        
        this.showOverlay('Place Your Towers', 'Click on non-path tiles to place towers before starting the wave.');
        this.updateUI();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw path
        this.drawPath();
        
        // Draw towers
        for (let tower of this.towers) {
            tower.draw(this.ctx);
        }
        
        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }
        
        // Draw hover effect
        if (this.gameState === 'prep') {
            this.drawHoverEffect();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let row = 0; row <= this.gridSize; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.tileSize);
            this.ctx.lineTo(this.width, row * this.tileSize);
            this.ctx.stroke();
        }
        
        for (let col = 0; col <= this.gridSize; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.tileSize, 0);
            this.ctx.lineTo(col * this.tileSize, this.height);
            this.ctx.stroke();
        }
    }
    
    drawPath() {
        this.ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const tile = this.grid[row][col];
                if (tile.isPath) {
                    this.ctx.fillRect(
                        col * this.tileSize,
                        row * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }
    
    drawHoverEffect() {
        const tile = this.getTileAtPosition(this.mouseX, this.mouseY);
        if (tile && !tile.isPath && !tile.hasTower) {
            this.ctx.fillStyle = 'rgba(76, 205, 196, 0.3)';
            this.ctx.fillRect(
                tile.col * this.tileSize,
                tile.row * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
    }
    
    updateUI() {
        document.getElementById('wave-number').textContent = this.wave;
        document.getElementById('enemies-remaining').textContent = this.enemiesRemaining;
        document.getElementById('core-hp').textContent = this.coreHP;
        document.getElementById('towers-placed').textContent = this.towersPlaced;
    }
    
    showOverlay(title, message) {
        const overlay = document.getElementById('game-overlay');
        document.getElementById('overlay-title').textContent = title;
        document.getElementById('overlay-message').textContent = message;
        overlay.classList.add('active');
    }
    
    hideOverlay() {
        const overlay = document.getElementById('game-overlay');
        overlay.classList.remove('active');
    }
    
    updateTowerRangeIndicators() {
        for (let tower of this.towers) {
            const distance = Math.sqrt(
                Math.pow(this.mouseX - tower.x, 2) + 
                Math.pow(this.mouseY - tower.y, 2)
            );
            tower.setRangeIndicator(distance < 30); // Show range when mouse is close to tower
        }
    }
    
    startGameLoop() {
        const gameLoop = (currentTime) => {
            if (currentTime - this.lastTime >= 1000 / this.tickRate) {
                this.update();
                this.draw();
                this.lastTime = currentTime;
            }
            this.animationId = requestAnimationFrame(gameLoop);
        };
        gameLoop(0);
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}