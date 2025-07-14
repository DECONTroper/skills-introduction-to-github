class Battlefield {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
        this.canvas = document.getElementById('battlefield');
        this.ctx = this.canvas.getContext('2d');
        
        this.tileSize = 80;
        this.selectedTile = null;
        this.hoveredTile = null;
        this.placementMode = false;
        this.selectedCardIndex = -1;
        this.game = null;
        
        this.setupEventListeners();
        this.render();
    }
    
    createGrid() {
        const grid = [];
        for (let y = 0; y < this.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                grid[y][x] = null;
            }
        }
        return grid;
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredTile = null;
            this.render();
        });
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.tileSize);
        const y = Math.floor((e.clientY - rect.top) / this.tileSize);
        
        if (this.isValidPosition(x, y)) {
            if (this.placementMode && this.game) {
                this.game.playCard(this.selectedCardIndex, x, y);
                this.exitPlacementMode();
            } else {
                this.selectTile(x, y);
            }
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.tileSize);
        const y = Math.floor((e.clientY - rect.top) / this.tileSize);
        
        if (this.isValidPosition(x, y)) {
            this.hoveredTile = { x, y };
        } else {
            this.hoveredTile = null;
        }
        
        this.render();
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    selectTile(x, y) {
        this.selectedTile = { x, y };
        this.render();
    }
    
    setPlacementMode(cardIndex, game) {
        this.placementMode = true;
        this.selectedCardIndex = cardIndex;
        this.game = game;
        this.canvas.style.cursor = 'crosshair';
    }
    
    exitPlacementMode() {
        this.placementMode = false;
        this.selectedCardIndex = -1;
        this.game = null;
        this.canvas.style.cursor = 'default';
    }
    
    placeUnit(unit, x, y) {
        if (this.isValidPosition(x, y) && !this.grid[y][x]) {
            this.grid[y][x] = unit;
            unit.x = x;
            unit.y = y;
            this.render();
            return true;
        }
        return false;
    }
    
    moveUnit(unit, newX, newY) {
        if (this.isValidPosition(newX, newY) && !this.grid[newY][newX]) {
            // Remove from old position
            this.grid[unit.y][unit.x] = null;
            
            // Place at new position
            this.grid[newY][newX] = unit;
            unit.x = newX;
            unit.y = newY;
            
            this.render();
            return true;
        }
        return false;
    }
    
    removeUnit(x, y) {
        if (this.isValidPosition(x, y)) {
            this.grid[y][x] = null;
            this.render();
        }
    }
    
    getUnit(x, y) {
        if (this.isValidPosition(x, y)) {
            return this.grid[y][x];
        }
        return null;
    }
    
    getUnitsInRange(centerX, centerY, range) {
        const units = [];
        for (let y = Math.max(0, centerY - range); y <= Math.min(this.height - 1, centerY + range); y++) {
            for (let x = Math.max(0, centerX - range); x <= Math.min(this.width - 1, centerX + range); x++) {
                const unit = this.grid[y][x];
                if (unit && Math.abs(x - centerX) + Math.abs(y - centerY) <= range) {
                    units.push(unit);
                }
            }
        }
        return units;
    }
    
    getEmptyPositions() {
        const positions = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.grid[y][x]) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }
    
    findPath(startX, startY, targetX, targetY) {
        // Simple A* pathfinding
        const openSet = [{ x: startX, y: startY, g: 0, h: 0, f: 0, parent: null }];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        gScore.set(`${startX},${startY}`, 0);
        fScore.set(`${startX},${startY}`, this.heuristic(startX, startY, targetX, targetY));
        
        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            if (current.x === targetX && current.y === targetY) {
                return this.reconstructPath(cameFrom, current);
            }
            
            closedSet.add(`${current.x},${current.y}`);
            
            const neighbors = this.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (closedSet.has(key)) continue;
                
                const tentativeGScore = gScore.get(`${current.x},${current.y}`) + 1;
                
                if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(key)) {
                    continue;
                }
                
                cameFrom.set(key, current);
                gScore.set(key, tentativeGScore);
                fScore.set(key, tentativeGScore + this.heuristic(neighbor.x, neighbor.y, targetX, targetY));
            }
        }
        
        return null; // No path found
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 1, dy: 0 },  // Right
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }  // Left
        ];
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (this.isValidPosition(newX, newY) && !this.grid[newY][newX]) {
                neighbors.push({ x: newX, y: newY, g: 0, h: 0, f: 0, parent: null });
            }
        }
        
        return neighbors;
    }
    
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    
    reconstructPath(cameFrom, current) {
        const path = [];
        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = cameFrom.get(`${current.x},${current.y}`);
        }
        return path;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawTile(x, y);
            }
        }
        
        // Draw units
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const unit = this.grid[y][x];
                if (unit) {
                    this.drawUnit(unit, x, y);
                }
            }
        }
    }
    
    drawTile(x, y) {
        const tileX = x * this.tileSize;
        const tileY = y * this.tileSize;
        
        // Base tile color
        let fillColor = '#2c3e50';
        
        // Highlight selected tile
        if (this.selectedTile && this.selectedTile.x === x && this.selectedTile.y === y) {
            fillColor = '#4ecdc4';
        }
        
        // Highlight hovered tile
        if (this.hoveredTile && this.hoveredTile.x === x && this.hoveredTile.y === y) {
            fillColor = this.placementMode ? '#ff6b6b' : '#34495e';
        }
        
        // Draw tile background
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
        
        // Draw tile border
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(tileX, tileY, this.tileSize, this.tileSize);
        
        // Draw grid coordinates (for debugging)
        if (this.tileSize > 60) {
            this.ctx.fillStyle = '#7f8c8d';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`${x},${y}`, tileX + 5, tileY + 15);
        }
    }
    
    drawUnit(unit, x, y) {
        const tileX = x * this.tileSize;
        const tileY = y * this.tileSize;
        const centerX = tileX + this.tileSize / 2;
        const centerY = tileY + this.tileSize / 2;
        
        // Draw unit background circle
        this.ctx.fillStyle = unit.getDisplayColor();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.tileSize / 3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw unit border
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw unit symbol
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${this.tileSize / 3}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(unit.getDisplaySymbol(), centerX, centerY);
        
        // Draw health bar
        this.drawHealthBar(unit, tileX, tileY);
        
        // Draw unit stats
        this.drawUnitStats(unit, tileX, tileY);
    }
    
    drawHealthBar(unit, tileX, tileY) {
        const barWidth = this.tileSize - 10;
        const barHeight = 6;
        const barX = tileX + 5;
        const barY = tileY + this.tileSize - 15;
        
        // Background
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthWidth = (unit.health / unit.maxHealth) * barWidth;
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    drawUnitStats(unit, tileX, tileY) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const stats = [
            `HP: ${unit.health}/${unit.maxHealth}`,
            `DMG: ${unit.damage}`,
            `RNG: ${unit.range}`
        ];
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, tileX + 2, tileY + 2 + (index * 12));
        });
    }
    
    // Animation methods
    animateUnitMove(unit, path, callback) {
        if (!path || path.length < 2) {
            if (callback) callback();
            return;
        }
        
        let currentStep = 0;
        const animate = () => {
            if (currentStep >= path.length - 1) {
                if (callback) callback();
                return;
            }
            
            const currentPos = path[currentStep];
            const nextPos = path[currentStep + 1];
            
            // Move unit
            this.moveUnit(unit, nextPos.x, nextPos.y);
            
            currentStep++;
            setTimeout(animate, 200);
        };
        
        animate();
    }
    
    animateAttack(attacker, target, callback) {
        // Flash the attacker
        const originalColor = attacker.getDisplayColor();
        attacker.getDisplayColor = () => '#ffff00';
        this.render();
        
        setTimeout(() => {
            attacker.getDisplayColor = () => originalColor;
            this.render();
            
            if (callback) callback();
        }, 300);
    }
    
    // Utility methods
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    
    getUnitsByTeam(team) {
        const units = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const unit = this.grid[y][x];
                if (unit && unit.team === team) {
                    units.push(unit);
                }
            }
        }
        return units;
    }
    
    getUnitsByType(type) {
        const units = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const unit = this.grid[y][x];
                if (unit && unit.type === type) {
                    units.push(unit);
                }
            }
        }
        return units;
    }
    
    clear() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = null;
            }
        }
        this.render();
    }
}