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
function preload ()
{
    this.load.image('frog', require("./assets/peepo.png"));
    this.load.image('sky', require("./assets/sky.png"));
}

function create ()
{
    gameState.background = this.add.image(400, 300, 'sky');
    gameState.cursors = this.input.keyboard.createCursorKeys();
    
    gameState.road_1 = this.add.rectangle(config.width / 2, 225, config.width, 250, 0x7A0F96);
    gameState.road_1 = this.add.rectangle(config.width / 2, 525, config.width, 250, 0x7A0F96);

    gameState.player = this.add.image(config.width / 2, config.height - 25, 'frog');
    gameState.enemies = this.add.group();
    gameState.platformsEven = this.add.group();
    gameState.platformsOdd = this.add.group();

    const enemyLanes = [1, 2, 3, 4, 5];
    const platLanesEven = [8, 10];
    const platLanesOdd = [7, 9, 11];
    
    function createEnemy(){
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        var start_x, angle;

        if(curr_lane % 2 == 0){
            start_x = config.width - 50;
            angle = -90;
        }
        else{
            start_x = 25;
            angle = 90;
        }

        const enemy = gameState.enemies.create(start_x, pos_y, 'frog');
        enemy.setAngle(angle);
        enemy.speed = 2;
        return enemy;
    }

    function createPlatformEven(){
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        let start_x = config.width - 50;

        let platform = gameState.platformsOdd.create(start_x, pos_y, 'frog');
        platform.speed = 2;
        return platform;
    }

    function createPlatformOdd(){
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        let start_x = 25;

        let platform = gameState.platformsEven.create(start_x, pos_y, 'frog');
        platform.speed = 2;
        return platform;
    }

    for (let lane of enemyLanes){
        this.time.addEvent({
            delay: Math.random() * 1600 + 1200,
            callback: createEnemy,
            callbackScope: {lane: lane},
            loop: true,
        })
    }

    for (let lane of platLanesEven){
        this.time.addEvent({
            delay: Math.random() * 1600 + 1200,
            callback: createPlatformEven,
            callbackScope: {lane: lane},
            loop: true,
        })
    }

    for (let lane of platLanesOdd){
        this.time.addEvent({
            delay: Math.random() * 1600 + 1200,
            callback: createPlatformOdd,
            callbackScope: {lane: lane},
            loop: true,
        })
    }

    
}

function update ()
{   
    removeOutOfBoundObj();

    // Key Controls, left right is continuous movement, up down is stepping
    if (gameState.cursors.left.isDown && gameState.player.x > 50){
        gameState.player.x -= 2;
    }
    if (gameState.cursors.right.isDown && gameState.player.x < config.width - 25){
        gameState.player.x += 2;
    }
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.up) && gameState.player.y > 25){
        gameState.player.y -= 50;
    }
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.down) && gameState.player.y < config.height - 25){
        gameState.player.y += 50;
    }

    gameState.enemies.getChildren().forEach(enemy => {
        if(enemy.angle == -90){
            enemy.x -= enemy.speed;
        }
        else{
            enemy.x += enemy.speed;
        }

        if(checkCollision(enemy, gameState.player)){
            console.log("Collision: " + collided + ". Enemy: " + enemy.x + ", " + 
            enemy.y + ", Player: " + gameState.player.x + ", " + gameState.player.y);
        }
    });

    gameState.platformsEven.getChildren().forEach(platform => {
        platform.x += platform.speed;
        if(checkCollision(platform, gameState.player)){
            gameState.player.x = platform.x;
        }
    });

    gameState.platformsOdd.getChildren().forEach(platform => {
        platform.x -= platform.speed;
        if(checkCollision(platform, gameState.player)){
            gameState.player.x = platform.x;
        }
    });
}

/*
 *  checkCollision(A, B):
 *  Params:     A   -   First obj to check collision
 *              B   -   Second obj to check collision with
 *  Return:     True for collision, False no collision
 */
function checkCollision(A, B){
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
function removeOutOfBoundObj(){
    gameState.enemies.getChildren().forEach(enemy => {
        if(enemy.x > 825 || enemy.x < -25){
            gameState.enemies.remove(enemy);
        }
    });
    gameState.platformsEven.getChildren().forEach(platform => {
        if(platform.x > 825 || platform.x < -25){
            gameState.platformsEven.remove(platform);
        }
    });
    gameState.platformsOdd.getChildren().forEach(platform => {
        if(platform.x > 825 || platform.x < -25){
            gameState.platformsOdd.remove(platform);
        }
    });
}