// main.js - Phaser game configuration and initialization
class AmongUsGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 1280,
            height: 720,
            parent: 'game-container',
            backgroundColor: '#000000',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 800,
                    height: 600
                },
                max: {
                    width: 1920,
                    height: 1080
                }
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [
                PreloadScene,
                MainMenuScene,
                SettingsScene,
                LocalLobbyScene,
                DropshipLobbyScene
            ],
            input: {
                keyboard: true,
                mouse: true,
                touch: true
            },
            render: {
                pixelArt: false,
                antialias: true
            }
        };
        
        // Initialize the game
        this.game = new Phaser.Game(this.config);
        
        // Add global event listeners
        this.setupGlobalEvents();
    }
    
    setupGlobalEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.game.scale.refresh();
        });
        
        // Handle visibility change (pause/resume game when tab is hidden/shown)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.game.sound.pauseAll();
            } else {
                this.game.sound.resumeAll();
            }
        });
        
        // Handle fullscreen toggle
        window.addEventListener('keydown', (event) => {
            if (event.key === 'F11') {
                event.preventDefault();
                this.toggleFullscreen();
            }
        });
    }
    
    toggleFullscreen() {
        if (this.game.scale.isFullscreen) {
            this.game.scale.stopFullscreen();
        } else {
            this.game.scale.startFullscreen();
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    window.amongUsGame = new AmongUsGame();
});