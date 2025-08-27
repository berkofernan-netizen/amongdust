export default class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    this.add.text(100, 100, "Main Menu Scene Çalışıyor!", { font: '32px Arial', fill: '#fff' });
  }
}
