class Game {
    constructor() {
        this.wave = 1;
        this.turn = 1;
        this.energy = 3;
        this.maxEnergy = 3;
        this.gameState = 'player_turn'; // 'player_turn', 'combat_turn', 'wave_complete', 'game_over'
        
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        
        this.enemyDeck = [];
        this.enemyHand = [];
        this.enemyDiscardPile = [];
        
        this.playerUnits = [];
        this.enemyUnits = [];
        
        this.battlefield = null;
        this.cardManager = null;
        this.ai = null;
        
        this.battleLog = [];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.battlefield = new Battlefield(8, 8);
        this.cardManager = new CardManager();
        this.ai = new AI();
        
        // Initialize starting deck
        this.deck = this.cardManager.getStartingDeck();
        this.shuffleDeck();
        
        this.enemyDeck = this.cardManager.getStartingDeck();
        this.shuffleEnemyDeck();
        this.enemyHand = [];
        this.enemyDiscardPile = [];
        
        // Draw initial hand
        this.drawCards(2);
        this.drawEnemyCards(2);
        
        this.updateUI();
        this.logMessage("Game started! Deploy your units and defeat the enemies.");
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) {
                this.reshuffleDiscard();
            }
            
            if (this.deck.length > 0) {
                const card = this.deck.pop();
                this.hand.push(card);
            }
        }
        this.updateUI();
    }
    
    reshuffleDiscard() {
        if (this.discardPile.length > 0) {
            this.deck = [...this.discardPile];
            this.discardPile = [];
            this.shuffleDeck();
            this.logMessage("Deck reshuffled!");
        }
    }
    
    playCard(cardIndex, x, y) {
        if (cardIndex < 0 || cardIndex >= this.hand.length) return false;
        
        const card = this.hand[cardIndex];
        
        // Check energy cost
        if (this.energy < card.cost) {
            this.logMessage("Not enough energy to play this card!");
            return false;
        }
        
        // Check if position is valid
        if (!this.battlefield.isValidPosition(x, y) || this.battlefield.getUnit(x, y)) {
            this.logMessage("Invalid position for unit placement!");
            return false;
        }
        
        // Create and place unit
        const unit = new Unit(card, x, y, 'player');
        this.playerUnits.push(unit);
        this.battlefield.placeUnit(unit, x, y);
        
        // Pay energy cost
        this.energy -= card.cost;
        
        // Remove card from hand
        this.hand.splice(cardIndex, 1);
        
        this.logMessage(`${card.name} deployed at (${x}, ${y})`);
        this.updateUI();
        
        return true;
    }
    
    endPlayerTurn() {
        if (this.gameState !== 'player_turn') return;
        
        this.gameState = 'combat_turn';
        this.logMessage("Combat phase begins!");
        
        // Enemy deploys units from hand
        this.enemyDeployUnits();
        // Execute combat
        this.executeCombat();
        // Check victory conditions
        this.checkVictoryConditions();
    }
    
    spawnEnemies() {
        const enemyCount = Math.min(3 + this.wave, 8); // Scale with wave, max 8 enemies
        
        for (let i = 0; i < enemyCount; i++) {
            const enemyCard = this.cardManager.getRandomEnemy(this.wave);
            const spawnPosition = this.getRandomSpawnPosition();
            
            if (spawnPosition) {
                const enemy = new Unit(enemyCard, spawnPosition.x, spawnPosition.y, 'enemy');
                this.enemyUnits.push(enemy);
                this.battlefield.placeUnit(enemy, spawnPosition.x, spawnPosition.y);
                this.logMessage(`${enemyCard.name} spawned at (${spawnPosition.x}, ${spawnPosition.y})`);
            }
        }
    }
    
    enemyDeployUnits() {
        // Try to deploy up to 2 units from enemy hand to random spawn positions
        let deployed = 0;
        for (let i = this.enemyHand.length - 1; i >= 0 && deployed < 2; i--) {
            const card = this.enemyHand[i];
            const spawnPosition = this.getRandomSpawnPosition();
            if (spawnPosition) {
                const enemy = new Unit(card, spawnPosition.x, spawnPosition.y, 'enemy');
                this.enemyUnits.push(enemy);
                this.battlefield.placeUnit(enemy, spawnPosition.x, spawnPosition.y);
                this.logMessage(`${card.name} (enemy) deployed at (${spawnPosition.x}, ${spawnPosition.y})`);
                this.enemyHand.splice(i, 1);
                deployed++;
            }
        }
    }
    
    getRandomSpawnPosition() {
        const spawnPositions = [];
        
        // Spawn from edges
        for (let x = 0; x < 8; x++) {
            spawnPositions.push({x, y: 0}); // Top edge
            spawnPositions.push({x, y: 7}); // Bottom edge
        }
        for (let y = 1; y < 7; y++) {
            spawnPositions.push({x: 0, y}); // Left edge
            spawnPositions.push({x: 7, y}); // Right edge
        }
        
        // Filter out occupied positions
        const availablePositions = spawnPositions.filter(pos => 
            !this.battlefield.getUnit(pos.x, pos.y)
        );
        
        if (availablePositions.length === 0) return null;
        
        return availablePositions[Math.floor(Math.random() * availablePositions.length)];
    }
    
    async executeCombat() {
        // Sort units by priority (player units first, then enemies)
        const allUnits = [...this.playerUnits, ...this.enemyUnits];
        allUnits.sort((a, b) => {
            if (a.team !== b.team) return a.team === 'player' ? -1 : 1;
            return b.priority - a.priority;
        });
        // Execute actions for each unit, with animation delay
        for (const unit of allUnits) {
            if (unit.health <= 0) continue;
            const action = this.ai.getUnitAction(unit, this.battlefield, this.playerUnits, this.enemyUnits);
            await this.executeActionWithAnimation(unit, action);
        }
        // Remove dead units
        this.removeDeadUnits();
        // Increment turn
        this.turn++;
        // Reset for next player turn
        this.gameState = 'player_turn';
        this.energy = Math.min(this.maxEnergy + Math.floor(this.turn / 3), 6);
        this.drawCards(2);
        this.drawEnemyCards(2);
        this.logMessage("Your turn! Deploy units and end turn when ready.");
    }
    
    async executeActionWithAnimation(unit, action) {
        switch (action.type) {
            case 'move':
                await this.battlefield.animateUnitMove(unit, [
                    { x: unit.x, y: unit.y },
                    { x: action.targetX, y: action.targetY }
                ]);
                this.battlefield.moveUnit(unit, action.targetX, action.targetY);
                this.logMessage(`${unit.name} moved to (${action.targetX}, ${action.targetY})`);
                break;
            case 'attack':
                const target = this.battlefield.getUnit(action.targetX, action.targetY);
                if (target) {
                    await this.battlefield.animateAttack(unit, target);
                    const damage = this.calculateDamage(unit, target);
                    target.takeDamage(damage);
                    this.logMessage(`${unit.name} attacked ${target.name} for ${damage} damage!`);
                    if (target.health <= 0) {
                        this.logMessage(`${target.name} was defeated!`);
                    }
                }
                break;
            case 'wait':
                this.logMessage(`${unit.name} waited.`);
                break;
        }
        // Add a small delay between actions for animation pacing
        await new Promise(res => setTimeout(res, 200));
    }
    
    calculateDamage(attacker, defender) {
        let damage = attacker.damage;
        
        // Apply armor reduction
        if (defender.traits.includes('armor')) {
            damage = Math.max(1, damage - 1);
        }
        
        // Apply critical hits (10% chance)
        if (Math.random() < 0.1) {
            damage = Math.floor(damage * 1.5);
            this.logMessage("Critical hit!");
        }
        
        return damage;
    }
    
    removeDeadUnits() {
        this.playerUnits = this.playerUnits.filter(unit => {
            if (unit.health <= 0) {
                this.battlefield.removeUnit(unit.x, unit.y);
                return false;
            }
            return true;
        });
        
        this.enemyUnits = this.enemyUnits.filter(unit => {
            if (unit.health <= 0) {
                this.battlefield.removeUnit(unit.x, unit.y);
                return false;
            }
            return true;
        });
    }
    
    checkVictoryConditions() {
        if (this.playerUnits.length === 0) {
            this.gameOver('defeat');
            return;
        }
        
        if (this.enemyUnits.length === 0) {
            this.waveComplete();
            return;
        }
    }
    
    waveComplete() {
        this.gameState = 'wave_complete';
        this.logMessage(`Wave ${this.wave} completed!`);
        
        // Show card selection
        this.showCardSelection();
    }
    
    showCardSelection() {
        const cardOptions = this.cardManager.getCardOptions(this.wave);
        const modal = document.getElementById('card-selection-modal');
        const optionsContainer = document.getElementById('card-options');
        
        optionsContainer.innerHTML = '';
        
        cardOptions.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.addEventListener('click', () => {
                this.selectCard(card);
                modal.classList.add('hidden');
            });
            optionsContainer.appendChild(cardElement);
        });
        
        modal.classList.remove('hidden');
    }
    
    selectCard(card) {
        this.deck.push(card);
        this.logMessage(`Added ${card.name} to your deck!`);
        
        this.wave++;
        this.gameState = 'player_turn';
        this.energy = this.maxEnergy;
        
        // Check for boss wave
        if (this.wave % 5 === 0) {
            this.logMessage("Boss wave incoming!");
        }
        
        this.updateUI();
    }
    
    gameOver(result) {
        this.gameState = 'game_over';
        
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        
        if (result === 'victory') {
            title.textContent = 'Victory!';
            message.textContent = `Congratulations! You survived ${this.wave} waves!`;
        } else {
            title.textContent = 'Defeat';
            message.textContent = `You were defeated on wave ${this.wave}. Try again!`;
        }
        
        modal.classList.remove('hidden');
    }
    
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-stats">
                <div>HP: ${card.health}</div>
                <div>DMG: ${card.damage}</div>
                <div>Range: ${card.range}</div>
                <div>Type: ${card.type}</div>
            </div>
        `;
        return cardElement;
    }
    
    updateUI() {
        // Update stats
        document.getElementById('wave-number').textContent = this.wave;
        document.getElementById('energy').textContent = this.energy;
        document.getElementById('unit-count').textContent = this.playerUnits.length;
        document.getElementById('turn-number').textContent = this.turn;
        document.getElementById('enemies-remaining').textContent = this.enemyUnits.length;
        document.getElementById('deck-count').textContent = this.deck.length;
        
        // Update hand
        const handContainer = document.getElementById('hand');
        handContainer.innerHTML = '';
        
        this.hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.addEventListener('click', () => {
                this.selectCardForPlacement(index);
            });
            handContainer.appendChild(cardElement);
        });
        
        // Update enemy hand
        const enemyHandContainer = document.getElementById('enemy-hand');
        enemyHandContainer.innerHTML = '';
        this.enemyHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.addEventListener('click', () => {
                // Enemy AI will handle deployment from their hand
            });
            enemyHandContainer.appendChild(cardElement);
        });
        
        // Update battle log
        const logContainer = document.getElementById('battle-log');
        logContainer.innerHTML = '';
        
        this.battleLog.slice(-10).forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.textContent = entry;
            logContainer.appendChild(logEntry);
        });
        
        // Update battlefield
        this.battlefield.render();
    }
    
    selectCardForPlacement(cardIndex) {
        // Clear previous selection
        document.querySelectorAll('.card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new card
        const cards = document.querySelectorAll('#hand .card');
        if (cards[cardIndex]) {
            cards[cardIndex].classList.add('selected');
        }
        
        // Set up battlefield click handler
        this.battlefield.setPlacementMode(cardIndex, this);
    }
    
    logMessage(message) {
        this.battleLog.push(`[Turn ${this.turn}] ${message}`);
        if (this.battleLog.length > 50) {
            this.battleLog.shift();
        }
    }
    
    restart() {
        // Reset game state
        this.wave = 1;
        this.turn = 1;
        this.energy = 3;
        this.maxEnergy = 3;
        this.gameState = 'player_turn';
        
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        this.enemyDeck = [];
        this.enemyHand = [];
        this.enemyDiscardPile = [];
        this.playerUnits = [];
        this.enemyUnits = [];
        this.battleLog = [];
        
        // Hide modals
        document.getElementById('card-selection-modal').classList.add('hidden');
        document.getElementById('game-over-modal').classList.add('hidden');
        
        // Reinitialize
        this.initializeGame();
    }
}