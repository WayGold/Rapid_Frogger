import { result } from "lodash";
import Phaser from "phaser";

//Player's score and score text on screen
var score = 0;
var y_max;
var score_text;
var gameover_text;
var isGameOver;

//Timer
var timer_bar;
var timedEvent;

const HALF_OBJ_PIXEL = 37.5;
const OBJ_PIXEL = 75;

var Game = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
        function Game() {
            Phaser.Scene.call(this, { key: 'game' });
            window.GAME = this;
        },

    // This is used for pre loading assets
    preload: function () {
        this.load.spritesheet('playerIdle', require("./assets/PlayerIdle_spritesheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('Dive_In', require("./assets/Dive_spritesheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('Dive_Out', require("./assets/Dive_spritesheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('Dive_Idle', require("./assets/DiveIdle_spritesheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('Shark_Idle', require("./assets/SharkIdle_SpriteSheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('Shark_Attack', require("./assets/SharkAttack_SpriteSheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('Eagle_Idle', require("./assets/Seagullidle_spritesheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('Eagle_Attack', require("./assets/SeagullAttack_spritesheet.png"), {
            frameWidth: 75,
            frameHeight: 75
        });

        this.load.spritesheet('OnPlat_Idle', require("./assets/PlatformIdle_SpriteSheet.png"), {
            frameWidth: 150,
            frameHeight: 75
        });

        this.load.spritesheet('OnPlat_Dive', require("./assets/PlatformDown_SpriteSheet.png"), {
            frameWidth: 150,
            frameHeight: 75
        });

        this.load.spritesheet('OnDive_JumpPlat', require("./assets/PlatformUp_SpriteSheet.png"), {
            frameWidth: 150,
            frameHeight: 75
        });

        this.load.spritesheet('DriftBottle', require("./assets/Bottle.png"), {
            frameWidth: 150,
            frameHeight: 75
        });

        this.load.image('bg', require("./assets/Background.png"));
        this.load.image('crab', require("./assets/crab.png"));
        this.load.image('JellyFish', require("./assets/JellyFish.png"))
    },


    create: function () {
        gameState.startTime = getTime();
        gameState.sharkRoamTime = gameState.startTime;
        gameState.randSharkDest = [config.width / 2, (config.height / 2 - OBJ_PIXEL) / 2];
        gameState.eagleRoamTime = gameState.startTime;
        gameState.randEagleDest = [config.width / 2, OBJ_PIXEL * 2];

        gameState.active = true;

        gameState.isPlayerDiving = false;
        gameState.isPlayerOnPlatform = false;
        gameState.isPlayerInOcean = false;

        // Animation Control Flags
        gameState.isPlayerDivingAni = false;
        gameState.isPlayerOnPlatformAni = false;
        gameState.isPlayerInOceanAni = false;
        gameState.sharkAttackAni = false;
        gameState.eagleAttackAni = false;
        gameState.OnPlatDiveAni = false;
        gameState.OnPlatDiveFlag = false;
        gameState.OnDiveToPlatAni = false;
        gameState.OnDiveToPlatFlag = false;

        gameState.currPlat = null;
        gameState.prePlat = null;

        gameState.background = this.add.image(config.width / 2, config.height / 2, 'bg');
        gameState.cursors = this.input.keyboard.createCursorKeys();

        gameState.player = this.add.sprite(config.width / 2, config.height - HALF_OBJ_PIXEL, 'playerIdle');
        gameState.player.depth = 100;
        gameState.playerPreY = gameState.player.y;

        gameState.enemies = this.add.group();
        gameState.platformsEven = this.add.group();
        gameState.platformsOdd = this.add.group();
        gameState.predatorEnemies = this.add.group();


        const enemyLanes = [1, 2];
        const platLanesEven = [4, 6, 8, 10];
        const platLanesOdd = [5, 7, 9, 11];

        // Animation Section
        this.anims.create({
            key: 'player_idle_anim',
            frames: this.anims.generateFrameNumbers('playerIdle'),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'player_dive_idle_anim',
            frames: this.anims.generateFrameNumbers('Dive_Idle'),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'shark_idle',
            frames: this.anims.generateFrameNumbers('Shark_Idle'),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'eagle_idle',
            frames: this.anims.generateFrameNumbers('Eagle_Idle'),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'shark_attack',
            frames: this.anims.generateFrameNumbers('Shark_Attack'),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'eagle_attack',
            frames: this.anims.generateFrameNumbers('Eagle_Attack'),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'on_plat_idle',
            frames: this.anims.generateFrameNumbers('OnPlat_Idle'),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'on_plat_dive',
            frames: this.anims.generateFrameNumbers('OnPlat_Dive'),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'on_dive_jump_plat',
            frames: this.anims.generateFrameNumbers('OnDive_JumpPlat'),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'bottle_idle',
            frames: this.anims.generateFrameNumbers('DriftBottle'),
            frameRate: 10,
            repeat: -1
        });

        gameState.player.play('player_idle_anim');

        isGameOver = false;


        function createEnemyBeach() {
            if (!gameState.active) return null;
            const curr_lane = this.lane;
            const pos_y = config.height - (HALF_OBJ_PIXEL + (curr_lane * OBJ_PIXEL));
            var start_x, name;

            if (curr_lane % 2 == 0) {
                start_x = config.width - HALF_OBJ_PIXEL;
                name = "pos";
            }
            else {
                start_x = HALF_OBJ_PIXEL;
            }
            let enemy = gameState.enemies.create(start_x, pos_y, 'crab');
            enemy.speed = 2;
            enemy.setName(name);
            return enemy;
        }

        function createEnemyShark() {
            if (!gameState.active) return null;
            let pos_y = randBtwMinMax(125, 325);
            let start_x = randBtwMinMax(25, 785);
            let shark = gameState.predatorEnemies.create(start_x, pos_y, 'shark_idle');
            shark.speed = 1;
            shark.setName("Shark");
            return shark;
        }
        gameState.shark = createEnemyShark();
        gameState.shark.play('shark_idle');

        function createEnemyEagle() {
            if (!gameState.active) return null;
            let pos_y = randBtwMinMax(125, 325);
            let start_x = randBtwMinMax(25, 785);
            let eagle = gameState.predatorEnemies.create(start_x, pos_y, 'eagle_idle');
            eagle.speed = 1;
            eagle.setName("Eagle");
            return eagle;
        }
        gameState.eagle = createEnemyEagle();
        gameState.eagle.depth = 200;
        gameState.eagle.play('eagle_idle');

        function createPlatformEven() {
            if (!gameState.active) return null;
            const curr_lane = this.lane;
            const pos_y = config.height - (HALF_OBJ_PIXEL + (curr_lane * OBJ_PIXEL));
            let start_x = config.width - OBJ_PIXEL;

            let platform = gameState.platformsOdd.create(start_x, pos_y, 'bottle_idle');
            platform.speed = 1;
            platform.play('bottle_idle');
            return platform;
        }

        function createPlatformOdd() {
            if (!gameState.active) return null;
            const curr_lane = this.lane;
            const pos_y = config.height - (HALF_OBJ_PIXEL + (curr_lane * OBJ_PIXEL));
            let start_x = HALF_OBJ_PIXEL;

            let platform = gameState.platformsEven.create(start_x, pos_y, 'DriftBottle');
            platform.speed = 1;
            platform.play('bottle_idle');
            return platform;
        }

        for (let lane of enemyLanes) {
            this.time.addEvent({
                delay: Math.random() * 2000 + 1500,
                callback: createEnemyBeach,
                callbackScope: { lane: lane },
                loop: true,
            })
        }

        for (let lane of platLanesEven) {
            this.time.addEvent({
                delay: Math.random() * 3000 + 7000,
                callback: createPlatformEven,
                callbackScope: { lane: lane },
                loop: true,
            })
        }

        for (let lane of platLanesOdd) {
            this.time.addEvent({
                delay: Math.random() * 4000 + 5000,
                callback: createPlatformOdd,
                callbackScope: { lane: lane },
                loop: true,
            })
        }

        //initialize score text
        score_text = this.add.text(10, 10, 'Score: ' + score, { fontSize: "30px", color: '#00ff00' });
        y_max = gameState.player.y;

        //initialize timer bar
        timer_bar = this.add.graphics();
        timer_bar.fillStyle(0x00ff00, 1);
        timer_bar.fillRect(config.width / 2, 0, 400, HALF_OBJ_PIXEL);
        timedEvent = this.time.addEvent({
            delay: 40000,
            callback: () => {
                this.scene.pause();
                this.scene.launch('gameover');
            },
            callbackScope: this,
            loop: false
        });


        // Time Event To Handle Animation Switching
        this.time.addEvent({
            delay: 0,
            callback: () => {
                // Check Diving Animations
                if (gameState.isPlayerDiving != gameState.isPlayerDivingAni) {
                    if (gameState.isPlayerDiving)
                        gameState.player.play('player_dive_idle_anim');
                    else
                        gameState.player.play('player_idle_anim');
                    gameState.isPlayerDivingAni = gameState.isPlayerDiving;
                }

                // // Check Predator Attack Animations
                // if (gameState.sharkAttackAni) {
                //     gameState.shark.play('shark_attack');
                // }
                // if (gameState.eagleAttackAni) {
                //     gameState.eagle.play('shark_attack');
                // }

                // Check Platform Animations
                if (gameState.isPlayerOnPlatform && gameState.isPlayerOnPlatform != gameState.isPlayerOnPlatformAni) {
                    gameState.currPlat.play('on_plat_idle');
                    gameState.player.visible = false;
                    gameState.isPlayerOnPlatformAni = gameState.isPlayerOnPlatform;
                }

                // Check Jumping Off Platform
                if (!gameState.isPlayerOnPlatform && gameState.currPlat != null) {
                    console.log('Jump off platform');
                    gameState.player.visible = true;
                    gameState.currPlat.play('bottle_idle');

                    // Update Platform Trackers
                    gameState.prePlat = gameState.currPlat;
                    gameState.currPlat = null;

                    gameState.isPlayerOnPlatformAni = false;
                }

                // Check Jumping to Next Platform
                if (gameState.currPlat != null && gameState.currPlat != gameState.prePlat) {
                    console.log('Jump to next platform');
                    if (gameState.prePlat)
                        gameState.prePlat.play('bottle_idle');
                    gameState.currPlat.play('on_plat_idle');
                    gameState.player.visible = false;
                }

                // Platform Diving Animation Controls
                if (gameState.isPlayerInOcean) {
                    // Dive into water
                    if (gameState.OnPlatDiveAni != gameState.OnPlatDiveFlag) {
                        console.log("Playing diving animation");
                        // Because dived into water, currPlat is null
                        gameState.prePlat.play('on_plat_dive');
                        gameState.player.visible = false;
                        gameState.OnPlatDiveFlag = gameState.OnPlatDiveAni;

                        gameState.prePlat.on('animationcomplete', ()=>{
                            console.log('Animation Completed');
                            gameState.prePlat.play('bottle_idle');
                            gameState.player.visible = true;
                            gameState.OnPlatDiveAni = false;
                            gameState.OnPlatDiveFlag = false;
                        })
                        
                    }
                    // Jump to platform
                    if(gameState.OnDiveToPlatAni != gameState.OnDiveToPlatFlag){
                        console.log("Playing jump animation");
                        gameState.currPlat.play('on_dive_jump_plat');
                        gameState.player.visible = false;
                        gameState.OnDiveToPlatFlag = gameState.OnDiveToPlatAni;

                        gameState.currPlat.on('animationcomplete', ()=>{
                            console.log('Animation Completed');
                            if(gameState.currPlat)
                                gameState.currPlat.play('on_plat_idle');
                            gameState.player.visible = false;
                            gameState.OnDiveToPlatAni = false;
                            gameState.OnDiveToPlatFlag = false;
                        })
                        
                    }
                }
            },
            loop: true
        });
    },

    update: function (time, delta) {
        timer_bar.clear();
        timer_bar.fillStyle(0x00ff00, 1);

        if (1 - timedEvent.getProgress() > 0) {
            timer_bar.fillRect(config.width / 2, 0, 400 * (1 - timedEvent.getProgress()), HALF_OBJ_PIXEL);
        }

        removeOutOfBoundObj();

        //Restart Function when Game Over
        if (isGameOver) {
            score = 0;
            gameState.player.depth = 100;
            gameState.player.angle = 0;
            gameState.player.x = config.width / 2;
            gameState.player.y = config.height - HALF_OBJ_PIXEL * 3;
            isGameOver = false;
            gameState.isPlayerDiving = false;
            gameState.eagleAttackAni = false;
            gameState.sharkAttackAni = false;
            y_max = gameState.player.y;
            timedEvent.reset({
                delay: 40000,
                callback: () => {
                    this.scene.pause();
                    this.scene.launch('gameover');
                },
                callbackScope: this,
                loop: false
            });
        }

        //Spawn a new player when player arrive at the endpoint.
        if (checkAttheEnd(gameState.player)) {
            this.add.sprite(gameState.player.x, gameState.player.y, 'playerIdle');
            gameState.player.depth = 100;
            gameState.player.angle = 0;
            gameState.player.x = config.width / 2;
            gameState.player.y = config.height - HALF_OBJ_PIXEL * 3;
            score += 50 + Math.floor((1 - timedEvent.getProgress()) * 40) * 2;
            gameState.isPlayerDiving = false;
            y_max = gameState.player.y;
            timedEvent.reset({
                delay: 40000,
                callback: () => {
                    this.scene.pause();
                    this.scene.launch('gameover');
                },
                callbackScope: this,
                loop: false
            });
        }

        if (gameState.active && !isGameOver) {
            // Key Controls, left, right, up, down are stepping by 75px

            // LEFT
            if (Phaser.Input.Keyboard.JustDown(gameState.cursors.left) && gameState.player.x > OBJ_PIXEL) {
                gameState.player.angle = -90;
                gameState.player.x -= OBJ_PIXEL;
            }

            // RIGHT
            if (Phaser.Input.Keyboard.JustDown(gameState.cursors.right) && gameState.player.x < config.width - OBJ_PIXEL) {
                gameState.player.angle = 90;
                gameState.player.x += OBJ_PIXEL;
            }

            // UP
            if (Phaser.Input.Keyboard.JustDown(gameState.cursors.up) && !gameState.isPlayerDiving
                && gameState.player.y > OBJ_PIXEL * 2) {

                // Check First Step From Safe Zone to Ocean
                if (gameState.player.y > (OBJ_PIXEL * 10) && (gameState.player.y - OBJ_PIXEL) < (OBJ_PIXEL * 10)) {
                    gameState.isPlayerDiving = true;
                    let tmp_player = Object.assign({}, gameState.player);
                    tmp_player.y -= OBJ_PIXEL;

                    // Platforms Manipulations
                    gameState.platformsEven.getChildren().forEach(platform => {
                        if (checkCollision(platform, tmp_player)) {
                            gameState.isPlayerDiving = false;
                        }
                    });

                    gameState.platformsOdd.getChildren().forEach(platform => {
                        if (checkCollision(platform, tmp_player)) {
                            gameState.isPlayerDiving = false;
                        }
                    });
                }

                // When Currently On A Platform
                if (gameState.isPlayerOnPlatform) {
                    let tmp_player = Object.assign({}, gameState.player);
                    tmp_player.y -= OBJ_PIXEL;
                    let break_out = true;

                    // Platforms Manipulations
                    gameState.platformsEven.getChildren().forEach(platform => {
                        if (checkCollision(platform, tmp_player)) {
                            break_out = false;
                        }
                    });

                    gameState.platformsOdd.getChildren().forEach(platform => {
                        if (checkCollision(platform, tmp_player)) {
                            break_out = false;
                        }
                    });

                    if (tmp_player.y < OBJ_PIXEL * 2)
                        break_out = false;

                    if (!break_out) {
                        gameState.playerPreY = gameState.player.y
                        gameState.player.angle = 0;
                        gameState.player.y -= OBJ_PIXEL;

                        //Every forward step scores 10 points
                        if (gameState.player.y < y_max) {
                            y_max = gameState.player.y;
                            score += 10;
                        }
                    }
                }
                else {
                    gameState.playerPreY = gameState.player.y
                    gameState.player.angle = 0;
                    gameState.player.y -= OBJ_PIXEL;

                    //Every forward step scores 10 points
                    if (gameState.player.y < y_max) {
                        y_max = gameState.player.y;
                        score += 10;
                    }
                }
            }

            // DOWN
            if (Phaser.Input.Keyboard.JustDown(gameState.cursors.down) && gameState.player.y < config.height - HALF_OBJ_PIXEL) {

                if (gameState.player.y < OBJ_PIXEL * 10 && gameState.player.y + OBJ_PIXEL > OBJ_PIXEL * 10)
                    gameState.isPlayerDiving = false;

                gameState.playerPreY = gameState.player.y
                gameState.player.angle = 180;
                gameState.player.y += OBJ_PIXEL;
            }

            // SPACE
            if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space) && gameState.isPlayerInOcean) {

                let flag = false;

                // Platforms Manipulations
                gameState.platformsEven.getChildren().forEach(platform => {
                    if (checkCollision(platform, gameState.player)) {
                        flag = true;
                    }
                });

                gameState.platformsOdd.getChildren().forEach(platform => {
                    if (checkCollision(platform, gameState.player)) {
                        flag = true;
                    }
                });

                // Update Animation Flag
                if (flag) {
                    // Case for jumping up the plat
                    if (gameState.isPlayerDiving) {
                        gameState.OnDiveToPlatAni = true;
                    }
                    // Case for diving in
                    else {
                        gameState.OnPlatDiveAni = true;
                    }
                }

                // Update Diving Condition Flag
                if (flag) {
                    gameState.isPlayerDiving = !gameState.isPlayerDiving;
                    console.log("Diving - " + gameState.isPlayerDiving);
                }
            }

            // Shark AI, not on platform chase the player, on platform random roaming
            sharkControl();
            // Eagle AI, on platform chase the player, dive random roaming
            eagleControl();

            // Check Whether Player Is In Ocean
            if (gameState.player.y < OBJ_PIXEL * 10 && gameState.player.y > OBJ_PIXEL * 2)
                gameState.isPlayerInOcean = true;
            else {
                gameState.isPlayerInOcean = false;
            }

            // Beach Enemies Control
            gameState.enemies.getChildren().forEach(enemy => {
                // Check which way the enemy is coming from, enemies from right named with pos
                if (enemy.name == "pos") {
                    enemy.x -= enemy.speed;
                }
                else {
                    enemy.x += enemy.speed;
                }
                // Check colliding with player for game state
                if (checkCollision(enemy, gameState.player)) {
                    this.scene.pause();
                    this.scene.launch('gameover');
                    console.log("Collision Detected: " + ". Enemy: " + enemy.x + ", " +
                        enemy.y + ", Player: " + gameState.player.x + ", " + gameState.player.y);
                }
            });

            gameState.isPlayerOnPlatform = false;

            // Platforms Manipulations
            gameState.platformsEven.getChildren().forEach(platform => {
                platform.x += platform.speed;
                if (checkCollision(platform, gameState.player) && !gameState.isPlayerDiving) {
                    gameState.isPlayerOnPlatform = true;
                    // Record Previous and Update Current Platform
                    gameState.prePlat = gameState.currPlat;
                    gameState.currPlat = platform;
                }
            });

            gameState.platformsOdd.getChildren().forEach(platform => {
                platform.x -= platform.speed;
                if (checkCollision(platform, gameState.player) && !gameState.isPlayerDiving) {
                    gameState.isPlayerOnPlatform = true;
                    // Record Previous and Update Current Platform
                    gameState.prePlat = gameState.currPlat;
                    gameState.currPlat = platform;
                }
            });

            // This case means player jumped off a platform
            if (!gameState.isPlayerOnPlatform && gameState.currPlat != null) {

                if (gameState.isPlayerInOcean)
                    gameState.isPlayerDiving = true;
                else
                    gameState.isPlayerDiving = false;
            }

            if (gameState.isPlayerOnPlatform && gameState.currPlat != null) {
                gameState.player.x = gameState.currPlat.x;
                gameState.isPlayerDiving = false;
            }

            // Collision Checking with Player
            if (checkCollision(gameState.shark, gameState.player) && !gameState.isPlayerOnPlatform) {
                console.log("Shark Attack");
                // Shark Attack Animation Flag
                gameState.sharkAttackAni = true;

                // Game Over
                this.scene.pause();
                this.scene.launch('gameover');
            }

            // Collision Checking with Player
            if (checkCollision(gameState.eagle, gameState.player) && gameState.isPlayerOnPlatform) {
                console.log("Eagle Attack");
                // Seagull Attack Animation Flag
                gameState.eagleAttackAni = true;

                // Game Over
                this.scene.pause();
                this.scene.launch('gameover');
            }

            //update score text
            score_text.text = "Score: " + score;
        }
    }
});

var GameOver = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

        function GameOver() {
            Phaser.Scene.call(this, { key: 'gameover' });
        },

    create: function () {
        gameover_text = this.add.text(config.width / 2, config.height / 2, 'Game Over', { fontSize: '150px' }).setOrigin(0.5);
        this.key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.KeyDown = false;
        isGameOver = true;
        this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function (time, delta) {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            gameover_text.text = "";
            this.scene.resume('game');
        }

    }

});


