
var touchRight = false;
var touchLeft = false;
var touchJump = false;

class GameScene extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'gameScene', active: true });

        this.player = null;
        this.tub = null;
        this.tubfront = null;
        this.grav_yuzu = null;
        this.platforms = null;
        this.cursors = null;
        this.isClicking = false;
        touchRight = false;
        touchLeft = false;
        touchJump = false;
        this.score = 0;
        this.gameOver = false;
        this.right = true;
        this.flipped_gravity = false;
    }

    preload ()
    {
        this.load.image('bg', 'assets/background.png');
        this.load.image('ground', 'assets/groundtile.png');
        this.load.image('yuzu', 'assets/yuzu.png');
        this.load.image('tub', 'assets/capytub.png');
        this.load.image('tubfront', 'assets/capytubfront.png');
        this.load.spritesheet('capy', 'assets/capybara_sprite.png', { frameWidth: 106, frameHeight: 87 });
    }

    create ()
    {
        this.add.image(1280/2, 720/2, 'bg');
        this.platforms = this.physics.add.staticGroup();

        // ground
        this.platforms.create(1280/2, 720 - 10, 'ground').setScale(64, 1).refreshBody();
        // start
        this.platforms.create(200, 530, 'ground').setScale(20, 1).refreshBody();
        // overhang
        this.platforms.create(350, 620, 'ground').setScale(5, 1).refreshBody();
        this.platforms.create(400, 660, 'ground').setScale(1, 5).refreshBody();
        // first jump
        this.platforms.create(720, 530, 'ground').setScale(10, 1).refreshBody();
        this.platforms.create(720, 380, 'ground').setScale(1, 14).refreshBody();
        this.platforms.create(720, 440, 'ground').setScale(3, 1).refreshBody();
        this.platforms.create(720, 350, 'ground').setScale(3, 1).refreshBody();
        this.platforms.create(330, 250, 'ground').setScale(40, 1).refreshBody();
        // ladder
        this.platforms.create(1040, 620, 'ground').setScale(5, 1).refreshBody();
        this.platforms.create(1105, 530, 'ground').setScale(5, 1).refreshBody();
        this.platforms.create(1165, 440, 'ground').setScale(5, 1).refreshBody();
        this.platforms.create(1040, 360, 'ground').setScale(5, 1).refreshBody();
        this.platforms.create(980, 310, 'ground').setScale(1, 6).refreshBody();
        // next
        this.platforms.create(940, 260, 'ground').setScale(5, 1).refreshBody();
        // goal
        this.platforms.create(200, 160, 'ground').setScale(20, 1).refreshBody();

        this.tub = this.physics.add.staticGroup();
        this.tub.create(200, 120, 'tub').setScale(0.3).refreshBody();
        this.tubfront = this.add.image(200, 120, 'tubfront').setScale(0.3);

        // The player and its settings
        this.player = this.physics.add.sprite(200, 400, 'capy').setScale(0.5);
        this.tubfront.setDepth(1);

        this.player.setCollideWorldBounds(true);

        this.grav_yuzu = this.physics.add.staticGroup();
        this.grav_yuzu.create(350, 660, 'yuzu');

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('capy', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'capy', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('capy', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right_static',
            frames: [{ key: 'capy', frame: 8 }],
            frameRate: 20
        });
        this.anims.create({
            key: 'left_static',
            frames: [{ key: 'capy', frame: 0 }],
            frameRate: 20
        });

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.addPointer(1);

        this.input.on('pointerdown', this.handleTouchDown, null, this);
        this.input.on('pointerup', this.handleTouchUp, null, this);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.grav_yuzu, this.antigrav, null, this);
        this.physics.add.collider(this.player, this.tub, this.win, null, this);
    }

    update ()
    {
        if (this.gameOver) {
            return;
        }

        if (this.cursors.left.isDown || touchLeft) {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
            this.right = false;
        }
        else if (this.cursors.right.isDown || touchRight) {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
            this.right = true;
        } else {
            this.player.setVelocityX(0);
        if (this.right){
            this.player.anims.play('right_static');
        } else {
            this.player.anims.play('left_static');
        }
        }
        if ((this.cursors.up.isDown || touchJump) && this.player.body.touching.down && !this.flipped_gravity) {
            this.player.setVelocityY(-330);

        }
        if ((this.cursors.up.isDown || touchJump) && this.player.body.touching.up && this.flipped_gravity) {
            this.player.setVelocityY(330);

        }
    }

    handleTouchDown (pointer) {
        if (pointer.position.x > (1280 * 3 / 4) &&
            pointer.position.y > (720 * 1 / 2)){
                touchRight = true;
        }
        if (pointer.position.x < (1280 * 1 / 4) &&
            pointer.position.y > (720 * 1 / 2)){
                touchLeft = true;
        }
        if (pointer.position.y < (720 * 1 / 2)){
            touchJump = true;
        }
    }

    handleTouchUp (pointer){
        if (pointer.downX > (1280 * 3 / 4)){
            touchRight = false;
        }
        if (pointer.downX < (1280 * 1 / 4)){
            touchLeft = false;
        }
        if (pointer.downY < (720 * 1 / 2)){
            touchJump = false;
        }
    }

    antigrav(player, yuzu) {
        yuzu.disableBody(true, true);
        player.setGravity(0, -1200);
        player.setFlipY(true);
        this.flipped_gravity = true;
        setTimeout(()=>{
            yuzu.enableBody(true, yuzu.x, yuzu.y, true, true);
            player.setGravity(0, 0);
            player.setFlipY(false);
            this.flipped_gravity = false;
        }, 5000)
    }

    win(player, tub) {
      this.physics.pause();
      player.anims.play('turn');
      player.setPosition(205, 90)
      this.gameOver = true;
    }
}

var config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      parent: 'happycapy',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720
  },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 600 },
        debug: false
      }
    },
    scene: [ GameScene ]
};

const game = new Phaser.Game(config);