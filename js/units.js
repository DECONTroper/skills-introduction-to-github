class Unit {
    constructor(card, x, y, team) {
        // Copy card properties
        this.name = card.name;
        this.type = card.type;
        this.health = card.health;
        this.maxHealth = card.health;
        this.damage = card.damage;
        this.range = card.range;
        this.speed = card.speed;
        this.priority = card.priority;
        this.behavior = card.behavior;
        this.traits = card.traits;
        this.cost = card.cost;
        this.description = card.description;
        
        // Position and team
        this.x = x;
        this.y = y;
        this.team = team; // 'player' or 'enemy'
        
        // Combat state
        this.hasAttacked = false;
        this.hasMoved = false;
        this.isStunned = false;
        this.isDead = false;
        
        // Special effects
        this.buffs = [];
        this.debuffs = [];
        this.turnEffects = [];
        
        // Visual state
        this.animationState = 'idle';
        this.animationTimer = 0;
    }
    
    takeDamage(damage) {
        // Apply armor reduction
        let actualDamage = damage;
        if (this.traits.includes('armor')) {
            actualDamage = Math.max(1, damage - 1);
        }
        
        this.health = Math.max(0, this.health - actualDamage);
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
        
        // Apply rage effects
        if (this.traits.includes('frenzy') && this.health < this.maxHealth * 0.5) {
            this.damage += 2; // Berserker rage
        }
        
        return actualDamage;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    die() {
        this.isDead = true;
        this.health = 0;
        
        // Trigger death effects
        if (this.traits.includes('undead')) {
            // Undead units have a chance to revive
            if (Math.random() < 0.3) {
                this.revive();
            }
        }
    }
    
    revive() {
        this.isDead = false;
        this.health = Math.floor(this.maxHealth * 0.5);
    }
    
    canMove() {
        return !this.hasMoved && !this.isStunned && !this.isDead;
    }
    
    canAttack() {
        return !this.hasAttacked && !this.isStunned && !this.isDead;
    }
    
    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.hasMoved = true;
    }
    
    attack(target) {
        if (!this.canAttack()) return false;
        
        const damage = this.calculateDamage(target);
        target.takeDamage(damage);
        this.hasAttacked = true;
        
        return damage;
    }
    
    calculateDamage(target) {
        let damage = this.damage;
        
        // Apply critical hits (10% chance)
        if (Math.random() < 0.1) {
            damage = Math.floor(damage * 1.5);
        }
        
        // Apply magic bonus
        if (this.traits.includes('magic')) {
            damage += 1;
        }
        
        // Apply rage bonus
        if (this.traits.includes('frenzy') && this.health < this.maxHealth * 0.5) {
            damage += 2;
        }
        
        return damage;
    }
    
    resetTurn() {
        this.hasAttacked = false;
        this.hasMoved = false;
        this.isStunned = false;
        
        // Process turn effects
        this.processTurnEffects();
    }
    
    processTurnEffects() {
        // Process buffs
        this.buffs = this.buffs.filter(buff => {
            buff.duration--;
            if (buff.duration <= 0) {
                this.removeBuff(buff);
                return false;
            }
            return true;
        });
        
        // Process debuffs
        this.debuffs = this.debuffs.filter(debuff => {
            debuff.duration--;
            if (debuff.duration <= 0) {
                this.removeDebuff(debuff);
                return false;
            }
            return true;
        });
        
        // Process turn effects
        this.turnEffects = this.turnEffects.filter(effect => {
            effect.duration--;
            if (effect.duration <= 0) {
                this.removeTurnEffect(effect);
                return false;
            }
            return true;
        });
    }
    
    addBuff(buff) {
        this.buffs.push(buff);
        this.applyBuff(buff);
    }
    
    addDebuff(debuff) {
        this.debuffs.push(debuff);
        this.applyDebuff(debuff);
    }
    
    addTurnEffect(effect) {
        this.turnEffects.push(effect);
        this.applyTurnEffect(effect);
    }
    
    applyBuff(buff) {
        switch (buff.type) {
            case 'damage':
                this.damage += buff.value;
                break;
            case 'health':
                this.maxHealth += buff.value;
                this.health += buff.value;
                break;
            case 'speed':
                this.speed += buff.value;
                break;
            case 'range':
                this.range += buff.value;
                break;
        }
    }
    
    applyDebuff(debuff) {
        switch (debuff.type) {
            case 'damage':
                this.damage = Math.max(1, this.damage - debuff.value);
                break;
            case 'speed':
                this.speed = Math.max(1, this.speed - debuff.value);
                break;
            case 'stun':
                this.isStunned = true;
                break;
        }
    }
    
    applyTurnEffect(effect) {
        switch (effect.type) {
            case 'heal':
                this.heal(effect.value);
                break;
            case 'damage':
                this.takeDamage(effect.value);
                break;
        }
    }
    
    removeBuff(buff) {
        switch (buff.type) {
            case 'damage':
                this.damage -= buff.value;
                break;
            case 'health':
                this.maxHealth -= buff.value;
                this.health = Math.min(this.health, this.maxHealth);
                break;
            case 'speed':
                this.speed -= buff.value;
                break;
            case 'range':
                this.range -= buff.value;
                break;
        }
    }
    
    removeDebuff(debuff) {
        switch (debuff.type) {
            case 'damage':
                this.damage += debuff.value;
                break;
            case 'speed':
                this.speed += debuff.value;
                break;
            case 'stun':
                this.isStunned = false;
                break;
        }
    }
    
    removeTurnEffect(effect) {
        // Turn effects are usually one-time, so no removal needed
    }
    
    getDistanceTo(target) {
        return Math.abs(this.x - target.x) + Math.abs(this.y - target.y);
    }
    
    isInRange(target) {
        return this.getDistanceTo(target) <= this.range;
    }
    
    canReach(target) {
        return this.getDistanceTo(target) <= this.speed;
    }
    
    getHealthPercentage() {
        return this.health / this.maxHealth;
    }
    
    isLowHealth() {
        return this.getHealthPercentage() < 0.5;
    }
    
    isCriticalHealth() {
        return this.getHealthPercentage() < 0.25;
    }
    
    // Special abilities based on traits
    useSpecialAbility(targets) {
        if (this.traits.includes('healing')) {
            return this.healAllies(targets);
        }
        
        if (this.traits.includes('fire_breath')) {
            return this.fireBreath(targets);
        }
        
        if (this.traits.includes('summoner')) {
            return this.summonMinions();
        }
        
        if (this.traits.includes('necromancer')) {
            return this.raiseDead();
        }
        
        return false;
    }
    
    healAllies(allies) {
        let healed = false;
        allies.forEach(ally => {
            if (ally.team === this.team && ally.health < ally.maxHealth) {
                ally.heal(2);
                healed = true;
            }
        });
        return healed;
    }
    
    fireBreath(targets) {
        let hit = false;
        targets.forEach(target => {
            if (target.team !== this.team) {
                target.takeDamage(Math.floor(this.damage * 0.7));
                hit = true;
            }
        });
        return hit;
    }
    
    summonMinions() {
        // This would be handled by the game logic
        return true;
    }
    
    raiseDead() {
        // This would be handled by the game logic
        return true;
    }
    
    // Visual representation
    getDisplayColor() {
        if (this.team === 'player') {
            return '#4ecdc4';
        } else {
            return '#ff6b6b';
        }
    }
    
    getDisplaySymbol() {
        switch (this.type) {
            case 'Warrior':
                return '⚔️';
            case 'Archer':
                return '🏹';
            case 'Knight':
                return '🛡️';
            case 'Mage':
                return '🔮';
            case 'Enemy':
                return '👹';
            case 'Boss':
                return '🐉';
            default:
                return '⚔️';
        }
    }
    
    // Serialization for saving/loading
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            damage: this.damage,
            range: this.range,
            speed: this.speed,
            priority: this.priority,
            traits: this.traits,
            x: this.x,
            y: this.y,
            team: this.team,
            buffs: this.buffs,
            debuffs: this.debuffs
        };
    }
    
    static fromJSON(data) {
        const unit = new Unit({
            name: data.name,
            type: data.type,
            health: data.maxHealth,
            damage: data.damage,
            range: data.range,
            speed: data.speed,
            priority: data.priority,
            behavior: { primary: 'seek_nearest_enemy', secondary: 'attack_nearest' },
            traits: data.traits,
            cost: 0
        }, data.x, data.y, data.team);
        
        unit.health = data.health;
        unit.buffs = data.buffs || [];
        unit.debuffs = data.debuffs || [];
        
        return unit;
    }
}