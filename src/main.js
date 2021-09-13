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

    const lanes = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
    
    function createEnemy(){
        const curr_lane = this.lane;
        const pos_y = config.height - (25 + (curr_lane * 50));
        var start_x, angle;

        if(curr_lane % 2 == 0){
            start_x = config.width - 50;
            angle = 90;
        }
        else{
            start_x = 0;
            angle = -90;
        }

        const enemy = gameState.enemies.create(start_x, pos_y, 'frog');
        enemy.setAngle(angle);
        enemy.speed = 3;
        return enemy;
    }

    for (let lane of lanes){
        this.time.addEvent({
            delay: Math.random() * 1600 + 800,
            callback: createEnemy,
            callbackScope: {lane: lane},
            loop: true,
        })
    }
    
}

function update ()
{   
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
        if(enemy.angle == 90){
            enemy.x -= enemy.speed;
        }
        else{
            enemy.x += enemy.speed;
        }
    })
}