# Abstract Warfare - Tower Defense

A browser-based 2D tower defense game with a minimalist "Abstract Warfare" theme featuring geometric shapes and smooth animations.

## 🎮 Game Overview

Defend your core from waves of geometric invaders! Place hexagonal towers strategically on the grid to stop circles, triangles, and squares from reaching the end of the path.

## ✨ Features

### Core Gameplay
- **10x10 Grid System**: Strategic placement on a checkerboard-style grid
- **Path-Based Enemies**: Enemies follow a predefined path marked in yellow
- **Tower Placement**: Place up to 5 hexagonal towers on non-path tiles
- **Wave System**: Progressive difficulty with increasing enemy counts
- **Core Health**: Lose HP when enemies reach the end

### Enemy Types
- **🔴 Circle**: Basic enemy - balanced health and speed
- **🔵 Triangle**: Fast enemy - lower health, higher speed
- **🔷 Square**: Tank enemy - high health, slow speed

### Tower Mechanics
- **Hexagonal Design**: Distinctive geometric tower appearance
- **Automatic Targeting**: Towers automatically target nearest enemies in range
- **Projectile System**: Visual projectiles with trail effects
- **Range & Damage**: Configurable attack range and damage values

### Visual Effects
- **Smooth Animations**: 60 FPS game loop with requestAnimationFrame
- **Death Animations**: Enemies shrink and fade when destroyed
- **Projectile Trails**: Visual trails behind moving projectiles
- **Hover Effects**: Visual feedback when placing towers
- **Health Bars**: Dynamic health indicators on enemies

### UI Elements
- **Game Information**: Wave number, enemies remaining, core HP, towers placed
- **Control Buttons**: Start wave and reset game functionality
- **Overlay System**: Instructional overlays for game phases
- **Responsive Design**: Works on different screen sizes

## 🚀 How to Play

1. **Place Towers**: Click on non-path tiles (gray areas) to place hexagonal towers
2. **Start Wave**: Click "Start Wave" when ready to begin the attack
3. **Defend**: Watch your towers automatically target and destroy enemies
4. **Survive**: Prevent enemies from reaching the end of the path
5. **Progress**: Complete waves to advance to higher difficulties

## 🛠️ Technical Implementation

### Architecture
- **Modular Design**: Separate classes for Game, Enemy, Tower, and Projectile
- **Object-Oriented**: Clean separation of concerns and responsibilities
- **Canvas Rendering**: Pure HTML5 Canvas with no external dependencies
- **Event-Driven**: Mouse and keyboard input handling

### Game Loop
- **60 FPS**: Smooth animation using requestAnimationFrame
- **Tick-Based**: Consistent timing for game logic updates
- **State Management**: Clear game states (prep, wave, gameOver)

### Performance
- **Efficient Rendering**: Only draw what's visible and necessary
- **Memory Management**: Proper cleanup of dead enemies and expired projectiles
- **Smooth Animations**: Hardware-accelerated canvas operations

## 📁 File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling and animations
├── js/
│   ├── Game.js         # Main game controller
│   ├── Enemy.js        # Enemy class and behavior
│   ├── Tower.js        # Tower class and targeting
│   ├── Projectile.js   # Projectile physics and rendering
│   └── main.js         # Game initialization
└── README.md           # This file
```

## 🎯 Game Mechanics

### Scoring & Progression
- **Waves**: Each wave increases enemy count and difficulty
- **Health System**: Core starts with 100 HP, loses 10 per enemy that reaches the end
- **Tower Limit**: Maximum 5 towers per game
- **Enemy Scaling**: Health and speed increase with wave number

### Strategy Elements
- **Path Analysis**: Study the yellow path to place towers strategically
- **Range Coverage**: Position towers to cover multiple path segments
- **Enemy Prioritization**: Towers automatically target closest enemies
- **Resource Management**: Limited tower placements require careful planning

## 🔧 Customization

The game is designed to be easily expandable:

### Adding New Enemy Types
```javascript
// In Enemy.js constructor, add new case:
case 'newType':
    this.health = 75;
    this.speed = 0.025;
    this.size = 16;
    this.color = '#newColor';
    break;
```

### Adding New Tower Types
```javascript
// Create new tower class or extend existing Tower class
class NewTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.range = 100;
        this.damage = 35;
        // Custom properties
    }
}
```

### Modifying Game Balance
- Adjust enemy health, speed, and spawn rates in `Enemy.js`
- Modify tower damage, range, and cooldown in `Tower.js`
- Change wave progression in `Game.js`

## 🌟 Future Enhancements

Potential additions for future versions:
- **Tower Upgrades**: Click towers to upgrade damage/range
- **Multiple Tower Types**: Different tower shapes and abilities
- **Sound Effects**: Audio feedback using Web Audio API
- **Particle Effects**: Enhanced visual feedback
- **Multiple Maps**: Different path layouts
- **Power-ups**: Special abilities and bonuses
- **High Score System**: Local storage for best scores

## 🎨 Design Philosophy

The game embraces minimalism and abstraction:
- **Geometric Shapes**: All game elements use basic shapes
- **Color Coding**: Distinct colors for different enemy types
- **Clean UI**: Uncluttered interface with essential information
- **Smooth Animations**: Polished feel without overwhelming effects

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. The game will automatically load and display instructions
3. Click on gray tiles to place towers
4. Click "Start Wave" to begin gameplay
5. Enjoy defending against geometric invaders!

## 📱 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

Requires a modern browser with HTML5 Canvas support.

---

**Abstract Warfare Tower Defense** - Where geometry meets strategy! 🎮
