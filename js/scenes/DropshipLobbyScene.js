// DropshipLobbyScene.js - Dropship lobby with joystick controls and character animations
class DropshipLobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DropshipLobbyScene' });
        this.players = [];
        this.localPlayer = null;
        this.playerCustomization = null;
        this.joystick = null;
        this.isMobile = false;
        this.gameSettings = {
            impostorCount: 1,
            taskCount: 3,
            selectedMap: 'skeld'
        };
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get player data from registry
        this.players = this.registry.get('players') || [];
        this.localPlayer = this.registry.get('localPlayer');
        this.playerCustomization = this.registry.get('playerCustomization');
        
        // Detect if mobile
        this.isMobile = this.sys.game.device.input.touch;
        
        // Add dropship background
        this.background = this.add.image(width / 2, height / 2, 'dropship');
        this.background.setScale(Math.max(width / this.background.width, height / this.background.height));
        
        // Initialize player characters
        this.initializeCharacters();
        
        // Create mobile joystick if on mobile
        if (this.isMobile) {
            this.createMobileJoystick();
        }
        
        // Create laptop interface for host settings
        this.createLaptopInterface();
        
        // Setup input controls
        this.setupControls();
        
        // Setup dropship boundaries
        this.setupDropshipBoundaries();
        
        // Start with seating animation
        this.startSeatingAnimation();
    }
    
    setupDropshipBoundaries() {
        // Define collision boundaries for dropship interior
        // These prevent players from walking outside the ship
        this.dropshipBounds = [
            // Outer boundaries (ship walls)
            { x: 0, y: 0, width: 1280, height: 150 }, // Top boundary
            { x: 0, y: 570, width: 1280, height: 150 }, // Bottom boundary
            { x: 0, y: 0, width: 200, height: 720 }, // Left boundary
            { x: 1080, y: 0, width: 200, height: 720 }, // Right boundary
            
            // Internal ship structures
            { x: 200, y: 150, width: 100, height: 100 }, // Left console
            { x: 980, y: 150, width: 100, height: 100 }, // Right console
            { x: 500, y: 200, width: 280, height: 50 }, // Central console
        ];
    }
    
    checkDropshipCollision(x, y, sprite, character = null) {
        // Check if position would collide with dropship boundaries
        const spriteWidth = sprite.width * sprite.scaleX;
        const spriteHeight = sprite.height * sprite.scaleY;
        
        for (let bound of this.dropshipBounds) {
            if (x - spriteWidth/2 < bound.x + bound.width &&
                x + spriteWidth/2 > bound.x &&
                y - spriteHeight/2 < bound.y + bound.height &&
                y + spriteHeight/2 > bound.y) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }
    
    initializeCharacters() {
        // Define seat positions in the dropship
        const seatPositions = [
            { x: 300, y: 400 }, // Left side seats
            { x: 300, y: 500 },
            { x: 980, y: 400 }, // Right side seats
            { x: 980, y: 500 },
            { x: 640, y: 350 }, // Center seats
            { x: 640, y: 450 },
            { x: 640, y: 550 },
            { x: 450, y: 380 },
            { x: 830, y: 380 },
            { x: 640, y: 250 }
        ];
        
        this.characterSprites = [];
        
        this.players.forEach((player, index) => {
            if (index < seatPositions.length) {
                const pos = seatPositions[index];
                
                // Create character sprite (start with lobby.png - sitting position)
                const character = this.add.sprite(pos.x, pos.y, 'character_lobby');
                character.setScale(0.5);
                character.setTint(player.color);
                
                // Add player name tag
                const nameTag = this.add.text(pos.x, pos.y - 40, player.name, {
                    fontSize: '14px',
                    fill: '#ffffff',
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: '#000000',
                    padding: { x: 6, y: 3 }
                }).setOrigin(0.5);
                
                // Store character data
                const characterData = {
                    sprite: character,
                    nameTag: nameTag,
                    player: player,
                    isSeated: true,
                    isLocal: player.isLocal,
                    seatPosition: pos,
                    currentPosition: { x: pos.x, y: pos.y }
                };
                
                this.characterSprites.push(characterData);
                
                // Set local player reference
                if (player.isLocal) {
                    this.localCharacter = characterData;
                }
            }
        });
    }
    
    startSeatingAnimation() {
        // Show all characters in sitting position for 1-2 seconds
        this.time.delayedCall(2000, () => {
            this.transitionToIdle();
        });
    }
    
    transitionToIdle() {
        // Transition characters from lobby.png to idle.png
        this.characterSprites.forEach(charData => {
            charData.sprite.setTexture('character_idle');
            charData.isSeated = false;
            
            // Add subtle breathing animation for idle
            this.tweens.add({
                targets: charData.sprite,
                scaleY: 0.52,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
        
        // Enable movement for local player
        this.localCharacter.canMove = true;
    }
    
    createMobileJoystick() {
        // Create joystick only when screen is touched
        this.input.on('pointerdown', (pointer) => {
            if (!this.joystick && this.localCharacter && this.localCharacter.canMove) {
                this.createJoystickAt(pointer.x, pointer.y);
            }
        });
    }
    
    createJoystickAt(x, y) {
        // Position joystick in bottom left area
        const joystickX = Math.max(80, Math.min(x, 150));
        const joystickY = Math.max(this.cameras.main.height - 150, Math.min(y, this.cameras.main.height - 80));
        
        // Create joystick base
        this.joystickBase = this.add.image(joystickX, joystickY, 'joystick_base');
        this.joystickBase.setScale(0.8);
        this.joystickBase.setAlpha(0.7);
        
        // Create joystick handle
        this.joystickHandle = this.add.image(joystickX, joystickY, 'joystick_handle');
        this.joystickHandle.setScale(0.6);
        this.joystickHandle.setInteractive();
        this.joystickHandle.setAlpha(0.8);
        
        // Make handle draggable
        this.input.setDraggable(this.joystickHandle);
        
        this.joystick = {
            base: this.joystickBase,
            handle: this.joystickHandle,
            baseX: joystickX,
            baseY: joystickY,
            maxDistance: 40
        };
        
        // Handle joystick drag
        this.joystickHandle.on('drag', (pointer, dragX, dragY) => {
            this.handleJoystickDrag(dragX, dragY);
        });
        
        // Handle joystick release
        this.input.on('pointerup', () => {
            this.releaseJoystick();
        });
    }
    
    handleJoystickDrag(dragX, dragY) {
        if (!this.joystick) return;
        
        const distance = Phaser.Math.Distance.Between(this.joystick.baseX, this.joystick.baseY, dragX, dragY);
        
        if (distance <= this.joystick.maxDistance) {
            this.joystick.handle.x = dragX;
            this.joystick.handle.y = dragY;
        } else {
            const angle = Phaser.Math.Angle.Between(this.joystick.baseX, this.joystick.baseY, dragX, dragY);
            this.joystick.handle.x = this.joystick.baseX + Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.handle.y = this.joystick.baseY + Math.sin(angle) * this.joystick.maxDistance;
        }
        
        // Calculate movement direction and speed
        const deltaX = this.joystick.handle.x - this.joystick.baseX;
        const deltaY = this.joystick.handle.y - this.joystick.baseY;
        const currentDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = (currentDistance / this.joystick.maxDistance) * 3; // Max speed of 3
        
        // Move local character
        this.moveLocalCharacter(deltaX, deltaY, speed);
    }
    
    releaseJoystick() {
        if (!this.joystick) return;
        
        // Return handle to center
        this.tweens.add({
            targets: this.joystick.handle,
            x: this.joystick.baseX,
            y: this.joystick.baseY,
            duration: 200,
            ease: 'Power2'
        });
        
        // Stop character movement and return to idle
        if (this.localCharacter) {
            this.localCharacter.sprite.setTexture('character_idle');
            this.localCharacter.isWalking = false;
        }
        
        // Remove joystick after a delay
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
    
    moveLocalCharacter(deltaX, deltaY, speed) {
        if (!this.localCharacter || !this.localCharacter.canMove) return;
        
        // Normalize direction
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (length > 0) {
            const normalizedX = deltaX / length;
            const normalizedY = deltaY / length;
            
            // Calculate new position
            const newX = this.localCharacter.sprite.x + normalizedX * speed;
            const newY = this.localCharacter.sprite.y + normalizedY * speed;
            
            // Check collision before moving
            if (!this.checkDropshipCollision(newX, newY, this.localCharacter.sprite)) {
                // Update character position
                this.localCharacter.sprite.x = newX;
                this.localCharacter.sprite.y = newY;
                
                // Update name tag position
                this.localCharacter.nameTag.x = newX;
                this.localCharacter.nameTag.y = newY - 40;
                
                // Switch to walking animation if moving
                if (speed > 0.5 && !this.localCharacter.isWalking) {
                this.localCharacter.sprite.setTexture('character_walk');
                this.localCharacter.isWalking = true;
                
                // Create walking animation frames
                this.anims.create({
                    key: 'walk',
                    frames: this.anims.generateFrameNumbers('character_walk', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
                
                this.localCharacter.sprite.play('walk');
                }
            }
        }
    }
    
    setupControls() {
        // Keyboard controls for desktop
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }
    
    createLaptopInterface() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Laptop position (center-left of dropship)
        const laptopX = 200;
        const laptopY = 300;
        
        // Create laptop sprite (using a simple rectangle for now)
        this.laptop = this.add.graphics();
        this.laptop.fillStyle(0x2c3e50, 1);
        this.laptop.lineStyle(2, 0x34495e, 1);
        this.laptop.fillRoundedRect(laptopX - 30, laptopY - 20, 60, 40, 5);
        this.laptop.strokeRoundedRect(laptopX - 30, laptopY - 20, 60, 40, 5);
        
        // Screen
        this.laptop.fillStyle(0x000000, 1);
        this.laptop.fillRoundedRect(laptopX - 25, laptopY - 15, 50, 25, 2);
        
        // Use button appears when player is near laptop
        this.createUseButton(laptopX, laptopY - 50);
    }
    
    createUseButton(x, y) {
        this.useButton = this.add.image(x, y, 'use_button');
        this.useButton.setScale(0.6);
        this.useButton.setVisible(false);
        this.useButton.setInteractive();
        
        this.useButton.on('pointerup', () => {
            this.openLaptopMenu();
        });
    }
    
    openLaptopMenu() {
        // Create laptop menu overlay
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Dark overlay
        this.laptopOverlay = this.add.graphics();
        this.laptopOverlay.fillStyle(0x000000, 0.8);
        this.laptopOverlay.fillRect(0, 0, width, height);
        this.laptopOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        
        // Menu panel
        const panelWidth = 600;
        const panelHeight = 500;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2;
        
        this.laptopPanel = this.add.graphics();
        this.laptopPanel.fillStyle(0x2c3e50, 0.95);
        this.laptopPanel.lineStyle(4, 0x3498db, 1);
        this.laptopPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        this.laptopPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        
        // Title
        this.add.text(width / 2, panelY + 40, 'Host Settings', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Game settings
        this.createGameSettings(panelX, panelY, panelWidth);
        
        // Customization section
        this.createCustomizationSection(panelX, panelY, panelWidth);
        
        // Start button
        this.createStartGameButton(width / 2, panelY + panelHeight - 60);
        
        // Close button
        this.createCloseButton(panelX + panelWidth - 40, panelY + 20);
    }
    
    createGameSettings(panelX, panelY, panelWidth) {
        const settingsY = panelY + 90;
        
        // Impostor count
        this.add.text(panelX + 30, settingsY, 'Impostors:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        
        this.createNumberSelector(panelX + 150, settingsY, 'impostorCount', 1, 3, this.gameSettings.impostorCount);
        
        // Task count
        this.add.text(panelX + 30, settingsY + 50, 'Tasks:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        
        this.createNumberSelector(panelX + 150, settingsY + 50, 'taskCount', 1, 5, this.gameSettings.taskCount);
        
        // Map selection
        this.add.text(panelX + 30, settingsY + 100, 'Map:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        
        this.createMapSelector(panelX + 150, settingsY + 100);
    }
    
    createNumberSelector(x, y, setting, min, max, current) {
        // Decrease button
        const decreaseBtn = this.add.text(x, y, '-', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#e74c3c',
            padding: { x: 10, y: 5 }
        }).setInteractive();
        
        // Current value
        const valueText = this.add.text(x + 40, y, current.toString(), {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#34495e',
            padding: { x: 15, y: 8 }
        });
        
        // Increase button
        const increaseBtn = this.add.text(x + 80, y, '+', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#27ae60',
            padding: { x: 10, y: 5 }
        }).setInteractive();
        
        decreaseBtn.on('pointerup', () => {
            if (this.gameSettings[setting] > min) {
                this.gameSettings[setting]--;
                valueText.setText(this.gameSettings[setting].toString());
            }
        });
        
        increaseBtn.on('pointerup', () => {
            if (this.gameSettings[setting] < max) {
                this.gameSettings[setting]++;
                valueText.setText(this.gameSettings[setting].toString());
            }
        });
    }
    
    createMapSelector(x, y) {
        const maps = ['The Skeld', 'MIRA HQ', 'Polus'];
        const currentIndex = maps.indexOf('The Skeld');
        
        const mapText = this.add.text(x, y, maps[currentIndex], {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#34495e',
            padding: { x: 15, y: 8 }
        }).setInteractive();
        
        mapText.on('pointerup', () => {
            // Cycle through maps (for now just show the name)
            const nextIndex = (maps.indexOf(mapText.text) + 1) % maps.length;
            mapText.setText(maps[nextIndex]);
            this.gameSettings.selectedMap = maps[nextIndex].toLowerCase().replace(' ', '_');
        });
    }
    
    createCustomizationSection(panelX, panelY, panelWidth) {
        const customY = panelY + 250;
        
        this.add.text(panelX + 30, customY, 'Customization:', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        
        // Hats, Skins, Pets buttons (for future implementation)
        const customButtons = ['Hats', 'Skins', 'Pets'];
        customButtons.forEach((buttonText, index) => {
            const btn = this.add.text(panelX + 30 + (index * 120), customY + 40, buttonText, {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#7f8c8d',
                padding: { x: 15, y: 8 }
            }).setInteractive();
            
            btn.on('pointerover', () => {
                btn.setStyle({ backgroundColor: '#95a5a6' });
            });
            
            btn.on('pointerout', () => {
                btn.setStyle({ backgroundColor: '#7f8c8d' });
            });
            
            // TODO: Implement customization menus
        });
    }
    
    createStartGameButton(x, y) {
        this.startGameBtn = this.add.image(x, y, 'start_button');
        this.startGameBtn.setScale(0.8);
        this.startGameBtn.setInteractive();
        
        this.startGameBtn.on('pointerover', () => {
            this.startGameBtn.setScale(0.85);
            this.startGameBtn.setTint(0xffff99);
        });
        
        this.startGameBtn.on('pointerout', () => {
            this.startGameBtn.setScale(0.8);
            this.startGameBtn.clearTint();
        });
        
        this.startGameBtn.on('pointerup', () => {
            this.startGame();
        });
    }
    
    createCloseButton(x, y) {
        const closeBtn = this.add.text(x, y, '×', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#e74c3c',
            padding: { x: 8, y: 4 }
        }).setInteractive().setOrigin(0.5);
        
        closeBtn.on('pointerup', () => {
            this.closeLaptopMenu();
        });
    }
    
    closeLaptopMenu() {
        if (this.laptopOverlay) {
            this.laptopOverlay.destroy();
            this.laptopPanel.destroy();
        }
    }
    
    startGame() {
        this.closeLaptopMenu();
        
        // Show shhh.png sprite
        this.showShhhScreen();
    }
    
    showShhhScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Black screen
        const blackScreen = this.add.graphics();
        blackScreen.fillStyle(0x000000, 1);
        blackScreen.fillRect(0, 0, width, height);
        
        // Shhh image
        const shhhImage = this.add.image(width / 2, height / 2, 'shhh');
        shhhImage.setScale(0.8);
        
        // Show for 2 seconds then proceed to role reveal
        this.time.delayedCall(2000, () => {
            blackScreen.destroy();
            shhhImage.destroy();
            this.showRoleReveal();
        });
    }
    
    showRoleReveal() {
        // Determine if local player is impostor (random for now)
        const isImpostor = Math.random() < (this.gameSettings.impostorCount / this.players.length);
        
        // Store role information
        this.registry.set('isImpostor', isImpostor);
        this.registry.set('gameSettings', this.gameSettings);
        
        let roleVideo;
        if (isImpostor) {
            roleVideo = 'impostor_reveal';
        } else {
            // Choose crewmate video based on impostor count
            switch (this.gameSettings.impostorCount) {
                case 1:
                    roleVideo = 'crewmate_1imp';
                    break;
                case 2:
                    roleVideo = 'crewmate_2imp';
                    break;
                case 3:
                    roleVideo = 'crewmate_3imp';
                    break;
                default:
                    roleVideo = 'crewmate_1imp';
            }
        }
        
        // Play role reveal video
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const roleRevealVideo = this.add.video(width / 2, height / 2, roleVideo);
        roleRevealVideo.setScale(Math.max(width / roleRevealVideo.width, height / roleRevealVideo.height));
        
        roleRevealVideo.play();
        
        // When video ends, start the actual game
        roleRevealVideo.on('complete', () => {
            // Transition to map scene
            this.scene.start('MapScene');
        });
    }
    
    update() {
        // Handle keyboard movement for desktop
        if (!this.isMobile && this.localCharacter && this.localCharacter.canMove) {
            this.handleKeyboardMovement();
        }
        
        // Check if player is near laptop for Use button
        this.checkLaptopProximity();
    }
    
    handleKeyboardMovement() {
        const speed = 3;
        let moving = false;
        let newX = this.localCharacter.sprite.x;
        let newY = this.localCharacter.sprite.y;
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            newX -= speed;
            moving = true;
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            newX += speed;
            moving = true;
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            newY -= speed;
            moving = true;
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            newY += speed;
            moving = true;
        }
        
        // Check collision before moving
        if (moving && !this.checkDropshipCollision(newX, newY, this.localCharacter.sprite)) {
            this.localCharacter.sprite.x = newX;
            this.localCharacter.sprite.y = newY;
            this.localCharacter.nameTag.x = newX;
            this.localCharacter.nameTag.y = newY - 40;
        }
        
        // Switch between walk and idle animations
        if (moving && !this.localCharacter.isWalking) {
            this.localCharacter.sprite.setTexture('character_walk');
            this.localCharacter.isWalking = true;
        } else if (!moving && this.localCharacter.isWalking) {
            this.localCharacter.sprite.setTexture('character_idle');
            this.localCharacter.isWalking = false;
        }
    }
    
    checkLaptopProximity() {
        if (!this.localCharacter || !this.useButton) return;
        
        const distance = Phaser.Math.Distance.Between(
            this.localCharacter.sprite.x,
            this.localCharacter.sprite.y,
            200, // laptop X
            300  // laptop Y
        );
        
        this.useButton.setVisible(distance < 80);
    }
}