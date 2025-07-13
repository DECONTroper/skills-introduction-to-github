// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Create and start the game
    const game = new Game(canvas);
    
    // Make game globally accessible for debugging
    window.game = game;
    
    // Add some helpful console messages
    console.log('🎮 Abstract Warfare Tower Defense loaded!');
    console.log('📋 Instructions:');
    console.log('   - Click on non-path tiles to place towers');
    console.log('   - Click "Start Wave" to begin the attack');
    console.log('   - Defend your core from geometric invaders!');
    console.log('   - Enemy types: Circle (basic), Triangle (fast), Square (tank)');
    
    // Handle page visibility changes to pause/resume game
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden, could pause game here if needed
            console.log('Game paused (page hidden)');
        } else {
            // Page is visible again
            console.log('Game resumed (page visible)');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Could implement responsive canvas resizing here
        console.log('Window resized - consider implementing responsive canvas');
    });
});