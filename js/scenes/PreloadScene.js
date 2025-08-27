// PreloadScene.js - Loads all game assets
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    
    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: '18px monospace',
            fill: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Update loading bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            
            // Hide HTML loading text
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        });
        
        // Load assets
        // Videos
        this.load.video('intro', 'assets/intro.mp4');
        this.load.video('victory_imp', 'assets/victory_imp.mp4');
        this.load.video('victory_crew', 'assets/victory_crew.mp4');
        this.load.video('defeat_imp', 'assets/defeat_imp.mp4');
        this.load.video('defeat_crew', 'assets/defeat_crew.mp4');
        
        // Role reveal videos
        this.load.video('crewmate_1imp', 'assets/roles/crewmate_1imp.mp4');
        this.load.video('crewmate_2imp', 'assets/roles/crewmate_2imp.mp4');
        this.load.video('crewmate_3imp', 'assets/roles/crewmate_3imp.mp4');
        this.load.video('impostor_reveal', 'assets/roles/Impostor.mp4');
        
        // Images
        this.load.image('logo', 'assets/logo.png');
        this.load.image('map', 'assets/map.png');
        this.load.image('dropship', 'assets/Dropship.png');
        
        // UI Assets
        this.load.image('play_button', 'assets/ui/play_button.png');
        this.load.image('local_button', 'assets/ui/local_button.png');
        this.load.image('settings_button', 'assets/ui/settings_button.png');
        this.load.image('start_button', 'assets/ui/start_button.png');
        this.load.image('use_button', 'assets/ui/use_button.png');
        this.load.image('vent_button', 'assets/ui/vent_button.png');
        this.load.image('vote_skip', 'assets/ui/vote_skip.png');
        this.load.image('vote_tick', 'assets/ui/vote_tick.png');
        this.load.image('vote_x', 'assets/ui/vote_x.png');
        this.load.image('voting_screen', 'assets/ui/voting_screen.png');
        this.load.image('emergency', 'assets/ui/emergency.png');
        this.load.image('i_voted', 'assets/ui/i_voted.png');
        this.load.image('joystick_base', 'assets/ui/joystick_base.png');
        this.load.image('joystick_handle', 'assets/ui/joystick_handle.png');
        this.load.image('kill_button', 'assets/ui/kill_button.png');
        this.load.image('report_button', 'assets/ui/report_button.png');
        this.load.image('sabotage_button', 'assets/ui/sabotage_button.png');
        this.load.image('arrow', 'assets/ui/arrow.png');
        this.load.image('chat_background', 'assets/ui/chat_background.png');
        this.load.image('chat_button', 'assets/ui/chat_button.png');
        this.load.image('chat_input', 'assets/ui/chat_input.png');
        this.load.image('chat_scrollbar', 'assets/ui/chat_scrollbar.png');
        this.load.image('chat_send', 'assets/ui/chat_send.png');
        this.load.image('shhh', 'assets/ui/shhh.png');
        
        // Character sprites
        this.load.image('character_lobby', 'assets/character/lobby.png');
        this.load.image('character_idle', 'assets/character/idle.png');
        this.load.spritesheet('character_walk', 'assets/character/walk.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('character_death', 'assets/character/death.png');
        this.load.image('character_ghost', 'assets/character/ghost.png');
        this.load.image('character_vent', 'assets/character/vent_player.png');
        
        // Hat assets
        this.load.image('hat_eggscellent', 'assets/hats/Eggscellent.png');
        this.load.image('hat_gift_wrapped', 'assets/hats/Gift_Wrapped.png');
        this.load.image('hat_knighted', 'assets/hats/Knighted.png');
        this.load.image('hat_pompous', 'assets/hats/Pompous_Person.png');
        this.load.image('hat_punkin', 'assets/hats/Punkin.png');
        
        // Skin assets
        this.load.image('skin_flashy', 'assets/skins/Flashy.png');
        this.load.image('skin_officer', 'assets/skins/Officer_Outfit.png');
        this.load.image('skin_suited', 'assets/skins/Suited_Up.png');
        
        // Character assets (we'll add more as needed)
        this.loadEnvironmentAssets();
    }
    
    loadCharacterAssets() {
        // Load character assets from character directory
        // We'll expand this based on available assets
    }
    
    loadEnvironmentAssets() {
        // Load environment assets
        // We'll expand this based on available assets
    }
    
    create() {
        // Switch to main menu after loading
        this.scene.start('MainMenuScene');
    }
}