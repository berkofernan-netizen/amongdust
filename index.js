import MainMenuScene from './scenes/MainMenuScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [ MainMenuScene ],
    parent: 'game-container'
};

const game = new Phaser.Game(config);
