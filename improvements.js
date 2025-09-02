// Geometry Rain Game Improvements
// Add these functions to your main game code

// --- Frame Rate Optimization ---
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

// Modify your gameLoop function to include this at the top:
/*
function gameLoop(timestamp) {
    if (gameOver && !gamePaused) {
        gamePaused = true;
        showGameOverScreen();
    }

    // Frame rate optimization
    if (timestamp - lastTime < FRAME_TIME) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (inCutscene) {
        updateCutscene(deltaTime);
    } else if (!gamePaused) {
        update(deltaTime);
    }
    draw();
    requestAnimationFrame(gameLoop);
}
*/

// --- Memory Management & Cleanup ---
function cleanupArrays() {
    // Remove dead particles, bullets, etc.
    activeBullets = activeBullets.filter(b => b.y > -50 && b.y < GAME_HEIGHT + 50);
    
    // Clean up other arrays
    lightningBolts = lightningBolts.filter(bolt => bolt.life > 0);
    lazers = lazers.filter(l => l.life > 0);
    droneShockwaves = droneShockwaves.filter(sw => sw.life > 0);
    detonatorShockwaves = detonatorShockwaves.filter(sw => sw.life > 0);
    corpseShockwaves = corpseShockwaves.filter(sw => sw.life > 0);
    bottomLightning = bottomLightning.filter(l => l.life > 0);
    blackHoles = blackHoles.filter(bh => bh.life > 0);
    waveBlasts = waveBlasts.filter(wb => wb.life > 0);
    vortexes = vortexes.filter(v => v.life > 0);
    flares = flares.filter(f => f.life > 0);
    flareTrails = flareTrails.filter(ft => ft.life > 0);
    shockwaves = shockwaves.filter(sw => sw.life > 0);
    arrangers = arrangers.filter(a => a.life > 0);
    bossFragments = bossFragments.filter(frag => frag.life > 0);
    ghostSilhouettes = ghostSilhouettes.filter(ghost => ghost.life > 0);
    pingWaves = pingWaves.filter(wave => wave.life > 0);
    distortionPulses = distortionPulses.filter(pulse => pulse.life > 0);
}

// --- Save/Load System ---
function saveGame() {
    const saveData = {
        score, wave, lives, credits, upgrades,
        meta, maxCombo, lastGameMode
    };
    try {
        localStorage.setItem('geometryRain_save', JSON.stringify(saveData));
        showNotification('Game Saved!');
    } catch (e) {
        console.warn('Could not save game:', e);
        showNotification('Save Failed');
    }
}

function loadGame() {
    try {
        const saveData = localStorage.getItem('geometryRain_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            score = data.score || 0;
            wave = data.wave || 1;
            lives = data.lives || meta.startingLives;
            credits = data.credits || 0;
            upgrades = data.upgrades || upgrades;
            meta = data.meta || meta;
            maxCombo = data.maxCombo || 0;
            lastGameMode = data.lastGameMode || 'classic';
            
            updateUI();
            showNotification('Game Loaded!');
            return true;
        }
    } catch (e) {
        console.warn('Could not load game:', e);
        showNotification('Load Failed');
    }
    return false;
}

function deleteSave() {
    try {
        localStorage.removeItem('geometryRain_save');
        showNotification('Save Deleted!');
    } catch (e) {
        console.warn('Could not delete save:', e);
    }
}

// --- Dynamic Difficulty Scaling ---
function getDifficultyMultiplier() {
    return 1 + (wave - 1) * 0.1; // 10% increase per wave
}

function adjustEnemyStats(enemy) {
    const multiplier = getDifficultyMultiplier();
    enemy.hp = Math.floor(enemy.hp * multiplier);
}

// --- Enhanced Mobile Touch Controls with Visual Feedback ---
function drawTouchControls() {
    if (window.innerWidth <= 640 && !isSandboxMode) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        
        // Left zone
        ctx.fillStyle = '#0f0';
        ctx.fillRect(0, 0, GAME_WIDTH * 0.4, GAME_HEIGHT);
        
        // Right zone
        ctx.fillRect(GAME_WIDTH * 0.6, 0, GAME_WIDTH * 0.4, GAME_HEIGHT);
        
        // Shoot zone
        ctx.fillStyle = '#ff0';
        ctx.fillRect(GAME_WIDTH * 0.4, 0, GAME_WIDTH * 0.2, GAME_HEIGHT);
        
        // Zone labels
        ctx.globalAlpha = 0.8;
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        
        ctx.fillText('MOVE', GAME_WIDTH * 0.2, 50);
        ctx.fillText('MOVE', GAME_WIDTH * 0.8, 50);
        ctx.fillText('SHOOT', GAME_WIDTH * 0.5, 50);
        
        ctx.restore();
    }
}

