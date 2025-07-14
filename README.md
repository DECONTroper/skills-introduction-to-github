<header>

<!--
  <<< Author notes: Course header >>>
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses MIT license.
-->

# Roguelike Grid Battle Simulator

A turn-based tactical roguelike game where you deploy unit cards onto an 8x8 grid battlefield and watch them fight automatically using AI behavior logic.

## 🎮 Game Concept

Deploy troops from your hand of cards onto the battlefield, then watch as they automatically engage enemies based on their unique AI behaviors. Victory depends on smart positioning, unit synergy, and strategic deck building.

## ⚙️ Core Mechanics

### Grid-Based Combat
- **8x8 Battlefield**: Strategic positioning on a grid
- **Turn-Based**: Player deployment phase followed by automatic combat
- **AI-Driven Units**: Each unit type has unique behavior patterns

### Card System
- **Unit Cards**: Represent deployable troops with stats and behaviors
- **Energy System**: Each card costs energy to play
- **Deck Building**: Add new cards after each wave
- **Hand Management**: Draw 2 cards per turn

### Combat System
- **Automatic Actions**: Units act based on their behavior logic
- **Range & Movement**: Different units have different attack ranges and movement
- **Health & Damage**: Classic RPG combat mechanics
- **Special Abilities**: Units have unique traits and abilities

## 🧠 Unit Behaviors

| Unit Type | Primary Behavior | Secondary Behavior |
|-----------|------------------|-------------------|
| Warrior | Seek nearest enemy | Protect allies |
| Knight | Seek toughest enemy | Protect vulnerable |
| Archer | Target farthest enemy | Flee from threats |
| Mage | Hide behind allies | Target weakest enemy |

## 🎴 Unit Types

### Basic Units
- **Warrior** (⚔️): Balanced melee fighter
- **Archer** (🏹): Ranged attacker
- **Knight** (🛡️): Tanky protector
- **Mage** (🔮): Fragile but powerful spellcaster

### Advanced Units
- **Paladin**: Holy warrior with healing
- **Ranger**: Mobile archer with extended range
- **Berserker**: High damage dealer with rage mechanics
- **Wizard**: Area damage specialist

### Enemies
- **Goblin**: Weak but numerous
- **Orc**: Strong melee enemy
- **Skeleton**: Undead with revival chance
- **Dark Mage**: Enemy spellcaster

### Bosses
- **Dragon**: Flying boss with breath attacks
- **Demon Lord**: Summons minions
- **Lich**: Undead master with necromancy

## 🎮 How to Play

1. **Deploy Units**: Click cards in your hand, then click on the battlefield to place them
2. **Manage Energy**: Each card costs energy to play
3. **End Turn**: Click "End Turn" to start the combat phase
4. **Watch Combat**: Units automatically move and attack based on their AI
5. **Survive Waves**: Defeat all enemies to advance to the next wave
6. **Build Your Deck**: Choose new cards after each wave

## 🎯 Victory Conditions

- **Victory**: Defeat all enemies in each wave
- **Defeat**: All your units are destroyed
- **Progression**: Survive multiple waves, face bosses every 5 waves

## 🚀 Features

- **Modern UI**: Beautiful, responsive design with animations
- **Smart AI**: Sophisticated behavior system for all units
- **Deck Building**: Roguelike progression with card collection
- **Wave System**: Increasing difficulty with boss encounters
- **Pathfinding**: Units intelligently navigate the battlefield
- **Special Effects**: Critical hits, armor, healing, and more

## 🎨 Technical Features

- **HTML5 Canvas**: Smooth rendering and animations
- **Modular Architecture**: Clean, maintainable code structure
- **Responsive Design**: Works on desktop and mobile
- **Debug Tools**: Built-in debugging and cheat functions

## 🎮 Controls

- **Mouse**: Click to select cards and place units
- **Space/Enter**: End turn
- **Escape**: Cancel card selection
- **1-5**: Quick card selection
- **View Paths**: See enemy spawn positions

## 🛠️ Development

### File Structure
```
├── index.html          # Main game page
├── styles.css          # Game styling
├── js/
│   ├── main.js         # Entry point and event handling
│   ├── game.js         # Main game logic
│   ├── cards.js        # Card management system
│   ├── units.js        # Unit class and mechanics
│   ├── battlefield.js  # Grid and rendering system
│   └── ai.js           # AI behavior system
```

### Debug Commands
Open the browser console and use:
- `debugGame()` - Show current game state
- `addEnergy(amount)` - Add energy (cheat)
- `drawCards(count)` - Draw extra cards (cheat)
- `spawnEnemy(type)` - Spawn an enemy (cheat)

## 🎯 Future Enhancements

- **Environmental Tiles**: Hazards, buffs, and cover
- **Card Scuttling**: Remove cards for energy
- **Unit Repositioning**: Move units after placement
- **Relic System**: Passive bonuses and upgrades
- **More Unit Types**: Additional classes and abilities
- **Save/Load System**: Progress persistence
- **Sound Effects**: Audio feedback and music

## 🚀 Getting Started

1. Open `index.html` in a modern web browser
2. Start deploying units and fighting enemies
3. Experiment with different unit combinations
4. Try to survive as many waves as possible!

---

**Enjoy the game!** 🎮⚔️🛡️
