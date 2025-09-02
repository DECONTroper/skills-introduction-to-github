// Enhanced Turret Visuals & Effects for Geometry Rain
// Add these functions to your main game code

// --- Turret Enhancement System ---

// Turret state tracking
const turretStates = {
    normal: 'normal',
    damaged: 'damaged',
    destroyed: 'destroyed',
    respawning: 'respawning'
};

// Enhanced turret object with visual effects
function createEnhancedTurret(type, x, y) {
    const turret = {
        type,
        x,
        y,
        width: 20,
        height: 12,
        hp: 100,
        maxHp: 100,
        state: turretStates.normal,
        
        // Visual effects
        damageFlashTimer: 0,
        shakeTimer: 0,
        shakeMagnitude: 0,
        respawnProgress: 0,
        respawnTimer: 0,
        
        // Death sequence
        deathBeamHeight: 0,
        deathBeamExpanding: false,
        deathBeamWidth: 0,
        deathBeamTimer: 0,
        
        // Respawn sequence
        respawnBeams: [],
        respawnPieces: [],
        respawnPulseTimer: 0,
        
        // Animation timers
        animationTimer: 0,
        pulseTimer: 0,
        
        // Visual properties
        glowIntensity: 1,
        particleTrails: [],
        outlineAlpha: 1
    };
    
    // Initialize respawn pieces
    turret.respawnPieces = createTurretPieces(turret);
    
    return turret;
}

// Create turret piece definitions for respawn animation
function createTurretPieces(turret) {
    const pieces = [];
    const pieceCount = 6;
    
    for (let i = 0; i < pieceCount; i++) {
        pieces.push({
            x: turret.x + (i - pieceCount/2) * (turret.width / pieceCount),
            y: turret.y,
            width: turret.width / pieceCount,
            height: turret.height,
            alpha: 0,
            glow: 0,
            solid: false
        });
    }
    
    return pieces;
}

// --- Damage Feedback System ---

function handleTurretDamage(turret, damage) {
    if (turret.state === turretStates.destroyed || turret.state === turretStates.respawning) {
        return;
    }
    
    turret.hp -= damage;
    turret.damageFlashTimer = 0.3;
    turret.shakeTimer = 0.2;
    turret.shakeMagnitude = Math.min(5, damage / 10);
    
    // Create damage particles
    createTurretDamageParticles(turret);
    
    if (turret.hp <= 0) {
        turret.state = turretStates.destroyed;
        startTurretDeathSequence(turret);
    }
}

function createTurretDamageParticles(turret) {
    for (let i = 0; i < 8; i++) {
        if (activeParticles.length >= MAX_PARTICLES) return;
        
        activeParticles.push({
            x: turret.x + Math.random() * turret.width,
            y: turret.y + Math.random() * turret.height,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100 - 50,
            size: Math.random() * 3 + 2,
            color: '#00ffff',
            alpha: 1,
            life: 0.8,
            gravity: true,
            type: 'turret_damage'
        });
    }
}

// --- Death Sequence System ---

function startTurretDeathSequence(turret) {
    turret.deathBeamHeight = 0;
    turret.deathBeamExpanding = false;
    turret.deathBeamWidth = 0;
    turret.deathBeamTimer = 0;
    
    // Create explosion effect
    createTurretExplosion(turret);
    
    // Play death sound
    SoundSystem.playSound('turretDestroy');
    
    // Start death sequence
    setTimeout(() => {
        turret.deathBeamExpanding = true;
    }, 1000);
}

function createTurretExplosion(turret) {
    // Blue energy explosion
    for (let i = 0; i < 20; i++) {
        if (activeParticles.length >= MAX_PARTICLES) return;
        
        const angle = (i / 20) * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        
        activeParticles.push({
            x: turret.x + turret.width / 2,
            y: turret.y + turret.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 3,
            color: '#0088ff',
            alpha: 1,
            life: 1.5,
            gravity: false,
            type: 'turret_explosion',
            glow: true
        });
    }
}

