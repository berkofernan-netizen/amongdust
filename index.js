import MainMenuScene from './scene/MainMenuScene.js';
import DropshipLobbyScene from './scene/DropshipLobbyScene.js';
import GameScene from './scene/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [ MainMenuScene ],  // sadece ana menü sahnesi ile başla
    parent: 'game-container'
};

const game = new Phaser.Game(config);
