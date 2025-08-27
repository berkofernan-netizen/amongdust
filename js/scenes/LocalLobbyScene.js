// LocalLobbyScene.js - Local play lobby scene
class LocalLobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LocalLobbyScene' });
        this.players = [];
        this.maxPlayers = 10;
        this.playerCustomization = {
            bodyColor: 0xC51111, // Default Among Us red
            backpackColor: 0x6B2FBB // Default Among Us purple
        };
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Add some stars for ambiance
        this.createStarField();
        
        // Title
        this.lobbyTitle = this.add.text(width / 2, 50, window.gameManager.getTranslation('localLobby'), {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Player list area
        this.playerListBg = this.add.graphics();
        this.playerListBg.fillStyle(0x16213e, 0.8);
        this.playerListBg.lineStyle(2, 0x0f4c75, 1);
        this.playerListBg.fillRoundedRect(50, 120, width - 100, height - 300, 10);
        this.playerListBg.strokeRoundedRect(50, 120, width - 100, height - 300, 10);
        
        // Players header
        this.add.text(70, 140, 'Players:', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        
        // Player customization area
        this.createCustomizationArea();
        
        // Initialize with current player
        this.addPlayer(window.gameManager.getPlayerName(), true);
        
        // Add some AI players for demonstration
        this.addAIPlayers();
        
        // Settings button (top right)
        this.settingsBtn = this.add.image(width - 50, 50, 'settings_button')
            .setInteractive()
            .setScale(0.4)
            .setOrigin(0.5);
            
        this.settingsBtn.on('pointerover', () => {
            this.settingsBtn.setScale(0.45);
            this.settingsBtn.setTint(0xffff99);
        });
        
        this.settingsBtn.on('pointerout', () => {
            this.settingsBtn.setScale(0.4);
            this.settingsBtn.clearTint();
        });
        
        this.settingsBtn.on('pointerup', () => {
            this.scene.launch('SettingsScene');
        });
        
        // Back button
        this.backBtn = this.add.text(70, height - 100, window.gameManager.getTranslation('back'), {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#e74c3c',
            padding: { x: 15, y: 10 }
        }).setInteractive();
        
        this.backBtn.on('pointerover', () => {
            this.backBtn.setStyle({ backgroundColor: '#c0392b' });
        });
        
        this.backBtn.on('pointerout', () => {
            this.backBtn.setStyle({ backgroundColor: '#e74c3c' });
        });
        
        this.backBtn.on('pointerup', () => {
            this.scene.start('MainMenuScene');
        });
        
        // Start button
        this.startBtn = this.add.text(width - 70, height - 100, window.gameManager.getTranslation('start'), {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#27ae60',
            padding: { x: 15, y: 10 }
        }).setInteractive().setOrigin(1, 0);
        
        this.startBtn.on('pointerover', () => {
            this.startBtn.setStyle({ backgroundColor: '#229954' });
        });
        
        this.startBtn.on('pointerout', () => {
            this.startBtn.setStyle({ backgroundColor: '#27ae60' });
        });
        
        this.startBtn.on('pointerup', () => {
            this.goToDropship();
        });
        
        // Update players display
        this.updatePlayersDisplay();
    }
    
    createStarField() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const star = this.add.circle(x, y, 1, 0xffffff, 0.7);
            
            // Add twinkling animation
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
    
    addPlayer(name, isLocal = false) {
        if (this.players.length >= this.maxPlayers) return;
        
        const player = {
            name: name,
            isLocal: isLocal,
            color: this.getRandomColor(),
            ready: false,
            id: `player_${this.players.length}`
        };
        
        this.players.push(player);
        this.updatePlayersDisplay();
    }
    
    addAIPlayers() {
        const aiNames = ['Red', 'Blue', 'Green', 'Pink', 'Orange', 'Yellow', 'Black', 'White', 'Purple'];
        const numAI = Math.min(5, this.maxPlayers - 1); // Add up to 5 AI players
        
        for (let i = 0; i < numAI; i++) {
            this.addPlayer(aiNames[i] || `Player ${i + 2}`);
        }
    }
    
    getRandomColor() {
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
        
        return colors[this.players.length % colors.length];
    }
    
    updatePlayersDisplay() {
        // Clear existing player displays
        if (this.playerTexts) {
            this.playerTexts.forEach(text => text.destroy());
        }
        if (this.playerCircles) {
            this.playerCircles.forEach(circle => circle.destroy());
        }
        
        this.playerTexts = [];
        this.playerCircles = [];
        
        // Display each player
        this.players.forEach((player, index) => {
            const x = 90;
            const y = 180 + (index * 40);
            
            // Player color circle
            const circle = this.add.circle(x, y, 15, player.color);
            if (player.color === 0x000000) {
                circle.setStrokeStyle(2, 0xffffff); // White border for black color
            }
            this.playerCircles.push(circle);
            
            // Player name with local indicator
            const nameText = player.isLocal ? `${player.name} (You)` : player.name;
            const text = this.add.text(x + 30, y, nameText, {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0, 0.5);
            
            // Show player name above character (this will be important in actual game)
            const nameTag = this.add.text(x, y - 25, player.name, {
                fontSize: '12px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5, 0.5);
            
            this.playerTexts.push(text);
            this.playerTexts.push(nameTag);
            
            // Add subtle animation
            this.tweens.add({
                targets: [circle, text, nameTag],
                alpha: 0.8,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                delay: index * 200
            });
        });
        
        // Update player count
        if (this.playerCountText) {
            this.playerCountText.destroy();
        }
        
        this.playerCountText = this.add.text(this.cameras.main.width - 70, 140, `${this.players.length}/${this.maxPlayers}`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
    }
    
    startGame() {
        if (this.players.length < 4) {
            // Show message that we need at least 4 players
            const warningText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Need at least 4 players to start!', {
                fontSize: '24px',
                fill: '#ff0000',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: warningText,
                alpha: 0,
                duration: 3000,
                onComplete: () => {
                    warningText.destroy();
                }
            });
            
            return;
        }
        
        // Store player data for the game
        this.registry.set('players', this.players);
        this.registry.set('localPlayer', this.players.find(p => p.isLocal));
        
        // For now, just show a message that the game would start
        const startText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Game Starting...\\nThis is where the actual game would begin!', {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setOrigin(0.5);
        
        // TODO: Transition to actual game scene
        // this.scene.start('GameScene');
    }
    
    createCustomizationArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Customization panel (right side)
        const customX = width - 300;
        const customY = 120;
        const customWidth = 250;
        const customHeight = height - 300;
        
        this.customBg = this.add.graphics();
        this.customBg.fillStyle(0x16213e, 0.8);
        this.customBg.lineStyle(2, 0x0f4c75, 1);
        this.customBg.fillRoundedRect(customX, customY, customWidth, customHeight, 10);
        this.customBg.strokeRoundedRect(customX, customY, customWidth, customHeight, 10);
        
        // Customization title
        this.add.text(customX + 20, customY + 20, 'Customize:', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        
        // Body color section
        this.add.text(customX + 20, customY + 60, 'Body Color:', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        
        this.createColorPicker(customX + 20, customY + 85, 'body');
        
        // Backpack color section
        this.add.text(customX + 20, customY + 160, 'Backpack Color:', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        
        this.createColorPicker(customX + 20, customY + 185, 'backpack');
        
        // Preview player
        this.createPlayerPreview(customX + 125, customY + 280);
    }
    
    createColorPicker(x, y, type) {
        // Use Among Us official colors
        const amongUsColors = CharacterSystem.getAvailableColors();
        const colors = amongUsColors.map(colorData => colorData.value);
        
        colors.forEach((color, index) => {
            const colorX = x + (index % 5) * 35;
            const colorY = y + Math.floor(index / 5) * 35;
            
            const colorCircle = this.add.circle(colorX + 15, colorY + 15, 12, color)
                .setInteractive()
                .setStrokeStyle(2, 0xffffff);
            
            if (color === 0x000000) {
                colorCircle.setStrokeStyle(3, 0xffffff);
            }
            
            // Highlight selected color
            if ((type === 'body' && color === this.playerCustomization.bodyColor) ||
                (type === 'backpack' && color === this.playerCustomization.backpackColor)) {
                colorCircle.setStrokeStyle(4, 0x00ff00);
            }
            
            colorCircle.on('pointerup', () => {
                this.selectColor(type, color);
            });
        });
    }
    
    selectColor(type, color) {
        if (type === 'body') {
            this.playerCustomization.bodyColor = color;
        } else if (type === 'backpack') {
            this.playerCustomization.backpackColor = color;
        }
        
        // Update the local player's appearance
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer) {
            localPlayer.color = this.playerCustomization.bodyColor;
        }
        
        // Recreate customization area to update selected colors
        this.customBg.destroy();
        this.createCustomizationArea();
        this.updatePlayersDisplay();
    }
    
    createPlayerPreview(x, y) {
        // Body
        this.previewBody = this.add.circle(x, y, 20, this.playerCustomization.bodyColor);
        if (this.playerCustomization.bodyColor === 0x000000) {
            this.previewBody.setStrokeStyle(2, 0xffffff);
        }
        
        // Backpack
        this.previewBackpack = this.add.circle(x + 12, y - 8, 8, this.playerCustomization.backpackColor);
        
        // Name tag
        this.previewName = this.add.text(x, y - 35, window.gameManager.getPlayerName(), {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
    }
    
    goToDropship() {
        if (this.players.length < 4) {
            // Show message that we need at least 4 players to start
            const warningText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Need at least 4 players to start!', {
                fontSize: '24px',
                fill: '#ff0000',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: warningText,
                alpha: 0,
                duration: 3000,
                onComplete: () => {
                    warningText.destroy();
                }
            });
            
            return;
        }
        
        // Store player data and customization for the dropship
        this.registry.set('players', this.players);
        this.registry.set('localPlayer', this.players.find(p => p.isLocal));
        this.registry.set('playerCustomization', this.playerCustomization);
        
        // Go to Dropship Lobby
        this.scene.start('DropshipLobbyScene');
    }

    update() {
        // Handle any real-time updates here
    }
}