// --- Auto-save functionality ---
let autoSaveTimer = 0;
const AUTO_SAVE_INTERVAL = 30; // Save every 30 seconds

function updateAutoSave(deltaTime) {
    if (!isSandboxMode && waveIsActive) {
        autoSaveTimer += deltaTime;
        if (autoSaveTimer >= AUTO_SAVE_INTERVAL) {
            saveGame();
            autoSaveTimer = 0;
        }
    }
}

// --- Performance monitoring ---
let frameCount = 0;
let lastFpsTime = 0;
let currentFps = 0;

function updatePerformanceMetrics(deltaTime) {
    frameCount++;
    if (Date.now() - lastFpsTime >= 1000) {
        currentFps = frameCount;
        frameCount = 0;
        lastFpsTime = Date.now();
    }
}

// --- Enhanced UI update function ---
function updateUI() {
    scoreEl.textContent = `Score: ${score}`;
    waveEl.textContent = `Wave: ${wave}`;
    livesEl.textContent = `Lives: ${lives}`;
    creditsEl.textContent = `Credits: ${credits}`;
    updateHealthBar();
    updateCoreButton();
    updateLivesUI();
}

// --- Enhanced enemy spawning with difficulty scaling ---
function spawnEnemyWithDifficulty(type, x, y, movementType = 'armada', spawnDelay = 0, squadId = null, options = {}) {
    const enemy = spawnEnemy(type, x, y, movementType, spawnDelay, squadId, options);
    adjustEnemyStats(enemy);
    return enemy;
}

// --- Enhanced power-up system with difficulty scaling ---
function createPowerUpWithDifficulty(x, y, specificType = null) {
    const powerUp = createPowerUp(x, y, specificType);
    if (powerUp) {
        // Scale power-up effectiveness with difficulty
        const difficultyMultiplier = getDifficultyMultiplier();
        if (powerUp.duration && powerUp.duration !== Infinity) {
            powerUp.duration *= difficultyMultiplier;
        }
    }
    return powerUp;
}

// --- Enhanced collision detection with performance optimization ---
function optimizedCollisionDetection() {
    // Use spatial partitioning for better performance
    const gridSize = 100;
    const grid = {};
    
    // Populate grid
    enemies.forEach(enemy => {
        const gridX = Math.floor(enemy.x / gridSize);
        const gridY = Math.floor(enemy.y / gridSize);
        const key = `${gridX},${gridY}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(enemy);
    });
    
    // Check collisions only within nearby grid cells
    activeBullets.forEach(bullet => {
        const gridX = Math.floor(bullet.x / gridSize);
        const gridY = Math.floor(bullet.y / gridSize);
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${gridX + dx},${gridY + dy}`;
                if (grid[key]) {
                    grid[key].forEach(enemy => {
                        if (isColliding(bullet, {x: enemy.x - enemy.size, y: enemy.y - enemy.size, width: enemy.size * 2, height: enemy.size * 2})) {
                            handleEnemyHit(enemy, bullet);
                        }
                    });
                }
            }
        }
    });
}

// --- Enhanced particle system with performance optimization ---
function createOptimizedParticle(x, y, color, count, radius = 50) {
    const maxParticles = Math.min(count, MAX_PARTICLES - activeParticles.length);
    for (let i = 0; i < maxParticles; i++) {
        activeParticles.push({
            x: x + (Math.random() - 0.5) * radius * 0.5, 
            y: y + (Math.random() - 0.5) * radius * 0.5,
            vx: (Math.random() - 0.5) * 150, 
            vy: (Math.random() - 0.5) * 150,
            size: Math.random() * 3 + 1,
            color, 
            alpha: 1, 
            gravity: true,
            life: 1.0 // Add life property for better cleanup
        });
    }
}

// --- Enhanced sound system with volume control ---
function setMasterVolume(volume) {
    if (SoundSystem.isInitialized && SoundSystem.masterVolume) {
        SoundSystem.masterVolume.volume.value = volume;
    }
}

function setMusicVolume(volume) {
    if (SoundSystem.isInitialized && SoundSystem.buses.ambient) {
        SoundSystem.buses.ambient.gain.value = volume;
    }
}

function setSFXVolume(volume) {
    if (SoundSystem.isInitialized) {
        SoundSystem.buses.player.gain.value = volume;
        SoundSystem.buses.enemy.gain.value = volume;
        SoundSystem.buses.powerup.gain.value = volume;
        SoundSystem.buses.special.gain.value = volume;
    }
}

