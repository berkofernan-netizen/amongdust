export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Harita
        this.load.image('skeldMap', 'assets/map.png'); 

        // Oyuncu
        this.load.image('player', 'assets/character/idle.png');
    }

    create() {
        // Haritayı ekle (ortalanmış şekilde)
        this.map = this.add.image(this.scale.width / 2, this.scale.height / 2, 'skeldMap');
        this.map.setDisplaySize(this.scale.width, this.scale.height);

        // Oyuncuyu ekle
        this.player = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'player');

        // Klavye kontrolleri
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (!this.cursors) return;

        let speed = 2;

        if (this.cursors.left.isDown) {
            this.player.x -= speed;
        } else if (this.cursors.right.isDown) {
            this.player.x += speed;
        }

        if (this.cursors.up.isDown) {
            this.player.y -= speed;
        } else if (this.cursors.down.isDown) {
            this.player.y += speed;
        }
    }
                }
