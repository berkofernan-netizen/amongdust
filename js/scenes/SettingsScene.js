// SettingsScene.js - Settings overlay with language selection and player name input
class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create dark overlay background
        this.overlay = this.add.graphics();
        this.overlay.fillStyle(0x000000, 0.8);
        this.overlay.fillRect(0, 0, width, height);
        this.overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        
        // Create settings panel
        this.settingsPanel = this.add.graphics();
        this.settingsPanel.fillStyle(0x2c3e50, 0.95);
        this.settingsPanel.lineStyle(4, 0x3498db, 1);
        
        const panelWidth = 500;
        const panelHeight = 400;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2;
        
        this.settingsPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        this.settingsPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
        
        // Settings title
        this.settingsTitle = this.add.text(width / 2, panelY + 40, window.gameManager.getTranslation('settings'), {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Player name section
        const nameY = panelY + 100;
        this.nameLabel = this.add.text(width / 2 - 180, nameY, window.gameManager.getTranslation('playerName') + ':', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        
        // Create player name input
        this.createPlayerNameInput(width / 2 - 50, nameY - 5);
        
        // Language section
        const langY = panelY + 180;
        this.langLabel = this.add.text(width / 2 - 180, langY, window.gameManager.getTranslation('language') + ':', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        
        // Language buttons
        this.createLanguageButtons(langY + 40);
        
        // Back button
        this.createBackButton(panelX + panelWidth - 80, panelY + 20);
        
        // Apply button
        this.createApplyButton(width / 2, panelY + panelHeight - 60);
        
        // ESC key to close settings
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => {
            this.closeSettings();
        });
    }
    
    createPlayerNameInput(x, y) {
        // Create input background
        this.inputBg = this.add.graphics();
        this.inputBg.fillStyle(0xffffff, 1);
        this.inputBg.lineStyle(2, 0x3498db, 1);
        this.inputBg.fillRoundedRect(x - 5, y - 5, 200, 35, 5);
        this.inputBg.strokeRoundedRect(x - 5, y - 5, 200, 35, 5);
        
        // Create HTML input element for player name
        this.playerNameInput = document.createElement('input');
        this.playerNameInput.type = 'text';
        this.playerNameInput.value = window.gameManager.getPlayerName();
        this.playerNameInput.maxLength = 12;
        this.playerNameInput.style.position = 'absolute';
        this.playerNameInput.style.left = x + 'px';
        this.playerNameInput.style.top = y + 'px';
        this.playerNameInput.style.width = '190px';
        this.playerNameInput.style.height = '25px';
        this.playerNameInput.style.fontSize = '16px';
        this.playerNameInput.style.border = 'none';
        this.playerNameInput.style.outline = 'none';
        this.playerNameInput.style.backgroundColor = 'transparent';
        this.playerNameInput.style.color = '#000000';
        this.playerNameInput.style.fontFamily = 'Arial, sans-serif';
        this.playerNameInput.style.zIndex = '1001';
        
        document.body.appendChild(this.playerNameInput);
        
        // Focus the input
        setTimeout(() => {
            this.playerNameInput.focus();
        }, 100);
    }
    
    createLanguageButtons(y) {
        const width = this.cameras.main.width;
        
        // English button
        this.englishBtn = this.add.text(width / 2 - 80, y, 'English', {
            fontSize: '18px',
            fill: window.gameManager.getLanguage() === 'en' ? '#3498db' : '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: window.gameManager.getLanguage() === 'en' ? '#ffffff' : '#34495e',
            padding: { x: 15, y: 8 }
        }).setInteractive();
        
        this.englishBtn.on('pointerover', () => {
            this.englishBtn.setStyle({ backgroundColor: '#3498db' });
        });
        
        this.englishBtn.on('pointerout', () => {
            this.englishBtn.setStyle({ 
                backgroundColor: window.gameManager.getLanguage() === 'en' ? '#ffffff' : '#34495e' 
            });
        });
        
        this.englishBtn.on('pointerup', () => {
            this.selectLanguage('en');
        });
        
        // Turkish button
        this.turkishBtn = this.add.text(width / 2 + 20, y, 'Türkçe', {
            fontSize: '18px',
            fill: window.gameManager.getLanguage() === 'tr' ? '#3498db' : '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: window.gameManager.getLanguage() === 'tr' ? '#ffffff' : '#34495e',
            padding: { x: 15, y: 8 }
        }).setInteractive();
        
        this.turkishBtn.on('pointerover', () => {
            this.turkishBtn.setStyle({ backgroundColor: '#3498db' });
        });
        
        this.turkishBtn.on('pointerout', () => {
            this.turkishBtn.setStyle({ 
                backgroundColor: window.gameManager.getLanguage() === 'tr' ? '#ffffff' : '#34495e' 
            });
        });
        
        this.turkishBtn.on('pointerup', () => {
            this.selectLanguage('tr');
        });
    }
    
    selectLanguage(lang) {
        window.gameManager.setLanguage(lang);
        
        // Update button styles
        this.englishBtn.setStyle({
            fill: lang === 'en' ? '#3498db' : '#ffffff',
            backgroundColor: lang === 'en' ? '#ffffff' : '#34495e'
        });
        
        this.turkishBtn.setStyle({
            fill: lang === 'tr' ? '#3498db' : '#ffffff',
            backgroundColor: lang === 'tr' ? '#ffffff' : '#34495e'
        });
        
        // Update text labels
        this.settingsTitle.setText(window.gameManager.getTranslation('settings'));
        this.nameLabel.setText(window.gameManager.getTranslation('playerName') + ':');
        this.langLabel.setText(window.gameManager.getTranslation('language') + ':');
        this.applyBtn.setText(window.gameManager.getTranslation('apply'));
        this.backBtn.setText(window.gameManager.getTranslation('back'));
    }
    
    createBackButton(x, y) {
        this.backBtn = this.add.text(x, y, window.gameManager.getTranslation('back'), {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#e74c3c',
            padding: { x: 12, y: 6 }
        }).setInteractive().setOrigin(0.5);
        
        this.backBtn.on('pointerover', () => {
            this.backBtn.setStyle({ backgroundColor: '#c0392b' });
        });
        
        this.backBtn.on('pointerout', () => {
            this.backBtn.setStyle({ backgroundColor: '#e74c3c' });
        });
        
        this.backBtn.on('pointerup', () => {
            this.closeSettings();
        });
    }
    
    createApplyButton(x, y) {
        this.applyBtn = this.add.text(x, y, window.gameManager.getTranslation('apply'), {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#27ae60',
            padding: { x: 20, y: 10 }
        }).setInteractive().setOrigin(0.5);
        
        this.applyBtn.on('pointerover', () => {
            this.applyBtn.setStyle({ backgroundColor: '#229954' });
        });
        
        this.applyBtn.on('pointerout', () => {
            this.applyBtn.setStyle({ backgroundColor: '#27ae60' });
        });
        
        this.applyBtn.on('pointerup', () => {
            this.applySettings();
        });
    }
    
    applySettings() {
        // Save player name
        if (this.playerNameInput && this.playerNameInput.value.trim() !== '') {
            window.gameManager.setPlayerName(this.playerNameInput.value.trim());
        }
        
        this.closeSettings();
    }
    
    closeSettings() {
        // Remove HTML input element
        if (this.playerNameInput && this.playerNameInput.parentNode) {
            this.playerNameInput.parentNode.removeChild(this.playerNameInput);
        }
        
        // Close the settings scene
        this.scene.stop();
    }
    
    shutdown() {
        // Clean up HTML input element on scene shutdown
        if (this.playerNameInput && this.playerNameInput.parentNode) {
            this.playerNameInput.parentNode.removeChild(this.playerNameInput);
        }
    }
}