// --- Enhanced UI with save/load buttons ---
function addSaveLoadButtons() {
    // Add these buttons to your bottom bar or create a new section
    const saveLoadGroup = document.createElement('div');
    saveLoadGroup.className = 'button-group';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = saveGame;
    
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load';
    loadButton.onclick = loadGame;
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Save';
    deleteButton.onclick = deleteSave;
    
    saveLoadGroup.appendChild(saveButton);
    saveLoadGroup.appendChild(loadButton);
    saveLoadGroup.appendChild(deleteButton);
    
    // Add to your existing bottom bar
    // document.getElementById('main-buttons').appendChild(saveLoadGroup);
}

// --- Enhanced game state management ---
function resetGameState() {
    // Enhanced reset function
    score = 0;
    wave = 1;
    lives = meta.startingLives;
    credits = 0;
    gameOver = false;
    gamePaused = true;
    waveIsActive = false;
    isSandboxMode = false;
    isRainMode = false;
    
    // Reset all arrays
    activeBullets = [];
    enemies = [];
    activeParticles = [];
    powerUps = [];
    drones = [];
    corpses = [];
    boss = null;
    bossFragments = [];
    
    // Reset player
    Object.assign(player, {
        x: GAME_WIDTH / 2 - 25,
        y: GAME_HEIGHT - 60,
        vy: 0,
        shotCooldown: 0,
        stunTimer: 0,
        invincibilityTimer: 0,
        isFiring: false,
        health: player.maxHealth,
        hasShield: false,
    });
    
    // Reset upgrades
    for (const type in upgrades) {
        upgrades[type].level = 0;
        upgrades[type].timer = 0;
    }
    
    // Reset combo state
    comboCount = 0;
    comboTimer = 0;
    maxCombo = 0;
    
    // Reset timers
    autoSaveTimer = 0;
    
    updateUI();
}

// --- Enhanced wave system with difficulty progression ---
function spawnWaveWithDifficulty() {
    const difficultyMultiplier = getDifficultyMultiplier();
    const baseEnemyCount = Math.floor((5 + wave) * difficultyMultiplier);
    
    // Adjust enemy types based on difficulty
    if (wave >= 20) {
        // Introduce more challenging enemy types
        enemyData.heptagon.hp = Math.floor(enemyData.heptagon.hp * difficultyMultiplier);
        enemyData.octagon.hp = Math.floor(enemyData.octagon.hp * difficultyMultiplier);
    }
    
    spawnWave();
}

// --- Enhanced boss system with difficulty scaling ---
function createBossWithDifficulty(forWave, forRotation) {
    const boss = createBossObject(forWave, forRotation);
    const difficultyMultiplier = getDifficultyMultiplier();
    
    // Scale boss health and attack speed
    boss.hp = Math.floor(boss.hp * difficultyMultiplier);
    boss.attackInterval = Math.max(0.2, boss.attackInterval / difficultyMultiplier);
    
    // Scale individual side health
    boss.sides.forEach(side => {
        side.hp = Math.floor(side.hp * difficultyMultiplier);
        side.maxHp = side.hp;
    });
    
    return boss;
}

// --- Enhanced power-up effectiveness with difficulty ---
function activatePowerUpWithDifficulty(p) {
    const difficultyMultiplier = getDifficultyMultiplier();
    
    switch (p.type) {
        case 'freeze':
            const freezeDuration = 3 * difficultyMultiplier;
            enemies.forEach(e => e.frozenTimer = freezeDuration);
            if (boss) boss.frozenTimer = freezeDuration;
            break;
        case 'rewind':
            const rewindDuration = 3 * difficultyMultiplier;
            rewindTimer = rewindDuration;
            break;
        case 'shield':
            // Shield duration scales with difficulty
            player.shieldDuration = 5 * difficultyMultiplier;
            break;
        default:
            // Default behavior
            break;
    }
    
    activatePowerUp(p);
}

// --- Enhanced notification system ---
function showEnhancedNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `ui-notification ${type}`;
    notification.textContent = message;
    
    // Add type-specific styling
    switch (type) {
        case 'success':
            notification.style.color = '#00ff00';
            break;
        case 'warning':
            notification.style.color = '#ffff00';
            break;
        case 'error':
            notification.style.color = '#ff0000';
            break;
        default:
            notification.style.color = '#0f0';
    }
    
    notificationAreaEl.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// --- Enhanced performance monitoring display ---
