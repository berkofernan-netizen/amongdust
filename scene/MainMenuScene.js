export default class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  preload() {
    this.load.image('logo', 'assets/logo.png');
  }

  create() {
    this.add.image(this.scale.width/2, this.scale.height/2, 'logo');
  }
}