function updateTurretDeathSequence(turret, deltaTime) {
    if (turret.state !== turretStates.destroyed) return;
    
    turret.deathBeamTimer += deltaTime;
    
    if (!turret.deathBeamExpanding) {
        // Vertical beam rising
        turret.deathBeamHeight = Math.min(GAME_HEIGHT, turret.deathBeamHeight + 800 * deltaTime);
        
        // Vaporize enemies in the beam path
        enemies.forEach(enemy => {
            if (enemy.y < turret.deathBeamHeight && 
                Math.abs(enemy.x - (turret.x + turret.width / 2)) < 15) {
                vaporizeEnemy(enemy);
            }
        });
        
        // Create beam particles
        createBeamParticles(turret);
        
    } else {
        // Horizontal beam expanding
        turret.deathBeamWidth = Math.min(GAME_WIDTH, turret.deathBeamWidth + 1200 * deltaTime);
        
        // Annihilate all enemies in the beam path
        enemies.forEach(enemy => {
            if (enemy.y < turret.deathBeamHeight) {
                vaporizeEnemy(enemy);
            }
        });
        
        // Create expansion particles
        createExpansionParticles(turret);
        
        // End sequence after full expansion
        if (turret.deathBeamWidth >= GAME_WIDTH) {
            setTimeout(() => {
                startTurretRespawn(turret);
            }, 500);
        }
    }
}

function vaporizeEnemy(enemy) {
    // Create vaporization effect
    createVaporizationEffect(enemy);
    
    // Remove enemy
    const index = enemies.indexOf(enemy);
    if (index > -1) {
        enemies.splice(index, 1);
    }
    
    // Add score
    updateScore(50);
}

function createVaporizationEffect(enemy) {
    for (let i = 0; i < 12; i++) {
        if (activeParticles.length >= MAX_PARTICLES) return;
        
        activeParticles.push({
            x: enemy.x + Math.random() * enemy.size * 2,
            y: enemy.y + Math.random() * enemy.size * 2,
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 200,
            size: Math.random() * 3 + 2,
            color: '#00ffff',
            alpha: 1,
            life: 1.0,
            gravity: false,
            type: 'vaporization',
            glow: true
        });
    }
}

function createBeamParticles(turret) {
    if (Math.random() > 0.3) return;
    
    for (let i = 0; i < 3; i++) {
        if (activeParticles.length >= MAX_PARTICLES) return;
        
        activeParticles.push({
            x: turret.x + turret.width / 2 + (Math.random() - 0.5) * 30,
            y: turret.y + turret.height / 2 + Math.random() * turret.deathBeamHeight,
            vx: (Math.random() - 0.5) * 50,
            vy: -100 - Math.random() * 100,
            size: Math.random() * 2 + 1,
            color: '#00ffff',
            alpha: 0.8,
            life: 0.5,
            gravity: false,
            type: 'beam_particle',
            glow: true
        });
    }
}

function createExpansionParticles(turret) {
    if (Math.random() > 0.2) return;
    
    for (let i = 0; i < 5; i++) {
        if (activeParticles.length >= MAX_PARTICLES) return;
        
        const x = Math.random() * turret.deathBeamWidth;
        const y = turret.deathBeamHeight + (Math.random() - 0.5) * 40;
        
        activeParticles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 300,
            vy: (Math.random() - 0.5) * 200,
            size: Math.random() * 3 + 2,
            color: '#00ffff',
            alpha: 0.9,
            life: 0.8,
            gravity: false,
            type: 'expansion_particle',
            glow: true
        });
    }
}

// --- Respawn Sequence System ---

function startTurretRespawn(turret) {
    turret.state = turretStates.respawning;
    turret.respawnProgress = 0;
    turret.respawnTimer = 0;
    turret.respawnBeams = [];
    
    // Create respawn beams from screen edges
    createRespawnBeams(turret);
    
    // Reset turret properties
    turret.hp = turret.maxHp;
    turret.x = turret.x; // Keep original position
    turret.y = turret.y;
}

function createRespawnBeams(turret) {
    const beamCount = 8;
    
    for (let i = 0; i < beamCount; i++) {
        const angle = (i / beamCount) * Math.PI * 2;
        const distance = Math.max(GAME_WIDTH, GAME_HEIGHT) * 0.8;
        
        turret.respawnBeams.push({
            startX: turret.x + turret.width / 2 + Math.cos(angle) * distance,
            startY: turret.y + turret.height / 2 + Math.sin(angle) * distance,
            endX: turret.x + turret.width / 2,
            endY: turret.y + turret.height / 2,
            progress: 0,
            speed: 0.5 + Math.random() * 0.5,
            width: 3 + Math.random() * 3,
            alpha: 1,
            life: 2.0
        });
    }
}