function drawPerformanceMetrics() {
    if (window.location.search.includes('debug=true')) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${currentFps}`, 10, 20);
        ctx.fillText(`Particles: ${activeParticles.length}/${MAX_PARTICLES}`, 10, 35);
        ctx.fillText(`Enemies: ${enemies.length}`, 10, 50);
        ctx.fillText(`Bullets: ${activeBullets.length}`, 10, 65);
        ctx.fillText(`Wave: ${wave}`, 10, 80);
        ctx.restore();
    }
}

// --- Enhanced accessibility features ---
function toggleAccessibilityMode() {
    const accessibilityMode = !window.accessibilityMode;
    window.accessibilityMode = accessibilityMode;
    
    if (accessibilityMode) {
        // High contrast mode
        document.body.style.filter = 'contrast(200%) brightness(150%)';
        // Larger text
        document.body.style.fontSize = '1.2em';
        // Show hitboxes
        showHitboxes = true;
    } else {
        // Normal mode
        document.body.style.filter = 'none';
        document.body.style.fontSize = '1em';
        showHitboxes = false;
    }
    
    showEnhancedNotification(`Accessibility Mode: ${accessibilityMode ? 'ON' : 'OFF'}`, 'info');
}

// --- Enhanced mobile controls with haptic feedback ---
function addHapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50); // 50ms vibration
    }
}

// Add haptic feedback to touch events
function enhanceTouchControls() {
    const touchElements = [touchLeftEl, touchRightEl, touchShootEl];
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', addHapticFeedback);
    });
}

// --- Enhanced game statistics tracking ---
const gameStats = {
    totalShots: 0,
    totalHits: 0,
    totalEnemiesKilled: 0,
    totalPowerUpsCollected: 0,
    totalBossesDefeated: 0,
    longestCombo: 0,
    totalPlayTime: 0,
    gamesPlayed: 0
};

function updateGameStats(type, value = 1) {
    if (gameStats[type] !== undefined) {
        gameStats[type] += value;
    }
    
    // Save stats to localStorage
    try {
        localStorage.setItem('geometryRain_stats', JSON.stringify(gameStats));
    } catch (e) {
        console.warn('Could not save game stats:', e);
    }
}

function loadGameStats() {
    try {
        const savedStats = localStorage.getItem('geometryRain_stats');
        if (savedStats) {
            Object.assign(gameStats, JSON.parse(savedStats));
        }
    } catch (e) {
        console.warn('Could not load game stats:', e);
    }
}

// --- Enhanced achievements system ---
const achievements = {
    sharpshooter: { name: 'Sharpshooter', description: 'Achieve 90% accuracy', unlocked: false, condition: () => gameStats.totalHits / gameStats.totalShots >= 0.9 },
    comboMaster: { name: 'Combo Master', description: 'Achieve a 50x combo', unlocked: false, condition: () => maxCombo >= 50 },
    survivor: { name: 'Survivor', description: 'Complete 10 waves', unlocked: false, condition: () => wave >= 10 },
    bossSlayer: { name: 'Boss Slayer', description: 'Defeat 5 bosses', unlocked: false, condition: () => gameStats.totalBossesDefeated >= 5 }
};

function checkAchievements() {
    Object.keys(achievements).forEach(key => {
        const achievement = achievements[key];
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            showEnhancedNotification(`Achievement Unlocked: ${achievement.name}!`, 'success', 5000);
            
            // Save achievements
            try {
                localStorage.setItem('geometryRain_achievements', JSON.stringify(achievements));
            } catch (e) {
                console.warn('Could not save achievements:', e);
            }
        }
    });
}

function loadAchievements() {
    try {
        const savedAchievements = localStorage.getItem('geometryRain_achievements');
        if (savedAchievements) {
            Object.assign(achievements, JSON.parse(savedAchievements));
        }
    } catch (e) {
        console.warn('Could not load achievements:', e);
    }
}

// --- Integration instructions ---
/*
To integrate these improvements:

1. Add the frame rate optimization to your gameLoop function
2. Call cleanupArrays() in your update function
3. Call updateAutoSave(deltaTime) in your update function
4. Call updatePerformanceMetrics(deltaTime) in your update function
5. Add drawTouchControls() to your draw function
6. Add drawPerformanceMetrics() to your draw function
7. Call addSaveLoadButtons() in your init function
8. Call loadGameStats() and loadAchievements() in your init function
9. Call checkAchievements() when appropriate (e.g., after killing enemies, completing waves)
10. Call updateGameStats() when appropriate (e.g., after shooting, hitting enemies)

Example integration in update function:
function update(deltaTime) {
    // ... existing code ...
    
    cleanupArrays();
    updateAutoSave(deltaTime);
    updatePerformanceMetrics(deltaTime);
    
    // ... rest of existing code ...
}

Example integration in draw function:
function draw() {
    // ... existing code ...
    
    drawTouchControls();
    drawPerformanceMetrics();
    
    // ... rest of existing code ...
}
*/