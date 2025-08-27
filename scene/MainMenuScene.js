export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    // Kısa loop video + görseller
    this.load.video('menuBg', 'assets/intro_short.mp4', 'loadeddata', false, true);
    this.load.image('logo', 'assets/logo.png');
    this.load.image('playButton', 'assets/ui/play_button.png');
    this.load.image('localButton', 'assets/ui/local_button.png');
    this.load.image('settingsButton', 'assets/ui/settings_button.png');
  }

  create() {
    // Video arka plan
    let bgVideo = this.add.video(this.scale.width / 2, this.scale.height / 2, 'menuBg');
    bgVideo.setDisplaySize(this.scale.width, this.scale.height);
    bgVideo.setDepth(-1);
    bgVideo.setMute(true);   // Sessiz başlat (autoplay için gerekli)
    bgVideo.play(true);      // Oynat
    bgVideo.setLoop(true);   // Sürekli tekrar etsin

    // Logo
    let logo = this.add.image(this.scale.width / 2, this.scale.height / 4, 'logo');
    logo.setOrigin(0.5);

    // Butonlar
    let playBtn = this.add.image(this.scale.width / 2, this.scale.height / 2, 'playButton').setInteractive();
    let localBtn = this.add.image(this.scale.width / 2, this.scale.height / 2 + 80, 'localButton').setInteractive();
    let settingsBtn = this.add.image(this.scale.width / 2, this.scale.height / 2 + 160, 'settingsButton').setInteractive();

    // Oyun başlat
    playBtn.on('pointerdown', () => {
      this.scene.start('DropshipLobbyScene');
    });

    // Diğer butonlar
    localBtn.on('pointerdown', () => console.log("Local clicked"));
    settingsBtn.on('pointerdown', () => console.log("Settings clicked"));
  }
                              }