const gameState = {};

var config = {
    type: Phaser.canvas2d,
    width: 1200,
    height: 1050,
    scene: [Game, GameOver]
};

var game = new Phaser.Game(config);


/* -- Utility Functions -- */
/*
 *  checkCollision(A, B):
 *  Params:     A   -   First obj to check collision
 *              B   -   Second obj to check collision with
 *  Return:     True for collision, False no collision
 */
function checkCollision(A, B) {
    const PADDING = 5;
    let A_Left_X = A.x - HALF_OBJ_PIXEL + PADDING;
    let A_Right_X = A.x + HALF_OBJ_PIXEL + PADDING;
    let A_Top_Y = A.y - HALF_OBJ_PIXEL + PADDING;
    let A_Bottom_Y = A.y + HALF_OBJ_PIXEL + PADDING;

    return (A_Left_X < B.x && B.x < A_Right_X) && (A_Top_Y < B.y && B.y < A_Bottom_Y);
}

/*
 *  removeOutOfBoundEnemy():
 *  Return:     Remove the enemies that go out of screen
 */
function removeOutOfBoundObj() {
    gameState.enemies.getChildren().forEach(enemy => {
        if (enemy.x > config.width + HALF_OBJ_PIXEL || enemy.x < -HALF_OBJ_PIXEL) {
            gameState.enemies.remove(enemy);
        }
    });
    gameState.platformsEven.getChildren().forEach(platform => {
        if (platform.x > config.width + HALF_OBJ_PIXEL * 2 || platform.x < -HALF_OBJ_PIXEL * 2) {
            gameState.platformsEven.remove(platform);
        }
    });
    gameState.platformsOdd.getChildren().forEach(platform => {
        if (platform.x > config.width + HALF_OBJ_PIXEL * 2 || platform.x < -HALF_OBJ_PIXEL * 2) {
            gameState.platformsOdd.remove(platform);
        }
    });
}

