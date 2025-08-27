export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('playButton', 'assets/ui/play_button.png');
        this.load.image('localButton', 'assets/ui/local_button.png');
        this.load.image('settingsButton', 'assets/ui/settings_button.png');
    }

    create() {
        // Arka plan (sadece renk dolduralım test için)
        this.cameras.main.setBackgroundColor('#222244');

        // Logo
        let logo = this.add.image(this.scale.width / 2, this.scale.height / 4, 'logo');
        logo.setOrigin(0.5);

        // Butonlar
        let playBtn = this.add.image(this.scale.width / 2, this.scale.height / 2, 'playButton').setInteractive();
        let localBtn = this.add.image(this.scale.width / 2, this.scale.height / 2 + 80, 'localButton').setInteractive();
        let settingsBtn = this.add.image(this.scale.width / 2, this.scale.height / 2 + 160, 'settingsButton').setInteractive();

        playBtn.on('pointerdown', () => {
            this.scene.start('DropshipLobbyScene');
        });
    }
}
