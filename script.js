var config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  parent: "happycapy",
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var player;
var platforms;
var cursors;
var isClicking = false;
var touchRight = false;
var touchLeft = false;
var touchJump = false;
var score = 0;
var gameOver = false;
var scoreText;
var right = true;
var flipped_gravity = false;

var game = new Phaser.Game(config);

function preload() {
  this.load.image('bg', 'assets/background.png');
  this.load.image('ground', 'assets/groundtile.png');
  this.load.image('yuzu', 'assets/yuzu.png');
  this.load.image('tub', 'assets/capytub.png');
  this.load.image('tubfront', 'assets/capytubfront.png');
  this.load.spritesheet('capy', 'assets/capybara_sprite.png', { frameWidth: 106, frameHeight: 87 });
}

function create() {
    this.add.image(config.width/2, config.height/2, 'bg');
    platforms = this.physics.add.staticGroup();

    // ground
    platforms.create(config.width/2, config.height - 10, 'ground').setScale(64, 1).refreshBody();
    // start
    platforms.create(200, 530, 'ground').setScale(20, 1).refreshBody();
    // overhang
    platforms.create(350, 620, 'ground').setScale(5, 1).refreshBody();
    platforms.create(400, 660, 'ground').setScale(1, 5).refreshBody();
    // first jump
    platforms.create(720, 530, 'ground').setScale(10, 1).refreshBody();
    platforms.create(720, 380, 'ground').setScale(1, 14).refreshBody();
    platforms.create(720, 440, 'ground').setScale(3, 1).refreshBody();
    platforms.create(720, 350, 'ground').setScale(3, 1).refreshBody();
    platforms.create(330, 250, 'ground').setScale(40, 1).refreshBody();
    // ladder
    platforms.create(1040, 620, 'ground').setScale(5, 1).refreshBody();
    platforms.create(1105, 530, 'ground').setScale(5, 1).refreshBody();
    platforms.create(1165, 440, 'ground').setScale(5, 1).refreshBody();
    platforms.create(1040, 360, 'ground').setScale(5, 1).refreshBody();
    platforms.create(980, 310, 'ground').setScale(1, 6).refreshBody();
    // next
    platforms.create(940, 260, 'ground').setScale(5, 1).refreshBody();
    // goal
    platforms.create(200, 160, 'ground').setScale(20, 1).refreshBody();

    tub = this.physics.add.staticGroup();
    tub.create(200, 120, 'tub').setScale(0.3).refreshBody();
    tubfront = this.add.image(200, 120, 'tubfront').setScale(0.3);

    // The player and its settings
    player = this.physics.add.sprite(200, 400, 'capy').setScale(0.5);
    tubfront.setDepth(1);

    player.setCollideWorldBounds(true);

    grav_yuzu = this.physics.add.staticGroup();
    grav_yuzu.create(350, 660, 'yuzu');

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
  cursors = this.input.keyboard.createCursorKeys();
  this.input.addPointer(1);

  this.input.on('pointerdown', handleTouchDown);
  this.input.on('pointerup', handleTouchUp);

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, grav_yuzu, antigrav, null, this);
  this.physics.add.collider(player, tub, win, null, this);
}

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown || touchLeft) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
    right = false;
  }
  else if (cursors.right.isDown || touchRight) {
    player.setVelocityX(160);

    player.anims.play('right', true);
    right = true;
  } else {
    player.setVelocityX(0);
    if (right){
        player.anims.play('right_static');
    } else {
        player.anims.play('left_static');
    }
  }
  if ((cursors.up.isDown || touchJump) && player.body.touching.down && !flipped_gravity) {
        player.setVelocityY(-330);

  }
  if ((cursors.up.isDown || touchJump) && player.body.touching.up && flipped_gravity) {
        player.setVelocityY(330);

  }
}

function handleTouchDown(pointer){
    if (pointer.position.x > (config.width * 3 / 4) &&
        pointer.position.y > (config.height * 1 / 2)){
        touchRight = true;
    }
    if (pointer.position.x < (config.width * 1 / 4) &&
        pointer.position.y > (config.height * 1 / 2)){
        touchLeft = true;
    }
    if (pointer.position.y < (config.height * 1 / 2)){
        touchJump = true;
    }
}

function handleTouchUp(pointer){
    if (pointer.downX > (config.width * 3 / 4)){
        touchRight = false;
    }
    if (pointer.downX < (config.width * 1 / 4)){
        touchLeft = false;
    }
    if (pointer.downY < (config.height * 1 / 2)){
        touchJump = false;
    }
}

function antigrav(player, yuzu) {
    yuzu.disableBody(true, true);
    player.setGravity(0, -1200);
    player.setFlipY(true);
    flipped_gravity = true;
    setTimeout(function() {
        yuzu.enableBody(true, yuzu.x, 0, true, true);
        player.setGravity(0, 0);
        player.setFlipY(false);
        flipped_gravity = false;
    }, 5000)
}

function win(player, tub) {
  this.physics.pause();
  player.anims.play('turn');
  player.setPosition(205, 90)
  gameOver = true;
}