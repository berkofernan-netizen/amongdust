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
    this.load.video('introVideo', 'assets/intro.mp4', 'canplaythrough', false, true);
  }

  create() {
    let bgVideo = this.add.video(this.scale.width / 2, this.scale.height / 2, 'introVideo');
    bgVideo.setDisplaySize(this.scale.width, this.scale.height);
    bgVideo.setDepth(-1);

    // Sessiz başlat
    this.input.once('pointerdown', () => {
        bgVideo.setMute(true);
        bgVideo.play(true);
        bgVideo.setLoop(true);
    });

    // Test için fallback (video açılmazsa kırmızı ekran verelim)
    bgVideo.on('error', () => {
        this.cameras.main.setBackgroundColor('#ff0000');
        console.error("Video oynatılamadı!");
    });
      }
                              }