function sharkControl() {
    // Shark AI, not on platform chase the player, on platform random roaming
    if (!gameState.isPlayerOnPlatform && gameState.isPlayerInOcean) {
        // console.log("Shark: Chasing player!");
        let sharkVec2 = [gameState.shark.x, gameState.shark.y];
        let playerVec2 = [gameState.player.x, gameState.player.y];
        let direcVec = [playerVec2[0] - sharkVec2[0], playerVec2[1] - sharkVec2[1]];
        let unitDirecVec = calcUnitVector(direcVec);

        let delta_x = ((unitDirecVec[0] * gameState.shark.speed) > 0) ?
            (unitDirecVec[0] * gameState.shark.speed) : (unitDirecVec[0] * gameState.shark.speed);
        let delta_y = ((unitDirecVec[1] * gameState.shark.speed) > 0) ?
            (unitDirecVec[1] * gameState.shark.speed) : (unitDirecVec[1] * gameState.shark.speed);

        gameState.shark.x += delta_x;
        gameState.shark.y += delta_y;
    }
    else {
        // console.log("Shark: Roaming");
        if (getTime() - gameState.sharkRoamTime > 1500) {
            gameState.randSharkDest = [parseInt(randBtwMinMax(0, config.width)),
            parseInt(randBtwMinMax(OBJ_PIXEL * 2, OBJ_PIXEL * 7))];
            // console.log("Shark: 2 sec passed. " + "New Destination: " + gameState.randSharkDest);
            gameState.sharkRoamTime = getTime();
        }

        let sharkVec2 = [gameState.shark.x, gameState.shark.y];
        let direcVec = [gameState.randSharkDest[0] - sharkVec2[0], gameState.randSharkDest[1] - sharkVec2[1]];
        let unitDirecVec = calcUnitVector(direcVec);

        let delta_x = ((unitDirecVec[0] * gameState.shark.speed) > 0) ?
            (unitDirecVec[0] * gameState.shark.speed) : (unitDirecVec[0] * gameState.shark.speed);
        let delta_y = ((unitDirecVec[1] * gameState.shark.speed) > 0) ?
            (unitDirecVec[1] * gameState.shark.speed) : (unitDirecVec[1] * gameState.shark.speed);

        gameState.shark.x += delta_x;
        gameState.shark.y += delta_y;
    }
}

