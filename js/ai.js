class AI {
    constructor() {
        this.behaviorHandlers = {
            // Primary behaviors
            seek_nearest_enemy: this.seekNearestEnemy.bind(this),
            seek_toughest_enemy: this.seekToughestEnemy.bind(this),
            seek_closest_unit: this.seekClosestUnit.bind(this),
            target_farthest_enemy: this.targetFarthestEnemy.bind(this),
            target_weakest_enemy: this.targetWeakestEnemy.bind(this),
            hide_behind_allies: this.hideBehindAllies.bind(this),
            
            // Secondary behaviors
            protect_allies: this.protectAllies.bind(this),
            protect_vulnerable: this.protectVulnerable.bind(this),
            flee_from_threats: this.fleeFromThreats.bind(this),
            attack_nearest: this.attackNearest.bind(this),
            rage_mode: this.rageMode.bind(this),
            kite_enemies: this.kiteEnemies.bind(this),
            area_damage: this.areaDamage.bind(this),
            heal_allies: this.healAllies.bind(this),
            undead_resilience: this.undeadResilience.bind(this),
            breath_attack: this.breathAttack.bind(this),
            summon_minions: this.summonMinions.bind(this),
            raise_dead: this.raiseDead.bind(this)
        };
    }
    
    getUnitAction(unit, battlefield, playerUnits, enemyUnits) {
        // Reset unit state for new turn
        unit.resetTurn();
        
        // Get enemies and allies
        const enemies = unit.team === 'player' ? enemyUnits : playerUnits;
        const allies = unit.team === 'player' ? playerUnits : enemyUnits;
        
        if (enemies.length === 0) {
            return { type: 'wait' };
        }
        
        // Try primary behavior first
        const primaryAction = this.executeBehavior(unit.behavior.primary, unit, battlefield, enemies, allies);
        if (primaryAction) {
            return primaryAction;
        }
        
        // Try secondary behavior
        const secondaryAction = this.executeBehavior(unit.behavior.secondary, unit, battlefield, enemies, allies);
        if (secondaryAction) {
            return secondaryAction;
        }
        
        // Default: wait
        return { type: 'wait' };
    }
    
    executeBehavior(behaviorName, unit, battlefield, enemies, allies) {
        const handler = this.behaviorHandlers[behaviorName];
        if (handler) {
            return handler(unit, battlefield, enemies, allies);
        }
        return null;
    }
    
    // Primary Behaviors
    
    seekNearestEnemy(unit, battlefield, enemies, allies) {
        const nearestEnemy = this.findNearestEnemy(unit, enemies);
        if (!nearestEnemy) return null;
        
        // If in range, attack
        if (unit.isInRange(nearestEnemy)) {
            return { type: 'attack', targetX: nearestEnemy.x, targetY: nearestEnemy.y };
        }
        
        // Move towards enemy
        const moveAction = this.moveTowardsTarget(unit, battlefield, nearestEnemy);
        if (moveAction) {
            return moveAction;
        }
        
        return null;
    }
    
    seekToughestEnemy(unit, battlefield, enemies, allies) {
        const toughestEnemy = this.findToughestEnemy(enemies);
        if (!toughestEnemy) return null;
        
        // If in range, attack
        if (unit.isInRange(toughestEnemy)) {
            return { type: 'attack', targetX: toughestEnemy.x, targetY: toughestEnemy.y };
        }
        
        // Move towards enemy
        const moveAction = this.moveTowardsTarget(unit, battlefield, toughestEnemy);
        if (moveAction) {
            return moveAction;
        }
        
        return null;
    }
    
    seekClosestUnit(unit, battlefield, enemies, allies) {
        const allUnits = [...enemies, ...allies];
        const nearestUnit = this.findNearestEnemy(unit, allUnits);
        if (!nearestUnit) return null;
        
        // If in range, attack
        if (unit.isInRange(nearestUnit)) {
            return { type: 'attack', targetX: nearestUnit.x, targetY: nearestUnit.y };
        }
        
        // Move towards unit
        const moveAction = this.moveTowardsTarget(unit, battlefield, nearestUnit);
        if (moveAction) {
            return moveAction;
        }
        
        return null;
    }
    
    targetFarthestEnemy(unit, battlefield, enemies, allies) {
        const farthestEnemy = this.findFarthestEnemy(unit, enemies);
        if (!farthestEnemy) return null;
        
        // If in range, attack
        if (unit.isInRange(farthestEnemy)) {
            return { type: 'attack', targetX: farthestEnemy.x, targetY: farthestEnemy.y };
        }
        
        // Move towards enemy
        const moveAction = this.moveTowardsTarget(unit, battlefield, farthestEnemy);
        if (moveAction) {
            return moveAction;
        }
        
        return null;
    }
    
    targetWeakestEnemy(unit, battlefield, enemies, allies) {
        const weakestEnemy = this.findWeakestEnemy(enemies);
        if (!weakestEnemy) return null;
        
        // If in range, attack
        if (unit.isInRange(weakestEnemy)) {
            return { type: 'attack', targetX: weakestEnemy.x, targetY: weakestEnemy.y };
        }
        
        // Move towards enemy
        const moveAction = this.moveTowardsTarget(unit, battlefield, weakestEnemy);
        if (moveAction) {
            return moveAction;
        }
        
        return null;
    }
    
    hideBehindAllies(unit, battlefield, enemies, allies) {
        // Find a safe position behind allies
        const safePosition = this.findSafePosition(unit, battlefield, enemies, allies);
        if (safePosition) {
            return { type: 'move', targetX: safePosition.x, targetY: safePosition.y };
        }
        
        // If no safe position, try to attack from current position
        const nearestEnemy = this.findNearestEnemy(unit, enemies);
        if (nearestEnemy && unit.isInRange(nearestEnemy)) {
            return { type: 'attack', targetX: nearestEnemy.x, targetY: nearestEnemy.y };
        }
        
        return null;
    }
    
    // Secondary Behaviors
    
    protectAllies(unit, battlefield, enemies, allies) {
        // Find vulnerable allies
        const vulnerableAlly = allies.find(ally => 
            ally.health < ally.maxHealth * 0.5 && 
            ally.getDistanceTo(unit) <= unit.speed
        );
        
        if (vulnerableAlly) {
            // Move to protect ally
            const moveAction = this.moveTowardsTarget(unit, battlefield, vulnerableAlly);
            if (moveAction) {
                return moveAction;
            }
        }
        
        return null;
    }
    
    protectVulnerable(unit, battlefield, enemies, allies) {
        // Find the most vulnerable ally
        const vulnerableAlly = allies.reduce((mostVulnerable, ally) => {
            if (!mostVulnerable || ally.getHealthPercentage() < mostVulnerable.getHealthPercentage()) {
                return ally;
            }
            return mostVulnerable;
        }, null);
        
        if (vulnerableAlly && vulnerableAlly.getHealthPercentage() < 0.7) {
            // Move to protect vulnerable ally
            const moveAction = this.moveTowardsTarget(unit, battlefield, vulnerableAlly);
            if (moveAction) {
                return moveAction;
            }
        }
        
        return null;
    }
    
    fleeFromThreats(unit, battlefield, enemies, allies) {
        // Check if there are nearby threats
        const nearbyThreats = enemies.filter(enemy => 
            unit.getDistanceTo(enemy) <= 2
        );
        
        if (nearbyThreats.length > 0) {
            // Find a safe position away from threats
            const safePosition = this.findSafePosition(unit, battlefield, enemies, allies);
            if (safePosition) {
                return { type: 'move', targetX: safePosition.x, targetY: safePosition.y };
            }
        }
        
        return null;
    }
    
    attackNearest(unit, battlefield, enemies, allies) {
        const nearestEnemy = this.findNearestEnemy(unit, enemies);
        if (nearestEnemy && unit.isInRange(nearestEnemy)) {
            return { type: 'attack', targetX: nearestEnemy.x, targetY: nearestEnemy.y };
        }
        
        return null;
    }
    
    rageMode(unit, battlefield, enemies, allies) {
        // When health is low, become more aggressive
        if (unit.isLowHealth()) {
            const nearestEnemy = this.findNearestEnemy(unit, enemies);
            if (nearestEnemy) {
                if (unit.isInRange(nearestEnemy)) {
                    return { type: 'attack', targetX: nearestEnemy.x, targetY: nearestEnemy.y };
                } else {
                    const moveAction = this.moveTowardsTarget(unit, battlefield, nearestEnemy);
                    if (moveAction) {
                        return moveAction;
                    }
                }
            }
        }
        
        return null;
    }
    
    kiteEnemies(unit, battlefield, enemies, allies) {
        // Move away from enemies while staying in attack range
        const nearestEnemy = this.findNearestEnemy(unit, enemies);
        if (!nearestEnemy) return null;
        
        const distance = unit.getDistanceTo(nearestEnemy);
        
        if (distance <= unit.range && distance > 1) {
            // In good position, attack
            return { type: 'attack', targetX: nearestEnemy.x, targetY: nearestEnemy.y };
        } else if (distance <= 1) {
            // Too close, move away
            const retreatPosition = this.findRetreatPosition(unit, battlefield, nearestEnemy);
            if (retreatPosition) {
                return { type: 'move', targetX: retreatPosition.x, targetY: retreatPosition.y };
            }
        }
        
        return null;
    }
    
    areaDamage(unit, battlefield, enemies, allies) {
        // Find position to hit multiple enemies
        const bestPosition = this.findBestAreaDamagePosition(unit, battlefield, enemies);
        if (bestPosition && (bestPosition.x !== unit.x || bestPosition.y !== unit.y)) {
            return { type: 'move', targetX: bestPosition.x, targetY: bestPosition.y };
        }
        
        // Attack if in range
        const nearestEnemy = this.findNearestEnemy(unit, enemies);
        if (nearestEnemy && unit.isInRange(nearestEnemy)) {
            return { type: 'attack', targetX: nearestEnemy.x, targetY: nearestEnemy.y };
        }
        
        return null;
    }
    
    healAllies(unit, battlefield, enemies, allies) {
        // Find injured allies
        const injuredAlly = allies.find(ally => 
            ally.health < ally.maxHealth && 
            unit.getDistanceTo(ally) <= 2
        );
        
        if (injuredAlly) {
            // Use healing ability
            return { type: 'special', targetX: injuredAlly.x, targetY: injuredAlly.y };
        }
        
        return null;
    }
    
    undeadResilience(unit, battlefield, enemies, allies) {
        // Undead units are more resilient and can continue fighting
        const nearestEnemy = this.findNearestEnemy(unit, enemies);
        if (nearestEnemy && unit.isInRange(nearestEnemy)) {
            return { type: 'attack', targetX: nearestEnemy.x, targetY: nearestEnemy.y };
        }
        
        return null;
    }
    
    breathAttack(unit, battlefield, enemies, allies) {
        // Dragon breath attack hits multiple enemies
        const enemiesInRange = enemies.filter(enemy => unit.isInRange(enemy));
        if (enemiesInRange.length > 0) {
            const target = enemiesInRange[0];
            return { type: 'special', targetX: target.x, targetY: target.y };
        }
        
        return null;
    }
    
    summonMinions(unit, battlefield, enemies, allies) {
        // Summon minions if no allies nearby
        const nearbyAllies = allies.filter(ally => unit.getDistanceTo(ally) <= 2);
        if (nearbyAllies.length === 0) {
            return { type: 'special', targetX: unit.x, targetY: unit.y };
        }
        
        return null;
    }
    
    raiseDead(unit, battlefield, enemies, allies) {
        // Raise dead if there are dead units nearby
        return { type: 'special', targetX: unit.x, targetY: unit.y };
    }
    
    // Helper Methods
    
    findNearestEnemy(unit, enemies) {
        return enemies.reduce((nearest, enemy) => {
            if (!nearest || unit.getDistanceTo(enemy) < unit.getDistanceTo(nearest)) {
                return enemy;
            }
            return nearest;
        }, null);
    }
    
    findFarthestEnemy(unit, enemies) {
        return enemies.reduce((farthest, enemy) => {
            if (!farthest || unit.getDistanceTo(enemy) > unit.getDistanceTo(farthest)) {
                return enemy;
            }
            return farthest;
        }, null);
    }
    
    findToughestEnemy(enemies) {
        return enemies.reduce((toughest, enemy) => {
            if (!toughest || enemy.health > toughest.health) {
                return enemy;
            }
            return toughest;
        }, null);
    }
    
    findWeakestEnemy(enemies) {
        return enemies.reduce((weakest, enemy) => {
            if (!weakest || enemy.health < weakest.health) {
                return enemy;
            }
            return weakest;
        }, null);
    }
    
    moveTowardsTarget(unit, battlefield, target) {
        if (!unit.canMove()) return null;
        
        const path = battlefield.findPath(unit.x, unit.y, target.x, target.y);
        if (path && path.length > 1) {
            const nextStep = path[1]; // Skip current position
            if (unit.getDistanceTo(target) > unit.range) {
                return { type: 'move', targetX: nextStep.x, targetY: nextStep.y };
            }
        }
        
        return null;
    }
    
    findSafePosition(unit, battlefield, enemies, allies) {
        const emptyPositions = battlefield.getEmptyPositions();
        let bestPosition = null;
        let bestScore = -Infinity;
        
        for (const pos of emptyPositions) {
            const score = this.calculatePositionSafety(pos, unit, enemies, allies);
            if (score > bestScore) {
                bestScore = score;
                bestPosition = pos;
            }
        }
        
        return bestPosition;
    }
    
    calculatePositionSafety(position, unit, enemies, allies) {
        let score = 0;
        
        // Prefer positions near allies
        allies.forEach(ally => {
            const distance = Math.abs(position.x - ally.x) + Math.abs(position.y - ally.y);
            if (distance <= 2) {
                score += 10 - distance;
            }
        });
        
        // Avoid positions near enemies
        enemies.forEach(enemy => {
            const distance = Math.abs(position.x - enemy.x) + Math.abs(position.y - enemy.y);
            if (distance <= 2) {
                score -= 20 - distance * 5;
            }
        });
        
        // Prefer positions that maintain attack range
        enemies.forEach(enemy => {
            const distance = Math.abs(position.x - enemy.x) + Math.abs(position.y - enemy.y);
            if (distance <= unit.range) {
                score += 5;
            }
        });
        
        return score;
    }
    
    findRetreatPosition(unit, battlefield, threat) {
        const emptyPositions = battlefield.getEmptyPositions();
        let bestPosition = null;
        let bestDistance = 0;
        
        for (const pos of emptyPositions) {
            const distance = Math.abs(pos.x - threat.x) + Math.abs(pos.y - threat.y);
            if (distance > bestDistance) {
                bestDistance = distance;
                bestPosition = pos;
            }
        }
        
        return bestPosition;
    }
    
    findBestAreaDamagePosition(unit, battlefield, enemies) {
        const emptyPositions = battlefield.getEmptyPositions();
        let bestPosition = null;
        let bestEnemyCount = 0;
        
        for (const pos of emptyPositions) {
            const enemiesInRange = enemies.filter(enemy => {
                const distance = Math.abs(pos.x - enemy.x) + Math.abs(pos.y - enemy.y);
                return distance <= unit.range;
            });
            
            if (enemiesInRange.length > bestEnemyCount) {
                bestEnemyCount = enemiesInRange.length;
                bestPosition = pos;
            }
        }
        
        return bestPosition;
    }
}