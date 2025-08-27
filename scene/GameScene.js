export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Skeld haritası
        this.load.image('skeldMap', 'assets/map.png');  // map.png yolunu dikkat et

        // Karakter
        this.load.image('player', 'assets/character/idle.png');
    }

    create() {
        // Haritayı ortala
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'skeldMap')
            .setDisplaySize(this.scale.width, this.scale.height);

        // Oyuncu
        this.player = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'player');

        // Basit test için klavye kontrolü (ilerde joystick ekleriz)
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.x -= 2;
        } else if (this.cursors.right.isDown) {
            this.player.x += 2;
        }

        if (this.cursors.up.isDown) {
            this.player.y -= 2;
        } else if (this.cursors.down.isDown) {
            this.player.y += 2;
        }
    }
              }
