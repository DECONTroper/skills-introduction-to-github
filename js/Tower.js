class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 80;
        this.damage = 25;
        this.cooldown = 0;
        this.maxCooldown = 30; // frames between shots
        this.target = null;
        this.size = 20;
        this.color = '#4ecdc4';
        this.borderColor = '#ffffff';
        this.projectiles = [];
        
        // Visual effects
        this.pulseAnimation = 0;
        this.rangeIndicator = false;
    }
    
    update(enemies) {
        // Update cooldown
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        
        // Update pulse animation
        this.pulseAnimation += 0.1;
        
        // Find target
        this.findTarget(enemies);
        
        // Shoot if we have a target and cooldown is ready
        if (this.target && this.cooldown <= 0) {
            this.shoot();
        }
        
        // Update projectiles
        this.updateProjectiles();
    }
    
    findTarget(enemies) {
        // Clear target if it's dead or out of range
        if (this.target && (this.target.isDead || this.getDistance(this.target) > this.range)) {
            this.target = null;
        }
        
        // Find new target if we don't have one
        if (!this.target) {
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (let enemy of enemies) {
                if (!enemy.isDead && !enemy.reachedEnd) {
                    const distance = this.getDistance(enemy);
                    if (distance <= this.range && distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            }
            
            this.target = closestEnemy;
        }
    }
    
    getDistance(enemy) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    shoot() {
        if (!this.target) return;
        
        // Create projectile
        const projectile = new Projectile(
            this.x,
            this.y,
            this.target.x,
            this.target.y,
            this.damage
        );
        
        this.projectiles.push(projectile);
        this.cooldown = this.maxCooldown;
        
        // Visual feedback
        this.pulseAnimation = 0;
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update();
            
            // Check collision with target
            if (this.target && !this.target.isDead) {
                const distance = projectile.getDistance(this.target);
                if (distance < 15) { // Collision radius
                    this.target.takeDamage(projectile.damage);
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }
            
            // Remove projectiles that have traveled too far or are too old
            if (projectile.lifetime > 60 || projectile.distanceTraveled > this.range * 1.5) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        // Draw range indicator when hovering
        if (this.rangeIndicator) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
        
        // Draw tower base
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Pulse effect when shooting
        const pulseScale = 1 + Math.sin(this.pulseAnimation) * 0.1;
        ctx.scale(pulseScale, pulseScale);
        
        // Draw hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw targeting line if we have a target
        if (this.target && !this.target.isDead) {
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.restore();
        
        // Draw projectiles
        for (let projectile of this.projectiles) {
            projectile.draw(ctx);
        }
    }
    
    setRangeIndicator(show) {
        this.rangeIndicator = show;
    }
    
    upgrade() {
        this.damage += 10;
        this.range += 10;
        this.maxCooldown = Math.max(10, this.maxCooldown - 2);
    }
}