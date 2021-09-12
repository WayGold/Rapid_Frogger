import Phaser from "phaser";
import { Frog } from "./frog";


var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var player = new Frog('frog', 200, 200, 400, 500);
var game = new Phaser.Game(config);
var keyDict = {}

// This is used for pre loading assets
function preload ()
{
    this.load.image('frog', require("./assets/pog_frog.png"));
    this.load.image('sky', require("./assets/sky.png"));
}

function create ()
{
    this.add.image(400, 300, 'sky');

    keyDict['Up'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    keyDict['Down'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    keyDict['Left'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    keyDict['Right'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
}

function update ()
{   
    this.add.image(400, 300, 'sky');
    player.draw(this);
    player.key_listener(keyDict);
}