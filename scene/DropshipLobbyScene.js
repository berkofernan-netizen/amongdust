export default class DropshipLobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DropshipLobbyScene' });
    }

    preload() {
        // Arka plan
        this.load.image('dropshipBg', 'assets/dropship.png');

        // Karakter animasyonları
        this.load.image('lobbyPose', 'assets/character/lobby.png');
        this.load.image('idle', 'assets/character/idle.png');
        this.load.image('walk', 'assets/character/walk.png');

        // Joystick
        this.load.image('joystickBase', 'assets/ui/joystick_base.png');
        this.load.image('joystickHandle', 'assets/ui/joystick_handle.png');

        // UI
        this.load.image('useButton', 'assets/ui/use_button.png');
        this.load.image('startButton', 'assets/ui/start_button.png');
        this.load.image('shhh', 'assets/ui/shhh.png');

        // Role videos
        this.load.video('crewmate1', 'assets/roles/crewmate_1imp.mp4');
        this.load.video('impostor', 'assets/roles/impostor.mp4');
        // Şapkalar
this.load.image('hat1', 'assets/hats/hat1.png');
this.load.image('hat2', 'assets/hats/hat2.png');
this.load.image('hat3', 'assets/hats/hat3.png');
    }

    create() {
        // Arka plan
        this.add.image(this.scale.width/2, this.scale.height/2, 'dropshipBg')
            .setDisplaySize(this.scale.width, this.scale.height);

        // Oyuncu başlangıcı → lobby pozisyonunda
        this.player = this.add.sprite(this.scale.width/2, this.scale.height/2, 'lobbyPose');

        // 1–2 saniye sonra idle pozuna geç
        this.time.delayedCall(2000, () => {
            this.player.setTexture('idle');
        });

        // Joystick
        this.joystickBase = this.add.image(150, this.scale.height - 150, 'joystickBase').setInteractive();
        this.joystickHandle = this.add.image(150, this.scale.height - 150, 'joystickHandle').setInteractive();

        this.input.setDraggable(this.joystickHandle);

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.joystickHandle) {
                let dx = dragX - this.joystickBase.x;
                let dy = dragY - this.joystickBase.y;
                let dist = Math.min(100, Math.sqrt(dx*dx + dy*dy)); // max 100 px
                let angle = Math.atan2(dy, dx);

                // Joystick handle pozisyonu
                gameObject.x = this.joystickBase.x + Math.cos(angle) * dist;
                gameObject.y = this.joystickBase.y + Math.sin(angle) * dist;

                // Player hareketi
                this.player.x += Math.cos(angle) * 2;
                this.player.y += Math.sin(angle) * 2;
                this.player.setTexture('walk');
            }
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject === this.joystickHandle) {
                gameObject.x = this.joystickBase.x;
                gameObject.y = this.joystickBase.y;
                this.player.setTexture('idle');
            }
        });

        // Host için ayarlar → Use button
        let useBtn = this.add.image(this.scale.width - 100, this.scale.height - 100, 'useButton').setInteractive();
        useBtn.on('pointerdown', () => {
    // Basit customization menüsü
    let hat1Btn = this.add.image(200, 200, 'hat1').setInteractive().setScale(0.5);
    let hat2Btn = this.add.image(300, 200, 'hat2').setInteractive().setScale(0.5);
    let hat3Btn = this.add.image(400, 200, 'hat3').setInteractive().setScale(0.5);

    // Seçim yapılınca player üstüne şapka ekle
    hat1Btn.on('pointerdown', () => this.setHat('hat1'));
    hat2Btn.on('pointerdown', () => this.setHat('hat2'));
    hat3Btn.on('pointerdown', () => this.setHat('hat3'));
});
    }

    showRoleReveal() {
        // Önce Shhh ekranı
        let shhh = this.add.image(this.scale.width/2, this.scale.height/2, 'shhh');
        shhh.setDisplaySize(this.scale.width, this.scale.height);

        // 2 sn sonra kaldır ve role videosu oynat
        this.time.delayedCall(2000, () => {
            shhh.destroy();

            // Şimdilik rastgele impostor/crewmate
            let isImpostor = Math.random() < 0.2; // %20 impostor
            let videoKey = isImpostor ? 'impostor' : 'crewmate1';

            let roleVideo = this.add.video(this.scale.width/2, this.scale.height/2, videoKey);
            roleVideo.setDisplaySize(this.scale.width, this.scale.height);
            roleVideo.play();

            // Video bitince → GameScene'e geçiş yapılabilir
            roleVideo.on('complete', () => {
                console.log("Role reveal bitti, oyun başlıyor...");
                this.scene.start('GameScene');
            });
        });
    }
setHat(hatKey) {
    if (this.currentHat) {
        this.currentHat.destroy();
    }
    this.currentHat = this.add.image(this.player.x, this.player.y - 50, hatKey);
    this.currentHat.setDepth(10);
}

update() {
    if (this.currentHat) {
        this.currentHat.x = this.player.x;
        this.currentHat.y = this.player.y - 50;
    }
}
}
