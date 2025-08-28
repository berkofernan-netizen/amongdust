import MainMenuScene from './scene/MainMenuScene.js';
import DropshipLobbyScene from './scene/DropshipLobbyScene.js';
import GameScene from './scene/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [ MainMenuScene, DropshipLobbyScene, GameScene ], // hepsini ekle
    parent: 'game-container'
};

const game = new Phaser.Game(config);
