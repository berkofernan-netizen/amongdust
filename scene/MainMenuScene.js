export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // Arka plan video ve görselleri yükle
        this.load.video('introVideo', 'assets/intro.mp4', 'loadeddata', false, true);
        this.load.image('logo', 'assets/logo.png');
        this.load.image('playButton', 'assets/ui/play_button.png');
        this.load.image('localButton', 'assets/ui/local_button.png');
        this.load.image('settingsButton', 'assets/ui/settings_button.png');
    }

    create() {
    // Video arka plan
    let bgVideo = this.add.video(this.scale.width / 2, this.scale.height / 2, 'introVideo');
    bgVideo.setDisplaySize(this.scale.width, this.scale.height);
    bgVideo.setDepth(-1);

    // Kullanıcı dokununca oynat (autoplay engelini aşmak için)
    this.input.once('pointerdown', () => {
        bgVideo.play(true);
        bgVideo.setLoop(true);
    });

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
    localBtn.on('pointerdown', () => console.log("Local clicked"));
    settingsBtn.on('pointerdown', () => console.log("Settings clicked"));
    }
                               }
