class Enemy {
    constructor(type, path, wave) {
        this.type = type;
        this.path = path;
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.targetX = path[0].x;
        this.targetY = path[0].y;
        this.progress = 0;
        
        // Enemy properties based on type
        switch(type) {
            case 'circle':
                this.health = 50 + wave * 10;
                this.maxHealth = this.health;
                this.speed = 0.02;
                this.size = 15;
                this.color = '#ff6b6b';
                this.borderColor = '#ffffff';
                break;
            case 'triangle':
                this.health = 30 + wave * 5;
                this.maxHealth = this.health;
                this.speed = 0.035;
                this.size = 12;
                this.color = '#4ecdc4';
                this.borderColor = '#ffffff';
                break;
            case 'square':
                this.health = 100 + wave * 20;
                this.maxHealth = this.health;
                this.speed = 0.015;
                this.size = 18;
                this.color = '#45b7d1';
                this.borderColor = '#ffffff';
                break;
        }
        
        this.isDead = false;
        this.deathAnimation = 0;
        this.reachedEnd = false;
    }
    
    update() {
        if (this.isDead) {
            this.deathAnimation += 0.05;
            return;
        }
        
        if (this.pathIndex >= this.path.length - 1) {
            this.reachedEnd = true;
            return;
        }
        
        // Move along path
        this.progress += this.speed;
        
        if (this.progress >= 1) {
            this.progress = 0;
            this.pathIndex++;
            
            if (this.pathIndex < this.path.length - 1) {
                this.targetX = this.path[this.pathIndex + 1].x;
                this.targetY = this.path[this.pathIndex + 1].y;
            }
        }
        
        // Interpolate position
        const currentPoint = this.path[this.pathIndex];
        const nextPoint = this.path[this.pathIndex + 1];
        
        if (nextPoint) {
            this.x = currentPoint.x + (nextPoint.x - currentPoint.x) * this.progress;
            this.y = currentPoint.y + (nextPoint.y - currentPoint.y) * this.progress;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
        }
    }
    
    draw(ctx) {
        if (this.isDead) {
            // Death animation - shrink and fade
            const scale = Math.max(0, 1 - this.deathAnimation);
            const alpha = Math.max(0, 1 - this.deathAnimation);
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(this.x, this.y);
            ctx.scale(scale, scale);
            
            this.drawShape(ctx);
            ctx.restore();
            return;
        }
        
        this.drawShape(ctx);
        
        // Health bar
        this.drawHealthBar(ctx);
    }
    
    drawShape(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        switch(this.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.strokeStyle = this.borderColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
                
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(-this.size * 0.866, this.size * 0.5);
                ctx.lineTo(this.size * 0.866, this.size * 0.5);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.strokeStyle = this.borderColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
                
            case 'square':
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                ctx.strokeStyle = this.borderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;
        }
        
        ctx.restore();
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size - 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4ecdc4' : healthPercent > 0.25 ? '#ffa726' : '#ff6b6b';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    isFullyDead() {
        return this.isDead && this.deathAnimation >= 1;
    }
}