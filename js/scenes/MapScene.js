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
        
        // Initialize corpses array
        this.corpses = [];
        
        // Initialize interaction system
        this.nearbyPlayers = [];
        this.nearbyCorpses = [];
        this.nearbyVents = [];
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
        const amongUsColors = CharacterSystem.getAvailableColors();
        const colors = amongUsColors.map(colorData => colorData.value);
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
        
        // Test keys for development
        this.testKillKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.testKillKey.on('down', () => {
            // Test kill - kill the local player for testing ghost mechanics
            this.testKillLocalPlayer();
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
        
        // Create UI button container
        this.uiButtons = this.add.group();
        
        // Emergency button (bottom center)
        this.emergencyButton = this.add.image(width / 2, height - 60, 'emergency');
        this.emergencyButton.setScale(0.8);
        this.emergencyButton.setInteractive();
        this.emergencyButton.setScrollFactor(0);
        this.emergencyButton.on('pointerup', () => this.callEmergencyMeeting());
        this.uiButtons.add(this.emergencyButton);
        
        // Bottom UI bar background
        this.uiBackground = this.add.graphics();
        this.uiBackground.fillStyle(0x000000, 0.8);
        this.uiBackground.fillRect(0, height - 120, width, 120);
        this.uiBackground.setScrollFactor(0);
        
        // Action buttons (bottom right)
        this.createActionButtons(width, height);
        
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
        this.roleIndicator.setScrollFactor(0);
        
        // Player count (top right)
        this.playerCountText = this.add.text(width - 20, 20, `Players: ${this.players.length}`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
        this.playerCountText.setScrollFactor(0);
        
        // Settings button (top right, below player count)
        this.settingsButton = this.add.image(width - 50, 70, 'settings_button');
        this.settingsButton.setScale(0.4);
        this.settingsButton.setInteractive();
        this.settingsButton.setScrollFactor(0);
        this.settingsButton.on('pointerup', () => this.openInGameSettings());
        
        // Create context-sensitive buttons (initially hidden)
        this.createContextButtons();
    }
    
    createActionButtons(width, height) {
        const buttonY = height - 60;
        const buttonSpacing = 80;
        let buttonIndex = 0;
        
        // Report button (always visible)
        this.reportButton = this.add.image(width - 50 - (buttonIndex * buttonSpacing), buttonY, 'report_button');
        this.reportButton.setScale(0.6);
        this.reportButton.setInteractive();
        this.reportButton.setScrollFactor(0);
        this.reportButton.setVisible(false); // Show when near corpse
        this.reportButton.on('pointerup', () => this.reportNearbyCorpse());
        this.uiButtons.add(this.reportButton);
        buttonIndex++;
        
        // Use button (context-sensitive)
        this.useButton = this.add.image(width - 50 - (buttonIndex * buttonSpacing), buttonY, 'use_button');
        this.useButton.setScale(0.6);
        this.useButton.setInteractive();
        this.useButton.setScrollFactor(0);
        this.useButton.setVisible(false); // Show when near interactive object
        this.useButton.on('pointerup', () => this.useNearbyObject());
        this.uiButtons.add(this.useButton);
        buttonIndex++;
        
        // Impostor-only buttons
        if (this.isImpostor) {
            // Kill button
            this.killButton = this.add.image(width - 50 - (buttonIndex * buttonSpacing), buttonY, 'kill_button');
            this.killButton.setScale(0.6);
            this.killButton.setInteractive();
            this.killButton.setScrollFactor(0);
            this.killButton.setVisible(false); // Show when near player
            this.killButton.on('pointerup', () => this.killNearbyPlayer());
            this.uiButtons.add(this.killButton);
            buttonIndex++;
            
            // Sabotage button
            this.sabotageButton = this.add.image(width - 50 - (buttonIndex * buttonSpacing), buttonY, 'sabotage_button');
            this.sabotageButton.setScale(0.6);
            this.sabotageButton.setInteractive();
            this.sabotageButton.setScrollFactor(0);
            this.sabotageButton.on('pointerup', () => this.openSabotageMenu());
            this.uiButtons.add(this.sabotageButton);
            buttonIndex++;
            
            // Vent button (context-sensitive)
            this.ventButton = this.add.image(width - 50 - (buttonIndex * buttonSpacing), buttonY, 'vent_button');
            this.ventButton.setScale(0.6);
            this.ventButton.setInteractive();
            this.ventButton.setScrollFactor(0);
            this.ventButton.setVisible(false); // Show when near vent
            this.ventButton.on('pointerup', () => this.useVent());
            this.uiButtons.add(this.ventButton);
        }
    }
    
    createContextButtons() {
        // These buttons appear based on proximity to objects/players
        // Already created in createActionButtons, just setting up the proximity detection
    }
    
    openInGameSettings() {
        // Create in-game settings overlay
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Dark overlay
        this.settingsOverlay = this.add.graphics();
        this.settingsOverlay.fillStyle(0x000000, 0.8);
        this.settingsOverlay.fillRect(0, 0, width, height);
        this.settingsOverlay.setScrollFactor(0);
        this.settingsOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        
        // Settings panel
        const panelWidth = 400;
        const panelHeight = 300;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2;
        
        this.settingsPanel = this.add.graphics();
        this.settingsPanel.fillStyle(0x2c3e50, 0.95);
        this.settingsPanel.lineStyle(4, 0x3498db, 1);
        this.settingsPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        this.settingsPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        this.settingsPanel.setScrollFactor(0);
        
        // Settings title
        this.add.text(width / 2, panelY + 40, 'Game Settings', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Leave Game button
        this.leaveGameButton = this.add.text(width / 2, panelY + 120, 'Leave Game', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#e74c3c',
            padding: { x: 20, y: 10 }
        }).setInteractive().setOrigin(0.5).setScrollFactor(0);
        
        this.leaveGameButton.on('pointerover', () => {
            this.leaveGameButton.setStyle({ backgroundColor: '#c0392b' });
        });
        
        this.leaveGameButton.on('pointerout', () => {
            this.leaveGameButton.setStyle({ backgroundColor: '#e74c3c' });
        });
        
        this.leaveGameButton.on('pointerup', () => {
            this.leaveGame();
        });
        
        // Close button
        this.settingsCloseButton = this.add.text(panelX + panelWidth - 30, panelY + 20, '×', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#e74c3c',
            padding: { x: 8, y: 4 }
        }).setInteractive().setOrigin(0.5).setScrollFactor(0);
        
        this.settingsCloseButton.on('pointerup', () => {
            this.closeInGameSettings();
        });
    }
    
    closeInGameSettings() {
        if (this.settingsOverlay) {
            this.settingsOverlay.destroy();
            this.settingsPanel.destroy();
            this.leaveGameButton.destroy();
            this.settingsCloseButton.destroy();
        }
    }
    
    leaveGame() {
        // Return to main menu
        this.scene.start('MainMenuScene');
    }
    
    // Action button handlers
    reportNearbyCorpse() {
        if (this.nearbyCorpses.length > 0) {
            const corpse = this.nearbyCorpses[0];
            this.characterSystem.reportCorpse(corpse.id, this.localCharacter.id);
            console.log(`Reported corpse: ${corpse.name}`);
            // TODO: Start emergency meeting
        }
    }
    
    useNearbyObject() {
        // TODO: Implement task system
        console.log('Using nearby object...');
    }
    
    killNearbyPlayer() {
        if (this.nearbyPlayers.length > 0 && this.isImpostor) {
            const victim = this.nearbyPlayers[0];
            if (!victim.isDead && !victim.isGhost) {
                this.characterSystem.performKill(this.localCharacter.id, victim.id, true);
                
                // Convert victim to ghost if it's the local player
                if (victim.isLocal) {
                    this.characterSystem.convertToGhost(victim.id);
                }
                
                console.log(`Killed ${victim.name}`);
            }
        }
    }
    
    openSabotageMenu() {
        // TODO: Implement sabotage system
        console.log('Opening sabotage menu...');
    }
    
    useVent() {
        // TODO: Implement vent system
        console.log('Using vent...');
    }
    
    testKillLocalPlayer() {
        // Test function to kill local player and convert to ghost
        if (this.localCharacter && !this.localCharacter.isDead) {
            // Create a dummy killer for testing
            let killer = this.characterSprites.find(c => !c.isLocal && !c.isDead);
            if (!killer) {
                // If no other players, create a temporary killer reference
                killer = { id: 'test_killer' };
            }
            
            // Perform kill
            this.characterSystem.performKill(killer.id, this.localCharacter.id, false);
            
            // Convert local player to ghost
            this.characterSystem.convertToGhost(this.localCharacter.id);
            
            console.log('Local player killed and converted to ghost (Press K to test)');
        }
    }
    
    checkCollision(x, y, sprite, character = null) {
        // Ghosts can phase through walls
        if (character && character.isGhost && character.canPhaseWalls) {
            return false;
        }
        
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
        if (!this.checkCollision(newX, newY, character.sprite, character)) {
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
        
        // Update proximity detection
        this.updateProximityDetection();
        
        // Update UI button visibility
        this.updateUIButtonVisibility();
        
        // Update camera to follow local player
        if (this.localCharacter) {
            this.cameras.main.scrollX = this.localCharacter.sprite.x - this.cameras.main.width / 2;
            this.cameras.main.scrollY = this.localCharacter.sprite.y - this.cameras.main.height / 2;
            
            // Constrain camera to map bounds
            this.cameras.main.scrollX = Phaser.Math.Clamp(this.cameras.main.scrollX, 0, this.background.width - this.cameras.main.width);
            this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY, 0, this.background.height - this.cameras.main.height);
        }
    }
    
    updateProximityDetection() {
        if (!this.localCharacter) return;
        
        const localPos = { x: this.localCharacter.sprite.x, y: this.localCharacter.sprite.y };
        const interactionDistance = 80;
        
        // Clear previous proximity arrays
        this.nearbyPlayers = [];
        this.nearbyCorpses = [];
        this.nearbyVents = [];
        
        // Check nearby players
        this.characterSprites.forEach(character => {
            if (character !== this.localCharacter && !character.isDead) {
                const distance = Phaser.Math.Distance.Between(
                    localPos.x, localPos.y,
                    character.sprite.x, character.sprite.y
                );
                
                if (distance < interactionDistance) {
                    this.nearbyPlayers.push(character);
                }
            }
        });
        
        // Check nearby corpses
        if (this.corpses) {
            this.corpses.forEach(corpse => {
                if (!corpse.reported) {
                    const distance = Phaser.Math.Distance.Between(
                        localPos.x, localPos.y,
                        corpse.x, corpse.y
                    );
                    
                    if (distance < interactionDistance) {
                        this.nearbyCorpses.push(corpse);
                    }
                }
            });
        }
        
        // TODO: Check nearby vents and interactive objects
    }
    
    updateUIButtonVisibility() {
        if (!this.localCharacter) return;
        
        // Report button - show when near unreported corpse
        if (this.reportButton) {
            this.reportButton.setVisible(this.nearbyCorpses.length > 0);
        }
        
        // Kill button - show when impostor is near alive player
        if (this.killButton && this.isImpostor) {
            const canKill = this.nearbyPlayers.some(p => !p.isDead && !p.isGhost);
            this.killButton.setVisible(canKill);
        }
        
        // Use button - show when near interactive objects (TODO: implement task system)
        if (this.useButton) {
            this.useButton.setVisible(false); // Will be implemented with task system
        }
        
        // Vent button - show when near vent (TODO: implement vent system)
        if (this.ventButton && this.isImpostor) {
            this.ventButton.setVisible(false); // Will be implemented with vent system
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