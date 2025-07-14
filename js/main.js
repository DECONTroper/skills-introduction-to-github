// Global game instance
let game = null;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    game = new Game();
}

function setupEventListeners() {
    // End turn button
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.addEventListener('click', () => {
        if (game && game.gameState === 'player_turn') {
            game.endPlayerTurn();
        }
    });
    
    // View paths button
    const viewPathsBtn = document.getElementById('view-paths-btn');
    viewPathsBtn.addEventListener('click', () => {
        togglePathView();
    });
    
    // Restart button
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
        if (game) {
            game.restart();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        handleKeyboardInput(e);
    });
    
    // Card selection modal close
    const cardSelectionModal = document.getElementById('card-selection-modal');
    cardSelectionModal.addEventListener('click', (e) => {
        if (e.target === cardSelectionModal) {
            cardSelectionModal.classList.add('hidden');
        }
    });
    
    // Game over modal close
    const gameOverModal = document.getElementById('game-over-modal');
    gameOverModal.addEventListener('click', (e) => {
        if (e.target === gameOverModal) {
            gameOverModal.classList.add('hidden');
        }
    });
}

function handleKeyboardInput(e) {
    if (!game) return;
    
    switch (e.key) {
        case 'Enter':
        case ' ':
            if (game.gameState === 'player_turn') {
                game.endPlayerTurn();
            }
            e.preventDefault();
            break;
            
        case 'Escape':
            // Clear card selection
            document.querySelectorAll('.card.selected').forEach(card => {
                card.classList.remove('selected');
            });
            if (game.battlefield) {
                game.battlefield.exitPlacementMode();
            }
            break;
            
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            const cardIndex = parseInt(e.key) - 1;
            if (cardIndex < game.hand.length) {
                game.selectCardForPlacement(cardIndex);
            }
            break;
    }
}

function togglePathView() {
    if (!game || !game.battlefield) return;
    
    const viewPathsBtn = document.getElementById('view-paths-btn');
    const isViewingPaths = viewPathsBtn.classList.contains('active');
    
    if (isViewingPaths) {
        viewPathsBtn.classList.remove('active');
        viewPathsBtn.textContent = 'View Paths';
        // Hide path visualization
        game.battlefield.render();
    } else {
        viewPathsBtn.classList.add('active');
        viewPathsBtn.textContent = 'Hide Paths';
        // Show path visualization
        showPathVisualization();
    }
}

function showPathVisualization() {
    if (!game || !game.battlefield) return;
    
    // This would show enemy movement paths and attack ranges
    // For now, just highlight potential enemy spawn positions
    const canvas = game.battlefield.canvas;
    const ctx = game.battlefield.ctx;
    
    // Draw spawn position indicators
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.lineWidth = 3;
    
    // Top and bottom edges
    for (let x = 0; x < 8; x++) {
        ctx.strokeRect(x * 80 + 5, 5, 70, 70); // Top
        ctx.strokeRect(x * 80 + 5, 565, 70, 70); // Bottom
    }
    
    // Left and right edges
    for (let y = 1; y < 7; y++) {
        ctx.strokeRect(5, y * 80 + 5, 70, 70); // Left
        ctx.strokeRect(565, y * 80 + 5, 70, 70); // Right
    }
}

// Utility functions for debugging
function debugGame() {
    if (!game) return;
    
    console.log('=== Game Debug Info ===');
    console.log('Wave:', game.wave);
    console.log('Turn:', game.turn);
    console.log('Energy:', game.energy);
    console.log('Game State:', game.gameState);
    console.log('Player Units:', game.playerUnits.length);
    console.log('Enemy Units:', game.enemyUnits.length);
    console.log('Hand Size:', game.hand.length);
    console.log('Deck Size:', game.deck.length);
    
    console.log('Player Units:');
    game.playerUnits.forEach((unit, index) => {
        console.log(`  ${index}: ${unit.name} at (${unit.x}, ${unit.y}) - HP: ${unit.health}/${unit.maxHealth}`);
    });
    
    console.log('Enemy Units:');
    game.enemyUnits.forEach((unit, index) => {
        console.log(`  ${index}: ${unit.name} at (${unit.x}, ${unit.y}) - HP: ${unit.health}/${unit.maxHealth}`);
    });
}

// Add debug function to window for console access
window.debugGame = debugGame;

// Add cheat functions for testing
window.addEnergy = (amount = 3) => {
    if (game) {
        game.energy += amount;
        game.updateUI();
    }
};

window.drawCards = (count = 2) => {
    if (game) {
        game.drawCards(count);
    }
};

window.spawnEnemy = (enemyType = 'goblin') => {
    if (game && game.battlefield) {
        const cardManager = new CardManager();
        const enemyCard = cardManager.getCardByName(enemyType);
        if (enemyCard) {
            const spawnPos = game.getRandomSpawnPosition();
            if (spawnPos) {
                const enemy = new Unit(enemyCard, spawnPos.x, spawnPos.y, 'enemy');
                game.enemyUnits.push(enemy);
                game.battlefield.placeUnit(enemy, spawnPos.x, spawnPos.y);
                game.updateUI();
            }
        }
    }
};

// Performance monitoring
let lastFrameTime = 0;
function gameLoop(currentTime) {
    if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
    }
    
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    // Update animations or other time-based systems here
    if (game && game.battlefield) {
        // Update any animations
        updateAnimations(deltaTime);
    }
    
    requestAnimationFrame(gameLoop);
}

function updateAnimations(deltaTime) {
    // Update unit animations
    if (game) {
        game.playerUnits.forEach(unit => {
            if (unit.animationTimer > 0) {
                unit.animationTimer -= deltaTime;
            }
        });
        
        game.enemyUnits.forEach(unit => {
            if (unit.animationTimer > 0) {
                unit.animationTimer -= deltaTime;
            }
        });
    }
}

// Start the game loop
requestAnimationFrame(gameLoop);

// Add some helpful tips to the console
console.log(`
🎮 Roguelike Grid Battle Simulator Loaded!

Controls:
- Click cards in hand to select them for placement
- Click on the battlefield to place selected units
- Press 'End Turn' or Space/Enter to end your turn
- Press Escape to cancel card selection
- Press 1-5 to quickly select cards in hand

Debug Commands (in console):
- debugGame() - Show current game state
- addEnergy(amount) - Add energy (cheat)
- drawCards(count) - Draw extra cards (cheat)
- spawnEnemy(type) - Spawn an enemy (cheat)

Have fun playing! 🚀
`);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, Unit, Battlefield, AI, CardManager };
}