function updateTurretRespawn(turret, deltaTime) {
    if (turret.state !== turretStates.respawning) return;
    
    turret.respawnTimer += deltaTime;
    turret.respawnProgress = Math.min(1, turret.respawnTimer / 3.0);
    
    // Update respawn beams
    turret.respawnBeams.forEach(beam => {
        beam.progress += beam.speed * deltaTime;
        beam.alpha = 1 - beam.progress;
    });
    
    // Update respawn pieces
    turret.respawnPieces.forEach((piece, index) => {
        const pieceProgress = Math.max(0, (turret.respawnProgress - index * 0.15) / 0.15);
        piece.alpha = pieceProgress;
        piece.glow = pieceProgress;
        piece.solid = pieceProgress >= 1;
    });
    
    // Create respawn particles
    if (Math.random() > 0.7) {
        createRespawnParticles(turret);
    }
    
    // Check if respawn is complete
    if (turret.respawnProgress >= 1) {
        completeTurretRespawn(turret);
    }
}

function createRespawnParticles(turret) {
    for (let i = 0; i < 3; i++) {
        if (activeParticles.length >= MAX_PARTICLES) return;
        
        activeParticles.push({
            x: turret.x + Math.random() * turret.width,
            y: turret.y + Math.random() * turret.height,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            size: Math.random() * 2 + 1,
            color: '#00ffff',
            alpha: 0.8,
            life: 1.0,
            gravity: false,
            type: 'respawn_particle',
            glow: true
        });
    }
}

function completeTurretRespawn(turret) {
    turret.state = turretStates.normal;
    turret.respawnPulseTimer = 0.5;
    
    // Create completion pulse
    createRespawnPulse(turret);
    
    // Play respawn sound
    SoundSystem.playSound('turretRespawn');
}

function createRespawnPulse(turret) {
    // Create expanding pulse effect
    for (let i = 0; i < 16; i++) {
        if (activeParticles.length >= MAX_PARTICLES) return;
        
        const angle = (i / 16) * Math.PI * 2;
        const speed = 150;
        
        activeParticles.push({
            x: turret.x + turret.width / 2,
            y: turret.y + turret.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 4,
            color: '#00ffff',
            alpha: 1,
            life: 1.0,
            gravity: false,
            type: 'respawn_pulse',
            glow: true
        });
    }
}

// --- Enhanced Turret Drawing ---

function drawEnhancedTurret(turret) {
    ctx.save();
    
    // Apply shake effect
    if (turret.shakeTimer > 0) {
        const shakeX = (Math.random() - 0.5) * turret.shakeMagnitude * 2;
        const shakeY = (Math.random() - 0.5) * turret.shakeMagnitude * 2;
        ctx.translate(shakeX, shakeY);
    }
    
    // Apply damage flash
    if (turret.damageFlashTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(turret.damageFlashTimer * 20) * 0.5;
    }
    
    // Draw based on state
    switch (turret.state) {
        case turretStates.normal:
            drawNormalTurret(turret);
            break;
        case turretStates.damaged:
            drawDamagedTurret(turret);
            break;
        case turretStates.destroyed:
            drawDeathSequence(turret);
            break;
        case turretStates.respawning:
            drawRespawnSequence(turret);
            break;
    }
    
    ctx.restore();
}

function drawNormalTurret(turret) {
    const centerX = turret.x + turret.width / 2;
    const centerY = turret.y + turret.height / 2;
    
    // Draw glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15 + Math.sin(turret.pulseTimer) * 5;
    
    // Draw main turret body
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(turret.x, turret.y, turret.width, turret.height);
    
    // Draw outline
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(turret.x, turret.y, turret.width, turret.height);
    
    // Draw center detail
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
    
    // Draw particle trails
    drawTurretParticleTrails(turret);
}

function drawDamagedTurret(turret) {
    // Similar to normal but with damage effects
    drawNormalTurret(turret);
    
    // Add damage indicators
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(turret.x - 2, turret.y - 2, turret.width + 4, turret.height + 4);
    ctx.setLineDash([]);
}

function drawDeathSequence(turret) {
    // Draw death beam
    if (turret.deathBeamHeight > 0) {
        drawDeathBeam(turret);
    }
    
    // Draw expansion beam
    if (turret.deathBeamExpanding && turret.deathBeamWidth > 0) {
        drawExpansionBeam(turret);
    }
}

