class CardManager {
    constructor() {
        this.unitCards = this.initializeUnitCards();
        this.enemyCards = this.initializeEnemyCards();
        this.bossCards = this.initializeBossCards();
    }
    
    initializeUnitCards() {
        return {
            // Basic Units
            warrior: {
                name: "Warrior",
                type: "Warrior",
                health: 8,
                damage: 3,
                range: 1,
                speed: 1,
                priority: 3,
                behavior: {
                    primary: "seek_nearest_enemy",
                    secondary: "protect_allies"
                },
                traits: ["tough"],
                cost: 1,
                description: "A basic melee fighter"
            },
            
            archer: {
                name: "Archer",
                type: "Archer",
                health: 5,
                damage: 4,
                range: 3,
                speed: 1,
                priority: 2,
                behavior: {
                    primary: "target_farthest_enemy",
                    secondary: "flee_from_threats"
                },
                traits: ["ranged"],
                cost: 2,
                description: "Ranged attacker with good damage"
            },
            
            knight: {
                name: "Knight",
                type: "Knight",
                health: 12,
                damage: 3,
                range: 1,
                speed: 1,
                priority: 4,
                behavior: {
                    primary: "seek_toughest_enemy",
                    secondary: "protect_vulnerable"
                },
                traits: ["armor", "taunt"],
                cost: 3,
                description: "Tanky unit that draws enemy attention"
            },
            
            mage: {
                name: "Mage",
                type: "Mage",
                health: 4,
                damage: 5,
                range: 2,
                speed: 1,
                priority: 1,
                behavior: {
                    primary: "hide_behind_allies",
                    secondary: "target_weakest_enemy"
                },
                traits: ["magic"],
                cost: 2,
                description: "Powerful but fragile spellcaster"
            },
            
            // Advanced Units
            paladin: {
                name: "Paladin",
                type: "Knight",
                health: 15,
                damage: 4,
                range: 1,
                speed: 1,
                priority: 5,
                behavior: {
                    primary: "seek_toughest_enemy",
                    secondary: "heal_allies"
                },
                traits: ["armor", "healing"],
                cost: 4,
                description: "Holy warrior with healing abilities"
            },
            
            ranger: {
                name: "Ranger",
                type: "Archer",
                health: 7,
                damage: 5,
                range: 4,
                speed: 2,
                priority: 2,
                behavior: {
                    primary: "target_farthest_enemy",
                    secondary: "kite_enemies"
                },
                traits: ["ranged", "mobile"],
                cost: 3,
                description: "Mobile archer with extended range"
            },
            
            berserker: {
                name: "Berserker",
                type: "Warrior",
                health: 10,
                damage: 6,
                range: 1,
                speed: 2,
                priority: 3,
                behavior: {
                    primary: "seek_nearest_enemy",
                    secondary: "rage_mode"
                },
                traits: ["frenzy"],
                cost: 3,
                description: "High damage dealer that gets stronger when hurt"
            },
            
            wizard: {
                name: "Wizard",
                type: "Mage",
                health: 6,
                damage: 7,
                range: 3,
                speed: 1,
                priority: 1,
                behavior: {
                    primary: "target_weakest_enemy",
                    secondary: "area_damage"
                },
                traits: ["magic", "aoe"],
                cost: 4,
                description: "Powerful mage with area damage"
            }
        };
    }
    
    initializeEnemyCards() {
        return {
            goblin: {
                name: "Goblin",
                type: "Enemy",
                health: 4,
                damage: 2,
                range: 1,
                speed: 1,
                priority: 2,
                behavior: {
                    primary: "seek_closest_unit",
                    secondary: "attack_nearest"
                },
                traits: ["swarm"],
                cost: 0,
                description: "Weak but numerous enemy"
            },
            
            orc: {
                name: "Orc",
                type: "Enemy",
                health: 8,
                damage: 4,
                range: 1,
                speed: 1,
                priority: 3,
                behavior: {
                    primary: "seek_toughest_enemy",
                    secondary: "rage_mode"
                },
                traits: ["tough"],
                cost: 0,
                description: "Strong melee enemy"
            },
            
            skeleton: {
                name: "Skeleton",
                type: "Enemy",
                health: 6,
                damage: 3,
                range: 1,
                speed: 1,
                priority: 2,
                behavior: {
                    primary: "seek_nearest_enemy",
                    secondary: "undead_resilience"
                },
                traits: ["undead"],
                cost: 0,
                description: "Undead warrior that's hard to kill"
            },
            
            dark_mage: {
                name: "Dark Mage",
                type: "Enemy",
                health: 5,
                damage: 5,
                range: 2,
                speed: 1,
                priority: 1,
                behavior: {
                    primary: "target_weakest_enemy",
                    secondary: "hide_behind_allies"
                },
                traits: ["magic"],
                cost: 0,
                description: "Enemy spellcaster"
            }
        };
    }
    
