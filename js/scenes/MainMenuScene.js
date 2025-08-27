// MainMenuScene.js - Main menu with background video, logo, and buttons
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background video
        this.backgroundVideo = this.add.video(width / 2, height / 2, 'intro');
        this.backgroundVideo.setScale(Math.max(width / this.backgroundVideo.width, height / this.backgroundVideo.height));
        this.backgroundVideo.play(true); // Loop the video
        this.backgroundVideo.setAlpha(0.8); // Slightly transparent for better UI visibility
        
        // Add dark overlay for better button visibility
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRect(0, 0, width, height);
        
        // Add logo
        this.logo = this.add.image(width / 2, height * 0.25, 'logo');
        this.logo.setScale(0.6);
        
        // Add glow effect to logo
        this.logo.setPostPipeline('glow');
        
        // Create buttons
        this.createButtons();
        
        // Add subtle animations
        this.tweens.add({
            targets: this.logo,
            scaleX: 0.65,
            scaleY: 0.65,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const buttonY = height * 0.6;
        const buttonSpacing = 120;
        
        // Play Button
        this.playButton = this.add.image(width / 2, buttonY, 'play_button')
            .setInteractive()
            .setScale(0.8);
            
        this.playButton.on('pointerover', () => {
            this.playButton.setScale(0.85);
            this.playButton.setTint(0xffff99);
        });
        
        this.playButton.on('pointerout', () => {
            this.playButton.setScale(0.8);
            this.playButton.clearTint();
        });
        
        this.playButton.on('pointerdown', () => {
            this.playButton.setScale(0.75);
        });
        
        this.playButton.on('pointerup', () => {
            this.playButton.setScale(0.85);
            // For now, go directly to local lobby
            this.scene.start('LocalLobbyScene');
        });
        
        // Local Button
        this.localButton = this.add.image(width / 2, buttonY + buttonSpacing, 'local_button')
            .setInteractive()
            .setScale(0.8);
            
        this.localButton.on('pointerover', () => {
            this.localButton.setScale(0.85);
            this.localButton.setTint(0xffff99);
        });
        
        this.localButton.on('pointerout', () => {
            this.localButton.setScale(0.8);
            this.localButton.clearTint();
        });
        
        this.localButton.on('pointerdown', () => {
            this.localButton.setScale(0.75);
        });
        
        this.localButton.on('pointerup', () => {
            this.localButton.setScale(0.85);
            this.scene.start('LocalLobbyScene');
        });
        
        // Settings Button
        this.settingsButton = this.add.image(width / 2, buttonY + (buttonSpacing * 2), 'settings_button')
            .setInteractive()
            .setScale(0.8);
            
        this.settingsButton.on('pointerover', () => {
            this.settingsButton.setScale(0.85);
            this.settingsButton.setTint(0xffff99);
        });
        
        this.settingsButton.on('pointerout', () => {
            this.settingsButton.setScale(0.8);
            this.settingsButton.clearTint();
        });
        
        this.settingsButton.on('pointerdown', () => {
            this.settingsButton.setScale(0.75);
        });
        
        this.settingsButton.on('pointerup', () => {
            this.settingsButton.setScale(0.85);
            this.scene.launch('SettingsScene');
        });
        
        // Add button hover sounds (we can add audio later)
        this.buttons = [this.playButton, this.localButton, this.settingsButton];
        
        // Stagger button animations
        this.buttons.forEach((button, index) => {
            this.tweens.add({
                targets: button,
                y: button.y + 10,
                duration: 1500 + (index * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }
    
    update() {
        // Keep background video playing
        if (this.backgroundVideo && !this.backgroundVideo.isPlaying()) {
            this.backgroundVideo.play(true);
        }
    }
}