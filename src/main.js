import { result } from "lodash";
import Phaser from "phaser";

const gameState = {};

var config = {
    type: Phaser.canvas2d,
    width: 800,
    height: 700,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var score = 0;
var score_text;

// This is used for pre loading assets
function preload ()
{
    this.load.image('frog', require("./assets/peepo.png"));
    this.load.image('bg', require("./assets/Background.jpg"));
    this.load.image('crab', require("./assets/crab.png"));
    this.load.image('DriftBottle', require("./assets/DriftBottle.png"));
}

function create ()
{
    gameState.background = this.add.image(400, 350, 'bg');
    gameState.cursors = this.input.keyboard.createCursorKeys();
    
    gameState.road_1 = this.add.rectangle(config.width / 2, 225, config.width, 250);
    gameState.road_1 = this.add.rectangle(config.width / 2, 525, config.width, 250);

    gameState.player = this.add.image(config.width / 2, config.height - 25, 'frog');
    gameState.player.depth = 100;
    gameState.enemies = this.add.group();
    gameState.platformsEven = this.add.group();
    gameState.platformsOdd = this.add.group();



  
    

    const enemyLanes = [1, 2, 3, 4, 5];
    const platLanesEven = [8, 10];
    const platLanesOdd = [7, 9, 11];
    
    function createEnemy(){
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        var start_x, name;

        if(curr_lane % 2 == 0){
            start_x = config.width - 25;
            name = "pos";
        }
        else{
            start_x = 25;
        }

        const enemy = gameState.enemies.create(start_x, pos_y, 'crab');
        enemy.speed = 2;
        enemy.setName(name);
        return enemy;
    }

    function createPlatformEven(){
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        let start_x = config.width - 50;

        let platform = gameState.platformsOdd.create(start_x, pos_y, 'DriftBottle');
        platform.speed = 2;
        return platform;
    }

    function createPlatformOdd(){
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        let start_x = 25;

        let platform = gameState.platformsEven.create(start_x, pos_y, 'DriftBottle');
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

    score_text = this.add.text(10, 10, 'Score: ' + score,{ fontSize:"30px",color: '#00ff00' });
}

function update ()
{   
    
    score_text.text = "Score: " + score;
    removeOutOfBoundObj();
    // Key Controls, left right is continuous movement, up down is stepping
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.left) && gameState.player.x > 50){
        gameState.player.x -= 50;
    }
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.right) && gameState.player.x < config.width - 25){
        gameState.player.x += 50;
    }
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.up) && gameState.player.y > 25){
        gameState.player.y -= 50;
        score += 10;
    }
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.down) && gameState.player.y < config.height - 25){
        gameState.player.y += 50;
    }

    gameState.enemies.getChildren().forEach(enemy => {
        if(enemy.name == "pos"){
            enemy.x -= enemy.speed;
        }
        else{
            enemy.x += enemy.speed;
        }

        if(checkCollision(enemy, gameState.player)){
            console.log("Collision Detected: " + ". Enemy: " + enemy.x + ", " + 
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
        if(platform.x > 850 || platform.x < -50){
            gameState.platformsEven.remove(platform);
        }
    });
    gameState.platformsOdd.getChildren().forEach(platform => {
        if(platform.x > 850 || platform.x < -50){
            gameState.platformsOdd.remove(platform);
        }
    });
}

/*
 *  calcNormal(vec2d):
 *  Param:      vec2d   -   input 2d vector to be normalized
 *  Return:     The result normalized vector
 */
function calcNormal(vec2d){
    result = [vec2d[0], vec2d[1]];
    result[0] = vec2d[0] / Math.sqrt(vec2d[0] * vec2d[0] + vec2d[1] * vec2d[1]);
    result[1] = vec2d[1] / Math.sqrt(vec2d[0] * vec2d[0] + vec2d[1] * vec2d[1]);
    return result;
}