    initializeBossCards() {
        return {
            dragon: {
                name: "Dragon",
                type: "Boss",
                health: 25,
                damage: 8,
                range: 2,
                speed: 1,
                priority: 5,
                behavior: {
                    primary: "seek_toughest_enemy",
                    secondary: "breath_attack"
                },
                traits: ["flying", "fire_breath"],
                cost: 0,
                description: "Powerful dragon with area attacks"
            },
            
            demon_lord: {
                name: "Demon Lord",
                type: "Boss",
                health: 30,
                damage: 6,
                range: 1,
                speed: 2,
                priority: 5,
                behavior: {
                    primary: "seek_nearest_enemy",
                    secondary: "summon_minions"
                },
                traits: ["demonic", "summoner"],
                cost: 0,
                description: "Demon that summons minions"
            },
            
            lich: {
                name: "Lich",
                type: "Boss",
                health: 20,
                damage: 7,
                range: 3,
                speed: 1,
                priority: 1,
                behavior: {
                    primary: "target_weakest_enemy",
                    secondary: "raise_dead"
                },
                traits: ["undead", "necromancer"],
                cost: 0,
                description: "Undead master that raises skeletons"
            }
        };
    }
    
    getStartingDeck() {
        return [
            this.unitCards.warrior,
            this.unitCards.warrior,
            this.unitCards.archer,
            this.unitCards.knight,
            this.unitCards.mage
        ];
    }
    
    getRandomEnemy(wave) {
        const enemies = Object.values(this.enemyCards);
        const enemy = enemies[Math.floor(Math.random() * enemies.length)];
        
        // Scale enemy stats with wave
        return this.scaleCardForWave(enemy, wave);
    }
    
    getBossForWave(wave) {
        const bosses = Object.values(this.bossCards);
        const boss = bosses[Math.floor(Math.random() * bosses.length)];
        
        // Bosses are already strong, scale less
        return this.scaleCardForWave(boss, Math.floor(wave / 5));
    }
    
    scaleCardForWave(card, wave) {
        const scaledCard = { ...card };
        
        // Scale health and damage based on wave
        const healthScale = 1 + (wave - 1) * 0.2;
        const damageScale = 1 + (wave - 1) * 0.1;
        
        scaledCard.health = Math.floor(card.health * healthScale);
        scaledCard.damage = Math.floor(card.damage * damageScale);
        
        return scaledCard;
    }
    
    getCardOptions(wave) {
        const allCards = Object.values(this.unitCards);
        const options = [];
        
        // Select 3 random cards
        for (let i = 0; i < 3; i++) {
            const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
            options.push({ ...randomCard });
        }
        
        // Add wave-specific cards for higher waves
        if (wave >= 3) {
            const advancedCards = [
                this.unitCards.paladin,
                this.unitCards.ranger,
                this.unitCards.berserker,
                this.unitCards.wizard
            ];
            
            const advancedCard = advancedCards[Math.floor(Math.random() * advancedCards.length)];
            options[Math.floor(Math.random() * options.length)] = { ...advancedCard };
        }
        
        return options;
    }
    
    getCardByName(name) {
        const allCards = { ...this.unitCards, ...this.enemyCards, ...this.bossCards };
        return allCards[name] || null;
    }
    
    getAllCards() {
        return {
            ...this.unitCards,
            ...this.enemyCards,
            ...this.bossCards
        };
    }
    
    // Card upgrade system
    upgradeCard(card, upgradeType) {
        const upgradedCard = { ...card };
        
        switch (upgradeType) {
            case 'health':
                upgradedCard.health += 2;
                break;
            case 'damage':
                upgradedCard.damage += 1;
                break;
            case 'range':
                upgradedCard.range += 1;
                break;
            case 'speed':
                upgradedCard.speed += 1;
                break;
            case 'cost_reduction':
                upgradedCard.cost = Math.max(1, upgradedCard.cost - 1);
                break;
        }
        
        return upgradedCard;
    }
    
    // Special card effects
    getCardEffect(card, effectType) {
        switch (effectType) {
            case 'healing':
                return card.traits.includes('healing') ? 2 : 0;
            case 'armor_bonus':
                return card.traits.includes('armor') ? 1 : 0;
            case 'rage_bonus':
                return card.traits.includes('frenzy') ? 2 : 0;
            case 'magic_bonus':
                return card.traits.includes('magic') ? 1 : 0;
            default:
                return 0;
        }
    }
}