function eagleControl() {
    // Shark AI, not on platform chase the player, on platform random roaming
    if (gameState.isPlayerOnPlatform) {
        // console.log("Eagle: Chasing player!");
        let eagleVec2 = [gameState.eagle.x, gameState.eagle.y];
        let playerVec2 = [gameState.player.x, gameState.player.y];
        let direcVec = [playerVec2[0] - eagleVec2[0], playerVec2[1] - eagleVec2[1]];
        let unitDirecVec = calcUnitVector(direcVec);

        let delta_x = ((unitDirecVec[0] * gameState.eagle.speed) > 0) ?
            (unitDirecVec[0] * gameState.eagle.speed) : (unitDirecVec[0] * gameState.eagle.speed);
        let delta_y = ((unitDirecVec[1] * gameState.eagle.speed) > 0) ?
            (unitDirecVec[1] * gameState.eagle.speed) : (unitDirecVec[1] * gameState.eagle.speed);

        gameState.eagle.x += delta_x;
        gameState.eagle.y += delta_y;
    }
    else {
        // console.log("Eagle: Roaming");
        if (getTime() - gameState.eagleRoamTime > 1500) {
            gameState.randEagleDest = [parseInt(randBtwMinMax(0, config.width)),
            parseInt(randBtwMinMax(OBJ_PIXEL * 2, OBJ_PIXEL * 7))];
            // console.log("Eagle: 2 sec passed. " + "New Destination: " + gameState.randEagleDest);
            gameState.eagleRoamTime = getTime();
        }

        let eagleVec2 = [gameState.eagle.x, gameState.eagle.y];
        let direcVec = [gameState.randEagleDest[0] - eagleVec2[0], gameState.randEagleDest[1] - eagleVec2[1]];
        let unitDirecVec = calcUnitVector(direcVec);

        let delta_x = ((unitDirecVec[0] * gameState.eagle.speed) > 0) ?
            (unitDirecVec[0] * gameState.eagle.speed) : (unitDirecVec[0] * gameState.eagle.speed);
        let delta_y = ((unitDirecVec[1] * gameState.eagle.speed) > 0) ?
            (unitDirecVec[1] * gameState.eagle.speed) : (unitDirecVec[1] * gameState.eagle.speed);

        gameState.eagle.x += delta_x;
        gameState.eagle.y += delta_y;
    }
}

/*
 *  calcUnitVector(vec2d):
 *  Param:      vec2d   -   input 2d vector to be normalized
 *  Return:     The result normalized vector
 */
function calcUnitVector(vec2d) {
    let result = [vec2d[0], vec2d[1]];
    result[0] = vec2d[0] / Math.sqrt(vec2d[0] * vec2d[0] + vec2d[1] * vec2d[1]);
    result[1] = vec2d[1] / Math.sqrt(vec2d[0] * vec2d[0] + vec2d[1] * vec2d[1]);
    return result;
}

/*
 *  randBtwMinMax(min, max):
 *  Desc:       Get a random number between min and max input
 */
function randBtwMinMax(min, max) {
    return Math.random() * (max - min) + min;
}

function getTime() {
    //make a new date object
    let d = new Date();

    //return the number of milliseconds since 1 January 1970 00:00:00.
    return d.getTime();
}

/*Check if player has arrive at the end*/
function checkAttheEnd(player) {
    return (player.y > OBJ_PIXEL && player.y < OBJ_PIXEL * 2);
}