function drawDeathBeam(turret) {
    const beamX = turret.x + turret.width / 2;
    
    // Create gradient for beam
    const gradient = ctx.createLinearGradient(beamX - 15, 0, beamX + 15, 0);
    gradient.addColorStop(0, 'rgba(0, 136, 255, 0)');
    gradient.addColorStop(0.3, 'rgba(0, 136, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(0, 136, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 136, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(beamX - 15, 0, 30, turret.deathBeamHeight);
    
    // Draw beam core
    ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.fillRect(beamX - 3, 0, 6, turret.deathBeamHeight);
    
    // Draw beam glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(beamX, 0);
    ctx.lineTo(beamX, turret.deathBeamHeight);
    ctx.stroke();
}

function drawExpansionBeam(turret) {
    const beamY = turret.deathBeamHeight;
    
    // Create gradient for expansion beam
    const gradient = ctx.createLinearGradient(0, beamY - 20, 0, beamY + 20);
    gradient.addColorStop(0, 'rgba(0, 136, 255, 0)');
    gradient.addColorStop(0.3, 'rgba(0, 136, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(0, 136, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 136, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, beamY - 20, turret.deathBeamWidth, 40);
    
    // Draw expansion beam core
    ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.fillRect(0, beamY - 3, turret.deathBeamWidth, 6);
    
    // Draw expansion glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, beamY);
    ctx.lineTo(turret.deathBeamWidth, beamY);
    ctx.stroke();
}

function drawRespawnSequence(turret) {
    // Draw respawn beams
    turret.respawnBeams.forEach(beam => {
        if (beam.progress < 1) {
            drawRespawnBeam(beam);
        }
    });
    
    // Draw respawn pieces
    turret.respawnPieces.forEach(piece => {
        if (piece.alpha > 0) {
            drawRespawnPiece(piece);
        }
    });
    
    // Draw respawn pulse
    if (turret.respawnPulseTimer > 0) {
        drawRespawnPulse(turret);
    }
}

function drawRespawnBeam(beam) {
    const currentX = lerp(beam.startX, beam.endX, beam.progress);
    const currentY = lerp(beam.startY, beam.endY, beam.progress);
    
    ctx.strokeStyle = `rgba(0, 255, 255, ${beam.alpha})`;
    ctx.lineWidth = beam.width;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.moveTo(beam.startX, beam.startY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
}

function drawRespawnPiece(piece) {
    ctx.globalAlpha = piece.alpha;
    ctx.fillStyle = `rgba(0, 136, 255, ${piece.alpha})`;
    ctx.strokeStyle = `rgba(0, 255, 255, ${piece.alpha})`;
    
    // Draw piece with glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10 * piece.glow;
    
    ctx.fillRect(piece.x, piece.y, piece.width, piece.height);
    ctx.lineWidth = 2;
    ctx.strokeRect(piece.x, piece.y, piece.width, piece.height);
}

function drawRespawnPulse(turret) {
    const pulseRadius = (1 - turret.respawnPulseTimer / 0.5) * 100;
    const pulseAlpha = turret.respawnPulseTimer / 0.5;
    
    ctx.globalAlpha = pulseAlpha;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.arc(turret.x + turret.width / 2, turret.y + turret.height / 2, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawTurretParticleTrails(turret) {
    turret.particleTrails.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// --- Turret Update Function ---

function updateEnhancedTurret(turret, deltaTime) {
    // Update timers
    if (turret.damageFlashTimer > 0) turret.damageFlashTimer -= deltaTime;
    if (turret.shakeTimer > 0) turret.shakeTimer -= deltaTime;
    if (turret.respawnPulseTimer > 0) turret.respawnPulseTimer -= deltaTime;
    
    // Update animation timers
    turret.animationTimer += deltaTime;
    turret.pulseTimer += deltaTime;
    
    // Update particle trails
    updateTurretParticleTrails(turret, deltaTime);
    
    // Update based on state
    switch (turret.state) {
        case turretStates.destroyed:
            updateTurretDeathSequence(turret, deltaTime);
            break;
        case turretStates.respawning:
            updateTurretRespawn(turret, deltaTime);
            break;
    }
}

function updateTurretParticleTrails(turret, deltaTime) {
    // Add new trail particles
    if (Math.random() > 0.7) {
        turret.particleTrails.push({
            x: turret.x + Math.random() * turret.width,
            y: turret.y + Math.random() * turret.height,
            size: Math.random() * 2 + 1,
            color: '#00ffff',
            alpha: 0.8,
            life: 1.0
        });
    }
    
    // Update existing trail particles
    turret.particleTrails.forEach(particle => {
        particle.alpha -= deltaTime;
        particle.life -= deltaTime;
    });
    
    // Remove dead trail particles
    turret.particleTrails = turret.particleTrails.filter(particle => particle.life > 0);
}

// --- Integration Functions ---

// Replace your existing turret creation with enhanced version
function spawnEnhancedTurret(type, x, y) {
    const turret = createEnhancedTurret(type, x, y);
    drones.push(turret);
    return turret;
}

// Enhanced turret hit detection
function handleTurretHit(turret, bullet) {
    handleTurretDamage(turret, bullet.damage || 1);
}

// Update your existing drone update loop to use enhanced turrets
function updateEnhancedDrones(deltaTime) {
    drones.forEach(drone => {
        if (drone.state) {
            // Enhanced turret
            updateEnhancedTurret(drone, deltaTime);
        } else {
            // Regular drone (existing logic)
            updateRegularDrone(drone, deltaTime);
        }
    });
}

// Draw enhanced drones/turrets
function drawEnhancedDrones() {
    drones.forEach(drone => {
        if (drone.state) {
            // Enhanced turret
            drawEnhancedTurret(drone);
        } else {
            // Regular drone (existing logic)
            drawRegularDrone(drone);
        }
    });
}

// Helper function for regular drones
function updateRegularDrone(drone, deltaTime) {
    // Your existing drone update logic
    const targetX = player.x + drone.offsetX;
    const targetY = player.y;
    drone.x += (targetX - drone.x) * 5 * deltaTime;
    drone.y += (targetY - drone.y) * 5 * deltaTime;
    drone.attackTimer -= deltaTime;
    if (drone.attackTimer <= 0) {
        if (drone.type === 'turret') {
            SoundSystem.playSound('drone_shoot');
            createBullet(drone.x, drone.y, 'normal');
        } else if (drone.type === 'missile') {
            createBullet(drone.x, drone.y, 'missile');
        }
        drone.attackTimer = drone.fireRate;
    }
}

function drawRegularDrone(drone) {
    // Your existing drone drawing logic
    ctx.save();
    const color = drone.type === 'turret' ? '#00dddd' : '#ffaa00';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 + 5 * Math.sin(Date.now() / 200);
    ctx.fillRect(drone.x - 10, drone.y - 10, 20, 20);
    ctx.restore();
}

// --- Sound Effects ---

// Add these to your SoundSystem if not already present
function addTurretSounds() {
    if (SoundSystem.isInitialized) {
        // Turret destroy sound
        SoundSystem.synths.turretDestroy = new Tone.MetalSynth({
            frequency: 300,
            envelope: { attack: 0.01, decay: 0.5, release: 0.3 },
            harmonicity: 8.1,
            modulationIndex: 40,
            resonance: 8000,
            octaves: 1.5
        }).connect(SoundSystem.buses.special);
        SoundSystem.synths.turretDestroy.volume.value = -8;
        
        // Turret respawn sound
        SoundSystem.synths.turretRespawn = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 },
            volume: -6
        }).connect(SoundSystem.buses.special);
    }
}

// Add sound playing functions
SoundSystem.playSound = function(soundName, options = {}) {
    // ... existing sound logic ...
    
    switch(soundName) {
        // ... existing cases ...
        
        case 'turretDestroy':
            this.synths.turretDestroy.triggerAttackRelease('C3', '0.5s', time);
            break;
        case 'turretRespawn':
            this.synths.turretRespawn.triggerAttackRelease(['C4', 'E4', 'G4'], '0.3s', time);
            break;
    }
};

// --- Integration Instructions ---

/*
To integrate these turret enhancements:

1. Include this file in your HTML
2. Replace turret creation with spawnEnhancedTurret()
3. Update your drone update loop to use updateEnhancedDrones()
4. Update your drone drawing to use drawEnhancedDrones()
5. Call addTurretSounds() in your SoundSystem.init()

Example integration:

// In your existing code, replace:
drones.push({ type: 'turret', x: player.x, y: player.y, offsetX: 0, attackTimer: 2, fireRate: 1 });

// With:
spawnEnhancedTurret('turret', player.x, player.y);

// Update your update function:
function update(deltaTime) {
    // ... existing code ...
    updateEnhancedDrones(deltaTime);
    // ... rest of code ...
}

// Update your draw function:
function draw() {
    // ... existing code ...
    drawEnhancedDrones();
    // ... rest of code ...
}
*/