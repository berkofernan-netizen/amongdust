window.onerror = function(message, source, lineno, colno, error) {
    alert("Error: " + message + "\nLine: " + lineno);
};
import MainMenuScene from 'amongdust/scene/MainMenuScene.js';
import DropshipLobbyScene from 'amongdust/scene/DropshipLobbyScene.js';
import GameScene from 'amongdust/scene/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [ MainMenuScene, DropshipLobbyScene, GameScene ], // sahneler listesi
    parent: 'game-container'
};

const game = new Phaser.Game(config);
