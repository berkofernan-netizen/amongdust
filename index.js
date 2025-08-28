// Hata yakalama kodu (en üstte olmalı)
window.onerror = function (message, source, lineno, colno, error) {
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.top = "0";
  div.style.left = "0";
  div.style.background = "red";
  div.style.color = "white";
  div.style.padding = "10px";
  div.style.zIndex = "9999";
  div.innerText = "Error: " + message + "\nLine: " + lineno;
  document.body.appendChild(div);
};

// Importlar sonra gelir
import MainMenuScene from './scene/MainMenuScene.js';
import DropshipLobbyScene from './scene/DropshipLobbyScene.js';
import GameScene from './scene/GameScene.js';

// Phaser config
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [ MainMenuScene, DropshipLobbyScene, GameScene ],
    parent: 'game-container'
};

const game = new Phaser.Game(config);
