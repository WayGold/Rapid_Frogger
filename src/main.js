import { result } from "lodash";
import Phaser from "phaser";

const gameState = {};

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 700,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

// This is used for pre loading assets
function preload() {
    this.load.image('frog', require("./assets/peepo.png"));
    this.load.image('bg', require("./assets/Background.jpg"));
    this.load.image('crab', require("./assets/crab.png"));
    this.load.image('DriftBottle', require("./assets/DriftBottle.png"));
    this.load.image('JellyFish', require("./assets/JellyFish.png"))
}

function create() {
    gameState.active = true;
    gameState.isPlayerDiving = false;
    gameState.isPlayerOnPlatform = false;

    gameState.background = this.add.image(400, 350, 'bg');
    gameState.cursors = this.input.keyboard.createCursorKeys();

    gameState.player = this.add.image(config.width / 2, config.height - 25, 'frog');
    gameState.enemies = this.add.group();
    gameState.platformsEven = this.add.group();
    gameState.platformsOdd = this.add.group();

    const enemyLanes = [1, 2, 3, 4, 5];
    const platLanesEven = [8, 10];
    const platLanesOdd = [7, 9, 11];

    function createEnemyBeach() {
        if(!gameState.active) return null;
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        var start_x, name;

        if (curr_lane % 2 == 0) {
            start_x = config.width - 25;
            name = "pos";
        }
        else {
            start_x = 25;
        }
        let enemy = gameState.enemies.create(start_x, pos_y, 'crab');
        enemy.speed = 2;
        enemy.setName(name);
        return enemy;
    }

    function createEnemyShark(){
        if(!gameState.active) return null;
        let pos_y = randBtwMinMax(125, 325);
        let start_x = randBtwMinMax(25, 785);
        let shark = gameState.enemies.create(start_x, pos_y, 'JellyFish');
        shark.speed = 2;
        shark.setName("Shark");
        return shark;
    }
    gameState.shark = createEnemyShark();
    function createPlatformEven() {
        if(!gameState.active) return null;
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        let start_x = config.width - 50;

        let platform = gameState.platformsOdd.create(start_x, pos_y, 'DriftBottle');
        platform.speed = 1;
        return platform;
    }

    function createPlatformOdd() {
        if(!gameState.active) return null;
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        let start_x = 25;

        let platform = gameState.platformsEven.create(start_x, pos_y, 'DriftBottle');
        platform.speed = 1;
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
    
    
}

function update() {
    removeOutOfBoundObj();

    if (gameState.active) {
        // Key Controls, left right is continuous movement, up down is stepping
        if (gameState.cursors.left.isDown && gameState.player.x > 50) {
            gameState.player.x -= 2;
        }
        if (gameState.cursors.right.isDown && gameState.player.x < config.width - 25) {
            gameState.player.x += 2;
        }
        if (Phaser.Input.Keyboard.JustDown(gameState.cursors.up) && gameState.player.y > 25) {
            gameState.player.y -= 50;
        }
        if (Phaser.Input.Keyboard.JustDown(gameState.cursors.down) && gameState.player.y < config.height - 25) {
            gameState.player.y += 50;
        }
        
        // Shark AI, not on platform chase the player, on platform random roaming
        if(!gameState.isPlayerOnPlatform){
            console.log("Shark: Chasing player!");
            let sharkVec2 = [gameState.shark.x, gameState.shark.y];
            let playerVec2 = [gameState.player.x, gameState.player.y];
            let direcVec = [playerVec2[0] - sharkVec2[0], playerVec2[1] - sharkVec2[1]];

            let unitDirecVec = calcUnitVector(direcVec);
            gameState.shark.x += Math.ceil(unitDirecVec[0] * gameState.shark.speed);
            gameState.shark.y += Math.ceil(unitDirecVec[1] * gameState.shark.speed);
        }
        else{
            console.log("Shark: Roaming!");
            let randMove = [parseInt(randBtwMinMax(-1, 1)), parseInt(randBtwMinMax(-1, 1))];
            gameState.shark.x += randMove[0];
            gameState.shark.y += randMove[1];
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
                gameState.active = false;
                this.add.text(400, 350, 'Game Over', {fontSize: '150px'}).setOrigin(0.5);
                console.log("Collision Detected: " + ". Enemy: " + enemy.x + ", " +
                    enemy.y + ", Player: " + gameState.player.x + ", " + gameState.player.y);
            }
        });

        gameState.platformsEven.getChildren().forEach(platform => {
            platform.x += platform.speed;
            if (checkCollision(platform, gameState.player)) {
                gameState.isPlayerOnPlatform = true;
                gameState.player.x = platform.x;
            }
            else{gameState.isPlayerOnPlatform = false;}
        });

        gameState.platformsOdd.getChildren().forEach(platform => {
            platform.x -= platform.speed;
            if (checkCollision(platform, gameState.player)) {
                gameState.isPlayerOnPlatform = true;
                gameState.player.x = platform.x;
            }
            else{gameState.isPlayerOnPlatform = false;}
        });
    }
}

/*
 *  checkCollision(A, B):
 *  Params:     A   -   First obj to check collision
 *              B   -   Second obj to check collision with
 *  Return:     True for collision, False no collision
 */
function  checkCollision(A, B) {
    let A_Left_X = A.x - 25;
    let A_Right_X = A.x + 25;
    let A_Top_Y = A.y - 25;
    let A_Bottom_Y = A.y + 25;

    return (A_Left_X < B.x && B.x < A_Right_X) && (A_Top_Y < B.y && B.y < A_Bottom_Y);
}

/*
 *  removeOutOfBoundEnemy():
 *  Return:     Remove the enemies that go out of screen
 */
function removeOutOfBoundObj() {
    gameState.enemies.getChildren().forEach(enemy => {
        if (enemy.x > 825 || enemy.x < -25) {
            gameState.enemies.remove(enemy);
        }
    });
    gameState.platformsEven.getChildren().forEach(platform => {
        if (platform.x > 850 || platform.x < -50) {
            gameState.platformsEven.remove(platform);
        }
    });
    gameState.platformsOdd.getChildren().forEach(platform => {
        if (platform.x > 850 || platform.x < -50) {
            gameState.platformsOdd.remove(platform);
        }
    });
}

/*
 *  calcUnitVector(vec2d):
 *  Param:      vec2d   -   input 2d vector to be normalized
 *  Return:     The result normalized vector
 */
function calcUnitVector(vec2d) {
    result = [vec2d[0], vec2d[1]];
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


