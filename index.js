window.onerror = function(message, source, lineno, colno, error) {
  let div = document.createElement("div");
  div.style.position = "absolute";
  div.style.top = "0";
  div.style.left = "0";
  div.style.background = "black";
  div.style.color = "red";
  div.style.padding = "10px";
  div.style.zIndex = "9999";
  div.innerText = "Error: " + message + "\nLine: " + lineno + "\nFile: " + source;
  document.body.appendChild(div);
};
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
