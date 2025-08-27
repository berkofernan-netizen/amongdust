// MapScene.js - Main game map with collision detection and character movement
class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
        this.players = [];
        this.localPlayer = null;
        this.playerCustomization = null;
        this.characterSprites = [];
        this.joystick = null;
        this.isMobile = false;
        this.collisionBounds = [];
        this.aiPlayers = [];
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get data from registry
        this.players = this.registry.get('players') || [];
        this.localPlayer = this.registry.get('localPlayer');
        this.playerCustomization = this.registry.get('playerCustomization');
        this.isImpostor = this.registry.get('isImpostor') || false;
        this.gameSettings = this.registry.get('gameSettings') || {};
        
        // Detect mobile
        this.isMobile = this.sys.game.device.input.touch;
        
        // Add map background
        this.background = this.add.image(width / 2, height / 2, 'map');
        this.background.setScale(Math.max(width / this.background.width, height / this.background.height));
        
        // Setup collision boundaries based on map layout
        this.setupCollisionBounds();
        
        // Initialize character system
        this.characterSystem = new CharacterSystem(this);
        
        // Create players on the map
        this.createMapCharacters();
        
        // Setup controls
        this.setupControls();
        
        // Create mobile joystick if needed
        if (this.isMobile) {
            this.setupMobileJoystick();
        }
        
        // Setup AI movement
        this.setupAIMovement();
        
        // Create UI elements
        this.createGameUI();
    }
    
    setupCollisionBounds() {
        // Define collision boundaries for The Skeld map
        // These coordinates represent walls and obstacles where players can't walk
        this.collisionBounds = [
            // Upper area walls
            { x: 0, y: 0, width: 1280, height: 100 }, // Top boundary
            { x: 0, y: 0, width: 100, height: 720 }, // Left boundary
            { x: 1180, y: 0, width: 100, height: 720 }, // Right boundary
            { x: 0, y: 620, width: 1280, height: 100 }, // Bottom boundary
            
            // Internal walls and obstacles (approximate positions for The Skeld)
            { x: 200, y: 150, width: 150, height: 50 }, // Upper left room wall
            { x: 400, y: 200, width: 100, height: 100 }, // Cafeteria table
            { x: 600, y: 150, width: 200, height: 80 }, // Upper corridor wall
            { x: 300, y: 350, width: 100, height: 150 }, // Admin wall
            { x: 700, y: 300, width: 150, height: 100 }, // Medbay wall
            { x: 200, y: 500, width: 200, height: 80 }, // Lower left wall
            { x: 800, y: 450, width: 100, height: 120 }, // Security wall
            { x: 500, y: 520, width: 180, height: 60 }, // Lower corridor
        ];
        
        // Create invisible collision rectangles for debugging (can be removed later)
        this.collisionObjects = this.add.group();
        
        this.collisionBounds.forEach(bound => {
            const collisionRect = this.add.rectangle(
                bound.x + bound.width / 2, 
                bound.y + bound.height / 2, 
                bound.width, 
                bound.height, 
                0xff0000, 
                0 // Transparent, set to 0.3 for debugging
            );
            collisionRect.setData('collision', true);
            this.collisionObjects.add(collisionRect);
        });
    }
    
    initializeCharacterSystem() {
        // Create character animation configurations
        this.characterConfigs = {
            idle: {
                texture: 'character_idle',
                scale: 0.6,
                frameRate: 2
            },
            walk: {
                texture: 'character_walk',
                scale: 0.6,
                frameRate: 8,
                frames: { start: 0, end: 3 }
            },
            vent: {
                texture: 'character_vent',
                scale: 0.6
            },
            vent_player: {
                texture: 'character_vent_player',
                scale: 0.6
            },
            ghost: {
                texture: 'character_ghost',
                scale: 0.6,
                alpha: 0.7
            },
            lobby: {
                texture: 'character_lobby',
                scale: 0.6
            },
            vote_icon: {
                texture: 'character_vote_icon',
                scale: 0.6
            },
            death: {
                texture: 'character_death',
                scale: 0.6
            },
            ejected: {
                texture: 'character_ejected',
                scale: 0.6
            },
            kill_animation: {
                texture: 'character_kill_animation',
                scale: 0.6,
                frameRate: 12
            }
        };
        
        // Create animations
        this.createCharacterAnimations();
    }
    
    createCharacterAnimations() {
        // Walking animation
        if (!this.anims.exists('character_walk')) {
            this.anims.create({
                key: 'character_walk',
                frames: this.anims.generateFrameNumbers('character_walk', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Idle breathing animation
        if (!this.anims.exists('character_idle')) {
            this.anims.create({
                key: 'character_idle',
                frames: [{ key: 'character_idle', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }
        
        // Ghost floating animation
        if (!this.anims.exists('character_ghost')) {
            this.anims.create({
                key: 'character_ghost',
                frames: [{ key: 'character_ghost', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }
        
        // Kill animation (if sprite sheet)
        if (!this.anims.exists('character_kill')) {
            this.anims.create({
                key: 'character_kill',
                frames: [{ key: 'character_kill_animation', frame: 0 }],
                frameRate: 12,
                repeat: 0
            });
        }
    }
    
    createMapCharacters() {
        // Define spawn positions for players
        const spawnPositions = [
            { x: 640, y: 360 }, // Center
            { x: 600, y: 400 },
            { x: 680, y: 400 },
            { x: 560, y: 360 },
            { x: 720, y: 360 },
            { x: 600, y: 320 },
            { x: 680, y: 320 },
            { x: 520, y: 400 },
            { x: 760, y: 400 },
            { x: 640, y: 280 }
        ];
        
        this.characterSprites = [];
        
        this.players.forEach((player, index) => {
            if (index < spawnPositions.length) {
                const spawnPos = spawnPositions[index];
                
                // Use CharacterSystem to create character
                const character = this.characterSystem.createCharacter(
                    player.id || `player_${index}`,
                    spawnPos.x,
                    spawnPos.y,
                    {
                        color: player.color || this.getPlayerColor(index),
                        name: player.name,
                        state: 'idle',
                        isLocal: player.isLocal
                    }
                );
                
                this.characterSprites.push(character);
                
                // Set local player reference
                if (player.isLocal) {
                    this.localCharacter = character;
                }
            }
        });
    }
    
    // Character sprite creation is now handled by CharacterSystem
    
    getPlayerColor(index) {
        const colors = [
            0xff0000, // Red
            0x0000ff, // Blue
            0x00ff00, // Green
            0xff69b4, // Pink
            0xffa500, // Orange
            0xffff00, // Yellow
            0x000000, // Black
            0xffffff, // White
            0x800080, // Purple
            0x00ffff  // Cyan
        ];
        return colors[index % colors.length];
    }
    
    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Emergency button
        this.emergencyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.emergencyKey.on('down', () => {
            this.callEmergencyMeeting();
        });
    }
    
    setupMobileJoystick() {
        this.input.on('pointerdown', (pointer) => {
            if (!this.joystick && this.localCharacter) {
                this.createJoystickAt(pointer.x, pointer.y);
            }
        });
    }
    
    createJoystickAt(x, y) {
        // Position joystick in bottom left
        const joystickX = Math.max(80, Math.min(x, 150));
        const joystickY = Math.max(this.cameras.main.height - 150, Math.min(y, this.cameras.main.height - 80));
        
        this.joystickBase = this.add.image(joystickX, joystickY, 'joystick_base');
        this.joystickBase.setScale(0.8);
        this.joystickBase.setAlpha(0.7);
        this.joystickBase.setScrollFactor(0); // UI element
        
        this.joystickHandle = this.add.image(joystickX, joystickY, 'joystick_handle');
        this.joystickHandle.setScale(0.6);
        this.joystickHandle.setAlpha(0.8);
        this.joystickHandle.setInteractive();
        this.joystickHandle.setScrollFactor(0); // UI element
        
        this.input.setDraggable(this.joystickHandle);
        
        this.joystick = {
            base: this.joystickBase,
            handle: this.joystickHandle,
            baseX: joystickX,
            baseY: joystickY,
            maxDistance: 40
        };
        
        this.joystickHandle.on('drag', (pointer, dragX, dragY) => {
            this.handleJoystickDrag(dragX, dragY);
        });
        
        this.input.on('pointerup', () => {
            this.releaseJoystick();
        });
    }
    
    handleJoystickDrag(dragX, dragY) {
        if (!this.joystick || !this.localCharacter) return;
        
        const distance = Phaser.Math.Distance.Between(this.joystick.baseX, this.joystick.baseY, dragX, dragY);
        
        if (distance <= this.joystick.maxDistance) {
            this.joystick.handle.x = dragX;
            this.joystick.handle.y = dragY;
        } else {
            const angle = Phaser.Math.Angle.Between(this.joystick.baseX, this.joystick.baseY, dragX, dragY);
            this.joystick.handle.x = this.joystick.baseX + Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.handle.y = this.joystick.baseY + Math.sin(angle) * this.joystick.maxDistance;
        }
        
        const deltaX = this.joystick.handle.x - this.joystick.baseX;
        const deltaY = this.joystick.handle.y - this.joystick.baseY;
        
        this.localCharacter.direction.x = deltaX / this.joystick.maxDistance;
        this.localCharacter.direction.y = deltaY / this.joystick.maxDistance;
    }
    
    releaseJoystick() {
        if (!this.joystick) return;
        
        this.tweens.add({
            targets: this.joystick.handle,
            x: this.joystick.baseX,
            y: this.joystick.baseY,
            duration: 200,
            ease: 'Power2'
        });
        
        if (this.localCharacter) {
            this.localCharacter.direction.x = 0;
            this.localCharacter.direction.y = 0;
        }
        
        this.time.delayedCall(3000, () => {
            this.destroyJoystick();
        });
    }
    
    destroyJoystick() {
        if (this.joystick) {
            this.joystick.base.destroy();
            this.joystick.handle.destroy();
            this.joystick = null;
        }
    }
    
    setupAIMovement() {
        // Setup AI behavior for non-local players
        this.aiPlayers = this.characterSprites.filter(char => !char.isLocal);
        
        // Create AI movement timer
        this.time.addEvent({
            delay: 2000, // Every 2 seconds
            callback: this.updateAIMovement,
            callbackScope: this,
            loop: true
        });
    }
    
    updateAIMovement() {
        this.aiPlayers.forEach(aiChar => {
            // Random chance to change direction
            if (Math.random() < 0.3) {
                // Choose random direction
                const angle = Math.random() * Math.PI * 2;
                aiChar.direction.x = Math.cos(angle) * 0.5;
                aiChar.direction.y = Math.sin(angle) * 0.5;
                
                // Sometimes stop moving
                if (Math.random() < 0.4) {
                    aiChar.direction.x = 0;
                    aiChar.direction.y = 0;
                }
            }
        });
    }
    
    createGameUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Emergency button (bottom center)
        this.emergencyButton = this.add.image(width / 2, height - 60, 'emergency');
        this.emergencyButton.setScale(0.8);
        this.emergencyButton.setInteractive();
        this.emergencyButton.setScrollFactor(0); // UI element
        
        this.emergencyButton.on('pointerup', () => {
            this.callEmergencyMeeting();
        });
        
        // Role indicator (top left)
        const roleText = this.isImpostor ? 'IMPOSTOR' : 'CREWMATE';
        const roleColor = this.isImpostor ? '#ff0000' : '#00ff00';
        
        this.roleIndicator = this.add.text(20, 20, roleText, {
            fontSize: '18px',
            fill: roleColor,
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.roleIndicator.setScrollFactor(0); // UI element
        
        // Player count (top right)
        this.playerCountText = this.add.text(width - 20, 20, `Players: ${this.players.length}`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
        this.playerCountText.setScrollFactor(0); // UI element
    }
    
    checkCollision(x, y, sprite) {
        // Check if position would collide with any collision bounds
        const spriteWidth = sprite.width * sprite.scaleX;
        const spriteHeight = sprite.height * sprite.scaleY;
        
        for (let bound of this.collisionBounds) {
            if (x - spriteWidth/2 < bound.x + bound.width &&
                x + spriteWidth/2 > bound.x &&
                y - spriteHeight/2 < bound.y + bound.height &&
                y + spriteHeight/2 > bound.y) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }
    
    moveCharacter(character, deltaTime) {
        if (!character || (character.direction.x === 0 && character.direction.y === 0)) {
            // Not moving, set direction in character system
            this.characterSystem.setCharacterDirection(character.id, 0, 0);
            return;
        }
        
        // Calculate new position
        const speed = character.speed;
        const newX = character.sprite.x + character.direction.x * speed;
        const newY = character.sprite.y + character.direction.y * speed;
        
        // Check collision before moving
        if (!this.checkCollision(newX, newY, character.sprite)) {
            // No collision, move character using character system
            this.characterSystem.updateCharacterPosition(character.id, newX, newY);
            this.characterSystem.setCharacterDirection(character.id, character.direction.x, character.direction.y);
        } else {
            // Collision detected, stop movement
            character.direction.x = 0;
            character.direction.y = 0;
            this.characterSystem.setCharacterDirection(character.id, 0, 0);
        }
    }
    
    // Character state management is now handled by CharacterSystem
    
    callEmergencyMeeting() {
        // TODO: Implement emergency meeting
        console.log('Emergency meeting called!');
        
        // For now, just show a message
        const messageText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'EMERGENCY MEETING!', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        messageText.setScrollFactor(0);
        
        this.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 3000,
            onComplete: () => {
                messageText.destroy();
            }
        });
    }
    
    update(time, delta) {
        // Handle local player keyboard movement
        if (this.localCharacter && !this.isMobile) {
            this.handleKeyboardMovement();
        }
        
        // Move all characters
        this.characterSprites.forEach(character => {
            this.moveCharacter(character, delta);
        });
        
        // Update camera to follow local player
        if (this.localCharacter) {
            this.cameras.main.scrollX = this.localCharacter.sprite.x - this.cameras.main.width / 2;
            this.cameras.main.scrollY = this.localCharacter.sprite.y - this.cameras.main.height / 2;
            
            // Constrain camera to map bounds
            this.cameras.main.scrollX = Phaser.Math.Clamp(this.cameras.main.scrollX, 0, this.background.width - this.cameras.main.width);
            this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY, 0, this.background.height - this.cameras.main.height);
        }
    }
    
    handleKeyboardMovement() {
        if (!this.localCharacter) return;
        
        let moving = false;
        this.localCharacter.direction.x = 0;
        this.localCharacter.direction.y = 0;
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.localCharacter.direction.x = -1;
            moving = true;
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.localCharacter.direction.x = 1;
            moving = true;
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.localCharacter.direction.y = -1;
            moving = true;
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.localCharacter.direction.y = 1;
            moving = true;
        }
        
        // Normalize diagonal movement
        if (this.localCharacter.direction.x !== 0 && this.localCharacter.direction.y !== 0) {
            this.localCharacter.direction.x *= 0.707; // 1/sqrt(2)
            this.localCharacter.direction.y *= 0.707;
        }
    }
}